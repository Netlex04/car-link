# Copilot-generated Dockerfile (api-gateway)
# Ziel: Läuft neben meet-service und registration-service, liefert statisches Frontend und weiterleitet API-Requests.

FROM node:20-alpine
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
