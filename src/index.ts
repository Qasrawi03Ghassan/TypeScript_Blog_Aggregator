import {Config, setUser, readConfig} from './config';

function main() {
  const currentUser: string = 'Ghassan';
  setUser(currentUser);

  let currConfig = readConfig();
  console.log(currConfig);
}

main();