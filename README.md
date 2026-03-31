# car-link

## Übersicht

`car-link` ist ein Full-Stack-Microservice-Projekt für Connecting-Car-Meetups, bestehend aus:

- **Frontend:** `RevMeet Frontend Design` (React/Vite)
- **Backend-Services:**
  - `meet-service` (Veranstaltungsmanagement, MQTT-Integration)
  - `registration-service` (Registrierung, Benutzer, Fahrzeuge, MQTT-Integration)
- **Infrastruktur:** MQTT-Broker + Postgres, Docker Compose.

## Projektstruktur

```
car-link/
├── docker-compose.yml
├── mosquitto.conf
├── openapi.yml
├── README.md
├── RevMeet Frontend Design/ ...
├── services/
│   ├── api-gateway/
│   ├── meet-service/
│   └── registration-service/
└── document/
```

### Frontend

- Ordner: `RevMeet Frontend Design`
- Technologie: React + Vite
- Wahlbegründung: React ist weit verbreitet, hat große Community und darf mit Vite sehr schnell entwickeln. Der Code wurde mit Figma generiert, da es diesen Stack unterstützt.
- UI-Framework: Eigenen Komponenten (kein externes UI-Kit in diesem Projekt, aber Basis ist React + CSS/Tailwind).
- Navigations- und UI-Komponenten in `src/app/components`
- Pages in `src/app/pages`

### Backend-Services

Je Service (meet/registration):

- `Dockerfile`
- Endpoints via Express
- DB: PostgreSQL (Pool in `database.js`)
- MQTT: Konfiguration in `mqtt.js`, Events in `mqtt_handlers`
- Controller in `controllers/`
- Business-Logik in `services/`
- Fehlerhandling in `middleware.js`
- Health-Check: Beide Services geben unter `/` (meet-service) bzw. `/health` (registration-service) Status zurück

### API Gateway

- Ort: `services/api-gateway`
- Funktion: zentraler Reverse-Proxy/Router für Anfragen an `meet-service`, `registration-service`, und Bereitstellung des Frontends
- Frontend-Build im Dockerfile:
  - Multi-Stage Build: zuerst Frontend in einem Build-Image (Vite + npm install, npm run build)
  - dann Ingtabenriertes statisches Bundle ins Final-Image kopieren
  - Ergebnis: schlankes Gateway-Image, das statische UI-Dateien schnell per Caching ausliefert

### API

API-Spezifikation: `openapi.yml`

## Setup & Ausführung

Docker-Compose starten (erstellt und startet alles, inkl. Frontend-Build):

```bash
docker-compose up --build
```

> Optional: Für lokalen Einzelnenbetrieb (nicht zwingend, da oben bereits alles startet):
>
> - Frontend: `cd "RevMeet Frontend Design" && npm install && npm run dev`
> - Backend: `cd services/<name> && npm install && npm start`

## Funktionen

### meet-service

- Meet (CRUD)
- Venue (CRUD)
- MQTT: `removeMeet`, `cancelMeet`
- health-check `/`
- DB-Schema: `venue`, `meet`

### registration-service

- User (CRUD)
- Vehicle (CRUD)
- Registration (CRUD + cancel + count)
- MQTT: `removeMeet`, `cancelMeet` (beeinflusst Registrierungen)
- DB-Schema: `user`, `vehicle`, `registration`

## Doku-Stil

Projektweit wurde JSDoc-Style-Dokumentation in allen Backend-Paketdateien verwendet (z.B. `utils.js`, `main.js`, `*service.js`, `*controller.js`).

## Weiteres

- `docker-compose.yml` enthält mit MQTT Broker `eclipse-mosquitto`, Postgres, API-Gateway, Services.
- `openapi.yml` definiert APIs, die die Controller implementieren.
