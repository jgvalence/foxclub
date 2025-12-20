import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/handlers";
import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { bulkUserActionSchema } from "@/lib/validations/fox-club";

/**
 * GET /api/admin/users
 * List all users with optional filtering
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const approved = searchParams.get("approved");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};
    if (approved !== null && approved !== undefined) {
      where.approved = approved === "true";
    }
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          approved: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              adminNotes: true,
            },
          },
          userForm: {
            select: {
              id: true,
              submitted: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
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
 * POST /api/admin/users/bulk-action
 * Perform bulk actions on users (approve, reject, delete)
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = bulkUserActionSchema.parse(body);

    let result;

    switch (validated.action) {
      case "approve":
        result = await prisma.user.updateMany({
          where: { id: { in: validated.userIds } },
          data: { approved: true },
        });
        break;

      case "reject":
        result = await prisma.user.updateMany({
          where: { id: { in: validated.userIds } },
          data: { approved: false },
        });
        break;

      case "delete":
        result = await prisma.user.deleteMany({
          where: { id: { in: validated.userIds } },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
