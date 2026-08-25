import { NewMessage } from "telegram/events/index.js";
import { commands, get_commands } from "./commands.js";
import client from "./db.js";
import { Api } from "telegram";
import { CallbackQuery } from "telegram/events/CallbackQuery.js";
import { genLink, getMediaDetails } from "./utility/tg.js";

// await client.setBotCommands(get_commands()[0]);
const backupChannel = process.env.backupChannel

export async function initializeBot(){
  await client.invoke(
      new Api.bots.SetBotCommands({
        scope: new Api.BotCommandScopeDefault({}),
        langCode: "",
        commands: get_commands()[0].map((cmd)=>{
          return new Api.BotCommand(cmd)
        })
      })
    );
  client.addEventHandler(async (event) => {
    if(!event?.isChannel && event.message.media){
        const msg = await forwardToChannel(event.message.peerId,event.message.id);
        client.sendMessage(event.chatId,{message : genLink(getMediaDetails(msg)),parseMode : "html",replyTo : event.message.id})
      }
      const cmd = event.message.text ? event.message.text.split("/")[1] : null;
      if (cmd && get_commands()[1].includes(cmd)) {
          const user = event._entities.get(event._chatPeer.userId.toString());
          commands[cmd](client, user, event);
      }
  }, new NewMessage({ incoming: true }));
  client.addEventHandler(async (event) => {
      const cmd = event.query.data.toString();
      if (cmd && get_commands()[1].includes(cmd)) {
          const user = {chatId : event.query.userId};
          commands[cmd](client, user, event);
      }
  }, new CallbackQuery({ incoming: true }));
  console.log("🤖 Telegram bot initialized")
}


async function forwardToChannel(fromPeer,id){
const result =   await client.invoke(
    new Api.messages.ForwardMessages({
      fromPeer,
      id: [Number(id)],
      toPeer : backupChannel,
      withMyScore: true,
      dropAuthor : true,
      noforwards: true
    })
  );
  return result.updates[1].message
}


