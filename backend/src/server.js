require("dotenv").config();
const http = require("http");
const { createApp } = require("./app");
const { connectToDatabase } = require("./config/db");

const PORT = process.env.PORT || 5001;

async function start() {
  let dbReady = false;
  try {
    await connectToDatabase();
    dbReady = true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      "Database connection failed; starting server without DB. Some routes will not work until DB is available."
    );
  }

  const app = createApp();
  const server = http.createServer(app);
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Server listening on port ${PORT}${dbReady ? "" : " (DB not connected)"}`
    );
  });
}

start();
