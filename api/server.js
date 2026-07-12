const path = require("path");
const fs = require("fs");

// Resolve the server entry from dist/
const serverPath = path.join(__dirname, "..", "dist", "server", "server.js");

// Pre-load all server assets so relative imports work
const assetsDir = path.join(__dirname, "..", "dist", "server", "assets");
if (fs.existsSync(assetsDir)) {
  for (const file of fs.readdirSync(assetsDir)) {
    if (file.endsWith(".js")) {
      try { require(path.join(assetsDir, file)); } catch {}
    }
  }
}

let handlerPromise;
function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import(serverPath);
  }
  return handlerPromise;
}

module.exports = async function vercelHandler(req, res) {
  try {
    const mod = await getHandler();
    const server = mod.default?.default || mod.default || mod;

    const host = req.headers.host || "localhost";
    const url = `https://${host}${req.url}`;
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && value !== null) {
        headers[key] = Array.isArray(value) ? value.join(", ") : String(value);
      }
    }

    const init = { method: req.method, headers };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length > 0) {
        init.body = Buffer.concat(chunks);
      }
    }

    const request = new Request(url, init);
    const response = await server.fetch(request, {}, {});

    const status = response.status || 200;
    res.status(status);

    response.headers.forEach((value, key) => {
      const skip = ["content-encoding", "transfer-encoding", "connection"];
      if (!skip.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (error) {
    console.error("Vercel handler error:", error?.message, error?.stack);
    res.status(500).json({ error: "Internal Server Error", message: error?.message });
  }
};
