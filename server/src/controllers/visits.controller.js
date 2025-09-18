// visits.controller.js
// Controllers should validate request data, call services and format responses.

export async function list(req, res) {
  return res.json([]);
}

export async function getById(req, res) {
  const { id } = req.params;
  return res.json({ id });
}

export async function create(req, res) {
  const payload = req.body;
  return res.status(201).json(payload);
}

export async function update(req, res) {
  const { id } = req.params;
  const updates = req.body;
  return res.json({ id, updates });
}

export async function remove(req, res) {
  const { id } = req.params;
  return res.status(204).send();
}