import * as service from "../services/registration.service.js";
import { throwError } from "../utils.js";

const prefix = "/registrations";

/**
 * Registriert Registration-Endpunkte.
 *
 * @param {object} app Express App
 */
export default function registerRoutes(app) {
  app.get(`${prefix}`, search);
  app.post(`${prefix}`, create);
  app.get(`${prefix}/:id`, read);
  app.put(`${prefix}/:id`, update);
  app.patch(`${prefix}/:id/cancel`, cancel);
  app.delete(`${prefix}/:id`, remove);
  app.get(`${prefix}/meets/:meetId/count`, count);
}

/**
 * Listet Registrations mit optionalen Filtern.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function search(req, res) {
  const registrations = await service.search(req.query);
  res.status(200).json(registrations);
}

/**
 * Erstellt eine Registrierung.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function create(req, res) {
  const created = await service.create(req.body);
  res.status(201).json(created);
}

/**
 * Gibt eine Registrierung per ID zurück.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function read(req, res) {
  const registration = await service.read(req.params.id);
  if (!registration) {
    throwError("NotFound", "Registration not found", 404);
  }
  res.status(200).json(registration);
}

/**
 * Aktualisiert eine Registrierung per ID.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function update(req, res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) {
    throwError("NotFound", "Registration not found", 404);
  }
  res.status(200).json(updated);
}

/**
 * Löscht eine Registrierung per ID.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function remove(req, res) {
  const old = await service.remove(req.params.id);
  if (!old) {
    throwError("NotFound", "Registration not found", 404);
  }
  res.status(204).send();
}

/**
 * Gibt die Anzahl Registrierungen für einen Meet zurück.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function count(req, res) {
  const meetId = req.params.meetId;
  const role = req.query.role;
  const result = await service.countByMeet(meetId, role);
  res.status(200).json(result);
}

/**
 * Markiert eine Registrierung als abgebrochen.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function cancel(req, res) {
  const id = req.params.id;
  const cancelled = await service.cancel(id);
  if (!cancelled) {
    throwError("NotFound", "Registration not found", 404);
  }
  res.status(200).json(cancelled);
}
