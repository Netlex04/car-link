export default function registerRoutes(app) {
  app.get("/meets", search);
  app.post("/meets", create);
  app.get("/meets/:id", read);
  app.put("/meets/:id", update);
  app.delete("/meets/:id", remove);
}

async function search(req, res) {}

async function create(req, res) {}

async function read(req, res) {}

async function update(req, res) {}

async function remove(req, res) {}
