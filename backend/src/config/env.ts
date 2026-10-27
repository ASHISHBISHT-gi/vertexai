import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  // Where uploaded files live (relative to the backend folder). Swap for S3/MinIO later.
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_VIDEO_MB: z.coerce.number().positive().default(500),
  MAX_SUBMISSION_MB: z.coerce.number().positive().default(10),
  // How long a signed video link stays valid.
  MEDIA_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  // "Today" for streaks is calculated in this timezone, not UTC.
  APP_TIMEZONE: z.string().default("Asia/Kolkata"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration (check backend/.env):");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.map(String).join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
