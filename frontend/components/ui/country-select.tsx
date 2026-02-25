"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRIES } from "@/lib/countries";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  error?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country",
  id,
  error,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = search
    ? COUNTRIES.filter((c) =>
        c.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      const selected = listRef.current.querySelector("[data-selected]");
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [open]);

  const handleSelect = (country: string) => {
    onChange(country);
    setOpen(false);
    setSearch("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!open) setOpen(true);
  };

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
      <div
        className={cn(
          "flex h-10 w-full items-center rounded-lg border bg-muted/30 px-3 text-sm shadow-sm transition-all duration-200 cursor-text hover:border-border hover:bg-muted/40",
          error
            ? "border-red-400/50 focus-within:border-red-400/50 focus-within:ring-2 focus-within:ring-red-400/10"
            : "border-border/60 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 focus-within:bg-background"
        )}
        onClick={() => {
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={open ? search : value}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value || placeholder}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50 min-w-0"
          autoComplete="off"
        />
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform",
          open && "rotate-180"
        )} />
      </div>

      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-border bg-background shadow-lg py-1"
        >
          {filtered.length > 0 ? (
            filtered.map((country) => (
              <li
                key={country}
                data-selected={country === value ? "" : undefined}
                onClick={() => handleSelect(country)}
                className={cn(
                  "px-3 py-1.5 text-sm cursor-pointer transition-colors",
                  country === value
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {country}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No countries found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
