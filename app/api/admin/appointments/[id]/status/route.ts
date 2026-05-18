import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import {
  AppointmentStatus,
  PaymentPurpose,
  PaymentStatus,
  PaymentProvider,
  NotificationType,
} from "@/src/generated/prisma/client"
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

    const { status, adminNotes, cancellationReason, amount } = body as {
      status?: AppointmentStatus
      adminNotes?: string
      cancellationReason?: string
      amount?: number
    }

    const allowedStatuses: AppointmentStatus[] = [
      AppointmentStatus.PAYMENT_PENDING,
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
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        payment: true,
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

    const appointmentAmount = Number(amount || 500)

    const result = await prisma.$transaction(async (tx) => {
      if (status === AppointmentStatus.REJECTED) {
        const rejectedAppointment = await tx.appointment.update({
          where: {
            id,
          },
          data: {
            status: AppointmentStatus.REJECTED,
            adminNotes: adminNotes?.trim() || null,
            cancellationReason:
              cancellationReason?.trim() || "Rejected by admin",
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

        await tx.notification.create({
          data: {
            userId: existingAppointment.userId,
            type: NotificationType.SYSTEM,
            title: "Appointment request rejected",
            message:
              cancellationReason?.trim() ||
              "Your appointment request was rejected by the nutritionist.",
            relatedAppointmentId: existingAppointment.id,
          },
        })

        return {
          appointment: rejectedAppointment,
          payment: null,
        }
      }

      const payment = await tx.payment.create({
        data: {
          userId: existingAppointment.userId,
          amount: appointmentAmount,
          currency: "INR",
          provider: PaymentProvider.RAZORPAY,
          status: PaymentStatus.PENDING,
          purpose: PaymentPurpose.APPOINTMENT,
        },
      })

      const updatedAppointment = await tx.appointment.update({
        where: {
          id,
        },
        data: {
          status: AppointmentStatus.PAYMENT_PENDING,
          paymentId: payment.id,
          adminNotes: adminNotes?.trim() || null,
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
          payment: true,
        },
      })

      await tx.notification.create({
        data: {
          userId: existingAppointment.userId,
          type: NotificationType.PAYMENT_REQUEST,
          title: "Payment requested for appointment",
          message: `Your appointment request has been verified. Please complete the payment of ₹${appointmentAmount}.`,
          relatedAppointmentId: existingAppointment.id,
        },
      })

      return {
        appointment: updatedAppointment,
        payment,
      }
    })

    return NextResponse.json(
      {
        success: true,
        message:
          status === AppointmentStatus.PAYMENT_PENDING
            ? "Appointment verified and dummy payment request created."
            : "Appointment rejected successfully.",
        appointment: result.appointment,
        payment: result.payment,
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