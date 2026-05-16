const mongoose = require("mongoose");

const endpointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    intervalMinutes: {
      type: Number,
      default: 5,
      min: 1,
      max: 60,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Endpoint", endpointSchema);