import Link from "next/link";
import { WizardHeader } from "@/components/wizard-header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function WelcomePage() {
  return (
    <>
      <WizardHeader stepLabel="Start" />

      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-secondary">
        <div className="max-w-3xl w-full text-center">
          {/* Hero Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-white p-8 md:p-20 relative">
              {/* Purple Ink Splash Placeholder */}
              <div className="relative z-10">
                <div className="w-full h-64 flex items-center justify-center">
                  <div className="relative w-80 h-64">
                    {/* Abstract purple ink splash effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-400/40 to-purple-600/30 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/50 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/40 rounded-full blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-primary to-purple-600 opacity-60 rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Create Professional{" "}
            <span className="text-primary">Invoices</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10">
            Generate beautiful invoices in seconds. Customize designs, manage
            clients, and get paid faster.
          </p>

          <Button asChild size="lg" className="h-12 px-6 md:h-14 md:px-10 text-base">
            <Link href="/invoice/new/company" className="gap-2">
              Create New Invoice
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
