import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { updateQuestionSchema } from "@/lib/validations/fox-club";
import { NotFoundError } from "@/lib/errors/types";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/admin/questions/[id]
 * Get a single question by ID
 * Admin only
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        questionFamily: true,
        _count: {
          select: { answers: true },
        },
      },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    return NextResponse.json(question);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/questions/[id]
 * Update a question
 * Admin only
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = updateQuestionSchema.parse(body);

    // Check if question exists
    const exists = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!exists) {
      throw new NotFoundError("Question not found");
    }

    const updated = await prisma.question.update({
      where: { id: params.id },
      data: validated,
      include: {
        questionFamily: {
          select: {
            id: true,
            label: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/questions/[id]
 * Delete a question
 * Admin only
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    // Check if question exists
    const exists = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!exists) {
      throw new NotFoundError("Question not found");
    }

    await prisma.question.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
