const express = require("express");
const { verifyAccessToken } = require("../helpers/jwtToken");

const router = express.Router();

router.get("/", verifyAccessToken, (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Access to products granted, successfully accessed", reqayload: req.payload });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
