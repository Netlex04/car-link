/**
 * Entry-Point des Registration-Service.
 *
 * Startet:
 * - dotenv Konfiguration
 * - Datenbankinit (pg)
 * - MQTT-Verbindung und -Handler
 * - Express mit Endpoints und Error-Handling
 * - Clean Shutdown auf Signale
 */
import dotenv from "dotenv";
import express from "express";
import { logger } from "./utils.js";
import process from "node:process";
import controllers from "./controllers/index.js";
import * as db from "./database.js";
import { logRequest, handleError } from "./middleware.js";
import * as mqtt from "./mqtt.js";
import mqttHandlers from "./mqtt_handlers/index.js";

/**
 * Startlog gibt Sichtbarkeit, dass die App den Einstiegspunkt erreicht.
 */
console.log("Erste Schritte mit Express");
console.log("==========================");
console.log();

/**
 * Umweltkonfiguration laden.
 */
dotenv.config();

/**
 * Core-Konfiguration aus env-Variablen.
 */
const config = {
  host: process.env.LISTEN_HOST || "",
  port: process.env.LISTEN_PORT || 3001,
  mqtt: {
    broker: process.env.MQTT_BROKER || "mqtt://mqtt-broker:1883",
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  },
};

/**
 * Datenbank initialisieren vor Start der HTTP-Server.
 */
await db.init();

let mqttClient;

/**
 * MQTT-Verbindung aufbauen und Handler laden.
 */
try {
  mqttClient = await mqtt.connect(
    config.mqtt.broker,
    config.mqtt.username,
    config.mqtt.password,
  );
  for (let mqttHandler of mqttHandlers || []) {
    await mqttHandler(mqttClient);
  }
  logger.info("MQTT-Verbindung hergestellt.");
} catch (err) {
  logger.error("MQTT-Verbindung fehlgeschlagen:", err);
}

/**
 * Express app konfigurieren.
 */
const app = express();
app.use(express.json());
app.use(logRequest(logger));

controllers.forEach((registerRoute) => registerRoute(app));

app.get("/", (req, res) => {
  res.status(200).send("Meet-Service OK");
});

app.use(handleError(logger));

/**
 * HTTP-Server starten.
 */
const server = app.listen(config.port, config.host, () => {
  logger.info(`Server lauscht auf ${config.host}:${config.port}`);
});

/**
 * Clean up bei Prozess-Ende.
 */
process.on("exit", async () => {
  console.log("Beende Server.");
  server.close();
  if (mqttClient && typeof mqttClient.end === "function") {
    mqttClient.end();
  }
  if (db && typeof db.close === "function") {
    await db.close();
  }
});

/**
 * Signal-Handler für sauberes Herunterfahren.
 */
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 3));
