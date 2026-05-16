"use client";

import { ReactNode } from "react";
import { useUserRole, UserRole } from "@/hooks/useUserRole";

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { isLoaded, role } = useUserRole();

  if (!isLoaded) return null;

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}