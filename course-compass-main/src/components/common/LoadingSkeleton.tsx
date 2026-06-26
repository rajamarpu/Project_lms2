import { cn } from "@/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-2xl bg-muted/60", className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="course-card flex h-full flex-col">
      <Skeleton className="h-40 rounded-none rounded-t-3xl" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-full" />
          ))}
          <Skeleton className="ml-1 h-3 w-8" />
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container py-6 sm:py-8 lg:py-10">
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Skeleton className="h-[520px] rounded-[2.4rem]" />
        <div className="grid gap-4">
          <Skeleton className="h-[250px] rounded-[2rem]" />
          <Skeleton className="h-[190px] rounded-[2rem]" />
        </div>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-[1.8rem]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Skeleton className="h-[290px] rounded-[2.2rem]" />
          <Skeleton className="h-[260px] rounded-[2.2rem]" />
          <Skeleton className="h-[430px] rounded-[2.2rem]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[220px] rounded-[2.2rem]" />
          <Skeleton className="h-[220px] rounded-[2.2rem]" />
          <Skeleton className="h-[220px] rounded-[2.2rem]" />
          <Skeleton className="h-[220px] rounded-[2.2rem]" />
        </div>
      </div>
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-[350px] rounded-none" />
      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="lg:max-w-3xl space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function ListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card/50 p-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
