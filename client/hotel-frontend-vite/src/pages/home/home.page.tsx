import { useAuth } from "@/contexts/auth.context";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-muted-foreground mb-6">
              You have successfully logged in to your hotel management
              dashboard.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Total Bookings
                </h3>
                <p className="text-3xl font-bold text-blue-600">248</p>
                <p className="text-sm text-blue-700 mt-2">
                  +12% from last month
                </p>
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
                <p className="text-sm text-pink-700 mt-2">
                  +5% from last month
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-muted rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">
                🎉 Authentication System Active
              </h3>
              <p className="text-muted-foreground">
                Your login system is now fully functional with:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-1 text-muted-foreground">
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
      </SidebarInset>
    </SidebarProvider>
  );
}
