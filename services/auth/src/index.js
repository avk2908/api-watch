const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const registerWithConsul = require("./config/consul");
const authRoutes = require("./routes/auth.routes");
const { swaggerUi, swaggerSpec } = require("./config/swagger");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// CRITICAL FIX: Parse JSON with error handling
app.use(express.json({ 
  limit: '10mb',
  strict: false 
}));

// Error handler for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error("JSON Parse Error:", err.message);
    return res.status(400).json({ status: "error", message: "Invalid JSON" });
  }
  next(err);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "auth-service" });
});

const start = async () => {
  await connectDB();

  app.listen(PORT, async () => {
    console.log(`Auth service running on port ${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/docs`);
    await registerWithConsul();
  });
};

start().catch(err => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});