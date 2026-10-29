const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");
const Reservation = require("../models/Reservation");
const { getCalendarDayWindow } = require("./libraryDates");

let isRunning = false;
let warnedMissingMailConfig = false;
const LIBRARY_TIMEZONE = process.env.LIBRARY_TIMEZONE || "Asia/Colombo";

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    return null;
  }

  const port = Number(SMTP_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }

  return {
    transporter: nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    }),
    from: MAIL_FROM,
  };
}

async function sendDueReminder(reservation, mailConfig) {
  const dueDate = reservation.dueDate.toLocaleDateString("en", {
    dateStyle: "long",
    timeZone: LIBRARY_TIMEZONE,
  });
  const bookTitle = reservation.book?.title || "your borrowed book";
  const message = `"${bookTitle}" is due on ${dueDate}. Please return it to the library by the due date.`;

  await Notification.updateOne(
    {
      reservation: reservation._id,
      type: "due_reminder",
    },
    {
      $setOnInsert: {
        member: reservation.member._id,
        title: "Book return due in two days",
        message,
      },
    },
    { upsert: true }
  );

  if (!mailConfig) {
    if (!warnedMissingMailConfig) {
      console.error(
        "Due reminder emails are disabled: configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM in Backend/.env."
      );
      warnedMissingMailConfig = true;
    }
    return;
  }

  await mailConfig.transporter.sendMail({
    from: mailConfig.from,
    to: reservation.member.email,
    subject: "Library book due in two days",
    text: `Hello ${reservation.member.name},\n\n${message}\n\nThank you,\nDigital Library`,
  });

  await Reservation.updateOne(
    { _id: reservation._id, status: "borrowed", reminderStatus: "pending" },
    {
      $set: {
        reminderStatus: "sent",
        reminderSentAt: new Date(),
      },
    }
  );
}

async function checkDueReminders() {
  if (isRunning) return;

  isRunning = true;

  try {
    const { start, end } = getCalendarDayWindow(2, LIBRARY_TIMEZONE);

    const reservations = await Reservation.find({
      status: "borrowed",
      reminderStatus: "pending",
      dueDate: { $gte: start, $lt: end },
    })
      .populate("member", "name email")
      .populate("book", "title");

    let mailConfig;
    try {
      mailConfig = createTransporter();
    } catch (error) {
      console.error("Invalid due reminder email configuration:", error.message);
      return;
    }

    for (const reservation of reservations) {
      try {
        await sendDueReminder(reservation, mailConfig);
      } catch (error) {
        console.error(
          `Unable to send due reminder for reservation ${reservation._id}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("Due reminder job failed:", error);
  } finally {
    isRunning = false;
  }
}

function startDueReminderJob() {
  cron.schedule("0 * * * *", checkDueReminders, {
    timezone: LIBRARY_TIMEZONE,
  });
  checkDueReminders();
}

module.exports = { startDueReminderJob };
