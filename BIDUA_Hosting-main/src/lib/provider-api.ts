import api from './api';

// Types
export interface DashboardStats {
  totalServers: number;
  activeServers: number;
  expiringoon: number;
  renewalRevenue: number;
  monthlyRecurring: number;
  serversByStatus: Record<string, number>;
}

export interface Server {
  id: string;
  name: string;
  status: 'active' | 'provisioning' | 'suspended' | 'expired';
  ipAddress: string;
  location: string;
  region: string;
  expiryDate: string;
  daysUntilExpiry: number;
  createdDate: string;
  costPerMonth: number;
  specs?: {
    cpu: string;
    memory: string;
    storage: string;
    bandwidth: string;
  };
}

export interface ServerDetails extends Server {
  lastMaintenance: string;
  renewalStatus: 'pending' | 'confirmed' | 'expired';
  uptime: number;
  bandwidth_used: number;
  storage_used: number;
  notes?: string;
}

export interface ExpiryItem {
  id: string;
  serverName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  urgency: 'critical' | 'warning' | 'caution' | 'safe';
  renewalStatus: 'pending' | 'confirmed' | 'expired';
  costPerMonth: number;
}

export interface ExpiryTrackerResponse {
  items: ExpiryItem[];
  stats: {
    critical: number;
    warning: number;
    caution: number;
    safe: number;
  };
}

export interface RenewResponse {
  success: boolean;
  message: string;
  newExpiryDate: string;
}

export interface ExportResponse {
  data: Server[];
  format: 'csv' | 'json';
  filename: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// API Functions
export const providerApi = {
  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.request<any>(
        '/api/v1/provider/stats',
        { method: 'GET' }
      );
      // Backend returns snake_case, convert to camelCase
      return {
        totalServers: response.total_servers || 0,
        activeServers: response.active_servers || 0,
        expiringoon: response.expiring_soon || 0,
        renewalRevenue: 0, // Not provided by backend
        monthlyRecurring: response.monthly_revenue || 0,
        serversByStatus: response.servers_by_status || {}
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  // Servers List with Pagination & Filtering
  async getServers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    location?: string;
    search?: string;
  }): Promise<Server[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('per_page', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.location) queryParams.append('location', params.location);
      if (params?.search) queryParams.append('search', params.search);

      const endpoint = `/api/v1/provider/servers?${queryParams.toString()}`;
      const response = await api.request<any[]>(
        endpoint,
        { method: 'GET' }
      );
      
      // Convert snake_case to camelCase
      return response.map((server: any) => ({
        id: server.id?.toString() || '',
        name: server.name || '',
        status: server.status || 'unknown',
        ipAddress: server.ip_address || '',
        location: server.location || '',
        region: server.region || '',
        expiryDate: server.expiry_date || '',
        daysUntilExpiry: 0, // Calculate client-side
        createdDate: server.created_at || '',
        costPerMonth: 50.00, // Default for now
        specs: {
          cpu: '2 vCPU',
          memory: '4 GB',
          storage: '80 GB SSD',
          bandwidth: '1 TB'
        }
      }));
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      throw error;
    }
  },

  // Single Server Details
  async getServerDetails(serverId: string): Promise<ServerDetails> {
    try {
      const response = await api.request<ServerDetails>(
        `/api/v1/provider/servers/${serverId}`,
        { method: 'GET' }
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch server details for ${serverId}:`, error);
      throw error;
    }
  },

  // Expiry Tracker
  async getExpiryTracker(params?: {
    urgency?: string;
    sortBy?: 'days' | 'name' | 'date';
    order?: 'asc' | 'desc';
  }): Promise<ExpiryItem[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.urgency) queryParams.append('urgency', params.urgency);

      const endpoint = `/api/v1/provider/expiry-tracker?${queryParams.toString()}`;
      const response = await api.request<any[]>(
        endpoint,
        { method: 'GET' }
      );
      
      // Convert snake_case to camelCase
      return response.map((item: any) => ({
        id: item.id?.toString() || '',
        serverName: item.name || '',
        expiryDate: item.expiry_date || '',
        daysUntilExpiry: item.days_until_expiry || 0,
        urgency: item.urgency || 'safe',
        renewalStatus: 'pending',
        costPerMonth: 50.00
      }));
    } catch (error) {
      console.error('Failed to fetch expiry tracker:', error);
      throw error;
    }
  },

  // Renew Single Server
  async renewServer(serverId: string, years: number = 1): Promise<RenewResponse> {
    try {
      const response = await api.request<RenewResponse>(
        `/api/v1/provider/servers/${serverId}/renew`,
        {
          method: 'POST',
          body: JSON.stringify({ years }),
        }
      );
      return response;
    } catch (error) {
      console.error(`Failed to renew server ${serverId}:`, error);
      throw error;
    }
  },

  // Bulk Renew Servers
  async bulkRenewServers(serverIds: string[], years: number = 1): Promise<{
    success: number;
    failed: number;
    errors: Array<{ serverId: string; error: string }>;
  }> {
    try {
      const response = await api.request<{
        success: number;
        failed: number;
        errors: Array<{ serverId: string; error: string }>;
      }>(
        '/api/v1/provider/servers/bulk-renew',
        {
          method: 'POST',
          body: JSON.stringify({ serverIds, years }),
        }
      );
      return response;
    } catch (error) {
      console.error('Failed to bulk renew servers:', error);
      throw error;
    }
  },

  // Export Servers
  async exportServers(format: 'csv' | 'json' = 'csv', params?: {
    status?: string;
    location?: string;
  }): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.location) queryParams.append('location', params.location);

      const endpoint = `/api/v1/provider/servers/export/${format}?${queryParams.toString()}`;
      const response = await fetch(
        `${(window as any).__API_BASE__ || import.meta.env.VITE_API_URL || 'https://api.ramaerahosting.com'}${endpoint}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export servers');
      }

      return await response.blob();
    } catch (error) {
      console.error('Failed to export servers:', error);
      throw error;
    }
  },

  // Get Server Activity Log
  async getServerActivityLog(serverId: string, limit: number = 50): Promise<Array<{
    id: string;
    action: string;
    timestamp: string;
    details: string;
  }>> {
    try {
      const response = await api.request<Array<{
        id: string;
        action: string;
        timestamp: string;
        details: string;
      }>>(
        `/api/v1/provider/servers/${serverId}/activity`,
        { method: 'GET' }
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch activity log for ${serverId}:`, error);
      throw error;
    }
  },

  // Get Provider Notifications
  async getNotifications(unreadOnly: boolean = false): Promise<Array<{
    id: string;
    type: 'expiry_warning' | 'renewal_failed' | 'status_change' | 'info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>> {
    try {
      const endpoint = `/api/v1/provider/notifications${unreadOnly ? '?unread=true' : ''}`;
      const response = await api.request<Array<{
        id: string;
        type: 'expiry_warning' | 'renewal_failed' | 'status_change' | 'info';
        title: string;
        message: string;
        timestamp: string;
        read: boolean;
      }>>(
        endpoint,
        { method: 'GET' }
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  },

  // Mark Notification as Read
  async markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.request<{ success: boolean }>(
        `/api/v1/provider/notifications/${notificationId}/read`,
        { method: 'POST' }
      );
      return response;
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
      throw error;
    }
  },
};

export default providerApi;
