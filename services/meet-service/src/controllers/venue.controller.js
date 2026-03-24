import * as service from "../services/venue.service.js";
import { throwError } from "../utils.js";

export default function registerRoutes(app) {
  app.get("/venues", search);
  app.post("/venues", create);
  app.get("/venues/:id", read);
  app.put("/venues/:id", update);
  app.delete("/venues/:id", remove);
}

async function search(req, res) {
  const venues = await service.search();
  res.status(200).json(venues);
}

async function create(req, res) {
  const venue = await service.create(req.body);
  res.status(201).json(venue);
}

async function read(req, res) {
  const venue = await service.read(req.params.id);
  if (!venue) {
    throwError("NotFound", "Venue not found", 404);
  }
  res.status(200).json(venue);
}

async function update(req, res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) {
    throwError("NotFound", "Venue not found", 404);
  }
  res.status(200).json(updated);
}

async function remove(req, res) {
  const removed = await service.remove(req.params.id);
  if (!removed) {
    throwError("NotFound", "Venue not found", 404);
  }
  res.status(204).send();
}
