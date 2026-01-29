"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  FileText,
  Palette,
  Mail,
  Send,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/invoice/new/welcome", label: "Welcome", icon: Home },
  { href: "/invoice/new/company", label: "Company Info", icon: Building2 },
  { href: "/invoice/new/details", label: "Invoice Details", icon: FileText },
  { href: "/invoice/new/design", label: "Select Design", icon: Palette },
  { href: "/invoice/new/email", label: "Email Details", icon: Mail },
  { href: "/invoice/new/review", label: "Send Invoice", icon: Send },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function WizardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-secondary border-r border-border p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold">Invoicer</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors relative",
                isActive
                  ? "text-primary bg-primary/8"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r" />
              )}
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Pro Plan Badge */}
      <div className="mt-auto pt-6 border-t border-border">
        <div className="text-sm">
          <p className="font-semibold text-gray-900">Pro Plan</p>
          <p className="text-gray-500 text-xs mt-1">
            You are using the free version.
          </p>
        </div>
      </div>
    </aside>
  );
}
