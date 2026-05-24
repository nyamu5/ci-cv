import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex-1 px-4 py-10 max-w-5xl mx-auto w-full flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="flex items-baseline gap-4">
        <Skeleton className="h-20 w-32" />
        <Skeleton className="h-12 flex-1" />
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </main>
  );
}
