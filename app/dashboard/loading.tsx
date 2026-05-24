import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex-1 px-4 py-10 max-w-4xl mx-auto w-full flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </main>
  );
}
