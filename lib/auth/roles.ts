// src/lib/auth/roles.ts

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function getCurrentDbUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  return dbUser;
}

export async function requireAuth() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    throw new Error("UNAUTHORIZED");
  }

  return dbUser;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const dbUser = await requireAuth();

  if (!allowedRoles.includes(dbUser.role)) {
    throw new Error("FORBIDDEN");
  }

  return dbUser;
}

export async function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}
