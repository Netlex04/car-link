import * as service from "../services/vehicle.service.js";
import { throwError } from "../utils.js";

const prefix = "/vehicles";

/**
 * Registriert Vehicle-Endpunkte.
 *
 * @param {object} app Express App
 */
export default function registerRoutes(app) {
  app.get(`${prefix}`, search);
  app.post(`${prefix}`, create);
  app.get(`${prefix}/:id`, read);
  app.put(`${prefix}/:id`, update);
  app.delete(`${prefix}/:id`, remove);
}

/**
 * Listet Fahrzeuge auf (optional nach userId).
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function search(req, res) {
  const vehicles = await service.search(req.query);
  res.status(200).json(vehicles);
}

/**
 * Erzeugt ein neues Fahrzeug.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function create(req, res) {
  const vehicle = await service.create(req.body.userId, req.body);
  res.status(201).json(vehicle);
}

/**
 * Gibt ein Fahrzeug per ID zurück.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function read(req, res) {
  const vehicle = await service.read(req.params.id);
  if (!vehicle) throwError("NotFound", "Vehicle not found", 404);
  res.status(200).json(vehicle);
}

/**
 * Aktualisiert ein Fahrzeug.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function update(req, res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) throwError("NotFound", "Vehicle not found", 404);
  res.status(200).json(updated);
}

/**
 * Entfernt ein Fahrzeug.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function remove(req, res) {
  const removed = await service.remove(req.params.id);
  if (!removed) throwError("NotFound", "Vehicle not found", 404);
  res.status(204).send();
}
