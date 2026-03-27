import * as service from "../services/registration.service.js";
import { throwError } from "../utils.js";

const prefix = "/registrations";

export default function registerRoutes(app) {
  app.get(`${prefix}`, search);
  app.post(`${prefix}`, create);
  app.get(`${prefix}/:id`, read);
  app.put(`${prefix}/:id`, update);
  app.delete(`${prefix}/:id`, remove);
  app.get(`${prefix}/meets/:meetId/count`, count);
}

async function search(req, res) {
  const registrations = await service.search(req.query);
  res.status(200).json(registrations);
}

async function create(req, res) {
  const created = await service.create(req.body);
  res.status(201).json(created);
}

async function read(req, res) {
  const registration = await service.read(req.params.id);
  if (!registration) {
    throwError("NotFound", "Registration not found", 404);
  }
  res.status(200).json(registration);
}

async function update(req, res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) {
    throwError("NotFound", "Registration not found", 404);
  }
  res.status(200).json(updated);
}

async function remove(req, res) {
  const old = await service.remove(req.params.id);
  if (!old) {
    throwError("NotFound", "Registration not found", 404);
  }
  res.status(204).send();
}

async function count(req, res) {
  const meetId = req.params.meetId;
  const role = req.query.role;
  const result = await service.countByMeet(meetId, role);
  res.status(200).json(result);
}
