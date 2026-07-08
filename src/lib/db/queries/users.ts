import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schemas/schema";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUser(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name,name));
  return result;
}

export async function getAllUsers() {
  const result = await db.select().from(users);
  return result;
}

export async function deleteAllUsers(){
  const result = await db.delete(users);
  return result;
}

export type User = typeof users.$inferSelect;