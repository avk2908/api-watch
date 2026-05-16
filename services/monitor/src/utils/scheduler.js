const cron = require("node-cron");
const Endpoint = require("../models/endpoint.model");
const pingEndpoint = require("./pinger");

const activeJobs = new Map();

const startScheduler = async () => {
  console.log("[SCHEDULER] Starting up...");

  const endpoints = await Endpoint.find({ active: true });
  console.log(`[SCHEDULER] Found ${endpoints.length} active endpoints`);

  endpoints.forEach((endpoint) => scheduleEndpoint(endpoint));
};

const scheduleEndpoint = (endpoint) => {
  if (activeJobs.has(endpoint._id.toString())) {
    activeJobs.get(endpoint._id.toString()).stop();
  }

  const cronExpr = `*/${endpoint.intervalMinutes} * * * *`;

  const job = cron.schedule(cronExpr, async () => {
    await pingEndpoint(endpoint);
  });

  activeJobs.set(endpoint._id.toString(), job);
  console.log(`[SCHEDULER] Scheduled "${endpoint.name}" every ${endpoint.intervalMinutes} min`);
};

const stopEndpoint = (endpointId) => {
  const id = endpointId.toString();
  if (activeJobs.has(id)) {
    activeJobs.get(id).stop();
    activeJobs.delete(id);
  }
};

module.exports = { startScheduler, scheduleEndpoint, stopEndpoint };