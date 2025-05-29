// hooks/useCurrentUser.ts
'use client';
import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<null | Record<string, any>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return { user, loading };
}
