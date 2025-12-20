import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import {
  updateUserApprovalSchema,
  updateUserRoleSchema,
} from "@/lib/validations/fox-club";
import { NotFoundError } from "@/lib/errors/types";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/admin/users/[id]
 * Get a single user with their form and admin notes
 * Admin only
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user approval status or role
 * Admin only
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const body = await request.json();

    // Check if user exists
    const exists = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!exists) {
      throw new NotFoundError("User not found");
    }

    // Validate based on what's being updated
    let data: any = {};

    if ("approved" in body) {
      const validated = updateUserApprovalSchema.parse(body);
      data.approved = validated.approved;
    }

    if ("role" in body) {
      const validated = updateUserRoleSchema.parse(body);
      data.role = validated.role;
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
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
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    // Check if user exists
    const exists = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!exists) {
      throw new NotFoundError("User not found");
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
