import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join } from "node:path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const DATA_DIR = join(process.cwd(), "data");

const isLocal = !GITHUB_TOKEN;

interface GitHubContent {
  sha: string;
  content: string;
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function localReadJSON<T>(localPath: string): Promise<T> {
  const content = await readFile(localPath, "utf-8");
  return JSON.parse(content);
}

async function localWriteJSON<T>(
  localPath: string,
  data: T
): Promise<void> {
  await ensureDir(join(localPath, ".."));
  await writeFile(localPath, JSON.stringify(data, null, 2), "utf-8");
}

async function localListFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".json"))
      .map((e) => e.name.replace(".json", ""));
  } catch {
    return [];
  }
}

/**
 * Read a JSON file. Path is relative to data/ directory (e.g. "products" or "products/picanha").
 */
export async function readJSON<T>(path: string): Promise<T> {
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
    throw new Error(`Failed to read ${path}: ${response.statusText}`);
  }

  const data: GitHubContent = await response.json();
  const decoded = atob(data.content.replace(/\n/g, ""));
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
    throw new Error(`Failed to write ${path}: ${putResponse.statusText}`);
  }
}

/**
 * List JSON files in a directory. Directory is relative to data/ (e.g. "products").
 */
export async function listFiles(directory: string): Promise<string[]> {
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
    throw new Error(`Failed to list ${directory}: ${response.statusText}`);
  }

  const data = await response.json();

  return Array.isArray(data)
    ? data
        .filter((item: { type: string }) => item.type === "file")
        .map((item: { name: string }) => item.name.replace(".json", ""))
    : [];
}
