const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const Book = require("./models/Book");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { startDueReminderJob } = require("./services/dueReminderJob");
const app = express();

const PORT = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors({ origin: /^http:\/\/(localhost|127\.0\.0\.1):51[7-9]\d$/ }));
app.use(express.json());
app.use("/api/reservations", reservationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
// Check whether the backend and database are connected
app.get("/", (req, res) => {
  res.json({
    message: "Digital Library Backend is running successfully!",
    database: mongoose.connection.readyState === 1
      ? "Connected"
      : "Not connected"
  });
});

// Test API route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Your Digital Library API is working!"
  });
});

// Connect to MongoDB, then start the server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    const migration = await Book.updateMany(
      { language: { $exists: false } },
      { $set: { language: "English" } }
    );
    if (migration.modifiedCount > 0) {
      console.log(
        `Set ${migration.modifiedCount} existing book(s) to English.`
      );
    }

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      startDueReminderJob();
    });
  } catch (error) {
    console.error("Failed to start the backend:", error.message);
    process.exit(1);
  }
}

startServer();
