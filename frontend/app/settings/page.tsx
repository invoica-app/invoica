import { WizardSidebar } from "@/components/wizard-sidebar";
import { WizardHeader } from "@/components/wizard-header";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      <WizardSidebar />
      <main className="flex-1 flex flex-col">
        <WizardHeader stepLabel="Settings" />
        <div className="flex-1 p-8 bg-secondary">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2">Application Settings</h1>
              <p className="text-gray-600">
                Manage your account and application preferences.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-12 border-2 border-dashed border-gray-300">
              <p className="text-center text-gray-400">Settings placeholder content</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
