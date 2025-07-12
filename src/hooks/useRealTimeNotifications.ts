// src/hooks/useRealTimeNotifications.ts
// Fixed version that prevents polling spam and handles connection properly

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { socketManager, NotificationData } from '@/lib/socket';
import { useNotifications } from './useNotifications';

interface ToastNotification extends NotificationData {
  id: string;
  autoClose?: boolean;
  duration?: number;
}

export function useRealTimeNotifications() {
  const { data: session } = useSession();
  const { notifications, unreadCount, refetch } = useNotifications();
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Use refs to prevent multiple initializations and memory leaks
  const initializationRef = useRef(false);
  const connectionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const isPollingActive = useRef(false);

  // Connection management
  const initializeConnection = useCallback(async () => {
    if (!session?.user?.restaurantId || initializationRef.current) {
      return;
    }

    console.log('🚀 Initializing WebSocket connection...');
    initializationRef.current = true;
    setConnectionStatus('connecting');

    try {
      const authToken = session.user.id || 'anonymous';
      
      // Try to connect to WebSocket
      await socketManager.connect(session.user.restaurantId, authToken);
      
      // Check if connection was successful
      const connected = socketManager.isSocketConnected();
      setIsConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'error');
      
      if (connected) {
        console.log('✅ WebSocket connection established');
        // Stop polling if it was active
        stopPolling();
      } else {
        console.log('⚠️ WebSocket connection failed, starting polling fallback');
        startPolling();
      }

    } catch (error) {
      console.error('❌ Failed to establish WebSocket connection:', error);
      setIsConnected(false);
      setConnectionStatus('error');
      initializationRef.current = false; // Allow retry
      startPolling();
    }
  }, [session?.user?.restaurantId, session?.user?.id]);

  // Start polling fallback
  const startPolling = useCallback(() => {
    if (isPollingActive.current || !session?.user?.restaurantId) {
      return; // Prevent multiple polling intervals
    }

    console.log('📡 Starting polling fallback mode...');
    isPollingActive.current = true;

    // Clear any existing polling interval
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    // Start polling every 15 seconds
    pollingInterval.current = setInterval(() => {
      if (!isConnected && isPollingActive.current) {
        console.log('🔄 Polling for updates (fallback mode)');
        refetch();
      }
    }, 15000);

    // Set connection status to show we're using polling
    setConnectionStatus('connected'); // Show as connected since polling works
  }, [session?.user?.restaurantId, isConnected, refetch]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      console.log('⏹️ Stopping polling fallback');
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    isPollingActive.current = false;
  }, []);

  // Initialize connection when session is available
  useEffect(() => {
    if (session?.user?.restaurantId && !initializationRef.current) {
      initializeConnection();
    }

    return () => {
      // Cleanup on unmount
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      stopPolling();
    };
  }, [session?.user?.restaurantId, initializeConnection, stopPolling]);

  // Monitor WebSocket connection status (only if we think we're connected)
  useEffect(() => {
    if (!isConnected) return;

    const checkConnection = () => {
      const connected = socketManager.isSocketConnected();
      
      if (connected !== isConnected) {
        console.log('🔄 Connection status changed:', connected ? 'connected' : 'disconnected');
        setIsConnected(connected);
        
        if (!connected) {
          console.log('🔌 WebSocket disconnected, falling back to polling');
          setConnectionStatus('error');
          startPolling();
        } else {
          console.log('✅ WebSocket reconnected, stopping polling');
          setConnectionStatus('connected');
          stopPolling();
        }
      }
    };

    // Check connection every 30 seconds (not too frequent)
    connectionCheckInterval.current = setInterval(checkConnection, 30000);

    return () => {
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
    };
  }, [isConnected, startPolling, stopPolling]);

  // Setup WebSocket event listeners (only when connected)
  useEffect(() => {
    if (!isConnected) return;

    console.log('🔔 Setting up real-time listeners...');

    // New notification listener
    const unsubscribeNotification = socketManager.onNewNotification((notification) => {
      console.log('📨 New notification received:', notification);
      addToastNotification(notification);
      playNotificationSound(notification);
      refetch();
    });

    // Order status update listener
    const unsubscribeOrderUpdate = socketManager.onOrderStatusUpdate((update) => {
      console.log('📋 Order status updated:', update);
      
      const notification: NotificationData = {
        _id: `order-${update.orderId}-${Date.now()}`,
        type: 'order',
        title: 'Order Status Updated',
        message: `Order ${update.orderNumber} is now ${update.status}`,
        priority: 'medium',
        data: update,
        timestamp: new Date(),
      };

      addToastNotification(notification);
      refetch();
    });

    // Kitchen update listener
    const unsubscribeKitchenUpdate = socketManager.onKitchenUpdate((update) => {
      console.log('👨‍🍳 Kitchen update received:', update);
      
      if (update.status === 'ready') {
        const notification: NotificationData = {
          _id: `kitchen-${update.orderId}-${Date.now()}`,
          type: 'kitchen',
          title: 'Order Ready',
          message: `Order is ready for pickup`,
          priority: 'high',
          data: update,
          timestamp: new Date(),
        };

        addToastNotification(notification);
        playNotificationSound(notification);
      }
      
      refetch();
    });

    // Inventory update listener
    const unsubscribeInventoryUpdate = socketManager.onInventoryUpdate((update) => {
      console.log('📦 Inventory updated:', update);
      refetch();
    });

    // Cleanup function
    return () => {
      unsubscribeNotification();
      unsubscribeOrderUpdate();
      unsubscribeKitchenUpdate();
      unsubscribeInventoryUpdate();
    };
  }, [isConnected, refetch]);

  // Toast notification management
  const addToastNotification = useCallback((notification: NotificationData) => {
    const toastId = `toast-${notification._id}-${Date.now()}`;
    const toast: ToastNotification = {
      ...notification,
      id: toastId,
      autoClose: notification.priority !== 'urgent',
      duration: notification.priority === 'urgent' ? 0 : 5000,
    };

    setToastNotifications(prev => {
      // Prevent duplicates
      const exists = prev.some(t => t._id === notification._id);
      if (exists) return prev;
      
      // Add new toast and limit to 5 toasts
      const newToasts = [toast, ...prev].slice(0, 5);
      return newToasts;
    });

    // Auto-remove toast
    if (toast.autoClose && (toast.duration ?? 0) > 0) {
      setTimeout(() => {
        removeToastNotification(toastId);
      }, toast.duration ?? 0);
    }
  }, []);

  const removeToastNotification = useCallback((id: string) => {
    setToastNotifications(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToastNotifications([]);
  }, []);

  // Sound notifications
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const playNotificationSound = useCallback((notification: NotificationData) => {
    if (!soundEnabled) return;

    // Only play sound for high priority notifications
    if (notification.priority === 'urgent' || notification.priority === 'high') {
      try {
        // Create audio context for sound generation
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const frequency = notification.priority === 'urgent' ? 800 : 600;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        console.log('🔊 Notification sound played');
      } catch (error) {
        console.warn('Failed to play notification sound:', error);
      }
    }
  }, [soundEnabled]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [refetch]);

  // Utility functions
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

  // Debug information
  const getDebugInfo = useCallback(() => {
    return {
      isConnected,
      connectionStatus,
      sessionExists: !!session,
      restaurantId: session?.user?.restaurantId,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      socketDebug: socketManager.getDebugInfo(),
      initializationRef: initializationRef.current,
      toastCount: toastNotifications.length,
      soundEnabled,
      isPollingActive: isPollingActive.current,
      hasPollingInterval: !!pollingInterval.current,
    };
  }, [isConnected, connectionStatus, session, toastNotifications.length, soundEnabled]);

  // Disconnect handler
  const disconnect = useCallback(() => {
    console.log('🔌 Manually disconnecting...');
    
    // Clear all intervals and timeouts
    if (connectionCheckInterval.current) {
      clearInterval(connectionCheckInterval.current);
    }
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    stopPolling();
    socketManager.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
    initializationRef.current = false;
  }, [stopPolling]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect requested...');
    disconnect();
    setTimeout(() => {
      initializeConnection();
    }, 1000);
  }, [disconnect, initializeConnection]);

  return {
    // Connection status
    isConnected,
    connectionStatus: isPollingActive.current && !isConnected ? 'connected' : connectionStatus, // Show as connected when polling
    
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
    disconnect,
    reconnect,
    
    // Utilities
    getNotificationIcon,
    getNotificationColor,
    getDebugInfo,
    
    // Socket manager (for advanced usage)
    socketManager
  };
}