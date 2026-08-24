
import { Button } from "telegram/tl/custom/button.js"
import { cmd } from "./utility/tg.js"
export const get_commands = () => {
    const command_descriptions = {
        "start": "Start the bot and get a welcome message",
        "ping": "Check the bot's status and response time",
        "about": "Get information about the bot",
        "help": "Show help and usage instructions",
        "status": "(Admin) View bot details and current workload",
    }
    return [
        Object.entries(command_descriptions).map(([command, description]) => {
            return { command, description }
        }),
        Object.keys(command_descriptions)
    ]
}
export const commands = {
    start: (client, user, event) => {
        client.sendMessage(event.chatId, {
            message: cmd("welcome").replace("${user_name}",user?.firstName),
                    buttons: client.buildReplyMarkup([
                        [
                            Button.url("GitHub", "https://github.com/codxvenu/filetolink" ),
                            Button.url("DevelopedBy","tg://resolve?domain=nocash_xD")
                        ],
                        [
                            Button.inline("/help",Buffer.from("help"))
                        ]
                    ])
                })
            },
            
    help: (client, user, event) => {
        client.sendMessage(event.chatId, { message: cmd("help") ,parseMode: "html"})
    },
    about: (client, user, event) => {
        client.sendMessage(event.chatId, { message: cmd("about"),parseMode: "html"})
    }
}