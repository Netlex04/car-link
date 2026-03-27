// Copilot-generated API Gateway (Express)
// Quelle: Nutzeranforderung. Verantwortlich für Proxying zwischen Microservices + optional Auth + statisches Frontend.

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = Number(process.env.PORT || 8080);
const MEET_TARGET = process.env.MEET_SERVICE_URL || "http://meet-service:3000";
const REG_TARGET =
  process.env.REGISTRATION_SERVICE_URL || "http://registration-service:3001";
const FRONTEND_DIST =
  process.env.FRONTEND_DIST ||
  path.join(__dirname, "..", "..", "RevMeet Frontend Design", "dist");
const API_TOKEN = process.env.API_GATEWAY_BEARER_TOKEN || "changeme123";

app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());

// Auth für /api-Routen
app.use("/api", (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: missing Bearer token" });
  }
  const token = authHeader.split(" ")[1];
  if (token !== API_TOKEN) {
    return res.status(403).json({ message: "Forbidden: invalid token" });
  }
  next();
});

const makeProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
    onProxyReq: (proxyReq, req, res) => {
      // Leite Original-Authorization header aus Gateway weiter, falls nötig
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }
    },
  });

// Meet-Service-Routen:
app.use("/api/venues", makeProxy(MEET_TARGET));
app.use("/api/meets", makeProxy(MEET_TARGET));
app.use("/api/venues/:id", makeProxy(MEET_TARGET));
app.use("/api/meets/:id", makeProxy(MEET_TARGET));

// Registration-Service-Routen:
app.use("/api/users", makeProxy(REG_TARGET));
app.use("/api/vehicles", makeProxy(REG_TARGET));
app.use("/api/registrations", makeProxy(REG_TARGET));
app.use("/api/registrations/meets/:meetId/count", makeProxy(REG_TARGET));

// Optional: OpenAPI-Dokument
app.get("/api/openapi.yml", (req, res) => {
  const p = path.resolve(__dirname, "..", "..", "openapi.yml");
  res.sendFile(p);
});

// Statische Auslieferung (Frontend). Debug: wenn dist nicht existiert, bitte bauen.
app.use(express.static(FRONTEND_DIST));
app.get("*", (req, res) => {
  const indexFile = path.join(FRONTEND_DIST, "index.html");
  res.sendFile(indexFile, (err) => {
    if (err)
      res
        .status(500)
        .send(
          "Frontend Build nicht gefunden; bitte `npm run build` in RevMeet Frontend Design ausführen.",
        );
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway läuft auf http://localhost:${PORT}`);
  console.log(`Meet-Service Proxy: ${MEET_TARGET}`);
  console.log(`Registration-Service Proxy: ${REG_TARGET}`);
  console.log(`Frontend static path: ${FRONTEND_DIST}`);
});
