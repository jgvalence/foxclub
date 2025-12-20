import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { updateQuestionFamilySchema } from "@/lib/validations/fox-club";
import { NotFoundError } from "@/lib/errors/types";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/question-families/[id]
 * Get a single question family by ID
 * Admin only
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const family = await prisma.questionFamily.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!family) {
      throw new NotFoundError("Question family not found");
    }

    return NextResponse.json(family);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/question-families/[id]
 * Update a question family
 * Admin only
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = updateQuestionFamilySchema.parse(body);
    const { id } = await params;

    // Check if family exists
    const exists = await prisma.questionFamily.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundError("Question family not found");
    }

    const updated = await prisma.questionFamily.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/question-families/[id]
 * Delete a question family and all its questions
 * Admin only
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if family exists
    const exists = await prisma.questionFamily.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundError("Question family not found");
    }

    // Delete will cascade to questions due to Prisma schema
    await prisma.questionFamily.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
