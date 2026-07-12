const handler = require("../dist/server/server.js");

module.exports = async function handler(req, res) {
  const request = new Request(`https://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: Object.fromEntries(Object.entries(req.headers)),
    body: ["POST", "PUT", "PATCH"].includes(req.method) ? await readBody(req) : undefined,
  });

  const response = await handler.default.fetch(request, {}, {});

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = await response.arrayBuffer();
  res.send(Buffer.from(body));
};

async function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
