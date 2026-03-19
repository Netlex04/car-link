import dotenv from "dotenv";
import express from "express";
import logging from "logging";
import process from "node:process";

console.log("Erste Schritte mit Express");
console.log("==========================");
console.log();

dotenv.config();

const config = {
  host: process.env.LISTEN_HOST || "",
  port: process.env.LISTEN_PORT || 9000,
};

const logger = logging.default("main");

const app = express();

const server = app.listen(config.port, config.host, () => {
  logger.info(`Server lauscht auf ${config.host}:${config.port}`);
});

process.on("exit", () => {
  console.log("Beende Server.");
  server.close();
  // db.close();
});

process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 3));
