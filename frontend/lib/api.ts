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
        // Include validation details if present (e.g. "invoiceNumber: Invoice number is required")
        const message = error.details?.length
          ? `${error.message}: ${error.details.join(", ")}`
          : error.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
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

  async updateInvoice(id: number, data: UpdateInvoiceRequest, resend = false, token?: string): Promise<Invoice> {
    const query = resend ? '?resend=true' : '';
    return this.request<Invoice>(`/invoices/${id}${query}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteInvoice(id: number, token?: string): Promise<void> {
    return this.request<void>(`/invoices/${id}`, {
      method: 'DELETE',
    }, token);
  }

  async recordDownload(id: number, token?: string): Promise<void> {
    return this.request<void>(`/invoices/${id}/download`, {
      method: 'POST',
    }, token);
  }

  // Feedback API methods
  async submitFeedback(data: FeedbackData, token?: string): Promise<FeedbackResponse> {
    return this.request<FeedbackResponse>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async checkFeedback(invoiceId: number, token?: string): Promise<{ feedbackGiven: boolean }> {
    return this.request<{ feedbackGiven: boolean }>(`/feedback/check/${invoiceId}`, {}, token);
  }

  async getFeedbackCount(token?: string): Promise<{ count: number }> {
    return this.request<{ count: number }>('/feedback/count', {}, token);
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

export interface FeedbackData {
  type: string;
  category?: string;
  rating?: number;
  npsScore?: number;
  easeScore?: number;
  message?: string;
  invoiceId?: number;
  page?: string;
  userAgent?: string;
}

export interface FeedbackResponse {
  id: number;
  userId: number;
  type: string;
  category: string | null;
  rating: number | null;
  npsScore: number | null;
  easeScore: number | null;
  message: string | null;
  invoiceId: number | null;
  page: string | null;
  userAgent: string | null;
  createdAt: string;
}

export const feedbackApi = {
  submit: (data: FeedbackData, token?: string) =>
    api.submitFeedback(data, token),
  check: (invoiceId: number, token?: string) =>
    api.checkFeedback(invoiceId, token),
  getCount: (token?: string) =>
    api.getFeedbackCount(token),
};

export const invoiceApi = {
  create: (data: CreateInvoiceRequest, token?: string) =>
    api.createInvoice(data, token),
  getAll: (status?: InvoiceStatus, token?: string) =>
    api.getAllInvoices(status, token),
  getById: (id: number, token?: string) =>
    api.getInvoiceById(id, token),
  update: (id: number, data: UpdateInvoiceRequest, resend?: boolean, token?: string) =>
    api.updateInvoice(id, data, resend, token),
  delete: (id: number, token?: string) =>
    api.deleteInvoice(id, token),
  recordDownload: (id: number, token?: string) =>
    api.recordDownload(id, token),
  uploadLogo: (file: File, token?: string) =>
    api.uploadLogo(file, token),
};
