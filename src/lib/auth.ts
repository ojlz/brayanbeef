import { SignJWT, jwtVerify } from "jose";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
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
  return pbkdf2Sync(password, salt, 150000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return randomBytes(32).toString("hex");
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres";
  if (!/[A-Z]/.test(password)) return "Senha deve conter pelo menos uma letra maiúscula";
  if (!/[a-z]/.test(password)) return "Senha deve conter pelo menos uma letra minúscula";
  if (!/[0-9]/.test(password)) return "Senha deve conter pelo menos um número";
  return null;
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

  if (!credentials) return null;
  if (username !== credentials.username) return null;

  const hash = hashPassword(password, credentials.salt);
  if (!constantTimeCompare(hash, credentials.passwordHash)) return null;

  const secret = getJwtSecret();
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
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
  } catch {
    return null;
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const credentials = await getAdminCredentials();
  if (!credentials) return { success: false, error: "Credenciais não encontradas" };

  const currentHash = hashPassword(currentPassword, credentials.salt);
  if (!constantTimeCompare(currentHash, credentials.passwordHash)) {
    return { success: false, error: "Senha atual incorreta" };
  }

  const strengthError = validatePasswordStrength(newPassword);
  if (strengthError) return { success: false, error: strengthError };

  await saveAdminCredentials(credentials.username, newPassword);
  return { success: true };
}

export function setSessionCookie(token: string): string {
  const maxAge = 8 * 60 * 60;
  return `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return "auth-token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
}

// Simple in-memory rate limiter
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) return false;

  entry.count++;
  return true;
}
