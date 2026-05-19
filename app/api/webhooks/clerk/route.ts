// app/api/webhooks/clerk/route.ts
// Clerk webhook: seeds User in Prisma on first sign-up, syncs role to Clerk metadata.
// Events: user.created, user.updated
//
// Setup: Clerk Dashboard → Webhooks → Add endpoint
//   URL: https://yourdomain.com/api/webhooks/clerk
//   Events: user.created, user.updated
//   Copy Signing Secret → CLERK_WEBHOOK_SECRET in .env
//
// Install: npm install svix

import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

import { prisma } from "@/lib/prisma";

import { clerkClient } from "@clerk/nextjs/server";

import { UserRole } from "@prisma/client";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkPhoneNumber {
  phone_number: string;
}

interface ClerkUserEventData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  phone_numbers: ClerkPhoneNumber[];
  first_name: string | null;
  last_name: string | null;
}

interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | string;
  data: ClerkUserEventData;
}

// ─────────────────────────────────────────────────────────────
// POST
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("Missing CLERK_WEBHOOK_SECRET");

      return NextResponse.json(
        {
          error: "Missing webhook secret",
        },
        {
          status: 500,
        }
      );
    }

    // ─────────────────────────────────────────────────────────
    // Verify Svix Headers
    // ─────────────────────────────────────────────────────────

    const svixId = req.headers.get("svix-id");

    const svixTimestamp = req.headers.get("svix-timestamp");

    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing svix headers");

      return NextResponse.json(
        {
          error: "Missing svix headers",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────────────────────────────────
    // Read raw body
    // ─────────────────────────────────────────────────────────

    const body = await req.text();

    // ─────────────────────────────────────────────────────────
    // Verify webhook signature
    // ─────────────────────────────────────────────────────────

    let event: ClerkWebhookEvent;

    try {
      const wh = new Webhook(WEBHOOK_SECRET);

      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;

      console.log("Webhook verified:", event.type);
    } catch (error) {
      console.error("Invalid webhook signature:", error);

      return NextResponse.json(
        {
          error: "Invalid webhook signature",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────────────────────────────────
    // USER CREATED
    // ─────────────────────────────────────────────────────────

    if (event.type === "user.created") {
      try {
        const { id, email_addresses, phone_numbers, first_name, last_name } =
          event.data;

        const email =
          email_addresses?.[0]?.email_address ?? `${id}@placeholder.clerk`;

        const phoneNumber = phone_numbers?.[0]?.phone_number ?? null;

        const fullName =
          [first_name, last_name].filter(Boolean).join(" ").trim() || "User";

        console.log("Creating DB user:", {
          clerkId: id,
          email,
          fullName,
        });

        const createdUser = await prisma.user.upsert({
          where: {
            clerkId: id,
          },

          create: {
            clerkId: id,

            email,

            fullName,

            phoneNumber,

            role: UserRole.FREE_USER,

            isVerified: true,
          },

          update: {},
        });

        console.log("DB user created:", createdUser.id);

        // ─────────────────────────────────────────────────────
        // Sync role to Clerk metadata
        // ─────────────────────────────────────────────────────

        await syncRoleToClerk(id, UserRole.FREE_USER);

        console.log("Clerk metadata synced");
      } catch (error) {
        console.error("USER_CREATED_WEBHOOK_ERROR:", error);

        return NextResponse.json(
          {
            error: "Failed user.created flow",
          },
          {
            status: 500,
          }
        );
      }
    }

    // ─────────────────────────────────────────────────────────
    // USER UPDATED
    // ─────────────────────────────────────────────────────────

    if (event.type === "user.updated") {
      try {
        const { id } = event.data;

        const user = await prisma.user.findUnique({
          where: {
            clerkId: id,
          },

          select: {
            role: true,
          },
        });

        if (user) {
          await syncRoleToClerk(id, user.role);

          console.log("User role re-synced");
        }
      } catch (error) {
        console.error("USER_UPDATED_WEBHOOK_ERROR:", error);

        return NextResponse.json(
          {
            error: "Failed user.updated flow",
          },
          {
            status: 500,
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("CLERK_WEBHOOK_FATAL_ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

async function syncRoleToClerk(clerkId: string, role: UserRole) {
  try {
    const client = await clerkClient();

    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role,
      },
    });

    console.log("Role synced to Clerk");
  } catch (error) {
    console.error("Failed syncing role to Clerk:", error);

    throw error;
  }
}
