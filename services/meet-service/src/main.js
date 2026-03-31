/**
 * Entry-Point des Meet-Service.
 *
 * Diese Datei startet die Dienste:
 * - Läd die Umgebungsvariablen mit dotenv
 * - Initialisiert Datenbank-Verbindung
 * - Baut MQTT-Verbindung auf und registriert Handler
 * - Erstellt Express HTTP-Server mit Routen und Error-Handling
 * - Behandelt sauberes Herunterfahren bei Signalen
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
 * Minimaler Start-Log, damit beim Neustart sichtbar ist, dass die App
 * den Startpunkt erreicht hat.
 */
console.log("Erste Schritte mit Express");
console.log("==========================");
console.log();

/**
 * Konfigurationsdaten aus Umgebungsvariablen.
 *
 * LISTEN_HOST: interface, auf dem gelauscht wird (z. B. "0.0.0.0")
 * LISTEN_PORT: Port (z. B. 3001)
 * MQTT_BROKER: Adresse des MQTT-Brokers
 * MQTT_USERNAME / MQTT_PASSWORD: optional für Authentifizierung
 */
dotenv.config();

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
 * Datenbank initialisieren. Diese Funktion muss vor dem Start des HTTP
 * Servers aufgerufen werden, damit alle Repositories arbeiten können.
 */
await db.init();

let mqttClient;

/**
 * MQTT-Verbindung herstellen und alle registrierten MQTT-Handler verbinden.
 * Fehler werden geloggt, aber brechen den Serverstart nicht vollständig ab.
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
 * Express App konfigurieren.
 */
const app = express();
app.use(express.json());
app.use(logRequest(logger));

/**
 * Alle Controller-Routen registrieren.
 */
controllers.forEach((registerRoute) => registerRoute(app));

/**
 * Health-Endpoint zum schnellen Check des Service-Status.
 */
app.get("/", (req, res) => {
  res.status(200).send("Meet-Service OK");
});

/**
 * Fehlerbehandlung am Ende der Middleware-Kette.
 */
app.use(handleError(logger));

/**
 * HTTP-Server starten.
 */
const server = app.listen(config.port, config.host, () => {
  logger.info(`Server lauscht auf ${config.host}:${config.port}`);
});

/**
 * Beenden des Servers und Schließen von Ressourcen bei Prozessende.
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
