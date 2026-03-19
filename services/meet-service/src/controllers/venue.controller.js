export default function registerRoutes(app) {
  app.get("/venues", search);
  app.post("/venues", create);
  app.get("/venues/:id", read);
  //   app.put("/venues/:id", update); #TODO: Maybe include?
  //   app.delete("/venues/:id", remove); #TODO: Maybe include?
}

async function search(req, res) {}

async function create(req, res) {}

async function read(req, res) {}

async function update(req, res) {}

async function remove(req, res) {}
