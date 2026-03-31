import * as service from "../services/meet.service.js";
import { throwError } from "../utils.js";

const prefix = "/meets";

/**
 * Registriert Meet-Routen.
 *
 * @param {object} app Express app
 */
export default function registerRoutes(app) {
  app.get(`${prefix}`, search);
  app.post(`${prefix}`, create);
  app.patch(`${prefix}/:id/cancel`, cancel);
  app.get(`${prefix}/:id`, read);
  app.put(`${prefix}/:id`, update);
  app.delete(`${prefix}/:id`, remove);
}

/**
 * Sucht Meets mit Query-Parametern.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function search(req, res) {
  const meets = await service.search(req.query);
  res.status(200).json(meets);
}

/**
 * Legt ein neues Meet an.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function create(req, res) {
  const result = await service.create(req.body);
  res.status(201).json(result);
}

/**
 * Gibt ein Meet per ID zurück.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function read(req, res) {
  const meet = await service.read(req.params.id);
  if (meet) {
    res.status(200).json(meet);
  } else {
    throwError("NotFound", "Meet not found", 404);
  }
}

/**
 * Aktualisiert ein Meet per ID.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function update(req, res) {
  const result = await service.update(req.params.id, req.body);
  if (result) {
    res.status(200).json(result);
  } else {
    throwError("NotFound", "Meet not found", 404);
  }
}

/**
 * Löscht ein Meet per ID.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function remove(req, res) {
  const meet = await service.remove(req.params.id);
  if (meet) {
    res.status(200).json(meet);
  } else {
    throwError("NotFound", "Meet not found", 404);
  }
}

/**
 * Markiert ein Meet als abgebrochen.
 *
 * @param {object} req Express Request
 * @param {object} res Express Response
 */
async function cancel(req, res) {
  const id = req.params.id;
  const cancelled = await service.cancel(id);
  if (!cancelled) {
    throwError("NotFound", "Meet not found", 404);
  }
  res.status(200).json(cancelled);
}
