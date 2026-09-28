import api from "../utils/api";

const notificationService = {
  // Get all notifications
  getNotifications: async () => {
    const res = await api.get("/api/notifications");
    return res.data;
  },

  // Mark as read
  markAsRead: async (id) => {
    const res = await api.put(`/api/notifications/${id}/read`);
    return res.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const res = await api.put("/api/notifications/read-all");
    return res.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const res = await api.delete(`/api/notifications/${id}`);
    return res.data;
  },

  // Clear all
  clearAll: async () => {
    const res = await api.delete("/api/notifications/clear");
    return res.data;
  },

  // Get VAPID key
  getVapidKey: async () => {
    const res = await api.get("/api/notifications/vapid-key");
    return res.data.publicKey;
  },

  // Subscribe to push
  subscribe: async (subscription) => {
    const res = await api.post("/api/notifications/subscribe", subscription);
    return res.data;
  },

  // Unsubscribe from push
  unsubscribe: async (endpoint) => {
    const res = await api.post("/api/notifications/unsubscribe", { endpoint });
    return res.data;
  },

  // Test push notification
  testPush: async () => {
    const res = await api.post("/api/notifications/test");
    return res.data;
  },

  // Admin: Get all notifications
  getAllNotifications: async (params = {}) => {
    const res = await api.get("/api/notifications/admin/all", { params });
    return res.data;
  },

  // Admin: Send notification
  sendNotification: async (data) => {
    const res = await api.post("/api/notifications/send", data);
    return res.data;
  },

  // Admin: Send bulk notifications
  sendBulkNotifications: async (data) => {
    const res = await api.post("/api/notifications/send-bulk", data);
    return res.data;
  },
};

export default notificationService;
