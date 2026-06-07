import {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceStatus,
  ApiError,
  FileUploadResponse,
  AiAnalysisResponse,
  AiUsageResponse,
  AiTemplateResponse,
  AiTemplateMappingResponse,
  UserDashboardStats,
  Page,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

type TokenProvider = () => string | undefined;

class ApiClient {
  private baseUrl: string;
  private getToken: TokenProvider = () => undefined;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setTokenProvider(provider: TokenProvider) {
    this.getToken = provider;
  }

  private authHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.authHeaders(),
      ...(options.headers as Record<string, string>),
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          if (typeof window !== 'undefined') {
            const { signOut } = await import('next-auth/react');
            signOut({ callbackUrl: '/login' });
          }
          throw new Error('Session expired. Please log in again.');
        }

        let message = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const error: ApiError = await response.json();
          message = error.details?.length
            ? `${error.message}: ${error.details.join(", ")}`
            : error.message || message;
        } catch {
          // Response body wasn't valid JSON
        }
        throw new Error(message);
      }

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
  async createInvoice(data: CreateInvoiceRequest, sendEmail = true): Promise<Invoice> {
    const query = sendEmail ? '' : '?sendEmail=false';
    return this.request<Invoice>(`/invoices${query}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllInvoices(status?: InvoiceStatus, page = 0, size = 20): Promise<Page<Invoice>> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('size', String(size));
    return this.request<Page<Invoice>>(`/invoices?${params}`);
  }

  async getInvoiceById(id: number): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}`);
  }

  async updateInvoice(id: number, data: UpdateInvoiceRequest, resend = false): Promise<Invoice> {
    const query = resend ? '?resend=true' : '';
    return this.request<Invoice>(`/invoices/${id}${query}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoice(id: number): Promise<void> {
    return this.request<void>(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboardStats(): Promise<UserDashboardStats> {
    return this.request<UserDashboardStats>('/invoices/dashboard-stats');
  }

  async recordDownload(id: number): Promise<void> {
    return this.request<void>(`/invoices/${id}/download`, {
      method: 'POST',
    });
  }

  async downloadPdf(data: CreateInvoiceRequest): Promise<Blob> {
    const url = `${this.baseUrl}/invoices/pdf-preview`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.authHeaders(),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`PDF generation failed: HTTP ${response.status}`);
    }

    return response.blob();
  }

  // Feedback API methods
  async submitFeedback(data: FeedbackData): Promise<FeedbackResponse> {
    return this.request<FeedbackResponse>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkFeedback(invoiceId: number): Promise<{ feedbackGiven: boolean }> {
    return this.request<{ feedbackGiven: boolean }>(`/feedback/check/${invoiceId}`);
  }

  async getFeedbackCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>('/feedback/count');
  }

  async getPublicInvoice(publicToken: string): Promise<Invoice> {
    const url = `${this.baseUrl}/invoices/public/${publicToken}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Invoice not found: HTTP ${response.status}`);
    }
    return response.json();
  }

  async downloadPublicPdf(publicToken: string): Promise<Blob> {
    const url = `${this.baseUrl}/invoices/public/${publicToken}/pdf`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PDF download failed: HTTP ${response.status}`);
    }
    return response.blob();
  }

  // AI API methods
  async analyzeInvoice(file: File): Promise<AiAnalysisResponse> {
    const url = `${this.baseUrl}/ai/analyze-invoice`;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.authHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw Object.assign(new Error(error.message || `Analysis failed: HTTP ${response.status}`), {
        status: response.status,
      });
    }

    return response.json();
  }

  async getAiUsage(): Promise<AiUsageResponse> {
    return this.request<AiUsageResponse>('/ai/usage');
  }

  async saveAiTemplate(data: { name: string; analysisJson: string; sampleImageUrl?: string | null }): Promise<AiTemplateResponse> {
    return this.request<AiTemplateResponse>('/ai/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAiTemplates(): Promise<AiTemplateResponse[]> {
    return this.request<AiTemplateResponse[]>('/ai/templates');
  }

  async mapTemplate(analysisJson: string): Promise<AiTemplateMappingResponse> {
    return this.request<AiTemplateMappingResponse>('/ai/map-template', {
      method: 'POST',
      body: JSON.stringify({ analysisJson }),
    });
  }

  // Subscription / Paystack
  async initializeSubscription(): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
    return this.request('/subscription/initialize', { method: 'POST' });
  }

  async verifySubscription(reference: string): Promise<{ status: string; reference: string }> {
    return this.request(`/subscription/verify/${reference}`);
  }

  async getSubscriptionConfig(): Promise<{ publicKey: string; amount: number; currency: string }> {
    return this.request('/subscription/config');
  }

  async uploadLogo(file: File): Promise<FileUploadResponse> {
    const url = `${this.baseUrl}/upload/logo`;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.authHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || `Upload failed: HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const api = new ApiClient(API_BASE_URL);

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
  submit: (data: FeedbackData) => api.submitFeedback(data),
  check: (invoiceId: number) => api.checkFeedback(invoiceId),
  getCount: () => api.getFeedbackCount(),
};

export const aiApi = {
  analyzeInvoice: (file: File) => api.analyzeInvoice(file),
  getUsage: () => api.getAiUsage(),
  saveTemplate: (data: { name: string; analysisJson: string; sampleImageUrl?: string | null }) =>
    api.saveAiTemplate(data),
  getTemplates: () => api.getAiTemplates(),
  mapTemplate: (analysisJson: string) => api.mapTemplate(analysisJson),
};

export const invoiceApi = {
  getDashboardStats: () => api.getDashboardStats(),
  create: (data: CreateInvoiceRequest, sendEmail?: boolean) => api.createInvoice(data, sendEmail),
  getAll: (status?: InvoiceStatus, page?: number, size?: number) =>
    api.getAllInvoices(status, page, size),
  getById: (id: number) => api.getInvoiceById(id),
  update: (id: number, data: UpdateInvoiceRequest, resend?: boolean) =>
    api.updateInvoice(id, data, resend),
  delete: (id: number) => api.deleteInvoice(id),
  recordDownload: (id: number) => api.recordDownload(id),
  downloadPdf: (data: CreateInvoiceRequest) => api.downloadPdf(data),
  uploadLogo: (file: File) => api.uploadLogo(file),
  getPublicInvoice: (publicToken: string) => api.getPublicInvoice(publicToken),
  downloadPublicPdf: (publicToken: string) => api.downloadPublicPdf(publicToken),
};
