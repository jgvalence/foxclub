import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { handleApiError } from "@/lib/errors/handlers";
import { createUserSchema } from "@/lib/validations/fox-club";

/**
 * POST /api/admin/users/create
 * Create a user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validated = createUserSchema.parse(body);

    const hashed = await hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        pseudo: validated.pseudo,
        email: validated.email || null,
        firstName: validated.firstName,
        lastName: validated.lastName,
        password: hashed,
        role: validated.role ?? "USER",
        types: validated.types ?? [],
        approved: validated.approved ?? true,
        emailVerified: validated.email ? new Date() : null,
      },
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
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
