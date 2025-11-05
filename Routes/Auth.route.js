const express = require("express");
const { User } = require("../models/AuthModal");
const {
  getAccessToken,
  getRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwtToken");
const createError = require("http-errors");
const { userSchema } = require("../validations/user-validations");

const router = express.Router();
// Add your authentication routes here

router.post("/register", async (req, res, next) => {
  try {
    const user = req.body;
    const validateUser = await userSchema.validateAsync(user);
    const existingUser = await User.findOne({ email: validateUser.email });
    if (existingUser) {
      throw createError.Conflict("User with this email already exists");
    }
    const newUser = new User(validateUser);
    const savedUser = await newUser.save();
    const asccessToken = await getAccessToken({ id: savedUser._id });
    const refreshToken = await getRefreshToken({ id: savedUser._id });
    res.status(201).json({ user: validateUser, asccessToken, refreshToken });
  } catch (error) {
    if (error.isJoi === true) error.status = 403;
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const validateUser = await userSchema.validateAsync(req.body);
    const user = await User.findOne({ email: validateUser.email });
    if (!user) {
      throw createError.Unauthorized("Invalid username/password");
    }
    const isValidPassword = await user.isValidPassword(validateUser.password);
    if (!isValidPassword) {
      throw createError.Unauthorized("Invalid username/password");
    }

    const accessToken = await getAccessToken({ id: user._id });
    const refreshToken = await getRefreshToken({ id: user._id });
    res.status(200).json({
      user: { id: user._id, email: user.email, userName: user.userName },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error.isJoi === true) error.status = 403;
    next(error);
  }
});

router.delete("/logout", (req, res) => {
  res.send("User logout endpoint");
});

router.post("/refreshToken", verifyRefreshToken, async(req, res, next) => {
  try {
    // get the userid from req.payload set in verifyRefreshToken middleware
    const userId = req.payload.id;
    const accessToken = await getAccessToken({ id: userId });
    const refreshToken = await getRefreshToken({ id: userId });
    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// refresh token API
// verify refresh token
// store refresh token in db or in-memory store
// implement logout to invalidate refresh token
// implement clusters
