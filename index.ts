// import
import 'dotenv/config'
import { ethers } from "ethers";
import TelegramBot from 'node-telegram-bot-api';
import { getCreate2Address } from "./create2";

// declare deployment parameters
import contractArtifact from "./artifact.json";

const constructorTypes = contractArtifact.abi
  .find((v) => v.type === "constructor")
  ?.inputs.map((t) => t.type);

export const factoryAddress = "0xc07c1980C87bfD5de0DC77f90Ce6508c1C0795C3";
const constructorArgs: any[] = [
  "0x1a44076050125825900e736c501f859c50fE728c",
  "0xe5159e75ba5f1C9E386A3ad2FC7eA75c14629572",
];

// console.log("constructor parameters", constructorTypes, constructorArgs);

const job = async () => {
  let i = 0;
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  while (true) {

    const salt = ethers.id("" + i);
    // Calculate contract address
    const computedAddress = getCreate2Address({
      salt: salt,

      factoryAddress,
      contractBytecode: contractArtifact.bytecode,
      constructorTypes: constructorTypes,
      constructorArgs: constructorArgs,
    });
    if (
      computedAddress.startsWith("0x0000") &&
      computedAddress.endsWith("0000")
    ) {
      console.log("found the right salt hash");
      console.log("salt", salt, computedAddress);
      try {
        const message = `
🟢🟢🟢🟢

found the right salt hash

salt : ${salt}
computedAddress: ${computedAddress}
`;
        await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message)
        console.log('successful');
      } catch (e) { console.log(e) };
      break;
    }

    if (i % 100000 == 0) console.log(i, "salt", salt, computedAddress)
    i++;
  }
};

job();
