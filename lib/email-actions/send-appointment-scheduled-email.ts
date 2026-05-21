import { resend } from "@/lib/resend";

import AppointmentScheduledEmail from "@/lib/emails/appointment-scheduled";

export async function sendAppointmentScheduledEmail({
  to,
  userName,
  scheduledDate,
  scheduledTime,
}: {
  to: string;
  userName: string;
  scheduledDate: string;
  scheduledTime: string;
}) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM!,

      to,

      subject: "Your Appointment Has Been Scheduled",

      react: AppointmentScheduledEmail({
        userName,
        scheduledDate,
        scheduledTime,
      }),
    });

    return data;
  } catch (error) {
    console.error(
      "SEND_APPOINTMENT_SCHEDULED_EMAIL_ERROR:",
      error
    );

    throw error;
  }
}