"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function SystemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g clipPath="url(#clip_sys)">
        <path d="M8.75014 14.53C7.82714 14.5901 6.91115 14.7549 6.02415 15.0339C5.62915 15.1589 5.41015 15.5791 5.53515 15.9751C5.65915 16.3691 6.07614 16.5869 6.47514 16.4651C8.43414 15.8482 10.5651 15.8482 12.5241 16.4651C12.5991 16.488 12.6751 16.5 12.7501 16.5C13.0681 16.5 13.3641 16.2949 13.4651 15.9761C13.5901 15.5811 13.3701 15.1599 12.9761 15.0349C12.0911 14.7549 11.1741 14.5901 10.2501 14.531V13.501H14.7501C14.7534 13.501 14.7564 13.5 14.7597 13.5H8.75014V14.53Z" fill="currentColor" />
        <path fillRule="evenodd" clipRule="evenodd" d="M14.75 2C16.267 2 17.5 3.2329 17.5 4.75V10.751C17.5 12.2646 16.2723 13.4946 14.7598 13.5H4.25C2.73311 13.4999 1.5 12.267 1.5 10.75V4.75C1.5 3.23298 2.73311 2.00013 4.25 2H14.75ZM7.60059 6.7207C7.03235 6.7207 6.57129 7.18176 6.57129 7.75C6.5713 8.31823 7.03235 8.7793 7.60059 8.7793H11.3994C11.9676 8.7793 12.4287 8.31823 12.4287 7.75C12.4287 7.18176 11.9677 6.7207 11.3994 6.7207H7.60059Z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id="clip_sys">
          <rect width="18" height="18" fill="white" transform="translate(0.5)" />
        </clipPath>
      </defs>
    </svg>
  );
}

function LightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M9 3C9.414 3 9.75 2.664 9.75 2.25V1.25C9.75 0.836 9.414 0.5 9 0.5C8.586 0.5 8.25 0.836 8.25 1.25V2.25C8.25 2.664 8.586 3 9 3Z" fill="currentColor" />
      <path d="M13.773 4.977C13.965 4.977 14.157 4.904 14.303 4.757L15.01 4.05C15.303 3.757 15.303 3.282 15.01 2.989C14.717 2.696 14.242 2.696 13.949 2.989L13.242 3.696C12.949 3.989 12.949 4.464 13.242 4.757C13.388 4.903 13.581 4.977 13.773 4.977Z" fill="currentColor" />
      <path d="M16.75 8.25H15.75C15.336 8.25 15 8.586 15 9C15 9.414 15.336 9.75 15.75 9.75H16.75C17.164 9.75 17.5 9.414 17.5 9C17.5 8.586 17.164 8.25 16.75 8.25Z" fill="currentColor" />
      <path d="M14.303 13.243C14.01 12.95 13.535 12.95 13.242 13.243C12.949 13.536 12.949 14.011 13.242 14.304L13.949 15.011C14.095 15.157 14.287 15.231 14.479 15.231C14.671 15.231 14.863 15.158 15.009 15.011C15.302 14.718 15.302 14.243 15.009 13.95L14.302 13.243H14.303Z" fill="currentColor" />
      <path d="M9 15C8.586 15 8.25 15.336 8.25 15.75V16.75C8.25 17.164 8.586 17.5 9 17.5C9.414 17.5 9.75 17.164 9.75 16.75V15.75C9.75 15.336 9.414 15 9 15Z" fill="currentColor" />
      <path d="M3.697 13.243L2.99 13.95C2.697 14.243 2.697 14.718 2.99 15.011C3.136 15.157 3.328 15.231 3.52 15.231C3.712 15.231 3.904 15.158 4.05 15.011L4.757 14.304C5.05 14.011 5.05 13.536 4.757 13.243C4.464 12.95 3.99 12.95 3.697 13.243Z" fill="currentColor" />
      <path d="M3 9C3 8.586 2.664 8.25 2.25 8.25H1.25C0.836 8.25 0.5 8.586 0.5 9C0.5 9.414 0.836 9.75 1.25 9.75H2.25C2.664 9.75 3 9.414 3 9Z" fill="currentColor" />
      <path d="M3.697 4.757C3.843 4.903 4.035 4.977 4.227 4.977C4.419 4.977 4.611 4.904 4.757 4.757C5.05 4.464 5.05 3.989 4.757 3.696L4.05 2.989C3.757 2.696 3.282 2.696 2.989 2.989C2.696 3.282 2.696 3.757 2.989 4.05L3.697 4.757Z" fill="currentColor" />
      <path d="M9 14C11.7614 14 14 11.7614 14 9C14 6.23858 11.7614 4 9 4C6.23858 4 4 6.23858 4 9C4 11.7614 6.23858 14 9 14Z" fill="currentColor" />
    </svg>
  );
}

function DarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M15.705 9.22299C15.459 9.03999 15.126 9.02599 14.867 9.18599C13.999 9.71799 13.008 9.99899 12 9.99899C8.967 9.99899 6.5 7.53199 6.5 4.49899C6.5 3.35299 6.854 2.25199 7.523 1.31299C7.7 1.06399 7.709 0.731993 7.544 0.473993C7.38 0.215993 7.077 0.0879926 6.774 0.139993C2.994 0.846993 0.25 4.15199 0.25 7.99999C0.25 12.411 3.839 16 8.25 16C11.888 16 15.069 13.539 15.985 10.014C16.062 9.71799 15.951 9.40499 15.705 9.22299Z" fill="currentColor" />
    </svg>
  );
}

type ThemeOption = "system" | "light" | "dark";

const options: { value: ThemeOption; icon: typeof SystemIcon; label: string }[] = [
  { value: "system", icon: SystemIcon, label: "System theme" },
  { value: "light", icon: LightIcon, label: "Light theme" },
  { value: "dark", icon: DarkIcon, label: "Dark theme" },
];

const translateMap: Record<ThemeOption, string> = {
  system: "translateX(0px)",
  light: "translateX(24px)",
  dark: "translateX(48px)",
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = (mounted ? theme : "system") as ThemeOption;

  return (
    <div
      role="radiogroup"
      aria-label="Theme switcher"
      className="relative inline-flex items-center gap-0 rounded-full bg-muted p-0.5"
    >
      {/* Sliding indicator */}
      <div
        className="absolute left-0.5 w-6 h-6 rounded-full bg-background shadow-sm transition-transform duration-[250ms] ease-in-out"
        style={{ transform: translateMap[current] }}
      />

      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={current === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-[250ms] ease-in-out"
        >
          <Icon
            className={`w-3.5 h-3.5 transition-colors duration-[250ms] ease-in-out ${
              current === value ? "text-foreground" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
