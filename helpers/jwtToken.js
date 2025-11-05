const jwt = require("jsonwebtoken");
const { createClient } = require("redis");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const createErr = require("http-errors");
const bcrypt = require("bcrypt");

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redis.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redis.connect();
})();
const getAccessToken = async (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, { expiresIn: "30s" }, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
};

const getRefreshToken = async (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, { expiresIn: "2m" }, async (err, token) => {
      if (err) return reject(err);
      // set token as key in redis with expiry of 2 minutes
      redis.setEx(token, 2 * 60, JSON.stringify(payload));
      resolve(token);
    });
  });
};

const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw createErr.Unauthorized("Access token is missing");
    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if (err) {
        throw next(createErr.Unauthorized("Unauthorized access"));
      }
      req.payload = payload;
      next();
    });
  } catch (err) {
    next(err);
  }
};

// refresh token verification can be added similarly
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createErr.Unauthorized("Refresh token is missing");
    jwt.verify(refreshToken, JWT_SECRET, async (err, payload) => {
      if (err) return next(createErr.Unauthorized("Invalid refresh token"));
      try {
        const reply = await redis.get(refreshToken);
        if (!reply) return next(createErr.Unauthorized("Invalid refresh token"));
        req.payload = reply;
        redis.del(refreshToken);
        next();
      } catch (err) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }

  // res.send("Refresh token verification endpoint", req);
};

module.exports = {
  getAccessToken,
  getRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
