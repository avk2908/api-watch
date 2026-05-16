const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const registerWithConsul = require("./config/consul");
const authRoutes = require("./routes/auth.routes");
const { swaggerUi, swaggerSpec } = require("./config/swagger");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

start();