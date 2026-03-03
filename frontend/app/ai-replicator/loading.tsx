export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="text-center space-y-3">
            <div className="h-8 bg-muted rounded w-64 mx-auto" />
            <div className="h-4 bg-muted rounded w-96 mx-auto" />
          </div>
          <div className="h-64 bg-muted rounded-xl" />
          <div className="flex justify-center gap-3">
            <div className="h-10 bg-muted rounded w-24" />
            <div className="h-10 bg-muted rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
