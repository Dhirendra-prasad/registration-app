const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: String,
    email: String,
    age: Number,
    qualification: String,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", registrationSchema);
