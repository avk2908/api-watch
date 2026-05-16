const axios = require("axios");
const PingLog = require("../models/pinglog.model");

const pingEndpoint = async (endpoint) => {
  const start = Date.now();
  let statusCode = null;
  let isUp = false;
  let error = null;

  try {
    const response = await axios.get(endpoint.url, { timeout: 10000 });
    statusCode = response.status;
    isUp = statusCode >= 200 && statusCode < 400;
  } catch (err) {
    if (err.response) {
      statusCode = err.response.status;
      isUp = false;
      error = `HTTP ${statusCode}`;
    } else {
      isUp = false;
      error = err.code || err.message;
    }
  }

  const latencyMs = Date.now() - start;

  await PingLog.create({
    endpointId: endpoint._id,
    userId: endpoint.userId,
    statusCode,
    latencyMs,
    isUp,
    error,
  });

  console.log(`[PING] ${endpoint.name} (${endpoint.url}) → ${isUp ? "UP" : "DOWN"} ${statusCode || "ERR"} ${latencyMs}ms`);
};

module.exports = pingEndpoint;