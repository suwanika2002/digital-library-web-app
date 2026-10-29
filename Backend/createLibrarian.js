
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("node:readline");
require("dotenv").config();

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
    const name = (await ask("Librarian name: ")).trim();
    const email = (await ask("Librarian email: ")).trim().toLowerCase();
    const password = await ask("Create a password (minimum 8 characters): ");

    if (!name || !email || password.length < 8) {
      throw new Error("Enter a name, valid email, and password of at least 8 characters.");
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already exists. Choose another email; no account was changed."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "librarian",
    });

    console.log("\nLibrarian account created successfully!");
    console.log("Email:", email);
    console.log("Role: librarian");
    console.log("Keep your password private.");
  } catch (error) {
    console.error("\nCould not create librarian:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

main();
