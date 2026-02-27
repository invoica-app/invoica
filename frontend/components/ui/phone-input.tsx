"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  PHONE_COUNTRIES,
  getDefaultPhoneCountry,
  findPhoneCountry,
  type PhoneCountry,
} from "@/lib/phone-countries";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  /** The selected country ISO code (e.g. "GH"). */
  countryCode?: string;
  /** The local phone number (without dial code). */
  value: string;
  /** Called when the phone number changes. */
  onChange: (value: string) => void;
  /** Called when the country selection changes. */
  onCountryChange?: (country: PhoneCountry) => void;
  placeholder?: string;
  error?: boolean;
  id?: string;
}

export function PhoneInput({
  countryCode,
  value,
  onChange,
  onCountryChange,
  placeholder = "24 123 4567",
  error,
  id,
}: PhoneInputProps) {
  const [selected, setSelected] = useState<PhoneCountry>(() => {
    if (countryCode) {
      return findPhoneCountry(countryCode) ?? getDefaultPhoneCountry();
    }
    return getDefaultPhoneCountry();
  });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync if countryCode prop changes externally
  useEffect(() => {
    if (countryCode) {
      const found = findPhoneCountry(countryCode);
      if (found && found.iso !== selected.iso) {
        setSelected(found);
      }
    }
  }, [countryCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to selected on open
  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
      if (listRef.current) {
        const el = listRef.current.querySelector("[data-selected]");
        if (el) el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [open]);

  const filtered = search
    ? PHONE_COUNTRIES.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.iso.toLowerCase().includes(q) ||
          c.dialCode.includes(q)
        );
      })
    : PHONE_COUNTRIES;

  const handleSelect = useCallback(
    (country: PhoneCountry) => {
      setSelected(country);
      onCountryChange?.(country);
      setOpen(false);
      setSearch("");
    },
    [onCountryChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
    if (e.key === "Enter" && filtered.length === 1) {
      handleSelect(filtered[0]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input row */}
      <div
        className={cn(
          "flex h-10 w-full rounded-lg border shadow-sm transition-all duration-200 overflow-hidden",
          error
            ? "border-red-400/50 focus-within:border-red-400/50 focus-within:ring-2 focus-within:ring-red-400/10"
            : "border-border/60 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15"
        )}
      >
        {/* Flag button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "flex items-center gap-1 px-2.5 border-r border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors shrink-0",
            "focus-visible:outline-none focus-visible:bg-muted/60"
          )}
        >
          <span className="text-lg leading-none">{selected.flag}</span>
          <ChevronDown
            className={cn(
              "w-3 h-3 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {/* Phone number input */}
        <input
          id={id}
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-muted/30 px-3 text-sm outline-none placeholder:text-muted-foreground/50 hover:bg-muted/40 focus:bg-background transition-colors min-w-0"
        />
      </div>

      {/* Country hint */}
      <p className="mt-1.5 text-[11px] text-muted-foreground/70">
        {selected.flag} {selected.name} ({selected.dialCode})
      </p>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border/60">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search countries..."
              className="w-full bg-muted/30 rounded-md px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground/50 focus:bg-muted/50 transition-colors"
              autoComplete="off"
            />
          </div>

          {/* Country list */}
          <ul ref={listRef} className="max-h-48 overflow-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((country) => (
                <li
                  key={country.iso}
                  data-selected={
                    country.iso === selected.iso ? "" : undefined
                  }
                  onClick={() => handleSelect(country)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer transition-colors",
                    country.iso === selected.iso
                      ? "bg-primary/10 font-medium"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="text-base leading-none shrink-0">
                    {country.flag}
                  </span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {country.dialCode}
                  </span>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                No countries found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
