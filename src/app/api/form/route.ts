import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { submitFormSchema } from "@/lib/validations/fox-club";
import { ForbiddenError } from "@/lib/errors/types";

/**
 * GET /api/form
 * Get current user's form with all questions and answers
 * Requires authenticated and approved user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get user with approved status
    const userWithStatus = await prisma.user.findUnique({
      where: { id: user.id },
      select: { approved: true },
    });

    if (!userWithStatus?.approved) {
      throw new ForbiddenError(
        "You must be approved by an admin to access the form"
      );
    }

    // Get all questions organized by family
    const questionFamilies = await prisma.questionFamily.findMany({
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    // Get or create user's form
    let userForm = await prisma.userForm.findUnique({
      where: { userId: user.id },
      include: {
        answers: true,
      },
    });

    if (!userForm) {
      userForm = await prisma.userForm.create({
        data: {
          userId: user.id,
        },
        include: {
          answers: true,
        },
      });
    }

    return NextResponse.json({
      form: userForm,
      questionFamilies,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/form
 * Save or submit user's form answers
 * Requires authenticated and approved user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Check if user is approved
    const userWithStatus = await prisma.user.findUnique({
      where: { id: user.id },
      select: { approved: true },
    });

    if (!userWithStatus?.approved) {
      throw new ForbiddenError(
        "You must be approved by an admin to submit the form"
      );
    }

    const body = await request.json();
    const validated = submitFormSchema.parse(body);

    // Get or create user's form
    let userForm = await prisma.userForm.findUnique({
      where: { userId: user.id },
    });

    if (!userForm) {
      userForm = await prisma.userForm.create({
        data: {
          userId: user.id,
          submitted: validated.submitted ?? false,
        },
      });
    }

    // Check if form is already submitted (prevent editing after submission)
    if (userForm.submitted) {
      throw new ForbiddenError("Form has already been submitted");
    }

    // Upsert all answers
    await Promise.all(
      validated.answers.map((answerData) =>
        prisma.formAnswer.upsert({
          where: {
            formId_questionId: {
              formId: userForm!.id,
              questionId: answerData.questionId,
            },
          },
          create: {
            formId: userForm!.id,
            questionId: answerData.questionId,
            ...answerData.answer,
          },
          update: {
            ...answerData.answer,
          },
        })
      )
    );

    // Update form submission status if requested
    if (validated.submitted) {
      await prisma.userForm.update({
        where: { id: userForm.id },
        data: { submitted: true },
      });
    }

    // Fetch updated form with answers
    const updatedForm = await prisma.userForm.findUnique({
      where: { id: userForm.id },
      include: {
        answers: {
          include: {
            question: {
              include: {
                questionFamily: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    return handleApiError(error);
  }
}
