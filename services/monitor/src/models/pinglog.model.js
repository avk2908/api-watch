const mongoose = require("mongoose");

const pingLogSchema = new mongoose.Schema(
  {
    endpointId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Endpoint",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    statusCode: {
      type: Number,
      default: null,
    },
    latencyMs: {
      type: Number,
      required: true,
    },
    isUp: {
      type: Boolean,
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PingLog", pingLogSchema);