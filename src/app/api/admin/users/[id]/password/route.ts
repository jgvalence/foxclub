import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { customAlphabet } from "nanoid";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { handleApiError } from "@/lib/errors/handlers";
import { adminResetPasswordSchema } from "@/lib/validations/fox-club";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const generatePassword = () => {
  const nano = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$", 12);
  return nano();
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const validated = adminResetPasswordSchema.parse(body);

    const plainPassword = validated.password || generatePassword();
    const hashed = await hash(plainPassword, 12);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashed,
        mustChangePassword: validated.mustChangePassword ?? true,
      },
    });

    return NextResponse.json({
      password: plainPassword,
      mustChangePassword: validated.mustChangePassword ?? true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
