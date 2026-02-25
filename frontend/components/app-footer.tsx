"use client";

import { HealthStatus } from "@/components/health-status";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 px-6 py-5 md:px-8 md:py-4">
      <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
        <HealthStatus />
        <ThemeSwitcher />
        <p className="text-[11px] text-muted-foreground">&copy; 2025 Invoica</p>
      </div>
    </footer>
  );
}
