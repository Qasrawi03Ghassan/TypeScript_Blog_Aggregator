import { setUser } from "../lib/db/Configs/dbConfig";
import { createUser, getUser } from "../lib/db/queries/users";

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

