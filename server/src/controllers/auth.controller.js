// auth.controller.js
export async function login(req, res) {
  // TODO: implement SMS/Firebase Auth integration
  const { cpf, code } = req.body;
  return res.json({ token: "fake-token", cpf, code });
}
export async function me(req, res) {
  // TODO: read user from req after auth middleware
  return res.json({ id: "me", name: "Responsible User" });
}