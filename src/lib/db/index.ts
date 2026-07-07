import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schemas/schema";
import { readConfig } from "./Configs/dbConfig";

const config = readConfig();
const conn = postgres(config.dbUrl);
export const db = drizzle(conn, { schema });