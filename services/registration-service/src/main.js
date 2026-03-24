import dotenv from "dotenv";
import express from "express";
import logging from "logging";

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

const logger = logging.default("main");

const app = express();

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (req, res) => {
  res.status(200);
  res.send("Hallo Express");
});

const server = app.listen(config.port, config.host, () => {
  logger.info(`Server lauscht auf ${config.host}:${config.port}`);
});

process.on("exit", () => {
  console.log("Beende Server.");
  server.close();
});

process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 3));
