import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo */}
      <div className="p-8">
        <h1 className="text-2xl font-bold">Inv.</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>

            <div className="space-y-3">
              {/* Google Sign In */}
              <Button
                asChild
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                <Link href="/dashboard" className="gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Link>
              </Button>

              {/* Microsoft Sign In */}
              <Button
                asChild
                variant="outline"
                className="w-full h-12 bg-black text-white hover:bg-gray-900 hover:text-white border-black"
              >
                <Link href="/dashboard" className="gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                  </svg>
                  Sign in with Microsoft
                </Link>
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OR CONTINUE WITH</span>
                </div>
              </div>

              {/* Guest Sign In */}
              <Button
                asChild
                variant="outline"
                className="w-full h-12 bg-muted hover:bg-muted/80"
              >
                <Link href="/dashboard">
                  Continue as Guest
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Icon */}
      <button className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
