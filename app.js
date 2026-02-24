require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const todoRouter = require("./routes/todo");

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the Todo API!" });
});

app.use("/todos", todoRouter);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ detail: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
