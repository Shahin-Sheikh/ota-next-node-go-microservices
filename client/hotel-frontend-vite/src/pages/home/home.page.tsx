import { useAuth } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";
import { Hotel, LogOut, User } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Hotel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Hotel Dashboard
                </h1>
                <p className="text-sm text-gray-500">Management Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => logout()}
                disabled={isPending}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                {isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully logged in to your hotel management dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Total Bookings
              </h3>
              <p className="text-3xl font-bold text-blue-600">248</p>
              <p className="text-sm text-blue-700 mt-2">+12% from last month</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Revenue
              </h3>
              <p className="text-3xl font-bold text-purple-600">$45,230</p>
              <p className="text-sm text-purple-700 mt-2">
                +8% from last month
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
              <h3 className="text-lg font-semibold text-pink-900 mb-2">
                Occupancy Rate
              </h3>
              <p className="text-3xl font-bold text-pink-600">87%</p>
              <p className="text-sm text-pink-700 mt-2">+5% from last month</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🎉 Authentication System Active
            </h3>
            <p className="text-gray-600">
              Your login system is now fully functional with:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-gray-600">
              <li>React Hook Form for form validation</li>
              <li>Zod schema validation</li>
              <li>React Query for API state management</li>
              <li>Axios interceptors for automatic token refresh</li>
              <li>Secure JWT token storage</li>
              <li>Protected routes</li>
              <li>Toast notifications</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
