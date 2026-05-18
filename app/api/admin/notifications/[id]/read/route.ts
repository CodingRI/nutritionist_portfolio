import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { corsOptionsResponse, getCorsHeaders } from "@/lib/cors";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function OPTIONS(req: Request) {
  return corsOptionsResponse(req);
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const origin = req.headers.get("origin");

  try {
    const { id } = await params;

    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        {
          status: 403,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: adminUser.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found.",
        },
        {
          status: 404,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        notification: updatedNotification,
      },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );
  } catch (error) {
    console.error("MARK_NOTIFICATION_READ_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to mark notification as read.",
      },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}