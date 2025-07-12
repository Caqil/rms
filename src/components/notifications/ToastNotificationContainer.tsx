"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { ToastNotification } from "./ToastNotifications";

export function ToastNotificationContainer() {
  const { toastNotifications, removeToastNotification } =
    useRealTimeNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const portalTarget = document.body;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toastNotifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={() => removeToastNotification(notification.id)}
        />
      ))}
    </div>,
    portalTarget
  );
}
