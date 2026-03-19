export default function registerRoutes(app) {
  app.get("/vehicles", search);
  app.post("/vehicles", create);
  app.get("/vehicles/:id", read);
  app.put("/vehicles/:id", update);
  app.delete("/vehicles/:id", remove);
}

async function search(req, res) {}

async function create(req, res) {}

async function read(req, res) {}

async function update(req, res) {}

async function remove(req, res) {}
