import service from "../services/meet.service.js";

export default function registerRoutes(app) {
  app.get("/meets", search);
  app.post("/meets", create);
  app.get("/meets/:id", read);
  app.put("/meets/:id", update);
  app.delete("/meets/:id", remove);
}

async function search(req, res) {
  try {
    const meets = await service.search(req.query);
    res.status(200).json(meets);
  } catch (err) {
    res.status(err.httpStatus || 500).json({ message: err.message });
  }
}

async function create(req, res) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    const status = err.httpStatus || 500;
    res.status(status).json({ message: err.message });
  }
}

async function read(req, res) {
  try {
    const meet = await service.read(req.params.id);
    if (meet) {
      res.status(200).json(meet);
    } else {
      res.status(404).json({ message: "Meet not found" });
    }
  } catch (err) {
    const status = err.httpStatus || 500;
    res.status(status).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const result = await service.update(req.params.id, req.body);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Meet not found" });
    }
  } catch (err) {
    const status = err.httpStatus || 500;
    res.status(status).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    const meet = await service.remove(req.params.id);
    if (meet) {
      res.status(200).json(meet);
    } else {
      res.status(404).json({ message: "Meet not found" });
    }
  } catch (err) {
    const status = err.httpStatus || 500;
    res.status(status).json({ message: err.message });
  }
}
