// Service Worker for Web Push Notifications
// Displays banner-style device notifications with icons, images, and actions.

const ICONS = {
  order: "/favicon.ico",
  booking: "/favicon.ico",
  vendor: "/favicon.ico",
  product: "/favicon.ico",
  assessment: "/favicon.ico",
  offer: "/favicon.ico",
  system: "/favicon.ico",
};

const TITLES = {
  order: "Order Update",
  booking: "Booking Update",
  vendor: "Vendor Update",
  product: "Product Update",
  assessment: "Assessment Update",
  offer: "Special Offer",
  system: "Notification",
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Push notification received — display as banner
self.addEventListener("push", (event) => {
  let data = {
    title: "New Notification",
    body: "",
    link: "/",
    type: "system",
    notificationId: "",
    icon: null,
    image: null,
    badge: null,
    tag: null,
    actions: null,
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const icon = data.icon || ICONS[data.type] || "/favicon.ico";
  const badge = data.badge || "/favicon.ico";
  const tag = data.tag || `${data.type}-${data.notificationId || Date.now()}`;

  const options = {
    body: data.body,
    icon,
    badge,
    image: data.image || null,
    vibrate: [200, 100, 200],
    tag,
    renotify: true,
    requireInteraction: true,
    timestamp: data.timestamp || Date.now(),
    silent: false,
    data: {
      link: data.link || "/",
      notificationId: data.notificationId || "",
      type: data.type || "system",
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: "open", title: "View Details", icon: "/favicon.ico" },
      { action: "dismiss", title: "Dismiss", icon: "/favicon.ico" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click — focus existing window or open new one
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const link = event.notification.data?.link || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(link);
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(link);
        }
      })
  );
});

// Notification close — track dismissal if needed
self.addEventListener("notificationclose", (event) => {
  // Optional: track when user dismisses notification
});

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
