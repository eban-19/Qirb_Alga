import { useQuery } from "@tanstack/react-query";
import { getRoomById, getRooms } from "@/lib/rooms";
import apiService from "@/services/api";

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      try {
        // Try to get real data from backend
        const response = await apiService.getPublicPensions();
        return response.data?.items || [];
      } catch (error) {
        // Fallback to mock data
        return await getRooms();
      }
    },
  });
}

export function useRoomById(id: string) {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: async () => {
      try {
        // Try to get real data from backend
        const response = await apiService.getPublicPension(parseInt(id));
        return response.data;
      } catch (error) {
        // Fallback to mock data
        return await getRoomById(id);
      }
    },
    enabled: Boolean(id),
    staleTime: 0, // Disable caching
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}
