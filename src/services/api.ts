import { ApiResponse, PaginatedResponse } from '@/types/api';

class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = 'http://localhost:3006/api') {
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

      const url = `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
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
        
        // Create enhanced error with original response data
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).originalResponse = data; // Preserve original response data
        (enhancedError as any).status = response.status;
        throw enhancedError;
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

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Property methods
  async getPropertyById(propertyId: string): Promise<ApiResponse<{
    id: string;
    name: string;
    location: string;
    description?: string;
    rooms: Array<{
      id: string;
      name: string;
      type: string;
      capacity: number;
      price: number;
      status: 'available' | 'occupied';
      amenities?: string[];
    }>;
    packages: Array<{
      id: string;
      name: string;
      price: number;
      duration?: string;
      description?: string;
      features?: string[];
    }>;
    owner: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
    images?: string[];
    totalRooms?: number;
    availableRooms?: number;
    avgRating?: number;
    reviewCount?: number;
  }>> {
    console.log('=== FETCHING REAL PENSION DATA ===');
    console.log('Pension ID:', propertyId);
    
    try {
      // Use the same data structure as pension owner dashboard
      const [
        roomsResponse,
        packagesResponse,
        pensionResponse
      ] = await Promise.all([
        this.getRooms(parseInt(propertyId)),
        this.getPackages(parseInt(propertyId)),
        this.getPension(parseInt(propertyId))
      ]);

      console.log('=== REAL DATA RESPONSES ===');
      console.log('Rooms response:', roomsResponse);
      console.log('Packages response:', packagesResponse);
      console.log('Pension response:', pensionResponse);

      // Get pension data directly from response
      if (!pensionResponse?.success || !pensionResponse?.data) {
        console.log('Pension not found, using fallback');
        throw new Error('Pension not found');
      }

      const pension = pensionResponse.data;

      // Transform rooms data (same structure as dashboard)
      const roomsData = roomsResponse?.data?.items || roomsResponse?.data || [];
      const transformedRooms = Array.isArray(roomsData) ? roomsData.map((room: any) => ({
        id: room.id || room.room_id,
        name: room.name || room.room_type || 'Standard Room',
        type: room.type || room.room_type || 'Standard',
        capacity: room.capacity || 2,
        price: room.price_per_night || room.price || 0,
        status: (room.is_available ? 'available' : 'occupied') as 'available' | 'occupied',
        amenities: room.amenities || []
      })) : [];

      // Transform packages data (same structure as dashboard)
      const packagesData = packagesResponse?.data || [];
      const transformedPackages = Array.isArray(packagesData) ? packagesData.map((pkg: any) => {
        let services = [];
        if (Array.isArray(pkg.inclusions)) {
          services = pkg.inclusions;
        } else if (typeof pkg.inclusions === 'string') {
          try {
            services = JSON.parse(pkg.inclusions);
          } catch (e) {
            services = pkg.inclusions.split(',').map((s: string) => s.trim());
          }
        } else if (Array.isArray(pkg.services)) {
          services = pkg.services;
        }

        return {
          id: pkg.package_id || pkg.id,
          name: pkg.name || 'Standard Package',
          price: pkg.price || 0,
          duration: pkg.duration || '1 night',
          description: pkg.description,
          services: Array.isArray(services) ? services : [],
          image: pkg.image_url || pkg.image || null
        };
      }) : [];

      // Get owner info from pension data
      const ownerInfo = {
        id: pension.owner_id,
        name: pension.owner_name || 'Property Owner',
        email: pension.email || pension.owner_email,
        phone: pension.phone || 'N/A'
      };

      console.log('=== TRANSFORMED DATA ===');
      console.log('Pension:', pension.name);
      console.log('Rooms count:', transformedRooms.length);
      console.log('Packages count:', transformedPackages.length);
      console.log('Owner:', ownerInfo.name);

      return {
        success: true,
        data: {
          id: pension.pension_id || pension.id,
          name: pension.name,
          location: pension.address,
          description: pension.description,
          rooms: transformedRooms,
          packages: transformedPackages,
          owner: ownerInfo,
          images: pension.image_url ? [pension.image_url] : [],
          totalRooms: transformedRooms.length,
          availableRooms: transformedRooms.filter(r => r.status === 'available').length,
          avgRating: pension.avg_rating || 0,
          reviewCount: pension.review_count || 0
        }
      };

    } catch (error: any) {
      console.error('Failed to fetch pension data:', error);
      
      // First try to get basic property info to use actual names
      let basicPropertyInfo = null;
      try {
        const basicResponse = await this.request('/admin/properties');
        if (basicResponse.success && basicResponse.data) {
          const property = (basicResponse.data as any[]).find(p => 
            String(p.id || p.pension_id) === String(propertyId)
          );
          if (property) {
            basicPropertyInfo = property;
            console.log('Found basic property info:', property.name);
          }
        }
      } catch (basicError) {
        console.log('Could not fetch basic property info:', basicError);
      }

      // Create property info with empty data (no fake data)
      const propertyName = basicPropertyInfo?.name || `Property ${propertyId}`;
      const propertyLocation = basicPropertyInfo?.address || basicPropertyInfo?.location || 'Location Loading...';
      const propertyDescription = basicPropertyInfo?.description || 'Property details are currently loading. Please try again later.';
      const ownerName = basicPropertyInfo?.ownerName || basicPropertyInfo?.owner_name || 'Property Owner';
      const ownerEmail = basicPropertyInfo?.ownerEmail || basicPropertyInfo?.owner_email || 'owner@example.com';

      console.log('=== USING EMPTY DATA (NO FAKE DATA) ===');
      console.log('Property name:', propertyName);

      return {
        success: true,
        data: {
          id: propertyId,
          name: propertyName,
          location: propertyLocation,
          description: propertyDescription,
          rooms: [], // Empty - no fake data
          packages: [], // Empty - no fake data
          owner: {
            id: basicPropertyInfo?.ownerId || basicPropertyInfo?.owner_id || 'owner1',
            name: ownerName,
            email: ownerEmail,
            phone: basicPropertyInfo?.phone || 'N/A'
          },
          images: [],
          totalRooms: 0,
          availableRooms: 0,
          avgRating: 0,
          reviewCount: 0
        }
      };
    }
  }

  // System status methods
  async getSystemStatus(): Promise<ApiResponse<{
    status: 'online' | 'offline' | 'degraded';
    uptime: number;
    database: boolean;
    api: boolean;
    storage: boolean;
    lastCheck: string;
    responseTime: number;
  }>> {
    return this.request('/system/status');
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
    language?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/public/pensions${query ? `?${query}` : ''}`);
  }

  async getPublicPension(id: number, params: { language?: string } = {}): Promise<ApiResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/public/pensions/${id}${query ? `?${query}` : ''}`);
  }

  // Pension methods
  async getPensions(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    language?: string;
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
  async getRooms(propertyId: number, params: {
    page?: number;
    limit?: number;
    language?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/rooms/pension/${propertyId}${query ? `?${query}` : ''}`);
  }

  async getMyRooms(params: {
    page?: number;
    limit?: number;
    pension_id?: number;
    language?: string;
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
  async getStaff(pensionId: number, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/staff/pensions/${pensionId}${query ? `?${query}` : ''}`);
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

  // Guest methods
  async getGuests(pensionId: number, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<any>> {
    try {
      const query = new URLSearchParams(params as any).toString();
      return await this.request(`/guests/pensions/${pensionId}${query ? `?${query}` : ''}`);
    } catch (error) {
      console.warn('Guests endpoint not available, returning empty array');
      return { success: true, data: { items: [], total: 0 } } as any;
    }
  }

  // Transaction methods
  async getTransactions(pensionId: number, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<any>> {
    try {
      const query = new URLSearchParams(params as any).toString();
      return await this.request(`/transactions/pensions/${pensionId}${query ? `?${query}` : ''}`);
    } catch (error) {
      console.warn('Transactions endpoint not available, returning empty array');
      return { success: true, data: { items: [], total: 0 } } as any;
    }
  }

  // Package methods
  async getPackages(pensionId: number, params: { language?: string } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams(params as any).toString();
    const response = await this.request<any[]>(`/packages/pensions/${pensionId}${query ? `?${query}` : ''}`);
    
    if (response.success && Array.isArray(response.data)) {
      response.data = response.data.map(pkg => {
        let services = [];
        if (Array.isArray(pkg.inclusions)) {
          services = pkg.inclusions;
        } else if (typeof pkg.inclusions === 'string') {
          try {
            services = JSON.parse(pkg.inclusions);
          } catch (e) {
            services = pkg.inclusions.split(',').map((s: string) => s.trim());
          }
        } else if (Array.isArray(pkg.services)) {
          services = pkg.services;
        }

        return {
          ...pkg,
          services: Array.isArray(services) ? services : [],
          image: pkg.image_url || pkg.image || null,
          images: Array.isArray(pkg.images) ? pkg.images : []
        };
      });
    }
    
    return response;
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
  async getExpenses(pensionId: number, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    try {
      const query = new URLSearchParams(params as any).toString();
      return await this.request(`/expenses/pensions/${pensionId}${query ? `?${query}` : ''}`);
    } catch (error) {
      console.warn('Expenses endpoint not available, returning empty array');
      return { success: true, data: { items: [], totalExpenses: 0, total: 0 } };
    }
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

  async getAllCustomers(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/customers');
  }

  async getAllStaffs(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/staffs');
  }

  async createStaff(data: any): Promise<ApiResponse<any>> {
    return this.request('/admin/staffs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSubscriptionPlan(planId: number): Promise<ApiResponse<any>> {
    return this.request(`/admin-payments/plans/${planId}`, {
      method: 'DELETE',
    });
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
      method: 'PUT'
    });
  }

  async reactivateOwner(ownerId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/owners/${ownerId}/reactivate`, {
      method: 'PUT'
    });
  }

  async deleteOwner(ownerId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/owners/${ownerId}`, {
      method: 'DELETE',
    });
  }

  async bulkOwnerAction(action: string, ownerIds: string[]): Promise<ApiResponse<any>> {
    return this.request('/admin/owners/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, ownerIds }),
    });
  }

  async bulkPensionAction(action: string, pensionIds: number[], rejectionReason?: string): Promise<ApiResponse<any>> {
    return this.request('/admin/pensions/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, pensionIds, rejectionReason }),
    });
  }

  async getAllProperties(): Promise<ApiResponse<any[]>> {
    console.log('=== FETCHING ALL PROPERTIES WITH ROOMS AND PACKAGES ===');
    try {
      // First get basic properties list
      const response = await this.request('/admin/properties');
      
      if (!response.success || !response.data) {
        console.error('Failed to fetch basic properties list');
        return response as ApiResponse<any[]>;
      }

      console.log('=== BASIC PROPERTIES RESPONSE ===');
      console.log('Properties count:', (response.data as any[]).length);
      console.log('Sample property:', (response.data as any[])[0]);

      // For each property, fetch real rooms and packages data
      const propertiesWithDetails = await Promise.all(
        (response.data as any[]).map(async (property: any) => {
          try {
            console.log(`=== FETCHING REAL DATA FOR PROPERTY ${property.id}: ${property.name} ===`);
            
            const propertyId = property.id || property.pension_id;
            
            // Fetch real rooms and packages data
            const [roomsResponse, packagesResponse] = await Promise.all([
              this.getRooms(parseInt(propertyId)),
              this.getPackages(parseInt(propertyId))
            ]);

            console.log('Rooms response:', roomsResponse);
            console.log('Packages response:', packagesResponse);

            // Get real rooms data
            const roomsData = roomsResponse.data?.items || roomsResponse.data || [];
            const realRooms = Array.isArray(roomsData) ? roomsData : [];

            // Get real packages data  
            const packagesData = packagesResponse.data || [];
            const realPackages = Array.isArray(packagesData) ? packagesData : [];

            // Calculate real room counts
            const availableRooms = realRooms.filter((room: any) => 
              room.is_available || room.status === 'available'
            ).length;

            const result = {
              ...property,
              rooms: realRooms,
              packages: realPackages,
              totalRooms: realRooms.length,
              availableRooms: availableRooms
            };

            console.log(`Property ${property.name}: ${result.availableRooms} available rooms, ${result.packages.length} packages`);
            return result;

          } catch (error) {
            console.error(`Failed to fetch real data for property ${property.id}:`, error);
            // Return property with empty arrays if real data fetch fails
            return {
              ...property,
              rooms: [],
              packages: [],
              totalRooms: 0,
              availableRooms: 0
            };
          }
        })
      );

      console.log('=== FINAL PROPERTIES WITH REAL DATA ===');
      console.log('Properties count:', propertiesWithDetails.length);
      propertiesWithDetails.forEach((prop, index) => {
        console.log(`Property ${index + 1}: ${prop.name} - Rooms: ${prop.rooms?.length || 0}, Available: ${prop.availableRooms || 0}, Packages: ${prop.packages?.length || 0}`);
      });

      return {
        success: true,
        data: propertiesWithDetails
      };
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      // Return basic properties without details rather than failing completely
      return this.request('/admin/properties') as Promise<ApiResponse<any[]>>;
    }
  }

  async getAdminPensions(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/pensions/all');
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

  // System Settings methods
  async getSystemSettings(): Promise<ApiResponse<Record<string, string>>> {
    return this.request('/system/settings');
  }

  async getRawSystemSettings(): Promise<ApiResponse<any[]>> {
    return this.request('/system/settings/raw');
  }

  async updateSystemSettings(settings: Record<string, string | number>): Promise<ApiResponse<any>> {
    return this.request('/system/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }
}

const apiService = new ApiService();

export default apiService;
