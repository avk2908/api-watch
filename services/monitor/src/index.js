const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const registerWithConsul = require("./config/consul");
const endpointRoutes = require("./routes/endpoint.routes");
const { startScheduler } = require("./utils/scheduler");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use("/endpoints", endpointRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "monitor-service" });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, async () => {
    console.log(`Monitor service running on port ${PORT}`);
    await registerWithConsul();
    await startScheduler();
  });
};

start();