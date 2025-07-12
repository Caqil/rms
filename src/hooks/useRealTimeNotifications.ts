
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { socketManager, NotificationData } from '@/lib/socket';
import { useNotifications } from './useNotifications';

interface ToastNotification extends NotificationData {
  id: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

export function useRealTimeNotifications() {
  const { data: session } = useSession();
  const { notifications, unreadCount, refetch } = useNotifications();
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Use ref to prevent multiple initializations
  const initializationRef = useRef(false);
  const connectionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection (only once)
  useEffect(() => {
    // Fixed: Use session.user.restaurantId instead of session.restaurantId
    if (!session?.user?.restaurantId || initializationRef.current) {
      return;
    }

    initializationRef.current = true;

    const initializeConnection = async () => {
      try {
        console.log('🚀 Initializing WebSocket connection for restaurant:', session.user.restaurantId);
        
        // Fixed: Pass session.user.id as auth token (or use actual token if available)
        const authToken = session.user.id; // or session.accessToken if you have it
        const socket = await socketManager.connect(session.user.restaurantId!, authToken);
        
        // Set up connection status checking
        connectionCheckInterval.current = setInterval(() => {
          const connected = socketManager.isConnected();
          setIsConnected(connected);
          
          // Debug log
          if (connected !== isConnected) {
            console.log('🔄 Connection status changed:', connected);
            console.log('🔍 Debug info:', socketManager.getDebugInfo());
          }
        }, 2000);

        // Initial connection check
        setTimeout(() => {
          setIsConnected(socketManager.isConnected());
        }, 1000);

      } catch (error) {
        console.error('❌ Failed to initialize WebSocket connection:', error);
        initializationRef.current = false; // Allow retry
      }
    };

    initializeConnection();

    // Fixed: Return cleanup function properly
    return () => {
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
      socketManager.disconnect();
      initializationRef.current = false;
    };
  }, [session?.user?.restaurantId]); // Fixed: Use session.user.restaurantId

  // Handle new notifications (only when connected)
  useEffect(() => {
    if (!isConnected) return;

    console.log('🔔 Setting up notification listeners');

    const unsubscribe = socketManager.onNewNotification((notification) => {
      console.log('📨 New notification received:', notification);
      
      // Add to toast notifications
      addToastNotification(notification);
      
      // Play sound if enabled
      playNotificationSound(notification);
      
      // Refresh notification list
      refetch();
    });

    // Fixed: Return the unsubscribe function properly
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isConnected, refetch]);

  // Polling fallback when WebSocket is not connected
  useEffect(() => {
    if (!isConnected) {
      console.log('📡 WebSocket not connected, using polling fallback');
      const pollInterval = setInterval(() => {
        console.log('🔄 Polling for notifications (fallback mode)');
        refetch();
      }, 15000); // Poll every 15 seconds
      
      return () => clearInterval(pollInterval);
    }
  }, [isConnected, refetch]);

  // Play notification sound
  const playNotificationSound = useCallback((notification: NotificationData) => {
    if (!soundEnabled) return;

    // Only play sound for high priority notifications
    if (notification.priority === 'urgent' || notification.priority === 'high') {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const frequency = notification.priority === 'urgent' ? 800 : 600;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';

        const volume = notification.priority === 'urgent' ? 0.3 : 0.2;
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);

        // For urgent notifications, play twice
        if (notification.priority === 'urgent') {
          setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();

            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            oscillator2.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator2.type = 'sine';
            gainNode2.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.3);
          }, 400);
        }
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    }
  }, [soundEnabled]);

  // Add toast notification
  const addToastNotification = useCallback((notification: NotificationData) => {
    const toastId = `${notification._id}-${Date.now()}`;
    const duration = {
      urgent: 8000,
      high: 6000,
      medium: 4000,
      low: 3000
    }[notification.priority];

    const toast: ToastNotification = {
      ...notification,
      id: toastId,
      timestamp: new Date(),
      autoClose: notification.priority !== 'urgent',
      duration
    };

    setToastNotifications(prev => [toast, ...prev].slice(0, 5));

    // Auto-remove toast after duration (unless urgent)
    if (toast.autoClose) {
      setTimeout(() => {
        removeToastNotification(toastId);
      }, duration);
    }
  }, []);

  // Remove toast notification
  const removeToastNotification = useCallback((id: string) => {
    setToastNotifications(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Clear all toast notifications
  const clearAllToasts = useCallback(() => {
    setToastNotifications([]);
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [refetch]);

  // Get notification icon based on type and priority
  const getNotificationIcon = useCallback((notification: NotificationData): string => {
    if (notification.priority === 'urgent') return '🚨';
    
    switch (notification.type) {
      case 'order':
        return '🛎️';
      case 'kitchen':
        return '👨‍🍳';
      case 'inventory':
        return '📦';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  }, []);

  // Get notification color based on priority
  const getNotificationColor = useCallback((priority: string): string => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-blue-500 bg-blue-50';
      case 'low':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-300 bg-white';
    }
  }, []);

  // Debug function
  const getDebugInfo = useCallback(() => {
    return {
      isConnected,
      sessionExists: !!session,
      restaurantId: session?.user?.restaurantId,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      socketDebug: socketManager.getDebugInfo(),
      initializationRef: initializationRef.current
    };
  }, [isConnected, session]);

  return {
    // Connection status
    isConnected,
    
    // Notifications data
    notifications,
    unreadCount,
    toastNotifications,
    
    // Sound settings
    soundEnabled,
    toggleSound,
    
    // Actions
    addToastNotification,
    removeToastNotification,
    clearAllToasts,
    markAsRead,
    refetch,
    
    // Utilities
    getNotificationIcon,
    getNotificationColor,
    getDebugInfo,
    
    // Socket manager (for advanced usage)
    socketManager
  };
}