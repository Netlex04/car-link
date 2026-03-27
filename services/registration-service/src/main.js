import dotenv from "dotenv";
import express from "express";
import process from "node:process";
import logging from "logging";
import controllers from "./controllers/index.js";
import * as db from "./database.js";
import { logRequest, handleError } from "./middleware.js";

console.log("Erste Schritte mit Express");
console.log("==========================");
console.log();

dotenv.config();

const config = {
  host: process.env.LISTEN_HOST || "",
  port: process.env.LISTEN_PORT || 3001,
  mqtt: {
    broker: process.env.MQTT_BROKER || "wss://mqtt.zimolong.eu",
    username: process.env.MQTT_USERNAME || "dhbw",
    password: process.env.MQTT_PASSWORD || "dhbw",
  },
};

const logger = logging("main");

await db.init();

const app = express();
app.use(express.json());
app.use(logRequest(logger));

controllers.forEach((registerRoute) => registerRoute(app));

app.get("/", (req, res) => {
  res.status(200).send("Hallo Express");
});

app.use(handleError(logger));

const server = app.listen(config.port, config.host, () => {
  logger.info(`Server lauscht auf ${config.host}:${config.port}`);
});

process.on("exit", async () => {
  console.log("Beende Server.");
  server.close();
  if (db && typeof db.close === "function") {
    await db.close();
  }
});

process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 3));
