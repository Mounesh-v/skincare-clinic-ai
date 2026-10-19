import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import notificationService from "../services/notificationService";
import { getUser } from "../utils/auth";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

// Convert VAPID key from base64url to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Wait for service worker to be truly ready (with timeout)
function waitForServiceWorker(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    if (!("serviceWorker" in navigator)) {
      return reject(new Error("Service workers not supported"));
    }
    const timeout = setTimeout(() => reject(new Error("SW ready timeout")), timeoutMs);

    navigator.serviceWorker.ready.then((reg) => {
      clearTimeout(timeout);
      resolve(reg);
    }).catch((err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pushPermission, setPushPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const rawUser = getUser();
  const userKey = rawUser ? rawUser.id || rawUser._id || rawUser.email : null;
  const user = useMemo(() => rawUser, [userKey]);
  const autoSubscribedRef = useRef(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Check existing subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      console.log("[PUSH-FRONTEND] Checking existing subscription...");
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("[PUSH-FRONTEND] Push not supported in this browser");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        const permission = typeof Notification !== "undefined" ? Notification.permission : "denied";
        console.log("[PUSH-FRONTEND] SW ready, subscription exists:", !!subscription, "permission:", permission);
        setIsSubscribed(!!subscription);
        setPushPermission(permission);
      } catch (e) {
        console.warn("[PUSH-FRONTEND] SW not ready yet:", e.message);
      }
    };
    checkSubscription();
  }, []);

  // Subscribe to push notifications (exposed for manual trigger)
  const subscribeToPush = useCallback(async () => {
    console.log("[PUSH-FRONTEND] subscribeToPush called");

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("[PUSH-FRONTEND] Push notifications not supported in this browser");
      return false;
    }

    try {
      console.log("[PUSH-FRONTEND] Requesting notification permission...");
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      console.log("[PUSH-FRONTEND] Notification permission:", permission);

      if (permission !== "granted") {
        console.warn("[PUSH-FRONTEND] Permission not granted:", permission);
        return false;
      }

      console.log("[PUSH-FRONTEND] Waiting for service worker...");
      const registration = await waitForServiceWorker(15000);
      console.log("[PUSH-FRONTEND] Service worker ready");

      // Check VAPID key
      console.log("[PUSH-FRONTEND] Fetching VAPID public key...");
      const vapidKey = await notificationService.getVapidKey();
      console.log("[PUSH-FRONTEND] VAPID public key available:", !!vapidKey, "length:", vapidKey?.length);

      if (!vapidKey) {
        console.error("[PUSH-FRONTEND] No VAPID public key received from server");
        return false;
      }

      // Check existing subscription
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        console.log("[PUSH-FRONTEND] Existing subscription found, endpoint:", subscription.endpoint.substring(0, 60) + "...");
      } else {
        console.log("[PUSH-FRONTEND] Creating new push subscription...");
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
        console.log("[PUSH-FRONTEND] New subscription created, endpoint:", subscription.endpoint.substring(0, 60) + "...");
      }

      const p256dh = btoa(
        String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("p256dh")))
      );
      const auth = btoa(
        String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("auth")))
      );

      console.log("[PUSH-FRONTEND] Sending subscription to backend...");
      console.log("[PUSH-FRONTEND] Auth token present:", !!localStorage.getItem("authToken"));

      await notificationService.subscribe({
        endpoint: subscription.endpoint,
        keys: { p256dh, auth },
      });

      console.log("[PUSH-FRONTEND] Subscription saved to backend successfully!");
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error("[PUSH-FRONTEND] Failed to subscribe to push:", error.message, error);
      return false;
    }
  }, []);

  // Auto-subscribe to push when user logs in (only once per session)
  useEffect(() => {
    if (!user || autoSubscribedRef.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("[PUSH-FRONTEND] Auto-subscribe skipped: push not supported");
      return;
    }

    console.log("[PUSH-FRONTEND] Auto-subscribe starting for user:", user.id || user._id || user.email);
    console.log("[PUSH-FRONTEND] Current permission:", Notification.permission);

    const autoSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();

        if (existing) {
          console.log("[PUSH-FRONTEND] Existing subscription found, syncing to server...");
          setIsSubscribed(true);
          try {
            await notificationService.subscribe({
              endpoint: existing.endpoint,
              keys: {
                p256dh: btoa(
                  String.fromCharCode.apply(null, new Uint8Array(existing.getKey("p256dh")))
                ),
                auth: btoa(
                  String.fromCharCode.apply(null, new Uint8Array(existing.getKey("auth")))
                ),
              },
            });
            console.log("[PUSH-FRONTEND] Existing subscription synced to server");
          } catch (e) {
            console.warn("[PUSH-FRONTEND] Failed to sync existing subscription:", e.message);
          }
          autoSubscribedRef.current = true;
          return;
        }

        // Only auto-subscribe if permission is already granted
        if (Notification.permission === "granted") {
          console.log("[PUSH-FRONTEND] Permission granted, auto-subscribing...");
          const result = await subscribeToPush();
          console.log("[PUSH-FRONTEND] Auto-subscribe result:", result);
        } else {
          console.log("[PUSH-FRONTEND] Permission not granted (" + Notification.permission + "), skipping auto-subscribe");
        }
      } catch (error) {
        console.error("[PUSH-FRONTEND] Auto-subscribe error:", error.message);
      }
      autoSubscribedRef.current = true;
    };

    // Wait longer for SW to fully initialize
    const timer = setTimeout(autoSubscribe, 3000);
    return () => clearTimeout(timer);
  }, [user, subscribeToPush]);

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      const notification = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Clear all
  const clearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  // Unsubscribe from push
  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await notificationService.unsubscribe(subscription.endpoint);
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Failed to unsubscribe from push:", error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    pushPermission,
    isSubscribed,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    subscribeToPush,
    unsubscribeFromPush,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
