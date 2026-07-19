const required = [
  "NEXT_PUBLIC_SITE_URL",
  "BACKEND_API_URL",
  "ONBOARDING_REQUEST_API_KEY",
  "MARKETING_CONTACT_API_KEY",
  "NEXT_PUBLIC_ADMIN_URL",
];

const failures = [];

for (const name of required) {
  if (!process.env[name]?.trim()) failures.push(`${name} is required`);
}

for (const name of ["NEXT_PUBLIC_SITE_URL", "BACKEND_API_URL", "NEXT_PUBLIC_ADMIN_URL", "NEXT_PUBLIC_RESIDENT_APP_URL", "NEXT_PUBLIC_GUARD_APP_URL"]) {
  const value = process.env[name]?.trim();
  if (!value) continue;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") failures.push(`${name} must use HTTPS`);
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) failures.push(`${name} cannot use a local host`);
    if (name === "NEXT_PUBLIC_SITE_URL" && url.pathname !== "/") failures.push(`${name} must not include a path`);
  } catch {
    failures.push(`${name} must be a valid absolute URL`);
  }
}

for (const name of ["ONBOARDING_REQUEST_API_KEY", "MARKETING_CONTACT_API_KEY"]) {
  const value = process.env[name]?.trim();
  if (value && value.length < 24) failures.push(`${name} must be at least 24 characters`);
  if (name.startsWith("NEXT_PUBLIC_")) failures.push(`${name} must remain server-only`);
}

if (
  process.env.ONBOARDING_REQUEST_API_KEY &&
  process.env.ONBOARDING_REQUEST_API_KEY === process.env.MARKETING_CONTACT_API_KEY
) {
  failures.push("ONBOARDING_REQUEST_API_KEY and MARKETING_CONTACT_API_KEY must be different secrets");
}

if (failures.length) {
  process.stderr.write(`Marketing release environment is not ready:\n- ${failures.join("\n- ")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Marketing release environment is structurally ready. Secret values were not printed.\n");
}
