import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  subscribePush,
  unsubscribePush,
  getVapidKey,
  getAllNotifications,
  sendNotification,
  sendBulkNotifications,
  testPushNotification,
} from "../controllers/notificationController.js";
import verifyToken, { verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

// Public
router.get("/vapid-key", getVapidKey);

// User routes
router.get("/", verifyToken, getNotifications);
router.put("/:id/read", verifyToken, markAsRead);
router.put("/read-all", verifyToken, markAllAsRead);
router.delete("/:id", verifyToken, deleteNotification);
router.delete("/clear", verifyToken, clearAllNotifications);

// Push subscription
router.post("/subscribe", verifyToken, subscribePush);
router.post("/unsubscribe", verifyToken, unsubscribePush);

// Test push (development)
router.post("/test", verifyToken, testPushNotification);

// Admin routes
router.get("/admin/all", verifyToken, verifyAdmin, getAllNotifications);
router.post("/send", verifyToken, verifyAdmin, sendNotification);
router.post("/send-bulk", verifyToken, verifyAdmin, sendBulkNotifications);

export default router;
