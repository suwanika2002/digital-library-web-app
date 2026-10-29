
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "borrowed",
        "returned",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },
    reservationDate: {
      type: Date,
      default: Date.now,
    },
    borrowedAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    reminderStatus: {
      type: String,
      enum: ["pending", "sent"],
      default: "pending",
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
