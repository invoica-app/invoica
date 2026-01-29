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
  private accessToken?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | undefined) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
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

// Helper to create API client with auth token
export function createAuthenticatedApi(accessToken?: string) {
  const client = new ApiClient(API_BASE_URL);
  if (accessToken) {
    client.setAccessToken(accessToken);
  }
  return client;
}

// Export individual methods for convenience
export const invoiceApi = {
  create: (data: CreateInvoiceRequest, token?: string) => {
    const client = createAuthenticatedApi(token);
    return client.createInvoice(data);
  },
  getAll: (status?: InvoiceStatus, token?: string) => {
    const client = createAuthenticatedApi(token);
    return client.getAllInvoices(status);
  },
  getById: (id: number, token?: string) => {
    const client = createAuthenticatedApi(token);
    return client.getInvoiceById(id);
  },
  update: (id: number, data: UpdateInvoiceRequest, token?: string) => {
    const client = createAuthenticatedApi(token);
    return client.updateInvoice(id, data);
  },
  delete: (id: number, token?: string) => {
    const client = createAuthenticatedApi(token);
    return client.deleteInvoice(id);
  },
};
