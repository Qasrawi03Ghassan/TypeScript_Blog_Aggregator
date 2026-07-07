import { setUser } from "../Configs/dbConfig";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;
export type CommandsRegistery = Record<string,CommandHandler>;

export function loginHandler(cmdName: string,...args:string[]): void{
    if(args === undefined || args.length === 0)throw new Error('Invalid use of login command.\n Syntax: login <username>');

    const loggedUsername = args[0];
    setUser(loggedUsername);
    console.log(`Logged in as ${loggedUsername}`);
}

export function registerCommand(registery: CommandsRegistery, cmdName: string, handler: CommandHandler){
    registery[cmdName] = handler;
}

export function runCommand(registery: CommandsRegistery, cmdName: string, ...args:string[]){
    if(cmdName in registery){
        registery[cmdName](cmdName,...args);
    }else{
        throw new Error(`ERROR: ${cmdName} is not registered in the commands registery!`);
    }
}

