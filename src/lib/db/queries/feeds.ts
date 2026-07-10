import { db } from "..";
import { eq, sql } from "drizzle-orm";
import { feeds } from "../schemas/schema";

export async function createFeed(name: string,url: string, user_id: string){
    const [result] = await db.insert(feeds).values({name:name,url:url,user_id:user_id}).returning();
    return result;
}

export async function getAllFeeds() {
  const result = await db.select().from(feeds);
  return result;
}

export async function getFeed(feedUrl: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url,feedUrl));
  return result;
}

export async function markFeedFetched(feed_id: string){
  const now = new Date();
  const result = await db.update(feeds).set({
    updatedAt: now,
    last_fetched_at:now
  })
  .where(eq(feeds.id,feed_id));
  return result;
}

export async function getNextFeedToFetch(){
  const result = await db.select().from(feeds).orderBy(sql`${feeds.last_fetched_at} ASC NULLS FIRST`).limit(1);
  return result[0];
}

export type Feed = typeof feeds.$inferSelect;