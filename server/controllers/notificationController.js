import Notification from "../models/Notification.js";
import PushSubscription from "../models/PushSubscription.js";
import Admin from "../models/Admin.js";
import webPush from "web-push";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@skincare.ai";

// Helper: find or create the single admin user for notifications
export const getAdminUser = async () => {
  let admin = await Admin.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = await Admin.create({ name: "Admin", email: ADMIN_EMAIL });
  }
  return admin;
};

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  "BKaAFUqddSo-GNjRQhbfmRKoWfeuJc4Ga3ra_bcSfDt5s0BIH0UFtJ588FnRYKkssSWRTjtmf1d66ucOiZfMh6s";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  "7MUp5wE9aP4r-JaY7WC-ArQwMsj46eBMYbgB8_X9SoY";

const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@skincare.ai";

webPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Helper: Send push notification to a user
export const sendPushNotification = async (userId, userModel, title, body, link, extras = {}) => {
  try {
    console.log(`[PUSH] Sending push to user=${userId} model=${userModel}`);

    const subscriptions = await PushSubscription.find({
      user: userId,
      userModel,
    });

    console.log(`[PUSH] Found ${subscriptions.length} subscription(s)`);

    if (!subscriptions.length) {
      console.log(`[PUSH] No subscriptions found — skipping push`);
      return [];
    }

    const payload = JSON.stringify({
      title,
      body,
      link: link || "/",
      type: extras.type || "system",
      notificationId: extras.notificationId || "",
      timestamp: extras.timestamp || Date.now(),
      tag: extras.tag || null,
      image: extras.image || null,
      actions: extras.actions || [
        { action: "open", title: "View Details" },
        { action: "dismiss", title: "Dismiss" },
      ],
    });

    console.log(`[PUSH] Payload:`, payload);

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webPush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        ).catch((err) => {
          console.error(`[PUSH] Failed to send to endpoint ${sub.endpoint.substring(0, 50)}... Status: ${err.statusCode}`);
          // Remove expired / revoked subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`[PUSH] Removing expired subscription: ${sub._id}`);
            PushSubscription.deleteOne({ _id: sub._id });
          }
          throw err;
        })
      )
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    console.log(`[PUSH] Results: ${succeeded} succeeded, ${failed} failed`);

    return results;
  } catch (error) {
    console.error("[PUSH] Push notification error:", error.message);
  }
};

// Helper: Create in-app notification + push
export const createNotification = async ({
  recipient,
  recipientModel,
  type,
  title,
  message,
  data = {},
  link = null,
  sendPush = true,
}) => {
  try {
    console.log(`[NOTIF] Creating notification: type=${type} recipient=${recipient} model=${recipientModel} push=${sendPush}`);

    const notification = await Notification.create({
      recipient,
      recipientModel,
      type,
      title,
      message,
      data,
      link,
    });

    console.log(`[NOTIF] Saved to DB: id=${notification._id}`);

    if (sendPush) {
      console.log(`[NOTIF] Sending push...`);
      await sendPushNotification(
        recipient,
        recipientModel,
        title,
        message,
        link,
        { type, notificationId: notification._id.toString(), timestamp: notification.createdAt, tag: `${type}-${notification._id}`, image: data.image || null, actions: data.actions || null }
      );
    } else {
      console.log(`[NOTIF] Push skipped (sendPush=${sendPush})`);
    }

    return notification;
  } catch (error) {
    console.error("[NOTIF] createNotification error:", error.message);
  }
};

// Helper: Send notification to admin (convenience wrapper)
export const notifyAdmin = async ({ type, title, message, data = {}, link = null }) => {
  console.log(`[NOTIFY-ADMIN] type=${type} title="${title}"`);
  const admin = await getAdminUser();
  if (!admin) {
    console.error(`[NOTIFY-ADMIN] No admin user found — skipping`);
    return;
  }
  console.log(`[NOTIFY-ADMIN] Admin user: ${admin._id}`);
  return createNotification({
    recipient: admin._id,
    recipientModel: "Admin",
    type,
    title,
    message,
    data: { ...data, actions: data.actions || [{ action: "open", title: "View" }, { action: "dismiss", title: "Dismiss" }] },
    link,
    sendPush: true,
  });
};

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
      recipientModel: req.user.role === "vendor" ? "Vendor" : req.user.role === "admin" ? "Admin" : "Register",
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      recipientModel: req.user.role === "vendor" ? "Vendor" : req.user.role === "admin" ? "Admin" : "Register",
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        recipientModel: req.user.role === "vendor" ? "Vendor" : req.user.role === "admin" ? "Admin" : "Register",
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear
// @access  Private
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      recipient: req.user.id,
      recipientModel: req.user.role === "vendor" ? "Vendor" : req.user.role === "admin" ? "Admin" : "Register",
    });

    res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
export const subscribePush = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    const userAgent = req.headers["user-agent"] || "";

    console.log(`[SUBSCRIBE] req.user=`, JSON.stringify(req.user));

    const userId = req.user.id || req.user._id;
    const userModel = req.user.role === "vendor" ? "Vendor" : req.user.role === "admin" ? "Admin" : "Register";

    console.log(`[SUBSCRIBE] userId=${userId} userModel=${userModel}`);

    if (!userId) {
      console.error(`[SUBSCRIBE] No user ID found in token`);
      return res.status(401).json({ message: "Invalid token — no user ID" });
    }

    const existing = await PushSubscription.findOne({ endpoint });

    if (existing) {
      existing.keys = keys;
      existing.userAgent = userAgent;
      await existing.save();
      console.log(`[SUBSCRIBE] Updated existing subscription for endpoint=${endpoint.substring(0, 50)}...`);
    } else {
      await PushSubscription.create({
        user: userId,
        userModel,
        endpoint,
        keys,
        userAgent,
      });
      console.log(`[SUBSCRIBE] New subscription created for user=${userId} model=${userModel}`);
    }

    res.status(200).json({ success: true, message: "Subscribed to push notifications" });
  } catch (error) {
    console.error(`[SUBSCRIBE] Error:`, error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unsubscribe from push notifications
// @route   POST /api/notifications/unsubscribe
// @access  Private
export const unsubscribePush = async (req, res) => {
  try {
    const { endpoint } = req.body;

    await PushSubscription.deleteOne({ endpoint });

    res.status(200).json({ success: true, message: "Unsubscribed from push notifications" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get VAPID public key
// @route   GET /api/notifications/vapid-key
// @access  Public
export const getVapidKey = async (req, res) => {
  res.status(200).json({ publicKey: VAPID_PUBLIC_KEY });
};

// @desc    Get all notifications (Admin)
// @route   GET /api/notifications/admin/all
// @access  Private/Admin
export const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, isRead } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === "true";

    const notifications = await Notification.find(filter)
      .populate("recipient", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: notifications,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send notification to user (Admin)
// @route   POST /api/notifications/send
// @access  Private/Admin
export const sendNotification = async (req, res) => {
  try {
    const { recipientId, recipientModel, type, title, message, link } = req.body;

    const notification = await createNotification({
      recipient: recipientId,
      recipientModel: recipientModel || "Register",
      type: type || "system",
      title,
      message,
      link,
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send bulk notifications (Admin)
// @route   POST /api/notifications/send-bulk
// @access  Private/Admin
export const sendBulkNotifications = async (req, res) => {
  try {
    const { recipientIds, recipientModel, type, title, message, link } = req.body;

    const results = await Promise.allSettled(
      recipientIds.map((id) =>
        createNotification({
          recipient: id,
          recipientModel: recipientModel || "Register",
          type: type || "system",
          title,
          message,
          link,
        })
      )
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    res.status(201).json({
      success: true,
      message: `Sent to ${succeeded} users, ${failed} failed`,
      succeeded,
      failed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send test push notification (development only)
// @route   POST /api/notifications/test
// @access  Private
export const testPushNotification = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userModel = req.user.role === "vendor" ? "Vendor" : req.user.role === "admin" ? "Admin" : "Register";

    console.log(`[TEST-PUSH] Testing push for user=${userId} model=${userModel}`);

    const subscriptionCount = await PushSubscription.countDocuments({ user: userId, userModel });
    console.log(`[TEST-PUSH] Found ${subscriptionCount} subscription(s) for this user`);

    if (subscriptionCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No push subscriptions found for this user. Enable notifications in the browser first.",
      });
    }

    const results = await sendPushNotification(
      userId,
      userModel,
      "Test Notification",
      "Web Push is working correctly! This is a test notification.",
      "/admin/dashboard",
      { type: "system", notificationId: "test", timestamp: Date.now() }
    );

    const succeeded = results?.filter((r) => r.status === "fulfilled").length || 0;
    const failed = results?.filter((r) => r.status === "rejected").length || 0;

    console.log(`[TEST-PUSH] Results: ${succeeded} succeeded, ${failed} failed`);

    res.status(200).json({
      success: true,
      message: `Test push sent: ${succeeded} succeeded, ${failed} failed`,
      subscriptions: subscriptionCount,
    });
  } catch (error) {
    console.error("[TEST-PUSH] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
