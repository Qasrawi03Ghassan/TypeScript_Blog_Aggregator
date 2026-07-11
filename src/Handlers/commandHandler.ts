import { readConfig, setUser } from "../lib/db/Configs/dbConfig";
import { createUser, getUser,deleteAllUsers, getAllUsers, User, getUserById } from "../lib/db/queries/users";
import { createFeed, Feed, getAllFeeds, getFeed, getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds";
import { fetchFeed } from "../lib/rss";
import { createFeedFollow, getFeedFollowsForUser } from "../lib/db/queries/feedFollows";
import { deleteFeedFollow } from "../lib/db/queries/feedFollows";
import { duration } from "drizzle-orm/gel-core";
import { createPost, getPostsForUser } from "../lib/db/queries/posts";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistery = Record<string,CommandHandler>;

export type UserCommandsHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

export type middlewareLoggedin = (handler: UserCommandsHandler) => CommandHandler;

export function registerCommand(registery: CommandsRegistery, cmdName: string, handler: CommandHandler){
    registery[cmdName] = handler;
}

export async function runCommand(registery: CommandsRegistery, cmdName: string, ...args:string[]){
    if(cmdName in registery){
        await registery[cmdName](cmdName,...args);
    }else{
        throw new Error(`ERROR: ${cmdName} is not registered in the commands registery!`);
    }
}


export async function loginHandler(cmdName: string,...args:string[]): Promise<void>{
    if(args === undefined || args.length === 0)throw new Error('Invalid use of login command.\n Syntax: login <username>');

    const loggedUsername = args[0];
    const isRegistered = await getUser(loggedUsername);
    if(!isRegistered)throw new Error(`User ${loggedUsername} not found, please register first!`);

    setUser(loggedUsername);
    console.log(`Logged in as ${loggedUsername}`);
}

export async function registerHandler(cmdName: string,...args:string[]): Promise<void>{
    if(args === undefined || args.length === 0)throw new Error('Invalid use of register command.\n Syntax: register <username>');

    const enteredUser = args[0];
    
    const isRegistered = await getUser(enteredUser);
    if(isRegistered)throw new Error(`User ${enteredUser} is already registered!`);
    
    let registeredUser = await createUser(enteredUser);

    setUser(args[0]);
    console.log(`Successfully registered new user ${enteredUser} and logged in.\n${enteredUser} data:\n`);
    console.log(registeredUser);
}

export async function resetHandler(cmdName: string, ...args:string[]):Promise<void>{
    await deleteAllUsers();
    console.log('Sucessfully reseted dataabse!');
}

export async function listUsers(cmdName: string, ...args:string[]): Promise<void>{
    let users = await getAllUsers();
    if(!users)console.log('There are no registered users!');

    let loggedUserName = readConfig().currentUserName;

    for(let user of Object.values(users)){
        console.log(`* ${user.name} ${loggedUserName === user.name? '(current)':''}`);
    }
}

export async function listFeeds(cmdName: string, ...args:string[]): Promise<void>{
    let feeds = await getAllFeeds();
    if(!feeds)console.log('There are no feeds!');

    console.log('Feeds details:');
    for(let feed of feeds){
        console.log(` * Feed number ${feeds.indexOf(feed)+1}:`);
        console.log(`       - name: ${feed.name}`);
        console.log(`       - url: ${feed.url}`);
        console.log(`       - creator_user: ${(await getUserById(feed.user_id)).name}\n`);
    }
}


export async function aggHandler(cmdName: string, ...args:string[]){
    if(args === undefined || args.length === 0)throw new Error('Invalid use of agg command.\n Syntax: agg <time_between_reqs>');
    
    const timeBetweenReqs = parseDuration(args[0]);

    console.log(`Starting feed aggregator with time between requests: ${args[0]}`);

    scrapeFeeds().catch((err) => {
        console.log(`Error while scraping feeds: ${err}`);
    });

    const interval = setInterval(async () => {
        scrapeFeeds().catch((err) => {
        console.log(`Error while scraping feeds: ${err}`);
    });
    },timeBetweenReqs);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
}

async function scrapeFeeds(){
    let nextFeed = await getNextFeedToFetch();
    if(!nextFeed) throw new Error('Cannot find next feed!');

    let markedFeed = await markFeedFetched(nextFeed.id);
    if(!markedFeed) throw new Error('Cannot mark feed as fetched!');

    let rssContent = await fetchFeed(nextFeed.url);
    if(!rssContent) throw new Error('Cannot get feed data!');

    if(!rssContent.channel.item)console.log(`No items are found in this fetchd feed: ${nextFeed.name}`);

    console.log(`Fetched feed ${nextFeed.name} items:\n`)
    for(let item of rssContent.channel.item){
        //console.log(`   * ${item.title}`); 

        let postPubDate = new Date(item.pubDate);
        if(Number.isNaN(postPubDate.getTime()))throw new Error(`ERROR: Invalid published_at date fromat for post ${item.title}!`);

        let savePost = await createPost(item.title,item.link,item.description,postPubDate,nextFeed.id);
        if(!savePost) throw new Error(`ERROR: Cannot save post ${item.title} in database!`);

        console.log(`Successfully saved post with title: ${item.title} and link: ${item.link}`);
    }

}

function parseDuration(durationStr: string): number{
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);

    if(!match)throw new Error('Invalid duration format. Use a number followed by ms, s, m, or h (e.g., 500ms, 2s, 5m, 1h).');

    const duration = parseInt(match[1]);
    const type = match[2];

    let finalDur = 0;

    switch(type){
        case 'ms':
            finalDur = duration;
            break;
        case 's':
            finalDur = duration * 1000;        
            break;
        case 'm':
            finalDur = duration * 1000 * 60;    
            break;
        case 'h':
            finalDur = duration * 1000 * 60 * 60;        
            break;
        default:
    }

    return finalDur;
}

export async function addFeedHandler(cmdName: string, user:User,...args:string[]){
    if(args === undefined || args.length === 0)throw new Error('Invalid use of addfeed command.\n Syntax: addfeed <feed_name> <feed_url>');
    
    const feedName = args[0];
    const feedUrl = args[1];

    let newFeed = await createFeed(feedName,feedUrl,user.id);

    await createFeedFollow(newFeed.id,user.id);

    console.log(`Successfully created new feed named ${feedName} under current user (${user.name}):\n`);
    console.log(newFeed);
}

export function printFeed(feed:Feed, user:User){
    console.log(`User data:`);
    console.log(`   - id: ${user.id}`);
    console.log(`   - name: ${user.name}`);
    console.log(`   - created_at: ${user.createdAt}`);
    console.log(`   - updated_at: ${user.updatedAt}`);

    console.log(`Feed data:`);
    console.log(`   - id: ${feed.id}`);
    console.log(`   - name: ${feed.name}`);
    console.log(`   - created_at: ${feed.createdAt}`);
    console.log(`   - updated_at: ${feed.updatedAt}`);
    console.log(`   - url: ${feed.url}`);
    console.log(`   - user_id: ${feed.user_id}`);
}

export async function followHandler(cmdName: string, user:User,...args:string[]){
    if(args === undefined || args.length === 0)throw new Error('Invalid use of follow command.\n Syntax: follow <feed_url>');

    const feedUrl = args[0];

    let feed = await getFeed(feedUrl);
    if(!feed) throw new Error('Feed does not exist!');

    let feedFollow = await createFeedFollow(feed.id,user.id);

    console.log(`Successfully followed ${feedFollow.feed_name} by ${feedFollow.user_name}: \n${JSON.stringify(feedFollow,null,2)}`);
}

export async function followingHandler(cmdName: string, user:User,...args:string[]){
    let userFeedFollows = await getFeedFollowsForUser(user.id);

    console.log(`Feeds followed by ${user.name}:`);
    for(let feedFollow of userFeedFollows){
        console.log(`   - ${feedFollow.feed_name}`);
    }
}

export async function unfollowHandler(cmdName: string,user:User, ...args: string[]){
    if(args === undefined || args.length === 0)throw new Error('Invalid use of follow command.\n Syntax: unfollow <feed_url>');

    const feedUrl = args[0];

    let feedToUnfollow = await getFeed(feedUrl);
    if(!feedToUnfollow)throw new Error(`ERROR: Feed with URL ${feedUrl} does not exist!`);

    let UnfollowedFeed = await deleteFeedFollow(user.id,feedToUnfollow.id);
    if(!UnfollowedFeed) throw new Error('ERROR: Cannot unfollow feed!');    

    console.log(`Successfully unfollowed feed with URL ${feedUrl}`);
}

export async function browseHandler(cmdName: string, user:User,...args:string[]){
    let limit = 0;
    if(args === undefined || args.length === 0)limit = 2;
    else limit = Number(args[0]);
    if(Number.isNaN(limit))throw new Error('ERROR: Invalid limit amount entered!');

    let userFeedFollows = await getFeedFollowsForUser(user.id);
    if(!userFeedFollows)throw new Error(`User ${user.name} does not follow any feed!`);

    let userFeedIds = [];
    for(let feedFollow of userFeedFollows){
        userFeedIds.push(feedFollow.feed_id);
    }

    let latestPosts = await getPostsForUser(userFeedIds,limit);
    if(!latestPosts || latestPosts.length === 0) throw new Error(`No posts found for user ${user.name}!`);

    console.log(`Posts details for user ${user.name}:\n`);
    for(let userPost of latestPosts){
        console.log(`   - title: ${userPost.title}`);
        console.log(`   - link: ${userPost.url}`);
        console.log(`   - description: ${userPost.description}`);
        console.log(`   - created_at: ${userPost.createdAt}`);
        console.log(`   - published_at: ${userPost.published_at}`);

        console.log('\n\n');
    }


}