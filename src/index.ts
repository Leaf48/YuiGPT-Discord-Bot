import "discord.js"
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { joinVoiceChannel} from '@discordjs/voice'
import Voice from "./Voiceroid";

require("dotenv").config()
require("dotenv").config({path: ".env.development", override: true})


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction,
    ]
})

client.once("ready", () => {
    console.log("🔨Yui is working!")
})

client.on("messageCreate", async msg => {
    const userMsg: string = msg.content
    const userVc = msg.member?.voice.channel
    const userId = msg.author.id

    if (userMsg == "!record" && userVc){
        const connection = joinVoiceChannel({
            adapterCreator: userVc.guild.voiceAdapterCreator,
            channelId: userVc.id,
            guildId: msg.member.guild.id,
            selfDeaf: false,
            selfMute: false
        })

        const yui = new Voice("./recordings", userId, connection, msg)
        yui.responder()
    }

})

client.login(process.env.token)