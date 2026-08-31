import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema/sqlite.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/synapsis.sqlite",
  },
});
