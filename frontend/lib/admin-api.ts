const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Types matching backend AdminDto.kt
export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalInvoices: number;
  paidRevenue: number;
  activeUsers30d: number;
  invoicesByStatus: Record<string, number>;
  invoicesOverTime: TimeSeriesPoint[];
  revenueOverTime: TimeSeriesPoint[];
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  provider: string;
  isGuest: boolean;
  isDisabled: boolean;
  invoiceCount: number;
  totalRevenue: number;
  createdAt: string;
}

export interface AdminUserList {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminInvoice {
  id: number;
  invoiceNumber: string;
  companyName: string;
  clientName: string | null;
  clientEmail: string;
  totalAmount: number;
  status: string;
  ownerEmail: string | null;
  ownerName: string | null;
  invoiceDate: string;
  createdAt: string;
}

export interface AdminInvoiceList {
  invoices: AdminInvoice[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SystemHealth {
  apiStatus: string;
  databaseStatus: string;
  uptime: number;
  jvmMemoryUsed: number;
  jvmMemoryMax: number;
  jvmMemoryPercent: number;
}

async function adminRequest<T>(
  endpoint: string,
  token?: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const adminApi = {
  getDashboard: (token?: string) =>
    adminRequest<DashboardStats>("/admin/dashboard", token),

  getUsers: (page: number, pageSize: number, search?: string, token?: string) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set("search", search);
    return adminRequest<AdminUserList>(`/admin/users?${params}`, token);
  },

  getUserById: (id: number, token?: string) =>
    adminRequest<AdminUser>(`/admin/users/${id}`, token),

  updateUserStatus: (id: number, disabled: boolean, token?: string) =>
    adminRequest<AdminUser>(`/admin/users/${id}/status`, token, {
      method: "PATCH",
      body: JSON.stringify({ disabled }),
    }),

  getInvoices: (page: number, pageSize: number, status?: string, search?: string, token?: string) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    return adminRequest<AdminInvoiceList>(`/admin/invoices?${params}`, token);
  },

  getInvoiceById: (id: number, token?: string) =>
    adminRequest<AdminInvoice>(`/admin/invoices/${id}`, token),

  getHealth: (token?: string) =>
    adminRequest<SystemHealth>("/admin/health", token),
};
