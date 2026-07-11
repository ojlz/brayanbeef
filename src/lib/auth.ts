import { SignJWT, jwtVerify } from "jose";
import { randomBytes, pbkdf2Sync } from "node:crypto";
import { readJSON, writeJSON } from "./github";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return new TextEncoder().encode(secret);
}

export interface AuthPayload {
  username: string;
  iat: number;
  exp: number;
}

interface AdminCredentials {
  username: string;
  passwordHash: string;
  salt: string;
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return randomBytes(32).toString("hex");
}

export async function getAdminCredentials(): Promise<AdminCredentials | null> {
  try {
    return await readJSON<AdminCredentials>("settings/admin");
  } catch {
    return null;
  }
}

export async function saveAdminCredentials(
  username: string,
  password: string
): Promise<void> {
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  await writeJSON(
    "settings/admin",
    { username, passwordHash, salt },
    "Update admin credentials"
  );
}

export async function login(
  username: string,
  password: string
): Promise<string | null> {
  const credentials = await getAdminCredentials();

  if (!credentials) {
    return null;
  }

  if (username !== credentials.username) {
    return null;
  }

  const hash = hashPassword(password, credentials.salt);
  if (hash !== credentials.passwordHash) {
    return null;
  }

  const secret = getJwtSecret();
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return token;
}

export async function verifyToken(
  token: string
): Promise<AuthPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthPayload;
  } catch (e) {
    console.error("verifyToken error:", e);
    return null;
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const credentials = await getAdminCredentials();

  if (!credentials) {
    return { success: false, error: "Credenciais não encontradas" };
  }

  const currentHash = hashPassword(currentPassword, credentials.salt);
  if (currentHash !== credentials.passwordHash) {
    return { success: false, error: "Senha atual incorreta" };
  }

  await saveAdminCredentials(credentials.username, newPassword);
  return { success: true };
}

export function setSessionCookie(token: string): string {
  const maxAge = 24 * 60 * 60;
  return `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return "auth-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}
