import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { AppointmentStatus } from "@/src/generated/prisma/client"
import { corsOptionsResponse, getCorsHeaders } from "@/lib/cors"

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function OPTIONS(req: Request) {
  return corsOptionsResponse(req)
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const origin = req.headers.get("origin")

  try {
    const { id } = await params

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

    const body = await req.json()

    const { status, adminNotes, cancellationReason } = body as {
      status?: AppointmentStatus
      adminNotes?: string
      cancellationReason?: string
    }

    const allowedStatuses: AppointmentStatus[] = [
      AppointmentStatus.APPROVED,
      AppointmentStatus.REJECTED,
    ]

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid appointment status.",
        },
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      )
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!existingAppointment) {
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found.",
        },
        {
          status: 404,
          headers: getCorsHeaders(origin),
        }
      )
    }

    if (existingAppointment.status !== AppointmentStatus.PENDING) {
      return NextResponse.json(
        {
          success: false,
          message: "Only pending appointments can be reviewed.",
        },
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      )
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: {
        status,
        adminNotes: adminNotes?.trim() || null,
        cancellationReason:
          status === AppointmentStatus.REJECTED
            ? cancellationReason?.trim() || "Rejected by admin"
            : null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message:
          status === AppointmentStatus.APPROVED
            ? "Appointment approved successfully."
            : "Appointment rejected successfully.",
        appointment: updatedAppointment,
      },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    )
  } catch (error) {
    console.error("UPDATE_APPOINTMENT_STATUS_ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update appointment status.",
      },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    )
  }
}