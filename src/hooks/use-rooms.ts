import { useQuery } from "@tanstack/react-query";
import { getRoomById, getRooms } from "@/lib/rooms";

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });
}

export function useRoomById(id: string) {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: () => getRoomById(id),
    enabled: Boolean(id),
  });
}
