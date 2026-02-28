import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Invoice, PaymentMethodType, MomoProvider, TemplateId } from "./types";
import { splitPhoneString } from "./country-codes";
import { useSettingsStore } from "./settings-store";

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
  phoneCode: string;
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

  // Payment Method
  paymentMethod: PaymentMethodType;
  momoProvider: MomoProvider;
  momoAccountName: string;
  momoNumber: string;
  momoCountryCode: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankSwiftCode: string;

  // Design
  primaryColor: string;
  fontFamily: string;
  templateId: TemplateId;
  authorizedSignature: string;

  // Currency
  currency: string;

  // Email
  clientEmail: string;
  emailSubject: string;
  emailMessage: string;

  // Draft saved timestamp
  lastSaved: string;

  // Editing state
  editingInvoiceId: number | null;
  editingInvoiceStatus: string | null;

  // Actions
  updateCompany: (data: Partial<InvoiceStore>) => void;
  updateInvoice: (data: Partial<InvoiceStore>) => void;
  updateClient: (data: Partial<InvoiceStore>) => void;
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  updateLineItem: (id: string, data: Partial<LineItem>) => void;
  setDesign: (color: string, font: string, templateId: TemplateId) => void;
  updatePayment: (data: Partial<InvoiceStore>) => void;
  updateEmail: (data: Partial<InvoiceStore>) => void;
  loadFromInvoice: (invoice: Invoice, id: number) => void;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

function getInitialState() {
  const settings = useSettingsStore.getState();
  return {
    companyLogo: null,
    companyName: "",
    address: "",
    city: "",
    zipCode: "00233",
    country: "Ghana",
    phoneCode: "+233",
    phone: "",
    companyEmail: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    lineItems: [] as { id: string; description: string; quantity: number; rate: number; amount: number }[],
    primaryColor: "",
    fontFamily: settings.defaultFont || "Inter",
    templateId: "modern" as TemplateId,
    authorizedSignature: "",
    currency: settings.defaultCurrency || "USD",
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
    // Payment Method
    paymentMethod: "momo" as PaymentMethodType,
    momoProvider: "mtn" as MomoProvider,
    momoAccountName: "",
    momoNumber: "",
    momoCountryCode: "GH",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankBranch: "",
    bankSwiftCode: "",
    lastSaved: new Date().toISOString(),
    editingInvoiceId: null,
    editingInvoiceStatus: null,
  };
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

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

      setDesign: (color, font, templateId) =>
        set({
          primaryColor: color,
          fontFamily: font,
          templateId,
          lastSaved: new Date().toISOString(),
        }),

      updatePayment: (data) =>
        set({
          ...data,
          lastSaved: new Date().toISOString(),
        }),

      updateEmail: (data) =>
        set({
          ...data,
          lastSaved: new Date().toISOString(),
        }),

      loadFromInvoice: (invoice: Invoice, id: number) => {
        const { phoneCode, localNumber } = splitPhoneString(invoice.phone, invoice.country);
        return set({
          editingInvoiceId: id,
          editingInvoiceStatus: invoice.status || "DRAFT",
          companyName: invoice.companyName,
          companyLogo: invoice.companyLogo ?? null,
          address: invoice.address,
          city: invoice.city,
          zipCode: invoice.zipCode,
          country: invoice.country,
          phoneCode,
          phone: localNumber,
          companyEmail: invoice.companyEmail,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          primaryColor: invoice.primaryColor,
          fontFamily: invoice.fontFamily,
          templateId: (invoice.templateId as TemplateId) || "modern",
          authorizedSignature: invoice.authorizedSignature ?? "",
          currency: invoice.currency,
          clientEmail: invoice.clientEmail,
          emailSubject: invoice.emailSubject ?? "",
          emailMessage: invoice.emailMessage ?? "",
          clientName: invoice.clientName ?? "",
          clientCompany: invoice.clientCompany ?? "",
          clientAddress: invoice.clientAddress ?? "",
          clientCity: invoice.clientCity ?? "",
          clientZip: invoice.clientZip ?? "",
          clientCountry: invoice.clientCountry ?? "",
          taxRate: invoice.taxRate ?? 0,
          discount: invoice.discount ?? 0,
          notes: invoice.notes ?? "",
          lineItems: invoice.lineItems.map((item) => ({
            id: generateId(),
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
          lastSaved: new Date().toISOString(),
        });
      },

      reset: () => set({ ...getInitialState(), lastSaved: new Date().toISOString() }),
    }),
    {
      name: "invoice-storage",
    }
  )
);
