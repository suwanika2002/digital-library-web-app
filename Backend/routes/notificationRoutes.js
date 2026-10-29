const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "member") {
      return res.status(403).json({
        message: "Notifications are available to members only.",
      });
    }

    const notifications = await Notification.find({
      member: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      message: "Unable to fetch notifications.",
    });
  }
});

router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "member") {
      return res.status(403).json({
        message: "Notifications are available to members only.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid notification ID.",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, member: req.user.id },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return res.status(500).json({
      message: "Unable to update notification.",
    });
  }
});

module.exports = router;
