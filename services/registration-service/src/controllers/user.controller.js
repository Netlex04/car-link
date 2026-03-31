import * as service from "../services/user.service.js";
import * as vehicleService from "../services/vehicle.service.js";
import { throwError } from "../utils.js";

const prefix = "/users";

/**
 * Registriert User-Endpunkte.
 *
 * @param {object} app Express App
 */
export default function registerRoutes(app) {
  app.post(`${prefix}`, create);
  app.get(`${prefix}/:id`, read);
  app.put(`${prefix}/:id`, update);
  app.delete(`${prefix}/:id`, remove);
}

/**
 * Erstellt einen neuen User.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function create(req, res) {
  const user = await service.create(req.body);
  res.status(201).json(user);
}

/**
 * Liest einen User nach ID.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function read(req, res) {
  const user = await service.read(req.params.id);
  if (!user) throwError("NotFound", "User not found", 404);
  res.status(200).json(user);
}

/**
 * Aktualisiert einen User.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function update(req, res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) throwError("NotFound", "User not found", 404);
  res.status(200).json(updated);
}

/**
 * Entfernt einen User.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function remove(req, res) {
  const removed = await service.remove(req.params.id);
  if (!removed) throwError("NotFound", "User not found", 404);
  res.status(204).send();
}
