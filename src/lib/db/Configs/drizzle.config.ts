import { defineConfig } from "drizzle-kit";
import {readConfig} from './dbConfig';

export default defineConfig({
  schema: "src/lib/db/schemas/schema.ts",
  out: "src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: readConfig().dbUrl,
  },
});