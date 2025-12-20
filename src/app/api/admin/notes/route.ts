import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { createAdminNoteSchema } from "@/lib/validations/fox-club";

/**
 * GET /api/admin/notes?userId=xxx
 * Get all admin notes for a specific user
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const notes = await prisma.adminNote.findMany({
      where: { userId },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data: notes });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/notes
 * Create a new admin note for a user
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const validated = createAdminNoteSchema.parse(body);

    const note = await prisma.adminNote.create({
      data: {
        ...validated,
        adminId: admin.id,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
