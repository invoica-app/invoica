import {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceStatus,
  ApiError,
  FileUploadResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Invoice API methods
  async createInvoice(data: CreateInvoiceRequest, token?: string): Promise<Invoice> {
    return this.request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getAllInvoices(status?: InvoiceStatus, token?: string): Promise<Invoice[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<Invoice[]>(`/invoices${query}`, {}, token);
  }

  async getInvoiceById(id: number, token?: string): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}`, {}, token);
  }

  async updateInvoice(id: number, data: UpdateInvoiceRequest, token?: string): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteInvoice(id: number, token?: string): Promise<void> {
    return this.request<void>(`/invoices/${id}`, {
      method: 'DELETE',
    }, token);
  }

  async uploadLogo(file: File, token?: string): Promise<FileUploadResponse> {
    const url = `${this.baseUrl}/upload/logo`;
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || `Upload failed: HTTP ${response.status}`);
    }

    return response.json();
  }
}

// Single reusable instance — token passed per-request, no allocation per call
const api = new ApiClient(API_BASE_URL);

export const invoiceApi = {
  create: (data: CreateInvoiceRequest, token?: string) =>
    api.createInvoice(data, token),
  getAll: (status?: InvoiceStatus, token?: string) =>
    api.getAllInvoices(status, token),
  getById: (id: number, token?: string) =>
    api.getInvoiceById(id, token),
  update: (id: number, data: UpdateInvoiceRequest, token?: string) =>
    api.updateInvoice(id, data, token),
  delete: (id: number, token?: string) =>
    api.deleteInvoice(id, token),
  uploadLogo: (file: File, token?: string) =>
    api.uploadLogo(file, token),
};
