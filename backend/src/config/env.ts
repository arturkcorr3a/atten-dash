import { config } from "dotenv";

config();

const PORT_FALLBACK = 3000;

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return PORT_FALLBACK;
  }

  const parsedPort = Number(value);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    return PORT_FALLBACK;
  }

  return parsedPort;
};

const getRequiredEnv = (name: "SUPABASE_URL" | "SUPABASE_ANON_KEY"): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  port: parsePort(process.env.PORT),
  supabaseUrl: getRequiredEnv("SUPABASE_URL"),
  supabaseAnonKey: getRequiredEnv("SUPABASE_ANON_KEY"),
};
