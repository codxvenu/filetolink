import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { configDotenv } from "dotenv"

configDotenv();

const apiId = process.env.apiId;     // from https://my.telegram.org
const apiHash = process.env.apiHash;  // from https://my.telegram.org
const session = new StringSession(process.env.session);

const client = new TelegramClient(session, Number(apiId), apiHash, {
  connectionRetries: 5,
});
await client.connect();

export default client;
