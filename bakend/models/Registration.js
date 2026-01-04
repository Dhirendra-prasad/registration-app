const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    // PERSONAL DETAILS
    name: { type: String, required: true },
    gender: { type: String },
    // gender: String,
    birthPlaceTime: String,
    profession: String,
    complexion: String,
    gotra: String,
    height: String,
    caste: String,
    religion: String,

    // PROFESSIONAL PROFILE
    professionalProfile: String,

    // PATERNAL FAMILY
    grandfatherName: String,
    fatherName: String,
    motherName: String,

    // MATERNAL FAMILY
    maternalFamily: String,

    // CONTACT DETAILS
    mobile: String,
    email: { type: String, required: true },
    address: String,

    // EXISTING
    age: Number,
    qualification: String,

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", registrationSchema);