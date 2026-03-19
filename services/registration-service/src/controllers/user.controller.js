export default function registerRoutes(app) {
  app.post("/users", create);
  app.get("/users/:id", read);
}

// async function search(req, res) {}

async function create(req, res) {}

async function read(req, res) {}

// async function update(req, res) {}

// async function remove(req, res) {}
