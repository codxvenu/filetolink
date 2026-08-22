import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { configDotenv } from "dotenv";
import fs from "node:fs"
configDotenv()

let bots = [];

function parseBots() {
    let bots = fs.readFileSync("bot.json", { "encoding": "UTF-8" });
    bots = JSON.parse(bots);
    if (!bots?.bots) return {}
    return bots.bots
}
function setSession(tk, session) {
    let bots = parseBots();
    bots[tk] = session;
    fs.writeFileSync("bot.json", JSON.stringify({ bots: bots }));
}
function Session(tk) {
    let bots = parseBots();
    const session = bots[tk]
    return session;
}

async function createClientStrings(BOT_TOKEN) {
    const session = Session(BOT_TOKEN);
    const client = new TelegramClient(
        new StringSession(session ?? ""),
        Number(process.env.apiId),
        process.env.apiHash,
        { connectionRetries: 5 }
    );
    if (session) {
        client.connect();
        return client
    }
    await client.start({
        botAuthToken: BOT_TOKEN,
    });
    setSession(BOT_TOKEN, client.session.save())
    client.connect();
    return client
}
export async function onFloodErr(id, sec) {
    bots = bots.map((b) => {
        if (b.id === id) {
            return { ...b, floodWait: Date.now() + (sec * 1000) }
        } else {
            return b
        }
    })
}

const tokens = process.env.botToken.split("|")
const createClientsObj = async (tokens) => {
    return await Promise.all(tokens.map(async (tk) => {
        const id = crypto.randomUUID()
        const client = await createClientStrings(tk)
        return { id, client, workload: 0, floodWait: 0 }
    }));
}
export async function initializeClients() {
    bots = await createClientsObj(tokens);
}
export function releaseClient(id) {
    bots = bots.map(b => b.id === id ? { ...b, workload: Math.max(0,b.workload - 1) } : b)
}
export function getFastestClient() {
    const bot = getBot();
    if (!bot) throw Error("No worker available")
    bots = bots.map(b => b.id === bot.id ? { ...b, workload: b.workload + 1 } : b)
    return { id: bot.id, client: bot.client };
}
export function getBot() {
    if (!bots.length) throw Error("No worker available")
    let bot = bots.find(b => b.workload === 0);
    if (bot) return bot;
    bot = bots.filter(b => !b.floodWait || b.floodWait <= Date.now())
    .reduce((acc, b) => (acc = (acc.workload < b.workload) ? acc : b), { workload: 4 });
    if (bot.workload >= 4) {
        throw Error("No worker available")
    } else {
        return bot
    }
}
export function getStats(){
    let message =  `Id${" ".repeat(40)}Workload \n`
    message += bots.map((b)=>{
        return `${b.id} |      ${b.workload}\n`
    }).join("")
    return message
}