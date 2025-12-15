const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration"
    },
    amount: Number,
    method: String,
    paymentStatus: Boolean
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
