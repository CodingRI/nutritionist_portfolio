import { resend } from "@/lib/resend";

import AppointmentPaymentEmail from "@/lib/emails/appointment-payment-request";

export async function sendAppointmentPaymentEmail({
  to,
  userName,
  amount,
}: {
  to: string;
  userName: string;
  amount: number;
}) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM!,

      to,

      subject: "Appointment Payment Request - NourishWell",

      react: AppointmentPaymentEmail({
        userName,
        amount,
      }),
    });

    return data;
  } catch (error) {
    console.error(
      "SEND_APPOINTMENT_PAYMENT_EMAIL_ERROR:",
      error
    );

    throw error;
  }
}