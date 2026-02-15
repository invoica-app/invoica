import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  // Default Currency
  defaultCurrency: string;

  // Default Company Info
  defaultCompanyName: string;
  defaultAddress: string;
  defaultCity: string;
  defaultZipCode: string;
  defaultCountry: string;
  defaultPhone: string;
  defaultCompanyEmail: string;

  // Invoice Numbering
  invoicePrefix: string;
  nextInvoiceNumber: number;

  // Email Defaults
  defaultEmailSubject: string;
  defaultEmailMessage: string;

  // Theme Defaults
  defaultColor: string;
  defaultFont: string;

  // Actions
  updateSettings: (data: Partial<SettingsStore>) => void;
  getNextInvoiceNumber: () => string;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      defaultCurrency: "USD",
      defaultCompanyName: "",
      defaultAddress: "",
      defaultCity: "",
      defaultZipCode: "",
      defaultCountry: "",
      defaultPhone: "",
      defaultCompanyEmail: "",
      invoicePrefix: "INV-",
      nextInvoiceNumber: 1,
      defaultEmailSubject: "",
      defaultEmailMessage: "",
      defaultColor: "#9747E6",
      defaultFont: "Inter",

      updateSettings: (data) => set({ ...data }),

      getNextInvoiceNumber: () => {
        const state = get();
        const num = String(state.nextInvoiceNumber).padStart(3, "0");
        return `${state.invoicePrefix}${num}`;
      },
    }),
    {
      name: "invoica-settings",
    }
  )
);
