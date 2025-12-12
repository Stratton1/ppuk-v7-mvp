import fs from "fs";
import path from "path";
import dotenv from "dotenv";

type RuntimeEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_JWT_SECRET: string;
  NODE_ENV: string;
  PLAYWRIGHT_TEST: string;
};

const FRONTEND_ROOT = process.cwd();
const REQUIRED_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
] as const;

let cachedEnv: RuntimeEnv | null = null;

function loadEnvFile(filePath: string, options: { required: boolean; override: boolean }) {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: options.override });
    return;
  }

  if (options.required) {
    throw new Error(`Required environment file missing: ${filePath}`);
  }
}

export function getRuntimeEnv(): RuntimeEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const isPlaywright = process.env.PLAYWRIGHT_TEST === "true";
  const shouldUseTestEnv = nodeEnv === "test" || isPlaywright;

  if (shouldUseTestEnv) {
    loadEnvFile(path.join(FRONTEND_ROOT, ".env.test.local"), { required: true, override: true });
  } else {
    loadEnvFile(path.join(FRONTEND_ROOT, ".env.local"), { required: false, override: false });
  }

  const missingKeys = REQUIRED_KEYS.filter((key) => !process.env[key]);
  if (missingKeys.length) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(", ")}`);
  }

  const runtimeEnv: RuntimeEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET!,
    NODE_ENV: shouldUseTestEnv ? "test" : nodeEnv,
    PLAYWRIGHT_TEST: isPlaywright ? "true" : process.env.PLAYWRIGHT_TEST === "true" ? "true" : "false",
  };

  cachedEnv = runtimeEnv;
  return runtimeEnv;
}

export function maskSecret(value?: string | null) {
  if (!value) {
    return "";
  }

  const visible = value.slice(0, 4);
  return `${visible}${"*".repeat(Math.max(0, value.length - 4))}`;
}
