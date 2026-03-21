import service from "../services/meet.service.js";

export default function registerRoutes(app) {
  app.get("/meets", search);
  app.post("/meets", create);
  app.get("/meets/:id", read);
  app.put("/meets/:id", update);
  app.delete("/meets/:id", remove);
}

async function search(req, res) {
  const meets = await service.search(req.query.q);
  res.status(200).json(meets);
}

async function create(req, res) {
  let result = await service.create(req.body);
}

async function read(req, res) {}

async function update(req, res) {}

async function remove(req, res) {}
