import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { createQuestionSchema } from "@/lib/validations/fox-club";

/**
 * GET /api/admin/questions
 * List all questions with optional filtering
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const familyId = searchParams.get("familyId");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};
    if (familyId) where.questionFamilyId = familyId;
    if (search) {
      where.text = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Fetch questions with pagination
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          questionFamily: {
            select: {
              id: true,
              label: true,
              type: true,
            },
          },
          _count: {
            select: { answers: true },
          },
        },
        orderBy: [{ questionFamilyId: "asc" }, { order: "asc" }],
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/questions
 * Create a new question
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = createQuestionSchema.parse(body);

    // Get the highest order value within the family and increment
    const maxOrder = await prisma.question.findFirst({
      where: { questionFamilyId: validated.questionFamilyId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const question = await prisma.question.create({
      data: {
        ...validated,
        order: validated.order ?? (maxOrder?.order ?? 0) + 1,
      },
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

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
