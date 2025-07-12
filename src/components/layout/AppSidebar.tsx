// src/components/layout/AppSidebar.tsx
"use client";

import {
  Home,
  ShoppingCart,
  Package,
  Users,
  ChefHat,
  BarChart3,
  Settings,
  ClipboardList,
  CreditCard,
  UserCheck,
  Store,
  LogOut,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  Building2,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/useDashboard";
import { useInventory } from "@/hooks/useInventory";
import { useKitchenOrders } from "@/hooks/useKitchenOrders";

interface AppSidebarProps {
  userRole: string;
}

const getNavigationItems = (role: string) => {
  // Core navigation items available to all roles
  const coreItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home, section: "main" },
  ];

  // Operations section - main business functions
  const operationsItems = [
    {
      name: "POS",
      href: "/dashboard/pos",
      icon: CreditCard,
      roles: ["manager", "cashier", "server"],
    },
    {
      name: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingCart,
      roles: ["manager", "cashier", "kitchen_staff", "server", "delivery"],
    },
    {
      name: "Kitchen",
      href: "/dashboard/kitchen",
      icon: ChefHat,
      roles: ["manager", "kitchen_staff"],
    },
    {
      name: "Menu",
      href: "/dashboard/menu",
      icon: ClipboardList,
      roles: ["manager"],
    },
    {
      name: "Inventory",
      href: "/dashboard/inventory",
      icon: Package,
      roles: ["manager", "kitchen_staff"],
    },
  ];

  // Business management section
  const managementItems = [
    {
      name: "Customers",
      href: "/dashboard/customers",
      icon: Users,
      roles: ["manager", "cashier", "server"],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
      roles: ["manager"],
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: DollarSign,
      roles: ["super_admin", "manager"],
    },
  ];

  // Administration section
  const adminItems = [
    {
      name: "Restaurants",
      href: "/dashboard/restaurants",
      icon: Building2,
      roles: ["super_admin"],
    },
    {
      name: "Staff",
      href: "/dashboard/staff",
      icon: UserCheck,
      roles: ["super_admin", "manager"],
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: Users,
      roles: ["super_admin"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["super_admin", "manager"],
    },
  ];

  const filterByRole = (items: any[]) => {
    return items.filter(
      (item) =>
        !item.roles || item.roles.includes(role) || role === "super_admin"
    );
  };

  return {
    core: coreItems,
    operations: filterByRole(operationsItems),
    management: filterByRole(managementItems),
    admin: filterByRole(adminItems),
  };
};

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const navigation = getNavigationItems(userRole);

  // Get real-time data for badges
  const { stats } = useDashboard();
  const { lowStockItems } = useInventory();
  const { pendingOrders } = useKitchenOrders();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  const getBadgeCount = (itemName: string) => {
    switch (itemName) {
      case "Orders":
        return stats.pendingOrders || 0;
      case "Kitchen":
        return pendingOrders?.length || 0;
      case "Inventory":
        return stats.lowStockItems || lowStockItems.length || 0;
      default:
        return 0;
    }
  };

  const getBadgeVariant = (itemName: string, count: number) => {
    if (count === 0) return null;

    switch (itemName) {
      case "Orders":
        return count > 5 ? "destructive" : "secondary";
      case "Kitchen":
        return count > 3 ? "destructive" : "default";
      case "Inventory":
        return count > 0 ? "destructive" : "secondary";
      default:
        return "secondary";
    }
  };

  const renderMenuSection = (items: any[], showBadges = false) => {
    return items.map((item) => {
      const isActive =
        pathname === item.href ||
        (pathname && pathname.startsWith(`${item.href}/`));
      const badgeCount = showBadges ? getBadgeCount(item.name) : 0;
      const badgeVariant = getBadgeVariant(item.name, badgeCount);

      return (
        <SidebarMenuItem key={item.name}>
          <SidebarMenuButton asChild isActive={!!isActive}>
            <Link href={item.href} className="relative">
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
              {badgeCount > 0 && badgeVariant && (
                <Badge
                  variant={badgeVariant}
                  className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </Badge>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">RestaurantOS</span>
            <span className="truncate text-xs text-muted-foreground">
              Management System
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuSection(navigation.core)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations Section */}
        {navigation.operations.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Operations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {renderMenuSection(navigation.operations, true)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Business Management */}
        {navigation.management.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {renderMenuSection(navigation.management)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Administration */}
        {navigation.admin.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderMenuSection(navigation.admin)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Role Badge */}
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-1">
              <Badge variant="secondary" className="w-full justify-center">
                {userRole?.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {userRole?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">User Profile</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userRole?.replace("_", " ")}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
