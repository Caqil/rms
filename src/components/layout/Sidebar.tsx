"use client";

import { Fragment } from "react";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import {
  X,
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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: string;
}

const getNavigationItems = (role: string) => {
  const baseItems = [{ name: "Dashboard", href: "/dashboard", icon: Home }];

  const roleBasedItems = {
    super_admin: [
      { name: "Restaurants", href: "/dashboard/restaurants", icon: Store },
      { name: "Users", href: "/dashboard/users", icon: Users },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
    manager: [
      { name: "POS", href: "/dashboard/pos", icon: CreditCard },
      { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { name: "Menu", href: "/dashboard/menu", icon: ClipboardList },
      { name: "Kitchen", href: "/dashboard/kitchen", icon: ChefHat },
      { name: "Inventory", href: "/dashboard/inventory", icon: Package },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
      { name: "Staff", href: "/dashboard/staff", icon: UserCheck },
      { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
    cashier: [
      { name: "POS", href: "/dashboard/pos", icon: CreditCard },
      { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
    ],
    kitchen_staff: [
      { name: "Kitchen", href: "/dashboard/kitchen", icon: ChefHat },
      { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    ],
    server: [
      { name: "POS", href: "/dashboard/pos", icon: CreditCard },
      { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { name: "Tables", href: "/dashboard/tables", icon: ClipboardList },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
    ],
    delivery: [
      { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
    ],
  };

  return [
    ...baseItems,
    ...(roleBasedItems[role as keyof typeof roleBasedItems] || []),
  ];
};

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  userRole,
}: SidebarProps) {
  const pathname = usePathname();
  const navigation = getNavigationItems(userRole);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-indigo-700">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-lg">R</span>
          </div>
          <span className="text-white text-xl font-semibold">RestaurantOS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-indigo-800 text-white"
                  : "text-indigo-100 hover:bg-indigo-600 hover:text-white"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive
                    ? "text-white"
                    : "text-indigo-300 group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userRole?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white capitalize">
              {userRole?.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 flex md:hidden"
          onClose={setSidebarOpen}
        >
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-700">
              <TransitionChild
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
              </TransitionChild>
              <SidebarContent />
            </div>
          </TransitionChild>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-700">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
