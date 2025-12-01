export default async function handler(req, res) {
  return res.status(200).json({
    status: "ok",
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString()
  });
}
