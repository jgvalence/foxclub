import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { createQuestionFamilySchema } from "@/lib/validations/fox-club";

/**
 * GET /api/admin/question-families
 * List all question families with optional filtering
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (search) {
      where.label = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Fetch families with pagination
    const [families, total] = await Promise.all([
      prisma.questionFamily.findMany({
        where,
        include: {
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { order: "asc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.questionFamily.count({ where }),
    ]);

    return NextResponse.json({
      data: families,
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
 * POST /api/admin/question-families
 * Create a new question family
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = createQuestionFamilySchema.parse(body);

    // Get the highest order value and increment
    const maxOrder = await prisma.questionFamily.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const family = await prisma.questionFamily.create({
      data: {
        ...validated,
        order: validated.order ?? (maxOrder?.order ?? 0) + 1,
      },
    });

    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
