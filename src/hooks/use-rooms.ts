import { useQuery, useQueryClient } from "@tanstack/react-query";
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

// Global hook to refresh all packages when rooms are created
export function useRefreshPackages() {
  const queryClient = useQueryClient();
  
  return {
    refreshAllPackages: async (pensionId: number) => {
      try {
        // Get latest rooms data
        const roomsResponse = await apiService.getRooms(pensionId);
        if (roomsResponse.success && roomsResponse.data?.items) {
          // Get current packages
          const packagesResponse = await apiService.getPublicPension(pensionId);
          if (packagesResponse.data && packagesResponse.data.packages) {
            // Update all packages with correct available rooms
            const updatedPackages = packagesResponse.data.packages.map((pkg: any) => {
              const packageRooms = roomsResponse.data.items.filter((room: any) => room.package_id === pkg.id);
              const availableRooms = packageRooms.filter((room: any) => 
                room.status === 'Available' || room.is_available !== false
              ).length;
              
              return {
                ...pkg,
                availableRooms
              };
            });
            
            // Update the cache for all queries
            queryClient.setQueryData(["rooms", pensionId.toString()], packagesResponse.data);
            queryClient.setQueryData(["pensions"], packagesResponse.data?.items || []);
            queryClient.invalidateQueries({ queryKey: ["packages"] });
          }
        }
      } catch (error) {
        console.error('Error refreshing packages:', error);
      }
    }
  };
}

export function useRoomById(id: string) {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: async () => {
      try {
        // Get real data from backend
        const response = await apiService.getPublicPension(parseInt(id));
        if (response.data && response.data.packages) {
          // Calculate available rooms dynamically from real room data
          const roomsResponse = await apiService.getRooms(parseInt(id));
          if (roomsResponse.success && roomsResponse.data?.items) {
            const updatedPackages = response.data.packages.map((pkg: any) => {
              const packageRooms = roomsResponse.data.items.filter((room: any) => room.package_id === pkg.id);
              const availableRooms = packageRooms.filter((room: any) => 
                room.status === 'Available' || room.is_available !== false
              ).length;
              
              return {
                ...pkg,
                availableRooms
              };
            });
            
            return {
              ...response.data,
              packages: updatedPackages
            };
          }
        }
        return response.data;
      } catch (error) {
        console.error('Error fetching room:', error);
        // Return empty data instead of mock to avoid wrong availability
        return null;
      }
    },
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
