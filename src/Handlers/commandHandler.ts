import { setUser } from "../lib/db/Configs/dbConfig";
import { createUser, getUser,deleteAllUsers, getAllUsers, User, getUserById } from "../lib/db/queries/users";
import { createFeed, Feed, getAllFeeds } from "../lib/db/queries/feeds";
import {readConfig} from '../lib/db/Configs/dbConfig';
import { fetchFeed } from "../lib/rss";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistery = Record<string,CommandHandler>;

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

export function getLoggedUser(): string{
    let currConfig = readConfig();
    return currConfig.currentUserName;
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
    console.log('Sucessfully deleted all users!');
}

export async function listUsers(cmdName: string, ...args:string[]): Promise<void>{
    let users = await getAllUsers();
    if(!users)console.log('There are no registered users!');

    const currUser = getLoggedUser();
    for(let user of Object.values(users)){
        console.log(`* ${user.name} ${currUser === user.name? '(current)':''}`);
    }
}

export async function listFeeds(cmdName: string, ...args:string[]): Promise<void>{
    let feeds = await getAllFeeds();
    if(!feeds)console.log('There are no feeds!');



    console.log('Feeds details:\n');
    for(let feed of feeds){
        console.log(`Feed number ${feeds.indexOf(feed)+1}`);
        console.log(`   - name: ${feed.name}`);
        console.log(`   - url: ${feed.url}`);
        console.log(`   - creator_user: ${(await getUserById(feed.user_id)).name}`);
        console.log('\n');
    }
}


export async function aggHandler(cmdName: string, ...args:string[]){
    //if(args === undefined || args.length === 0)throw new Error('Invalid use of agg command.\n Syntax: agg <username>');
    const feed = 'https://www.wagslane.dev/index.xml';
    let feedObject = await fetchFeed(feed);

    console.log(JSON.stringify(feedObject,null,2));
}

export async function addFeedHandler(cmdName: string, ...args:string[]){
    if(args === undefined || args.length === 0)throw new Error('Invalid use of addfeed command.\n Syntax: addfeed <feed_name> <feed_url>');
    
    const feedName = args[0];
    const feedUrl = args[1];

    let loggedUser = await getUser(getLoggedUser());
    if(!loggedUser)throw new Error('Could not get logged in user!');
    const loggedUserId = loggedUser.id;

    let newFeed = await createFeed(feedName,feedUrl,loggedUserId);
    console.log(`Successfully subscribed current user (${loggedUser.name}) to feed ${feedName}:\n`);
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