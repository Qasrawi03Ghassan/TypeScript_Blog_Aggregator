import { CommandHandler, UserCommandsHandler } from "../../Handlers/commandHandler";
import { readConfig } from "../db/Configs/dbConfig";
import { getUser } from "../db/queries/users";

export function getLoggedUser(cmdHandler: UserCommandsHandler): CommandHandler{
    return async (cmdName: string, ...args:string[]) :Promise<void> => {
        let currUsername = readConfig().currentUserName;
        if(!currUsername) throw new Error('Config file at home directory does not have current username!');

        let user = await getUser(currUsername);
        if(!user) throw new Error('Cannot get logged user!');
        
        return await cmdHandler(cmdName, user, ...args);
    };
}
