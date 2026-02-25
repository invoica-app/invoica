"use client";

import { useState, useEffect, ReactNode } from "react";

export function HydrationGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return <>{fallback}</>;

  return <>{children}</>;
}
