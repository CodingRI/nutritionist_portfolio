// hooks/useUserRole.ts
// Reads the current user's role from Clerk session claims (publicMetadata).
// The role string matches your UserRole enum: FREE_USER | CHAT_USER | APPOINTMENT_USER | ADMIN

import { useAuth, useUser } from '@clerk/nextjs';

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
  const { isLoaded, isSignedIn, user } = useUser();

  const metadataRole = user?.publicMetadata?.role as UserRole | undefined;

  const role = metadataRole ?? (isSignedIn ? 'FREE_USER' : null);

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