import {CommandsRegistery,registerCommand,runCommand,loginHandler, registerHandler, resetHandler, listUsers} from './Handlers/commandHandler';
import process from 'node:process';

async function main() {
  let registery: CommandsRegistery = {};
  registerAllCommands(registery);

  let argsv = process.argv.slice(2);
  if(argsv.length === 0){
    console.log('ERROR: Invalid command syntax, not enough arguments!');
    process.exit(1);
  }

  let cmdName = argsv[0];
  let args = argsv.slice(1);

  try {
    await runCommand(registery,cmdName,...args);
  } catch (err) {
    console.log(`${err}`);
    process.exit(1);
  }
}

function registerAllCommands(cmdReg: CommandsRegistery): void{
  registerCommand(cmdReg,'login',loginHandler);
  registerCommand(cmdReg,'register',registerHandler);
  registerCommand(cmdReg,'reset',resetHandler);
  registerCommand(cmdReg,'users',listUsers);
}

await main();
process.exit(0);