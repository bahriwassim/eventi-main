import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EventCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden border-white/5 bg-card/50">
      <CardHeader className="p-0">
        <Skeleton className="h-48 w-full shimmer bg-white/5" />
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 bg-white/5 shimmer" />
        <Skeleton className="h-3.5 w-1/2 bg-white/5 shimmer" />
        <Skeleton className="h-3.5 w-2/3 bg-white/5 shimmer" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-4 w-1/4 bg-white/5 shimmer" />
      </CardFooter>
    </Card>
  );
}
