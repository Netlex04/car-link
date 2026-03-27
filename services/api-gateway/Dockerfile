# Copilot-generated Multi-Stage Dockerfile (api-gateway + frontend)
# Ziel: Erst das Frontend im separaten Stage bauen, dann das Gateway-Image mit front-end dist erstellen.

# --- Stage 1: Frontend bauen ---
FROM node:20-alpine AS frontend-build
WORKDIR /tmp/frontend

# Das Frontend-Verzeichnis enthält Leerzeichen. Nutze JSON-array-Pfadnotation.
COPY ["RevMeet Frontend Design/package.json", "RevMeet Frontend Design/package-lock.json", "./"]
RUN npm install
COPY ["RevMeet Frontend Design", "."]
RUN npm run build

# --- Stage 2: Gateway app ---
FROM node:20-alpine
WORKDIR /usr/src/app

COPY services/api-gateway/package.json services/api-gateway/package-lock.json* ./
RUN npm install --production

COPY services/api-gateway .

# Frontend vom Build-Stage kopieren
COPY --from=frontend-build /tmp/frontend/dist ./frontend

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
