import os, { homedir } from 'os';
import fs, { read } from 'fs';
import path from 'path';
import { config } from 'process';

export type Config = {
    dbUrl: string,
    currentUserName: string
};

export function setUser(userName: string): void{
    let currConfig: Config = readConfig();
    currConfig.currentUserName = userName;
    writeConfig(currConfig);
}

export function readConfig(){
    try {
        let configFileContent = fs.readFileSync(getConfigFilePath(),"utf-8");

        let parsedContent = JSON.parse(configFileContent);
        let validatedContent = validateConfig(parsedContent);
        return validatedContent;

    } catch (err) {
        throw new Error(`ERROR: ${err}`);
    }
}

function getConfigFilePath(): string{
    return path.join(os.homedir(),'.gatorconfig.json');
}

function writeConfig(cfg: Config): void{
    const configFilepath = getConfigFilePath();
    const rawCfg = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    };

    try {
        fs.writeFileSync(configFilepath,JSON.stringify(rawCfg));
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

function validateConfig(rawCfg: any): Config{
    if(!rawCfg.db_url || typeof rawCfg.db_url !== "string")throw new Error('Raw config field is required!');
    const dbUrlValue = rawCfg.db_url;

    if(!rawCfg.current_user_name || typeof rawCfg.current_user_name !== "string")return {dbUrl:dbUrlValue ?? '',currentUserName:''};
    const currentUsernameValue = rawCfg.current_user_name;

    return {dbUrl: dbUrlValue, currentUserName: currentUsernameValue};
}