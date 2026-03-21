import * as service from "../services/venue.service.js";

export default function registerRoutes(app) {
  app.get("/venues", search);
  app.post("/venues", create);
  app.get("/venues/:id", read);
  app.put("/venues/:id", update);
  app.delete("/venues/:id", remove);
}

async function search(req, res) {
  try {
    const venues = await service.search();
    res.status(200).json(venues);
  } catch (err) {
    res.status(err.httpStatus || 500).json({ message: err.message });
  }
}

async function create(req, res) {
  try {
    const venue = await service.create(req.body);
    res.status(201).json(venue);
  } catch (err) {
    res.status(err.httpStatus || 500).json({ message: err.message });
  }
}

async function read(req, res) {
  try {
    const venue = await service.read(req.params.id);
    if (!venue) {
      res.status(404).json({ message: "Venue not found" });
      return;
    }
    res.status(200).json(venue);
  } catch (err) {
    res.status(err.httpStatus || 500).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ message: "Venue not found" });
      return;
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(err.httpStatus || 500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    const removed = await service.remove(req.params.id);
    if (!removed) {
      res.status(404).json({ message: "Venue not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(err.httpStatus || 500).json({ message: err.message });
  }
}
