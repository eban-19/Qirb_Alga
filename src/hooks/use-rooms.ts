import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRoomById, getRooms } from "@/lib/rooms";
import apiService from "@/services/api";
import { useLanguage } from "@/hooks/use-language";

export function useRooms() {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ["rooms", language],
    queryFn: async () => {
      try {
        // Try to get real data from backend with language parameter
        const response = await apiService.getPublicPensions({ language });
        console.log('🔍 useRooms - Full API response:', response);
        console.log('🔍 useRooms - Response data:', response.data);
        console.log('🔍 useRooms - Response items:', response.data?.items);
        
        const pensions = response.data?.items || [];
        
        console.log('🔍 useRooms - Raw backend data:', pensions.map(p => ({
          id: p.pension_id,
          name: p.name,
          image_url: p.image_url,
          hasImageUrl: !!p.image_url,
          allKeys: Object.keys(p)
        })));
        
        // Map backend data to frontend Room interface
        const mappedRooms = pensions.map((pension: any) => {
          // Check all possible field name variations
          const imageUrl = pension.image_url || pension.imageUrl || pension.image || pension.ImageUrl;
          const hasImage = !!imageUrl;
          const finalImages = hasImage ? [imageUrl] : ['/src/assets/room-1.png'];
          
          console.log('🔍 useRooms - Mapping pension:', {
            name: pension.name,
            allImageFields: {
              image_url: pension.image_url,
              imageUrl: pension.imageUrl,
              image: pension.image,
              ImageUrl: pension.ImageUrl
            },
            selectedImageUrl: imageUrl,
            hasImage,
            finalImages
          });
          
          return {
            ...pension,
            // Map image_url to images array for RoomCard compatibility
            images: finalImages,
            // Ensure packages have proper structure
            packages: pension.packages || [],
            // Map other fields as needed
            latitude: parseFloat(pension.latitude) || 0,
            longitude: parseFloat(pension.longitude) || 0,
          };
        });
        
        console.log('🔍 useRooms - Final mapped rooms:', mappedRooms.map(r => ({
          name: r.name,
          images: r.images,
          firstImage: r.images[0]
        })));
        
        return mappedRooms;
      } catch (error) {
        console.log('🔍 useRooms - Error, returning empty array:', error);
        // Return empty array instead of mock data to avoid showing mock services
        return [];
      }
    },
  });
}

// Global hook to refresh all packages when rooms are created
export function useRefreshPackages() {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  
  return {
    refreshAllPackages: async (pensionId: number) => {
      try {
        // Get latest rooms data with language parameter
        const roomsResponse = await apiService.getRooms(pensionId, { language });
        if (roomsResponse.success && roomsResponse.data?.items) {
          // Get current packages with language parameter
          const packagesResponse = await apiService.getPublicPension(pensionId, { language });
          if (packagesResponse.data && packagesResponse.data.packages) {
            // Update all packages with correct available rooms
            const updatedPackages = packagesResponse.data.packages.map((pkg: any) => {
              const packageRooms = roomsResponse.data.items.filter((room: any) => room.package_id === pkg.id || room.package_id === pkg.package_id);
              const availableRooms = packageRooms.filter((room: any) => 
                room.availability_status === 'Available' || room.is_available === true
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
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ["rooms", id, language],
    queryFn: async () => {
      try {
        // Get real data from backend with language parameter
        const response = await apiService.getPublicPension(parseInt(id), { language });
        if (response.data && response.data.packages) {
          // Calculate available rooms dynamically from real room data
          const roomsResponse = await apiService.getRooms(parseInt(id), { language });
          if (roomsResponse.success && roomsResponse.data?.items) {
            const updatedPackages = response.data.packages.map((pkg: any) => {
              const packageRooms = roomsResponse.data.items.filter((room: any) => room.package_id === pkg.id || room.package_id === pkg.package_id);
              const availableRooms = packageRooms.filter((room: any) => 
                room.availability_status === 'Available' || room.is_available === true
              ).length;
              
              return {
                ...pkg,
                availableRooms
              };
            });
            
            // Map image_url to images array for RoomProfile compatibility (same as useRooms)
            const imageUrl = response.data.image_url || response.data.imageUrl || response.data.image || response.data.ImageUrl;
            const hasImage = !!imageUrl;
            const finalImages = hasImage ? [imageUrl] : ['/src/assets/room-1.png'];
            
            return {
              ...response.data,
              images: finalImages,
              packages: updatedPackages
            };
          }
        }
        
        // Map image_url to images array for RoomProfile compatibility (same as useRooms)
        const imageUrl = response.data.image_url || response.data.imageUrl || response.data.image || response.data.ImageUrl;
        const hasImage = !!imageUrl;
        const finalImages = hasImage ? [imageUrl] : ['/src/assets/room-1.png'];
        
        return {
          ...response.data,
          images: finalImages
        };
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
