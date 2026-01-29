import Link from "next/link";
import Image from "next/image";
import { User, FileText } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inv.</h1>
        <button className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
          <User className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-1 mb-16 border-2 border-primary rounded-lg p-1 max-w-md mx-auto">
          <button className="flex-1 px-6 py-3 bg-primary text-white rounded-md font-medium flex items-center justify-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            HISTORY
          </button>
          <Link
            href="/invoice/new"
            className="flex-1 px-6 py-3 text-primary rounded-md font-medium flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors text-sm"
          >
            + INVOICE
          </Link>
        </div>

        {/* Empty State */}
        <div className="text-center">
          <h2
            className="text-5xl mb-12 text-primary font-bold"
            style={{ fontFamily: "Amatica SC, cursive" }}
          >
            Nothing Dey
          </h2>

          <div className="mb-8 flex justify-center">
            <Image
              src="/images/nothing-dey.svg"
              alt="Nothing Dey - Empty State"
              width={280}
              height={320}
              priority
            />
          </div>

          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            You haven&apos;t created any invoices yet. Click the &quot;+ Invoice&quot; tab to get started.
          </p>
        </div>
      </main>
    </div>
  );
}
