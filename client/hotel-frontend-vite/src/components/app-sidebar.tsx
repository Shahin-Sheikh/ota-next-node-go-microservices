import {
  Hotel,
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  User2,
  BarChart3,
  MessageSquare,
  Bell,
  CreditCard,
  ChevronDown,
  Building2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/auth.context";
import { useLogout } from "@/hooks/use-auth";

// Menu items with parent-child structure
const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Bookings",
    icon: Calendar,
    url: "/bookings",
    children: [
      {
        title: "All Bookings",
        url: "/bookings/all",
      },
      {
        title: "Check-ins Today",
        url: "/bookings/checkins",
      },
      {
        title: "Check-outs Today",
        url: "/bookings/checkouts",
      },
      {
        title: "Pending Confirmation",
        url: "/bookings/pending",
      },
    ],
  },
  {
    title: "Rooms",
    icon: Building2,
    url: "/rooms",
    children: [
      {
        title: "Room List",
        url: "/rooms/list",
      },
      {
        title: "Room Types",
        url: "/rooms/types",
      },
      {
        title: "Availability",
        url: "/rooms/availability",
      },
      {
        title: "Maintenance",
        url: "/rooms/maintenance",
      },
    ],
  },
  {
    title: "Guests",
    icon: Users,
    url: "/guests",
    children: [
      {
        title: "All Guests",
        url: "/guests/all",
      },
      {
        title: "VIP Guests",
        url: "/guests/vip",
      },
      {
        title: "Guest Reviews",
        url: "/guests/reviews",
      },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "/analytics",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    url: "/messages",
  },
  {
    title: "Notifications",
    icon: Bell,
    url: "/notifications",
  },
  {
    title: "Payments",
    icon: CreditCard,
    url: "/payments",
    children: [
      {
        title: "Transactions",
        url: "/payments/transactions",
      },
      {
        title: "Invoices",
        url: "/payments/invoices",
      },
      {
        title: "Refunds",
        url: "/payments/refunds",
      },
    ],
  },
];

const settingsItems = [
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
    children: [
      {
        title: "General",
        url: "/settings/general",
      },
      {
        title: "Hotel Details",
        url: "/settings/hotel",
      },
      {
        title: "Users & Roles",
        url: "/settings/users",
      },
      {
        title: "Integrations",
        url: "/settings/integrations",
      },
    ],
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const { mutate: logout } = useLogout();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200"
      style={{ backgroundColor: "rgb(248 250 252)" }}
    >
      <SidebarHeader
        className="h-16 border-b border-slate-200"
        style={{ backgroundColor: "rgb(248 250 252)" }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/60">
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-600 to-teal-600 text-white shadow-md">
                  <Hotel className="size-4" />
                </div>
                +
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-slate-900">
                    Hotel Portal
                  </span>
                  <span className="truncate text-xs text-slate-500">
                    Management
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent style={{ backgroundColor: "rgb(248 250 252)" }}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) =>
                item.children ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={false}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className="hover:bg-white hover:text-emerald-700 transition-all duration-200"
                        >
                          <item.icon className="text-slate-500" />
                          <span className="text-slate-700 font-medium">
                            {item.title}
                          </span>
                          <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 text-slate-400" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="ml-0 border-l-2 border-emerald-300 pl-4">
                          {item.children.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className="hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-150"
                              >
                                <a href={subItem.url}>
                                  <span className="text-sm text-slate-600">
                                    {subItem.title}
                                  </span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-white hover:text-emerald-700 transition-all duration-200"
                    >
                      <a href={item.url}>
                        <item.icon className="text-slate-500" />
                        <span className="text-slate-700 font-medium">
                          {item.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) =>
                item.children ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={false}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className="hover:bg-white hover:text-emerald-700 transition-all duration-200"
                        >
                          <item.icon className="text-slate-500" />
                          <span className="text-slate-700 font-medium">
                            {item.title}
                          </span>
                          <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 text-slate-400" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="ml-0 border-l-2 border-emerald-300 pl-4">
                          {item.children.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className="hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-150"
                              >
                                <a href={subItem.url}>
                                  <span className="text-sm text-slate-600">
                                    {subItem.title}
                                  </span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-white hover:text-emerald-700 transition-all duration-200"
                    >
                      <a href={item.url}>
                        <item.icon className="text-slate-500" />
                        <span className="text-slate-700 font-medium">
                          {item.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-slate-50 hover:bg-slate-50 transition-colors duration-150"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-600 to-teal-600 text-white shadow-md">
                    <User2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-slate-900">
                      {user?.name || "User"}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-slate-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-slate-200 bg-white shadow-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
