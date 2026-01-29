import { WizardSidebar } from "@/components/wizard-sidebar";

export default function InvoiceNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <WizardSidebar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
