
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("node:readline");
const User = require("./models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  try {
    const email = (
      await ask("Account email [testmember@example.com]: ")
    ).trim().toLowerCase() || "testmember@example.com";

    const password = await ask(
      "Enter your new password (minimum 8 characters): "
    );

    if (password.length < 8) {
      throw new Error("Password must contain at least 8 characters.");
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("No account exists with that email.");
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    console.log("\nPassword reset successfully.");
    console.log("Account:", user.email);
    console.log("Current role:", user.role);
  } catch (error) {
    console.error("\nPassword reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

main();
