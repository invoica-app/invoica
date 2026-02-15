import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceStore {
  // Company Info
  companyLogo: string | null;
  companyName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
  companyEmail: string;

  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];

  // Client (Bill To)
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientCity: string;
  clientZip: string;
  clientCountry: string;

  // Tax, Discount, Notes
  taxRate: number;
  discount: number;
  notes: string;

  // Design
  primaryColor: string;
  fontFamily: string;

  // Email
  clientEmail: string;
  emailSubject: string;
  emailMessage: string;

  // Draft saved timestamp
  lastSaved: string;

  // Actions
  updateCompany: (data: Partial<InvoiceStore>) => void;
  updateInvoice: (data: Partial<InvoiceStore>) => void;
  updateClient: (data: Partial<InvoiceStore>) => void;
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  updateLineItem: (id: string, data: Partial<LineItem>) => void;
  setDesign: (color: string, font: string) => void;
  updateEmail: (data: Partial<InvoiceStore>) => void;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const initialState = {
  companyLogo: null,
  companyName: "",
  address: "",
  city: "",
  zipCode: "",
  country: "",
  phone: "",
  companyEmail: "",
  invoiceNumber: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  lineItems: [] as { id: string; description: string; quantity: number; rate: number; amount: number }[],
  primaryColor: "#9747E6",
  fontFamily: "Inter",
  clientEmail: "",
  emailSubject: "",
  emailMessage: "",
  // Client (Bill To) fields
  clientName: "",
  clientCompany: "",
  clientAddress: "",
  clientCity: "",
  clientZip: "",
  clientCountry: "",
  // Tax, Discount, Notes
  taxRate: 0,
  discount: 0,
  notes: "",
  lastSaved: new Date().toISOString(),
};

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateCompany: (data) =>
        set({
          ...data,
          lastSaved: new Date().toISOString(),
        }),

      updateInvoice: (data) =>
        set({
          ...data,
          lastSaved: new Date().toISOString(),
        }),

      updateClient: (data) =>
        set({
          ...data,
          lastSaved: new Date().toISOString(),
        }),

      addLineItem: () =>
        set((state) => ({
          lineItems: [
            ...state.lineItems,
            {
              id: generateId(),
              description: "",
              quantity: 1,
              rate: 0,
              amount: 0,
            },
          ],
          lastSaved: new Date().toISOString(),
        })),

      removeLineItem: (id) =>
        set((state) => ({
          lineItems: state.lineItems.filter((item) => item.id !== id),
          lastSaved: new Date().toISOString(),
        })),

      updateLineItem: (id, data) =>
        set((state) => {
          const updatedItems = state.lineItems.map((item) => {
            if (item.id === id) {
              const updated = { ...item, ...data };
              updated.amount = updated.quantity * updated.rate;
              return updated;
            }
            return item;
          });
          return {
            lineItems: updatedItems,
            lastSaved: new Date().toISOString(),
          };
        }),

      setDesign: (color, font) =>
        set({
          primaryColor: color,
          fontFamily: font,
          lastSaved: new Date().toISOString(),
        }),

      updateEmail: (data) =>
        set({
          ...data,
          lastSaved: new Date().toISOString(),
        }),

      reset: () => set({ ...initialState, lastSaved: new Date().toISOString() }),
    }),
    {
      name: "invoice-storage",
    }
  )
);
