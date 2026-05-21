import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

import {
  AppointmentStatus,
  NotificationType,
} from "@prisma/client";

import {
  corsOptionsResponse,
  getCorsHeaders,
} from "@/lib/cors";

import { sendAppointmentScheduledEmail } from "@/lib/email-actions/send-appointment-scheduled-email";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function OPTIONS(req: Request) {
  return corsOptionsResponse(req);
}

export async function PATCH(
  req: Request,
  { params }: RouteParams
) {
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

    const body = await req.json();

    const {
      scheduledStart,
      adminNotes,
    } = body as {
      scheduledStart?: string;
      adminNotes?: string;
    };

    if (!scheduledStart) {
      return NextResponse.json(
        {
          success: false,
          message: "Scheduled date/time required.",
        },
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const existingAppointment =
      await prisma.appointment.findUnique({
        where: {
          id,
        },

        include: {
          user: true,
          payment: true,
        },
      });

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
      );
    }

    if (
      existingAppointment.status !==
      AppointmentStatus.PAID
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only paid appointments can be scheduled.",
        },
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const startDate = new Date(scheduledStart);

    const updatedAppointment =
      await prisma.appointment.update({
        where: {
          id,
        },

        data: {
          status: AppointmentStatus.SCHEDULED,

          scheduledStart: startDate,

          adminNotes:
            adminNotes?.trim() || null,
        },

        include: {
          user: true,
        },
      });

    await prisma.notification.create({
      data: {
        userId: existingAppointment.userId,

        type: NotificationType.SYSTEM,

        title: "Appointment Scheduled",

        message:
          "Your appointment has been scheduled successfully.",

        relatedAppointmentId:
          existingAppointment.id,
      },
    });

    await sendAppointmentScheduledEmail({
      to: existingAppointment.user.email,

      userName:
        existingAppointment.user.fullName,

      scheduledDate:
        startDate.toLocaleDateString(),

      scheduledTime:
        startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Appointment scheduled successfully.",

        appointment: updatedAppointment,
      },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );
  } catch (error) {
    console.error(
      "SCHEDULE_APPOINTMENT_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to schedule appointment.",
      },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}