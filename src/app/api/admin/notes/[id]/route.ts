import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { updateAdminNoteSchema } from "@/lib/validations/fox-club";
import { NotFoundError } from "@/lib/errors/types";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/admin/notes/[id]
 * Update an admin note
 * Admin only
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = updateAdminNoteSchema.parse(body);

    // Check if note exists
    const exists = await prisma.adminNote.findUnique({
      where: { id: params.id },
    });

    if (!exists) {
      throw new NotFoundError("Note not found");
    }

    const updated = await prisma.adminNote.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/notes/[id]
 * Delete an admin note
 * Admin only
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    // Check if note exists
    const exists = await prisma.adminNote.findUnique({
      where: { id: params.id },
    });

    if (!exists) {
      throw new NotFoundError("Note not found");
    }

    await prisma.adminNote.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
