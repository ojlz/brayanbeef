// Vercel Node.js adapter for TanStack Start (ESM)
const path = require("path");

let handlerPromise;
function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import(path.join(__dirname, "..", "dist", "server", "server.js"));
  }
  return handlerPromise;
}

module.exports = async function vercelHandler(req, res) {
  try {
    const handler = await getHandler();
    const defaultHandler = handler.default?.default || handler.default || handler;

    const url = `https://${req.headers.host || "localhost"}${req.url}`;
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers[key] = Array.isArray(value) ? value.join(", ") : value;
    }

    const init = { method: req.method, headers };

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      init.body = Buffer.concat(chunks);
    }

    const request = new Request(url, init);
    const response = await defaultHandler.fetch(request, {}, {});

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key !== "transfer-encoding") res.setHeader(key, value);
    });

    const body = await response.arrayBuffer();
    res.send(Buffer.from(body));
  } catch (error) {
    console.error("Vercel handler error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
