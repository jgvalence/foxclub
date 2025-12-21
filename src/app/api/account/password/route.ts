import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { handleApiError } from "@/lib/errors/handlers";
import { changePasswordSchema } from "@/lib/validations/fox-club";

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = changePasswordSchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!dbUser?.password) {
      return NextResponse.json(
        { error: "Aucun mot de passe local pour cet utilisateur" },
        { status: 400 }
      );
    }

    const isValid = await compare(validated.oldPassword, dbUser.password);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe invalide" }, { status: 401 });
    }

    const hashed = await hash(validated.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, mustChangePassword: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
