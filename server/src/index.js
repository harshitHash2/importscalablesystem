import express from "express";
import http from "http";
import mongoose from "mongoose";
import config from "./config/config.js";
import importRoutes from "./routes/import.routes.js";
import logsRoutes from "./routes/logs.routes.js";
import { startWorker } from "./workers/jobWorker.js";
import { stopWorker } from "./workers/stopWorker.js";
import { Server as IOServer } from "socket.io";
import { startJobFetchCron } from "./services/crons.service.js";
import cors from "cors";
async function main() {
  await mongoose.connect(config.MONGO_URI, {});
  console.log("Mongo connected");

  const app = express();
  app.use(express.json());
  app.use(cors({ origin: "*" }));
  app.use("/api/import", importRoutes);
  app.use("/api/logs", logsRoutes);
  app.get("/api/health", (req, res) => res.json({ ok: true }));

  const server = http.createServer(app);
  if (config.ENABLE_REALTIME) {
    const io = new IOServer(server, { cors: { origin: "*" } });
    global.io = io;
    io.on("connection", (sock) => {
      console.log("Socket connected", sock.id);
    });
  }

  // start worker
  startWorker();
  //   stopWorker();
  startJobFetchCron();
  server.listen(config.PORT, () => {
    console.log("Server running on", config.PORT);
  });
}

main().catch((err) => {
  console.error("ttttt", err);
  process.exit(1);
});
