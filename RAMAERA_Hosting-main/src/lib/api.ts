const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
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
        const error = await response.json().catch(() => ({
          detail: response.statusText
        }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Only log errors that aren't authentication related
      if (error instanceof Error && !error.message.includes('Not authenticated') && !error.message.includes('401')) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // Auth endpoints
  async signUp(email: string, password: string, username: string, fullName: string) {
    return this.request('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, full_name: fullName }),
    });
  }

  async signIn(email: string, password: string) {
    const response = await this.request<{ access_token: string; token_type: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async signOut() {
    this.setToken(null);
    return { success: true };
  }

  async getCurrentUser() {
    try {
      return await this.request('/api/v1/auth/me', {
        method: 'GET',
      });
    } catch (error) {
      // Return null if not authenticated instead of throwing
      return null;
    }
  }

  async refreshToken() {
    return this.request<{ access_token: string }>('/api/v1/auth/refresh', {
      method: 'POST',
    });
  }

  // User endpoints
  async getUsers(params?: { skip?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.skip) query.append('skip', params.skip.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return this.request(`/api/v1/users?${query.toString()}`, {
      method: 'GET',
    });
  }

  async getUserProfile(userId: string) {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'GET',
    });
  }

  async updateUserProfile(userId: string, data: any) {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Plans endpoints
  async getPlans() {
    return this.request('/api/v1/plans', {
      method: 'GET',
    });
  }

  async getPlan(planId: string) {
    return this.request(`/api/v1/plans/${planId}`, {
      method: 'GET',
    });
  }

  async createPlan(data: any) {
    return this.request('/api/v1/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlan(planId: string, data: any) {
    return this.request(`/api/v1/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlan(planId: string) {
    return this.request(`/api/v1/plans/${planId}`, {
      method: 'DELETE',
    });
  }

  // Servers endpoints
  async getServers(params?: { user_id?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.user_id) query.append('user_id', params.user_id);
    if (params?.status) query.append('status', params.status);
    
    return this.request(`/api/v1/servers?${query.toString()}`, {
      method: 'GET',
    });
  }

  async getServer(serverId: string) {
    return this.request(`/api/v1/servers/${serverId}`, {
      method: 'GET',
    });
  }

  async createServer(data: any) {
    return this.request('/api/v1/servers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateServer(serverId: string, data: any) {
    return this.request(`/api/v1/servers/${serverId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteServer(serverId: string) {
    return this.request(`/api/v1/servers/${serverId}`, {
      method: 'DELETE',
    });
  }

  // Orders endpoints
  async getOrders(params?: { user_id?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.user_id) query.append('user_id', params.user_id);
    if (params?.status) query.append('status', params.status);
    
    return this.request(`/api/v1/orders?${query.toString()}`, {
      method: 'GET',
    });
  }

  async getOrder(orderId: string) {
    return this.request(`/api/v1/orders/${orderId}`, {
      method: 'GET',
    });
  }

  async createOrder(data: any) {
    return this.request('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments endpoints
  async createPayment(data: any) {
    return this.request('/api/v1/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(paymentId: string, data: any) {
    return this.request(`/api/v1/payments/${paymentId}/verify`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentHistory(userId: string) {
    return this.request(`/api/v1/payments/history/${userId}`, {
      method: 'GET',
    });
  }

  // Invoices endpoints
  async getInvoices(params?: { user_id?: string }) {
    const query = new URLSearchParams();
    if (params?.user_id) query.append('user_id', params.user_id);
    
    return this.request(`/api/v1/invoices?${query.toString()}`, {
      method: 'GET',
    });
  }

  async getInvoice(invoiceId: string) {
    return this.request(`/api/v1/invoices/${invoiceId}`, {
      method: 'GET',
    });
  }

  // Referrals endpoints
  async getReferralStats(userId: string) {
    return this.request(`/api/v1/referrals/stats/${userId}`, {
      method: 'GET',
    });
  }

  async getReferralEarnings(userId: string) {
    return this.request(`/api/v1/referrals/earnings/${userId}`, {
      method: 'GET',
    });
  }

  async getReferralCode(userId: string) {
    return this.request(`/api/v1/referrals/code/${userId}`, {
      method: 'GET',
    });
  }

  // Support tickets endpoints
  async getSupportTickets(params?: { user_id?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.user_id) query.append('user_id', params.user_id);
    if (params?.status) query.append('status', params.status);
    
      return this.request(`/api/v1/support/tickets?${query.toString()}`, {
      method: 'GET',
    });
  }

  async getSupportTicket(ticketId: string) {
      return this.request(`/api/v1/support/tickets/${ticketId}`, {
      method: 'GET',
    });
  }

  async createSupportTicket(data: any) {
      return this.request('/api/v1/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupportTicket(ticketId: string, data: any) {
      return this.request(`/api/v1/support/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/api/v1/admin/stats', {
      method: 'GET',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
