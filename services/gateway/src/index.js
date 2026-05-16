const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { getServiceUrl, registerWithConsul } = require("./config/consul");
const protect = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "gateway-service" });
});

app.use("/auth", async (req, res, next) => {
  try {
    const url = await getServiceUrl("auth-service");
    createProxyMiddleware({ target: url, changeOrigin: true })(req, res, next);
  } catch (err) {
    res.status(503).json({ status: "error", message: "Auth service unavailable" });
  }
});

app.use("/endpoints", protect, async (req, res, next) => {
  try {
    const url = await getServiceUrl("monitor-service");
    createProxyMiddleware({ target: url, changeOrigin: true })(req, res, next);
  } catch (err) {
    res.status(503).json({ status: "error", message: "Monitor service unavailable" });
  }
});

app.use("/graphql", protect, async (req, res, next) => {
  try {
    const url = await getServiceUrl("graphql-service");
    createProxyMiddleware({ target: url, changeOrigin: true })(req, res, next);
  } catch (err) {
    res.status(503).json({ status: "error", message: "GraphQL service unavailable" });
  }
});

app.listen(PORT, async () => {
  console.log(`Gateway running on port ${PORT}`);
  await registerWithConsul();
});