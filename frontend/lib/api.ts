import {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceStatus,
  ApiError,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    return this.request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllInvoices(status?: InvoiceStatus): Promise<Invoice[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<Invoice[]>(`/invoices${query}`);
  }

  async getInvoiceById(id: number): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}`);
  }

  async updateInvoice(id: number, data: UpdateInvoiceRequest): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoice(id: number): Promise<void> {
    return this.request<void>(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// Export individual methods for convenience
export const invoiceApi = {
  create: (data: CreateInvoiceRequest) => api.createInvoice(data),
  getAll: (status?: InvoiceStatus) => api.getAllInvoices(status),
  getById: (id: number) => api.getInvoiceById(id),
  update: (id: number, data: UpdateInvoiceRequest) => api.updateInvoice(id, data),
  delete: (id: number) => api.deleteInvoice(id),
};
