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
  companyName: "Acme Corp",
  address: "123 Business St",
  city: "Tech City",
  zipCode: "10001",
  country: "USA",
  phone: "+1 (555) 123-4567",
  companyEmail: "billing@acme.com",
  invoiceNumber: "INV-001",
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  lineItems: [
    {
      id: generateId(),
      description: "Web Design Services",
      quantity: 10,
      rate: 150,
      amount: 1500,
    },
    {
      id: generateId(),
      description: "Hosting (Annual)",
      quantity: 1,
      rate: 200,
      amount: 200,
    },
  ],
  primaryColor: "#9747E6",
  fontFamily: "Inter",
  clientEmail: "client@example.com",
  emailSubject: "",
  emailMessage:
    "Hi,\n\nPlease find attached the invoice for our recent services.\n\nThanks,\nAcme Corp",
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
