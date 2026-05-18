import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { corsOptionsResponse, getCorsHeaders } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return corsOptionsResponse(req);
}

export async function GET(req: Request) {
  const origin = req.headers.get("origin");

  try {
    const { userId: clerkUserId } = await auth();
    console.log(clerkUserId);
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

    const notifications = await prisma.notification.findMany({
      where: {
        userId: adminUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: adminUser.id,
        isRead: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        notifications,
        unreadCount,
      },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );
  } catch (error) {
    console.error("GET_ADMIN_NOTIFICATIONS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications.",
      },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}