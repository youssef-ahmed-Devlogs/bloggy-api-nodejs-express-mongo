const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");
const usersRoutes = require("./routes/api/users");
const categoriesRoutes = require("./routes/api/categories");
const articlesRoutes = require("./routes/api/articles");
const commentsRoutes = require("./routes/api/comments");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ==================== Middleware ====================
// req.body in api
app.use(express.json({ limit: "10kb" }));

// ==================== Routes ====================
const baseURL = "/api";
app.use(`${baseURL}/users`, usersRoutes);
app.use(`${baseURL}/categories`, categoriesRoutes);
app.use(`${baseURL}/articles`, articlesRoutes);
app.use(`${baseURL}/comments`, commentsRoutes);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Not found",
  });
});

app.use((err, req, res, next) => {
  res.status(401).json({
    status: "fail",
    message: err.message,
    error: err,
    stack: err.stack,
  });
});

module.exports = app;
