import { WizardSidebar } from "@/components/wizard-sidebar";

export default function InvoiceNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <WizardSidebar />
      <main className="flex-1 flex flex-col pb-16 md:pb-0 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </main>
    </div>
  );
}
