const { Client } = require("../models/Client");
const { asyncHandler } = require("../utils/asyncHandler");

const createClient = asyncHandler(async (req, res) => {
  const client = await Client.create(req.body);
  res.status(201).json(client);
});

const listClients = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user?.role === "client") {
    if (!req.user.clientId) return res.json([]);
    filter._id = req.user.clientId;
  }
  const clients = await Client.find(filter);
  res.json(clients);
});

const getClient = asyncHandler(async (req, res) => {
  if (req.user?.role === "client" && req.user.clientId !== req.params.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ message: "Client not found" });
  res.json(client);
});

const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!client) return res.status(404).json({ message: "Client not found" });
  res.json(client);
});

const deleteClient = asyncHandler(async (req, res) => {
  await Client.findByIdAndDelete(req.params.id);
  res.json({ message: "Client deleted" });
});

module.exports = {
  createClient,
  listClients,
  getClient,
  updateClient,
  deleteClient,
};
