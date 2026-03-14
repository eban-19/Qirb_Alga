import { Skeleton } from "@/components/ui/skeleton";

const RoomCardSkeleton = () => {
  return (
    <article className="bg-card rounded-xl overflow-hidden border border-border">
      <div className="relative h-48 w-full">
        <Skeleton className="w-full h-full rounded-none" />
        <Skeleton className="absolute top-3 right-3 h-5 w-20 rounded-full" />
      </div>

      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    </article>
  );
};

export default RoomCardSkeleton;
