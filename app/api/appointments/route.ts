import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in to request an appointment.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      age,
      heightCm,
      reason,
      userNotes,
    } = body;

    if (!firstName || !lastName || !email || !phone || !age || !heightCm) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required appointment fields.",
        },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found in database.",
        },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: dbUser.id,

        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        age: Number(age),
        heightCm: Number(heightCm),
        reason: reason ? String(reason).trim() : null,
        userNotes: userNotes ? String(userNotes).trim() : null,

        status: "PENDING",
        requestDate: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Appointment request submitted successfully.",
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_APPOINTMENT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating appointment request.",
      },
      { status: 500 }
    );
  }
}
