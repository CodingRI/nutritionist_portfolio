import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { corsOptionsResponse, getCorsHeaders } from "@/lib/cors"

export async function OPTIONS(req: Request) {
  return corsOptionsResponse(req)
}

export async function GET(req: Request) {
  const origin = req.headers.get("origin")

  try {
    const { userId: clerkUserId } = await auth()

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
      )
    }

    const adminUser = await prisma.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
      select: {
        id: true,
        role: true,
      },
    })

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
      )
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            profile: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        appointments,
      },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    )
  } catch (error) {
    console.error("GET_PENDING_APPOINTMENTS_ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pending appointments",
      },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    )
  }
}