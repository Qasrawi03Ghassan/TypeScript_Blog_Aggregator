import { db } from "..";
import { eq } from "drizzle-orm";
import { feed_follows, feeds, users } from "../schemas/schema";

export async function createFeedFollow(feed_id: string, user_id: string){
    const [newFeedFollow] = await db.insert(feed_follows).values({feed_id:feed_id,user_id:user_id}).returning();

    const [result] = await db.select({
        id:feed_follows.id,
        createdAt: feed_follows.createdAt,
        updatedAt: feed_follows.updatedAt,
        feed_id: feeds.id,
        feed_name:feeds.name,
        user_id: users.id,
        user_name:users.name
    }).from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feed_id,feeds.id))
    .innerJoin(users, eq(feed_follows.user_id, users.id))
    .where(eq(feed_follows.id,newFeedFollow.id));

    return result;
}

export async function getFeedFollowsForUser(user_id: string){
    const result = await db.select({
        id:feed_follows.id,
        createdAt: feed_follows.createdAt,
        updatedAt: feed_follows.updatedAt,
        feed_id: feeds.id,
        feed_name:feeds.name,
        user_id: users.id,
        user_name:users.name}).from(feed_follows)
        .innerJoin(feeds, eq(feed_follows.feed_id,feeds.id))
        .innerJoin(users, eq(feed_follows.user_id, users.id))
        .where(eq(feed_follows.user_id,user_id));
    return result;
}

export type feedFollow = typeof feed_follows.$inferSelect;