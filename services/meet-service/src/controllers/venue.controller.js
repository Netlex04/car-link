import * as service from "../services/venue.service.js";
import { throwError } from "../utils.js";

/**
 * Registriert alle Venue-Routen.
 *
 * @param {object} app Express-Anwendung
 */
export default function registerRoutes(app) {
  app.get("/venues", search);
  app.post("/venues", create);
  app.get("/venues/:id", read);
  app.put("/venues/:id", update);
  app.delete("/venues/:id", remove);
}

/**
 * Liste aller Venues zurückgeben.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function search(req, res) {
  const venues = await service.search();
  res.status(200).json(venues);
}

/**
 * Neue Venue erstellen.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function create(req, res) {
  const venue = await service.create(req.body);
  res.status(201).json(venue);
}

/**
 * Venue nach ID ausgeben.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function read(req, res) {
  const venue = await service.read(req.params.id);
  if (!venue) {
    throwError("NotFound", "Venue not found", 404);
  }
  res.status(200).json(venue);
}

/**
 * Venue aktualisieren.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function update(req, res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) {
    throwError("NotFound", "Venue not found", 404);
  }
  res.status(200).json(updated);
}

/**
 * Venue löschen.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function remove(req, res) {
  const removed = await service.remove(req.params.id);
  if (!removed) {
    throwError("NotFound", "Venue not found", 404);
  }
  res.status(204).send();
}
