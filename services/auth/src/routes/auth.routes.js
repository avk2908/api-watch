const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Amithava Varma
 *               email:
 *                 type: string
 *                 example: amithava@example.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       201:
 *         description: User registered, JWT returned
 *       400:
 *         description: Validation error or duplicate email
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ status: "error", message: "name, email, and password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: "error", message: "Email already registered" });
    }
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({
      status: "success",
      token,
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: amithava@example.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Login successful, JWT returned
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "email and password are required" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: "error", message: "Invalid email or password" });
    }
    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user from JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: No token or invalid token
 */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: "error", message: "User no longer exists" });
    }
    res.status(200).json({
      status: "success",
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
  } catch (err) {
    res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
});

module.exports = router;