require("dotenv").config();
const mongoose = require("mongoose");
const { connectToDatabase } = require("../config/db");
const { Department } = require("../models/Department");
const { User } = require("../models/User");
const { Client } = require("../models/Client");

async function run() {
  await connectToDatabase();

  const departments = [
    "Development",
    "Video Production",
    "Creative Graphics",
    "Operations",
    "SEO",
    "Sales",
    "Support",
  ];

  const deptDocs = {};
  for (const name of departments) {
    const doc = await Department.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true }
    );
    deptDocs[name] = doc;
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@digitali.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@123456";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "System Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
  }

  const managerEmail =
    process.env.SEED_MANAGER_EMAIL || "manager@digitali.local";
  const managerPassword = process.env.SEED_MANAGER_PASSWORD || "Manager@123456";
  let manager = await User.findOne({ email: managerEmail });
  if (!manager) {
    manager = await User.create({
      name: "System Manager",
      email: managerEmail,
      password: managerPassword,
      role: "manager",
    });
  }

  const employeeEmail =
    process.env.SEED_EMPLOYEE_EMAIL || "employee@digitali.local";
  const employeePassword =
    process.env.SEED_EMPLOYEE_PASSWORD || "Employee@123456";
  let employee = await User.findOne({ email: employeeEmail });
  if (!employee) {
    employee = await User.create({
      name: "System Employee",
      email: employeeEmail,
      password: employeePassword,
      role: "employee",
    });
  }

  // Seed a default Client entity (company) for linking with a client user
  const seedClientCompany = process.env.SEED_CLIENT_COMPANY || "Acme Corp";
  const seedClientContact = process.env.SEED_CLIENT_CONTACT || "John Client";
  const seedClientMobile = process.env.SEED_CLIENT_MOBILE || "0000000000";
  const seedClientEmail = process.env.SEED_CLIENT_EMAIL || "client@acme.local";

  let clientDoc = await Client.findOne({ email: seedClientEmail });
  if (!clientDoc) {
    clientDoc = await Client.create({
      companyName: seedClientCompany,
      contactPerson: seedClientContact,
      mobile: seedClientMobile,
      email: seedClientEmail,
      address: process.env.SEED_CLIENT_ADDRESS || "HQ",
      plan: process.env.SEED_CLIENT_PLAN || "Standard",
      price: Number(process.env.SEED_CLIENT_PRICE || 0),
      whatsappGroupLink: process.env.SEED_CLIENT_WHATSAPP || "",
    });
  }

  // Seed a default Client user and link to the Client entity
  const clientUserEmail = process.env.SEED_CLIENT_USER_EMAIL || seedClientEmail;
  const clientUserPassword =
    process.env.SEED_CLIENT_USER_PASSWORD || "Client@123456";
  let clientUser = await User.findOne({ email: clientUserEmail });
  if (!clientUser) {
    clientUser = await User.create({
      name: process.env.SEED_CLIENT_USER_NAME || "System Client",
      email: clientUserEmail,
      password: clientUserPassword,
      role: "client",
      client: clientDoc._id,
    });
  }

  console.log("Seed complete:", {
    // adminEmail,
    // managerEmail,
    // employeeEmail,
    clientUserEmail,
    clientCompany: clientDoc.companyName,
    departments: departments.length,
  });
  await mongoose.connection.close();
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed", e);
  process.exit(1);
});
