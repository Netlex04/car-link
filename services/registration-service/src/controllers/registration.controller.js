export default function registerRoutes(app) {
  app.get("/registrations", search);
  app.post("/registrations", create);
  app.get("/registrations/:id", read);
  // app.put("/registrations/:id", update);
  app.delete("/registrations/:id", remove);
}

async function search(req, res) {}

async function create(req, res) {}

async function read(req, res) {}

// async function update(req, res) {}

async function remove(req, res) {}
