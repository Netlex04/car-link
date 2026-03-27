# car-link

## API Gateway (Express)

Dieses Projekt enthält jetzt einen eigenen Microservice `api-gateway`, der als zentraler Entrypoint für `meet-service` und `registration-service` dient.

- Gateway: `http://localhost:8080`
- Meet-Service: `http://localhost:3000`
- Registration-Service: `http://localhost:3001`

### Auth

API-Routen (`/api/...`) werden durch einen einfachen Bearer-Token geschützt.

- Token in `docker-compose`: `API_GATEWAY_BEARER_TOKEN`
- Beispiel Header: `Authorization: Bearer changeme123`

### Frontend-Auslieferung

Der Gateway dient auch statischen Frontend-Inhalten aus:

- Standard-Verzeichnis: `RevMeet Frontend Design/dist`
- Wenn es fehlt: `npm run build` im Frontend-Ordner ausführen und neu starten.

### Start (Docker Compose)

1. `docker compose up --build`
2. Frontend aufrufen: `http://localhost:8080`
3. API-Endpunkte: `http://localhost:8080/api/venues`, `http://localhost:8080/api/users` etc.

### OpenAPI

- Gemeinsame Spezifikation: `openapi.yml`
- Gatewayschirm: `http://localhost:8080/api/openapi.yml`
