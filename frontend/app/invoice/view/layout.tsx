export default function PublicInvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <main className="w-full flex-1 py-6 px-4 md:py-10">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground">
        Powered by Invoica
      </footer>
    </div>
  );
}
