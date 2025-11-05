const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();
require("./helpers/Init_db");
const createError = require("http-errors");

// import routes
const AuthRouter = require("./Routes/Auth.route");
const ProductRouter = require("./Routes/Products.route");

app.use(express.json());
app.use(cookieParser());
const PORT = process.env.APP_PORT || 5000;

app.use("/api/auth", AuthRouter);
app.use("/api/products", ProductRouter);

// 404 for unknown routes
app.use((req, res, next) => {
  const err = createError(404, "Route not found");
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || "Internal Server Error",
      status,
    },
  });
});

app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting the server:", err);
  } else {
    console.log(`Server is running on http://localhost:${PORT}`);
  }
});

console.log(process.env.APP_PORT);
