const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, trim: true },
    plan: { type: String, trim: true },
    expiryDate: { type: Date },
    price: { type: Number },
    whatsappGroupLink: { type: String, trim: true },
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", clientSchema);

module.exports = { Client };
