// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

type EnvVars = {
  DATABASE_URL: string;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // This will throw a nice error if DATABASE_URL is still missing
    url: env<EnvVars>("DATABASE_URL"),
  },
});