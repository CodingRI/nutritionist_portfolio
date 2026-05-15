// hooks/useUserRole.ts
// Reads the current user's role from Clerk session claims (publicMetadata).
// The role string matches your UserRole enum: FREE_USER | CHAT_USER | APPOINTMENT_USER | ADMIN

import { useAuth } from '@clerk/nextjs';

export type UserRole = 'FREE_USER' | 'CHAT_USER' | 'APPOINTMENT_USER' | 'ADMIN' | null;

interface UseUserRoleReturn {
  role: UserRole;
  isLoaded: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
  isChatUser: boolean;        // paid: WhatsApp/chat access
  isAppointmentUser: boolean; // paid: appointment booking access
  isFreeUser: boolean;        // signed in but unpaid
}

export function useUserRole(): UseUserRoleReturn {
  const { isLoaded, isSignedIn, sessionClaims } = useAuth();

  const role = (
    (sessionClaims?.publicMetadata as { role?: UserRole } | undefined)?.role ?? 
    (isSignedIn ? 'FREE_USER' : null)
  ) as UserRole;

  return {
    role,
    isLoaded,
    isSignedIn:        !!isSignedIn,
    isAdmin:           role === 'ADMIN',
    isChatUser:        role === 'CHAT_USER' || role === 'ADMIN',
    isAppointmentUser: role === 'APPOINTMENT_USER' || role === 'ADMIN',
    isFreeUser:        role === 'FREE_USER',
  };
}