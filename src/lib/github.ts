import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const DATA_DIR = join(process.cwd(), "data");

const isLocal = !GITHUB_TOKEN;

// Paths that require auth to read via the API (handled in github.read.ts)
// Note: settings/admin is NOT blocked here — auth system needs to read/write it
const BLOCKED_PATHS: string[] = [];

interface GitHubContent {
  sha: string;
  content: string;
}

/**
 * Validate that a path is safe (no traversal, no blocked paths).
 */
function validatePath(path: string): void {
  if (path.includes("..")) {
    throw new Error("Invalid path: traversal not allowed");
  }
  if (!/^[a-zA-Z0-9_\-\/]+$/.test(path)) {
    throw new Error("Invalid path: only alphanumeric, hyphens, underscores and slashes allowed");
  }
  if (BLOCKED_PATHS.some((blocked) => path === blocked || path.startsWith(blocked + "/"))) {
    throw new Error("Access denied");
  }
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function localReadJSON<T>(localPath: string): Promise<T> {
  const resolved = resolve(localPath);
  if (!resolved.startsWith(resolve(DATA_DIR))) {
    throw new Error("Access denied: path traversal");
  }
  const content = await readFile(localPath, "utf-8");
  return JSON.parse(content);
}

async function localWriteJSON<T>(
  localPath: string,
  data: T
): Promise<void> {
  const resolved = resolve(localPath);
  if (!resolved.startsWith(resolve(DATA_DIR))) {
    throw new Error("Access denied: path traversal");
  }
  await ensureDir(join(localPath, ".."));
  await writeFile(localPath, JSON.stringify(data, null, 2), "utf-8");
}

async function localListFiles(dirPath: string): Promise<string[]> {
  try {
    const resolved = resolve(dirPath);
    if (!resolved.startsWith(resolve(DATA_DIR))) {
      throw new Error("Access denied: path traversal");
    }
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".json"))
      .map((e) => e.name.replace(".json", ""));
  } catch {
    return [];
  }
}

/**
 * Read a JSON file. Path is relative to data/ directory.
 */
export async function readJSON<T>(path: string): Promise<T> {
  validatePath(path);

  if (isLocal) {
    const localPath = join(DATA_DIR, path + ".json");
    return localReadJSON<T>(localPath);
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/data/${path}.json?ref=${GITHUB_BRANCH}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Not found");
  }

  const data: GitHubContent = await response.json();
  const decoded = atob(data.content.replace(/\n/g, "")).replace(/^\uFEFF/, "");
  return JSON.parse(decoded);
}

/**
 * Write a JSON file. Path is relative to data/ directory.
 */
export async function writeJSON<T>(
  path: string,
  data: T,
  message: string
): Promise<void> {
  validatePath(path);

  if (isLocal) {
    const localPath = join(DATA_DIR, path + ".json");
    await localWriteJSON<T>(localPath, data);
    return;
  }

  const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/data/${path}.json?ref=${GITHUB_BRANCH}`;
  const getResponse = await fetch(getUrl, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  let sha: string | undefined;
  if (getResponse.ok) {
    const contentData: GitHubContent = await getResponse.json();
    sha = contentData.sha;
  }

  const body: Record<string, unknown> = {
    message,
    content: btoa(JSON.stringify(data, null, 2)),
    branch: GITHUB_BRANCH,
  };

  if (sha) {
    body.sha = sha;
  }

  const putResponse = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/data/${path}.json`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!putResponse.ok) {
    throw new Error("Failed to write");
  }
}

/**
 * List JSON files in a directory.
 */
export async function listFiles(directory: string): Promise<string[]> {
  validatePath(directory);

  if (isLocal) {
    const dirPath = join(DATA_DIR, directory);
    return localListFiles(dirPath);
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/data/${directory}?ref=${GITHUB_BRANCH}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return Array.isArray(data)
    ? data
        .filter((item: { type: string }) => item.type === "file")
        .map((item: { name: string }) => item.name.replace(".json", ""))
    : [];
}
