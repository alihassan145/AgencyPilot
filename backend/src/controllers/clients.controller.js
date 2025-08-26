const { Client } = require("../models/Client");
const { asyncHandler } = require("../utils/asyncHandler");

const createClient = asyncHandler(async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Failed to create client', error: error.message });
  }
});

const listClients = asyncHandler(async (req, res) => {
  try {
    const filter = {};
    if (req.user?.role === "client") {
      if (!req.user.clientId) return res.json([]);
      filter._id = req.user.clientId;
    }
    const clients = await Client.find(filter);
    res.json(clients);
  } catch (error) {
    console.error('Error listing clients:', error);
    res.status(500).json({ message: 'Failed to list clients', error: error.message });
  }
});

const getClient = asyncHandler(async (req, res) => {
  try {
    if (req.user?.role === "client" && req.user.clientId !== req.params.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({ message: 'Failed to get client', error: error.message });
  }
});

const updateClient = asyncHandler(async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Failed to update client', error: error.message });
  }
});

const deleteClient = asyncHandler(async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Client deleted" });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Failed to delete client', error: error.message });
  }
});

module.exports = {
  createClient,
  listClients,
  getClient,
  updateClient,
  deleteClient,
};
