// Shared types matching backend DTOs

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';

export interface LineItem {
  id?: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id?: number;
  // Company Info
  companyName: string;
  companyLogo?: string | null;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
  companyEmail: string;
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;  // ISO date format
  dueDate: string;      // ISO date format
  // Client (Bill To)
  clientName?: string | null;
  clientCompany?: string | null;
  clientAddress?: string | null;
  clientCity?: string | null;
  clientZip?: string | null;
  clientCountry?: string | null;
  // Tax, Discount, Notes
  taxRate?: number | null;
  discount?: number | null;
  notes?: string | null;
  // Design
  primaryColor: string;
  fontFamily: string;
  // Currency
  currency: string;
  // Email
  clientEmail: string;
  emailSubject?: string | null;
  emailMessage?: string | null;
  // Line Items
  lineItems: LineItem[];
  // Calculated
  totalAmount?: number;
  // Status
  status?: InvoiceStatus;
  // Audit
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInvoiceRequest {
  companyName: string;
  companyLogo?: string | null;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
  companyEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  primaryColor: string;
  fontFamily: string;
  currency: string;
  clientEmail: string;
  emailSubject?: string | null;
  emailMessage?: string | null;
  // Client (Bill To)
  clientName?: string | null;
  clientCompany?: string | null;
  clientAddress?: string | null;
  clientCity?: string | null;
  clientZip?: string | null;
  clientCountry?: string | null;
  // Tax, Discount, Notes
  taxRate?: number | null;
  discount?: number | null;
  notes?: string | null;
  lineItems: LineItemRequest[];
}

export interface UpdateInvoiceRequest {
  companyName?: string;
  companyLogo?: string | null;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  companyEmail?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  primaryColor?: string;
  fontFamily?: string;
  currency?: string;
  clientEmail?: string;
  emailSubject?: string | null;
  emailMessage?: string | null;
  // Client (Bill To)
  clientName?: string | null;
  clientCompany?: string | null;
  clientAddress?: string | null;
  clientCity?: string | null;
  clientZip?: string | null;
  clientCountry?: string | null;
  // Tax, Discount, Notes
  taxRate?: number | null;
  discount?: number | null;
  notes?: string | null;
  lineItems?: LineItem[];
  status?: InvoiceStatus;
}

export interface LineItemRequest {
  description: string;
  quantity: number;
  rate: number;
}

export interface FileUploadResponse {
  url: string;
  fileName: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details?: string[];
}
