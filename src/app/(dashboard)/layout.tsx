"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "../../components/layout/Header";
// ADDED: Import toast notifications
import ToastNotifications from "@/components/notifications/ToastNotifications";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar userRole={session?.user?.role || ""} />
        <SidebarInset className="flex flex-col">
          <Header user={session?.user} />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-6">{children}</div>
          </main>
        </SidebarInset>
      </div>
      <Toaster richColors />
      {/* ADDED: Toast notifications component */}
      <ToastNotifications />
    </SidebarProvider>
  );
}
