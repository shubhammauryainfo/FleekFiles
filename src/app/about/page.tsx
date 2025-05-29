'use client';
import { useCurrentUserId } from "@/hooks/useCurrentUser";

export default function page() {
  const userId = useCurrentUserId();

  return <div>User ID: {userId ?? "Not logged in"}</div>;
}
