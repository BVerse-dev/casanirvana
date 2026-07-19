import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(fileName) {
  const filePath = path.resolve(projectDir, fileName);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const requiredEnv = [
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_API_URL",
];

const missing = requiredEnv.filter((key) => !process.env[key] || process.env[key].trim() === "");

const hasNextAuthUrl = Boolean(process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim());
const hasVercelUrl = Boolean(process.env.VERCEL_URL && process.env.VERCEL_URL.trim());

if (!hasNextAuthUrl && !hasVercelUrl) {
  missing.push("NEXTAUTH_URL (or VERCEL_URL on Vercel)");
}

if (missing.length > 0) {
  console.error("Missing required environment variables for build:");
  missing.forEach((entry) => console.error(`- ${entry}`));
  process.exit(1);
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
if (!/^https?:\/\//.test(apiUrl)) {
  console.error("NEXT_PUBLIC_API_URL must be an absolute http(s) URL.");
  process.exit(1);
}

if (process.env.VERCEL && /^http:\/\//.test(apiUrl)) {
  console.warn("Warning: NEXT_PUBLIC_API_URL is using http on Vercel. Prefer https in production.");
}
