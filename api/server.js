const path = require("path");

// CRITICAL: set CWD to dist/server so relative imports in server.js work
const serverDir = path.join(__dirname, "..", "dist", "server");
process.chdir(serverDir);

const serverPath = path.join(serverDir, "server.js");

let handlerPromise;
function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import(serverPath).then((mod) => {
      const server = mod.default?.default || mod.default || mod;
      return server;
    });
  }
  return handlerPromise;
}

module.exports = async function vercelHandler(req, res) {
  try {
    const server = await getHandler();

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
    console.error("Handler error:", error?.message);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};
