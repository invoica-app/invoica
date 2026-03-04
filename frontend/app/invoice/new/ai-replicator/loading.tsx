export default function Loading() {
  return (
    <div className="flex-1 px-6 py-8 max-w-lg mx-auto w-full">
      <div className="animate-pulse space-y-6">
        <div className="text-center space-y-2">
          <div className="h-6 bg-muted rounded w-48 mx-auto" />
          <div className="h-4 bg-muted rounded w-72 mx-auto" />
        </div>
        <div className="h-56 bg-muted rounded-lg" />
        <div className="flex justify-center">
          <div className="h-9 bg-muted rounded w-32" />
        </div>
      </div>
    </div>
  );
}
