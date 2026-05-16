const express = require("express");
const Endpoint = require("../models/endpoint.model");
const PingLog = require("../models/pinglog.model");
const protect = require("../middleware/auth");
const { scheduleEndpoint, stopEndpoint } = require("../utils/scheduler");
const pingEndpoint = require("../utils/pinger");

const router = express.Router();

router.use(protect);

router.post("/", async (req, res) => {
  try {
    const { name, url, intervalMinutes } = req.body;
    if (!name || !url) {
      return res.status(400).json({ status: "error", message: "name and url are required" });
    }

    const endpoint = await Endpoint.create({
      name,
      url,
      intervalMinutes: intervalMinutes || 5,
      userId: req.userId,
    });

    scheduleEndpoint(endpoint);
    await pingEndpoint(endpoint);

    res.status(201).json({ status: "success", data: { endpoint } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const endpoints = await Endpoint.find({ userId: req.userId });
    res.status(200).json({ status: "success", results: endpoints.length, data: { endpoints } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const endpoint = await Endpoint.findOne({ _id: req.params.id, userId: req.userId });
    if (!endpoint) {
      return res.status(404).json({ status: "error", message: "Endpoint not found" });
    }

    const recentPings = await PingLog.find({ endpointId: endpoint._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ status: "success", data: { endpoint, recentPings } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const endpoint = await Endpoint.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!endpoint) {
      return res.status(404).json({ status: "error", message: "Endpoint not found" });
    }

    if (endpoint.active) {
      scheduleEndpoint(endpoint);
    } else {
      stopEndpoint(endpoint._id);
    }

    res.status(200).json({ status: "success", data: { endpoint } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const endpoint = await Endpoint.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!endpoint) {
      return res.status(404).json({ status: "error", message: "Endpoint not found" });
    }

    stopEndpoint(endpoint._id);
    await PingLog.deleteMany({ endpointId: endpoint._id });

    res.status(200).json({ status: "success", message: "Endpoint deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;