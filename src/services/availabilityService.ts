import {
  CheckInData,
  CheckOutData,
  AvailabilityUpdateData,
  AvailabilityHistory,
  RoomNeedingAttention,
  AvailabilityResponse,
  QuickCheckInResponse,
  QuickCheckOutResponse
} from '../types/availability';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

class AvailabilityService {
  private async apiCall<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        ...(data && { body: JSON.stringify(data) })
      };

      const response = await fetch(`${API_BASE_URL}/availability${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API Error (${endpoint}):`, error);
      throw new Error(error.message || 'API request failed');
    }
  }

  // Check-in guest
  async checkInGuest(data: CheckInData): Promise<AvailabilityResponse> {
    return this.apiCall<AvailabilityResponse>(`/check-in/${data.bookingId}`, 'POST', {
      actualCheckIn: data.actualCheckIn,
      earlyCheckIn: data.earlyCheckIn,
      notes: data.notes
    });
  }

  // Check-out guest
  async checkOutGuest(data: CheckOutData): Promise<AvailabilityResponse> {
    return this.apiCall<AvailabilityResponse>(`/check-out/${data.bookingId}`, 'POST', {
      actualCheckOut: data.actualCheckOut,
      earlyCheckOut: data.earlyCheckOut,
      notes: data.notes
    });
  }

  // Manual availability update
  async updateRoomAvailability(data: AvailabilityUpdateData): Promise<AvailabilityResponse> {
    return this.apiCall<AvailabilityResponse>(`/rooms/${data.roomId}/availability`, 'PUT', {
      newStatus: data.newStatus,
      reason: data.reason,
      bookingId: data.bookingId
    });
  }

  // Get availability history
  async getAvailabilityHistory(roomId: number, limit: number = 50): Promise<{ success: boolean; data: AvailabilityHistory[] }> {
    return this.apiCall<{ success: boolean; data: AvailabilityHistory[] }>(`/rooms/${roomId}/history?limit=${limit}`);
  }

  // Bulk availability update
  async bulkUpdateAvailability(updates: AvailabilityUpdateData[]): Promise<AvailabilityResponse> {
    return this.apiCall<AvailabilityResponse>('/rooms/bulk-availability', 'PUT', { updates });
  }

  // Get rooms needing attention
  async getRoomsNeedingAttention(pensionId: number): Promise<{ success: boolean; data: RoomNeedingAttention[] }> {
    return this.apiCall<{ success: boolean; data: RoomNeedingAttention[] }>(`/attention-needed/${pensionId}`);
  }

  // Quick check-in
  async quickCheckIn(bookingId: number): Promise<QuickCheckInResponse> {
    return this.apiCall<QuickCheckInResponse>('/quick-check-in', 'POST', { bookingId });
  }

  // Quick check-out
  async quickCheckOut(bookingId: number): Promise<QuickCheckOutResponse> {
    return this.apiCall<QuickCheckOutResponse>('/quick-check-out', 'POST', { bookingId });
  }

  // Helper methods for status colors and labels
  getStatusColor(status: string): string {
    switch (status) {
      case 'Available': return 'text-green-600 bg-green-50';
      case 'Occupied': return 'text-red-600 bg-red-50';
      case 'Maintenance': return 'text-yellow-600 bg-yellow-50';
      case 'Blocked': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Available': return '✅';
      case 'Occupied': return '🔴';
      case 'Maintenance': return '🔧';
      case 'Blocked': return '🚫';
      default: return '❓';
    }
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  }

  isEarlyCheckIn(checkInDate: string, actualCheckIn: string): boolean {
    return new Date(actualCheckIn) < new Date(checkInDate);
  }

  isEarlyCheckOut(checkOutDate: string, actualCheckOut: string): boolean {
    return new Date(actualCheckOut) < new Date(checkOutDate);
  }
}

export default new AvailabilityService();
