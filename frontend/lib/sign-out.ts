import { signOut } from "next-auth/react";

export function handleSignOut() {
  // Clear sensitive invoice and payment data from localStorage
  localStorage.removeItem("invoice-storage");
  localStorage.removeItem("invoica-settings");
  signOut({ callbackUrl: "/login" });
}
