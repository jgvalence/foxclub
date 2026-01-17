import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { updateFormSubmissionStatusSchema } from "@/lib/validations/fox-club";
import { NotFoundError } from "@/lib/errors/types";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/admin/users/[id]/form
 * Update a user's form submission status (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { submitted } = updateFormSubmissionStatusSchema.parse(body);

    const form = await prisma.userForm.findUnique({
      where: { userId: id },
      select: { id: true },
    });

    if (!form) {
      throw new NotFoundError("User form not found");
    }

    const updatedForm = await prisma.userForm.update({
      where: { id: form.id },
      data: { submitted },
      select: {
        id: true,
        userId: true,
        submitted: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    return handleApiError(error);
  }
}
