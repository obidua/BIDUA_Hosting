// API client configuration

// Move the constant to a separate file to avoid circular dependencies if any, 
// but for now let's keep the logic here and just fix the syntax.

const rawBase = import.meta.env.VITE_API_URL || 'https://api.ramaerahosting.com';

// In development with Vite, use empty string to leverage proxy config
// In production, use the actual API URL
const isDevelopment = import.meta.env.DEV;
const PRIMARY_BASE = isDevelopment ? '' : (
  (rawBase.includes('localhost') || rawBase.includes('127.0.0.1'))
    ? rawBase
    : rawBase.replace('http://', 'https://')
);
const FALLBACK_BASE = isDevelopment ? '' : (
  PRIMARY_BASE.includes('localhost')
    ? PRIMARY_BASE.replace('localhost', '127.0.0.1')
    : PRIMARY_BASE
);

export const API_BASE_URL = PRIMARY_BASE;

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('access_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const attempt = async (base: string): Promise<T> => {
      // Ensure base doesn't end with slash and endpoint starts with slash, or vice versa
      const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${cleanBase}${cleanEndpoint}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          headers[key] = String(value);
        });
      }

      const isPublicEndpoint = endpoint.includes('/auth/login') ||
        endpoint.includes('/auth/register') ||
        endpoint.includes('/auth/send-otp') ||
        endpoint.includes('/auth/verify-otp') ||
        endpoint.includes('/auth/send-signup-otp') ||
        endpoint.includes('/auth/verify-signup-otp') ||
        endpoint.includes('/auth/forgot-password') ||
        endpoint.includes('/auth/send-reset-otp') ||
        endpoint.includes('/auth/verify-reset-otp') ||
        endpoint.includes('/auth/reset-password-with-otp') ||
        endpoint.includes('/auth/reset-password') ||
        endpoint.includes('/auth/verify-reset-token/') ||
        endpoint.includes('/affiliate/validate-code') ||
        endpoint.includes('/plans/all');

      if (!isPublicEndpoint) {
        const token = this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const config: RequestInit = {
        ...options,
        headers,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: response.statusText
        }));

        if (response.status === 401 && !isPublicEndpoint) {
          this.setToken(null);
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }

        throw new Error(error.detail || `Request failed with status ${response.status}`);
      }

      return await response.json();
    };

    try {
      return await attempt(this.baseUrl);
    } catch (err) {
      if (err instanceof TypeError && (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) && FALLBACK_BASE !== this.baseUrl) {
        return await attempt(FALLBACK_BASE);
      }
      throw err;
    }
  }

  // Generic HTTP methods for flexibility
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async signOut() {
    this.setToken(null);
    return { message: 'Signed out successfully' };
  }

  // Auth endpoints
  async signUp(data: any) {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(email: string, password: string) {
    const response = await this.request<{ access_token: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async getCurrentUser() {
    return this.request('/api/v1/auth/me', { method: 'GET' });
  }

  // User endpoints
  async getUsers(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/users/?${query}`, { method: 'GET' });
  }

  async getUserProfile(id: string | number) {
    return this.request(`/api/v1/users/${id}/`, { method: 'GET' });
  }

  // Plan endpoints
  async getPlans() {
    return this.request('/api/v1/plans/', { method: 'GET' });
  }

  async getPublicPlans() {
    return this.request('/api/v1/plans/all/', { method: 'GET' });
  }

  // Server endpoints
  async getServers(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/servers/?${query}`, { method: 'GET' });
  }

  async getServer(id: string | number) {
    return this.request(`/api/v1/servers/${id}/`, { method: 'GET' });
  }

  async createServer(data: any) {
    return this.request('/api/v1/servers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async performServerAction(id: string | number, action: string) {
    return this.request(`/api/v1/servers/${id}/action/`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  // Order endpoints
  async getOrders(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/orders/?${query}`, { method: 'GET' });
  }

  async getOrder(id: string | number) {
    return this.request(`/api/v1/orders/${id}/`, { method: 'GET' });
  }

  // Invoice endpoints
  async getInvoices(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/invoices/?${query}`, { method: 'GET' });
  }

  // Support endpoints
  async getSupportTickets(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/support/tickets/?${query}`, { method: 'GET' });
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/api/v1/dashboard/stats/', { method: 'GET' });
  }

  async getDashboardOverview() {
    return this.request('/api/v1/dashboard/overview/', { method: 'GET' });
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/api/v1/admin/stats/', { method: 'GET' });
  }

  async getAdminRevenuePace() {
    return this.request('/api/v1/admin/revenue-pace/', { method: 'GET' });
  }

  async getAdminActivityFeed() {
    return this.request('/api/v1/admin/activity-feed/', { method: 'GET' });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
