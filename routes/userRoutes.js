const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { verifyToken, generateToken } = require("../middleware/verifyToken");

const User = require("../models/user");
const { json } = require("body-parser");
const localStorage = require("localStorage");
const { v4: uuidv4 } = require("uuid");
const ForgotPasswordRequest = require("../models/forgotPassword");
const sendinblueClient = require("../config/email");
const nodemailer = require("nodemailer");
const Sib = require("sib-api-v3-sdk");
const axios = require("axios");
require('dotenv').config();


const sendinblueApiKey = process.env.SENDINBLUE_API_KEY;
console.log("api_key",sendinblueApiKey)
const sendinblueConfig = {
  headers: {
    "Content-Type": "application/json",
    "api-key": sendinblueApiKey,
  },
};



router.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "Incomplete data provided" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    const token = generateToken(User.id);

    res.cookie("jwtToken", token, { httpOnly: true, maxAge: 3600000 * 1000 }); // 1 hour in milliseconds

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/signup", (req, res) => {
  res.render("user/signupScreen", { message: null });
});

router.get("/signin", (req, res) => {
  res.render("user/signinScreen", { message: null });
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    await ForgotPasswordRequest.destroy({ where: { userId: user.id } });
    const token = generateToken(User.id);

    res.cookie("jwtToken", token, { httpOnly: true, maxAge: 3600000 * 1000 }); // 1 hour in milliseconds
    localStorage.setItem("jwtToken", token);

    res.redirect(`/product/addProduct/${user.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/deleteUser/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/forgotpassword", (req, res) => {
  res.render("user/forgotpassword", { message: null });
});

router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (user) {
    const resetToken = generateResetToken();

    await ForgotPasswordRequest.create({ userId: user.id, resetToken });

    sendResetEmail(user.email, resetToken);

    res.render("user/forgotpasswordsuccess");
  } else {
    res.render("user/forgotpassworderror", { error: "User not found" });
  }
});

router.get("/resetpassword/:resetToken", async (req, res) => {
  const resetToken = req.params.resetToken;

  const forgotPasswordEntry = await ForgotPasswordRequest.findOne({
    where: { resetToken },
    include: User,
  });

  if (forgotPasswordEntry) {
    res.render("user/resetpassword", { resetToken });
  } else {
    res.render("user/resetpassworderror", { error: "Invalid or expired link" });
  }
});

router.post("/resetpassword", async (req, res) => {
  const { resetToken, password } = req.body;

  const forgotPasswordEntry = await ForgotPasswordRequest.findOne({
    where: { resetToken },
    include: User,
  });

  if (forgotPasswordEntry) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = forgotPasswordEntry.User;
    user.password = hashedPassword;
    await user.save();
    await forgotPasswordEntry.destroy();

    res.render("user/resetpasswordsuccess");
  } else {
    res.render("user/resetpassworderror", { error: "Invalid or expired link" });
  }
});


function generateResetToken() {
  const crypto = require("crypto");
  return crypto.randomBytes(8).toString("hex");
}

async function sendResetEmail(email, resetToken) {
  const emailData = {
    sender: { name: "Avi", email: process.env.SENDER_EMAIL },
    to: [{ email: email }],
    subject: " Testing Email",
    htmlContent: `
        <p>Click the following link to reset your password:</p>
        <a href="http://localhost:3000/user/resetpassword/${resetToken}">Reset Password</a>
      `,
  };

 
  try {
    await axios.post(
      "https://api.sendinblue.com/v3/smtp/email",
      emailData,
      sendinblueConfig
    );
    console.log("Email sent successfully");
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response ? error.response.data : error.message
    );
   
  }
}




module.exports = router;
