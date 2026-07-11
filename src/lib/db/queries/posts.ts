import {  desc, inArray } from "drizzle-orm";
import { db } from "..";
import {  posts } from "../schemas/schema";

export async function createPost(title: string, url: string, desc: string, pubDate: Date,feed_id: string){
    let [result] = await db.insert(posts).values({title:title, url:url, description:desc, published_at:pubDate, feed_id:feed_id}).returning();
    return result;
}

export async function getPostsForUser(feed_ids: string[],limit: number){
    let result = await db.select().from(posts).where(inArray(posts.feed_id,feed_ids)).orderBy(desc(posts.published_at)).limit(limit);
    return result;
}