export default function Loading() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 border-b border-border bg-card/50 px-3 sm:px-6 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-muted" />
            <div className="space-y-1.5">
              <div className="h-3.5 bg-muted rounded w-24" />
              <div className="h-2.5 bg-muted rounded w-32" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 1 && <div className="w-6 h-px bg-muted" />}
                <div className="w-5 h-5 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-xl mx-auto pt-8 animate-pulse space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted" />
            <div className="h-5 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-64" />
          </div>
          <div className="h-52 bg-muted rounded-xl" />
          <div className="flex justify-center">
            <div className="h-10 bg-muted rounded-lg w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
