import { ApiResponse, PaginatedResponse } from '@/types/api';

class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = 'http://localhost:3005/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        ...this.defaultHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        throw new Error(`Server returned HTML error page instead of JSON. Response: ${text.substring(0, 200)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error ? `${data.message}: ${data.error}` : (data.message || `HTTP error! status: ${response.status}`);
        throw new Error(errorMessage);
      }

      return data as ApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/auth/profile');
  }

  async updateUserProfile(userId: string | number, profileData: any): Promise<ApiResponse<any>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ userId, ...profileData }),
    });
  }

  // Logout method
  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore API failure and proceed with local logout
    }
  }

  // Public site methods
  async getPublicPensions(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/public/pensions${query ? `?${query}` : ''}`);
  }

  async getPublicPension(id: number): Promise<ApiResponse<any>> {
    return this.request(`/public/pensions/${id}`);
  }

  // Pension methods
  async getPensions(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/pensions/my/pensions${query ? `?${query}` : ''}`);
  }

  async getPension(id: number): Promise<ApiResponse<any>> {
    return this.request(`/pensions/${id}`);
  }

  async createPension(pensionData: any): Promise<ApiResponse<any>> {
    return this.request('/pensions', {
      method: 'POST',
      body: JSON.stringify(pensionData),
    });
  }

  async updatePension(id: number, pensionData: any): Promise<ApiResponse<any>> {
    return this.request(`/pensions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pensionData),
    });
  }

  async deletePension(id: number): Promise<ApiResponse<any>> {
    return this.request(`/pensions/${id}`, {
      method: 'DELETE',
    });
  }

  // Room methods
  async getRooms(pensionId: number, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/rooms/pension/${pensionId}${query ? `?${query}` : ''}`);
  }

  async getMyRooms(params: {
    page?: number;
    limit?: number;
    pension_id?: number;
  } = {}): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/rooms/my/rooms${query ? `?${query}` : ''}`);
  }

  async createRoom(roomData: any): Promise<ApiResponse<any>> {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async updateRoom(id: number, roomData: any): Promise<ApiResponse<any>> {
    return this.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  }

  async deleteRoom(id: number): Promise<ApiResponse<any>> {
    return this.request(`/rooms/${id}`, {
      method: 'DELETE',
    });
  }

  // Booking methods
  async getBookings(params: {
    page?: number;
    limit?: number;
    status?: string;
    pension_id?: number;
    user_id?: number;
  } = {}): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/bookings${query ? `?${query}` : ''}`);
  }

  async getBooking(id: number): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${id}`);
  }

  async createBooking(bookingData: any): Promise<ApiResponse<any>> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id: number, bookingData: any): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBookingStatus(id: number | string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async cancelBooking(id: number): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  }

  async completeBookingEarly(id: number | string): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${id}/complete-early`, {
      method: 'POST',
    });
  }

  // Staff Management methods
  async getStaff(pensionId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/staff/pensions/${pensionId}`);
  }

  async addStaff(pensionId: number, staffData: any): Promise<ApiResponse<any>> {
    return this.request(`/staff/pensions/${pensionId}`, {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  }

  async updateStaff(id: number, staffData: any): Promise<ApiResponse<any>> {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  }

  async deleteStaff(id: number): Promise<ApiResponse<any>> {
    return this.request(`/staff/${id}`, {
      method: 'DELETE',
    });
  }

  // Package management methods
  async getPackages(pensionId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/package-management/pensions/${pensionId}/packages`);
  }

  async createPackage(pensionId: number, packageData: any): Promise<ApiResponse<any>> {
    return this.request(`/package-management/pensions/${pensionId}/packages`, {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  async updatePackage(pensionId: number, packageId: number, packageData: any): Promise<ApiResponse<any>> {
    return this.request(`/package-management/pensions/${pensionId}/packages/${packageId}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  }

  async deletePackage(pensionId: number, packageId: number): Promise<ApiResponse<any>> {
    return this.request(`/package-management/pensions/${pensionId}/packages/${packageId}`, {
      method: 'DELETE',
    });
  }

  // Review methods
  async getReviews(params: {
    page?: number;
    limit?: number;
    rating?: number;
    pension_id?: number;
    user_id?: number;
  } = {}): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/reviews${query ? `?${query}` : ''}`);
  }

  async getMyReviews(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/reviews/my/reviews${query ? `?${query}` : ''}`);
  }

  // Upload methods
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/uploads/single`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  }

  // Expense methods
  async getExpenses(pensionId: number): Promise<ApiResponse<any>> {
    return this.request(`/expenses/pensions/${pensionId}`);
  }

  async addExpense(pensionId: number, expenseData: any): Promise<ApiResponse<any>> {
    return this.request(`/expenses/pensions/${pensionId}`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(expenseId: number): Promise<ApiResponse<any>> {
    return this.request(`/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  }

  // Admin methods
  async getAllOwners(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/owners');
  }

  async getOwnerDetails(ownerId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/owners/${ownerId}/details`);
  }

  async approveOwner(ownerId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/owners/${ownerId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectOwner(ownerId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/owners/${ownerId}/reject`, {
      method: 'PUT',
    });
  }

  async suspendOwner(ownerId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/owners/${ownerId}/suspend`, {
      method: 'PUT',
    });
  }

  async getAllProperties(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/properties');
  }

  async getAllBookings(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/bookings');
  }

  async getAdminMetrics(): Promise<ApiResponse<any>> {
    return this.request('/admin/metrics');
  }

  async getSystemAlerts(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/alerts');
  }

  // Notification methods
  async getNotifications(limit: number = 50): Promise<ApiResponse<any>> {
    return this.request(`/notifications?limit=${limit}`);
  }

  async getUnreadCount(): Promise<ApiResponse<any>> {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(notificationId: number): Promise<ApiResponse<any>> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT'
    });
  }

  async sendTestNotification(title: string, message: string, type: string): Promise<ApiResponse<any>> {
    return this.request('/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ title, message, type })
    });
  }
}

const apiService = new ApiService();

export default apiService;
