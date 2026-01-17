import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAdmin, requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { updateUserSchema } from "@/lib/validations/fox-club";
import { NotFoundError } from "@/lib/errors/types";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/users/[id]
 * Get a single user with their form and admin notes
 * Admin only
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await requireAuth();
    const { id } = await params;

    if (sessionUser.role !== "ADMIN" && sessionUser.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userForm: {
          include: {
            answers: {
              include: {
                question: {
                  include: {
                    questionFamily: true,
                  },
                },
              },
              orderBy: [
                { question: { questionFamilyId: "asc" } },
                { question: { order: "asc" } },
              ],
            },
          },
        },
        adminNotes: {
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Don't send password hash
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user profile, role, types, or approval status
 * Admin only
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { id } = await params;

    // Check if user exists
    const exists = await prisma.user.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundError("User not found");
    }

    // Validate the update data
    const validated = updateUserSchema.parse(body);

    // Build update data, handling empty strings as null
    const data: any = {};
    if (validated.pseudo !== undefined) data.pseudo = validated.pseudo;
    if (validated.email !== undefined) data.email = validated.email || null;
    if (validated.firstName !== undefined)
      data.firstName = validated.firstName || null;
    if (validated.lastName !== undefined)
      data.lastName = validated.lastName || null;
    if (validated.role !== undefined) data.role = validated.role;
    if (validated.types !== undefined) data.types = validated.types;
    if (validated.approved !== undefined) data.approved = validated.approved;

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        pseudo: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        types: true,
        approved: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user
 * Admin only
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if user exists
    const exists = await prisma.user.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundError("User not found");
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
