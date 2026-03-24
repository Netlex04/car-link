import * as service from "../services/meet.service.js";
import { throwError } from "../utils.js";

const prefix = "/meets";

export default function registerRoutes(app) {
  app.get(`${prefix}`, search);
  app.post(`${prefix}`, create);
  app.get(`${prefix}/:id`, read);
  app.put(`${prefix}/:id`, update);
  app.delete(`${prefix}/:id`, remove);
}

async function search(req, res) {
  const meets = await service.search(req.query);
  res.status(200).json(meets);
}

async function create(req, res) {
  const result = await service.create(req.body);
  res.status(201).json(result);
}

async function read(req, res) {
  const meet = await service.read(req.params.id);
  if (meet) {
    res.status(200).json(meet);
  } else {
    throwError("NotFound", "Meet not found", 404);
  }
}

async function update(req, res) {
  const result = await service.update(req.params.id, req.body);
  if (result) {
    res.status(200).json(result);
  } else {
    throwError("NotFound", "Meet not found", 404);
  }
}

async function remove(req, res) {
  const meet = await service.remove(req.params.id);
  if (meet) {
    res.status(200).json(meet);
  } else {
    throwError("NotFound", "Meet not found", 404);
  }
}
