// src/hooks/useCurrentUser.ts
import { useSession } from "next-auth/react";

export function useCurrentUserId(): string | null {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  return session?.user?.provider ?? null;
}
