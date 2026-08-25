import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { createInterface } from "node:readline/promises";
import { configDotenv } from "dotenv"

configDotenv()
const rl = createInterface({ input: process.stdin, output: process.stdout });

const apiId = process.env.apiId;
const apiHash = process.env.apiHash;  
const session = new StringSession(process.env?.session ?? "");

const client = new TelegramClient(session, Number(apiId), apiHash, {
  connectionRetries: 5,
});
await client.start({botAuthToken : process.env.TGbotToken})

console.log(client.session.save()) //copy the session from console and paste in .env
