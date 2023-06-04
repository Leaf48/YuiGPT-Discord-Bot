import "discord.js"
import { Client, GatewayIntentBits, Message, Partials } from "discord.js";
import { joinVoiceChannel, VoiceConnection, EndBehaviorType, createAudioPlayer, NoSubscriberBehavior, createAudioResource, StreamType, entersState, AudioPlayerStatus} from '@discordjs/voice'
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import {pipeline} from "stream"
import { OggLogicalBitstream, OpusHead } from "prism-media/dist/opus";
import {Configuration, OpenAIApi} from "openai"
import axios from "axios"
import FormData from "form-data"

require("dotenv").config()
require("dotenv").config({path: ".env.development", override: true})

const configuration = new Configuration({
    apiKey: process.env.openai
})
const openAI = new OpenAIApi(configuration)


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
    const username = msg.member?.nickname ? msg.member.nickname : msg.author.username

    if (userMsg == "!record" && userVc){
        const connection = joinVoiceChannel({
            adapterCreator: userVc.guild.voiceAdapterCreator,
            channelId: userVc.id,
            guildId: msg.member.guild.id,
            selfDeaf: false,
            selfMute: false
        })

        const receiver = connection.receiver

        // notification(connection)
        await respond(userId, connection, msg, username)

        // await record(userId, connection)
        //     .then(() => {
        //         const output = `./recordings/${userId}.mp3`
        //         var outStream = fs.createWriteStream(output)

        //         convert2mp3(userId, outStream)
        //             .then(() => {
        //                 getAudioTranscription(userId)
        //                     .then(text => {
        //                         console.log("Original", text)

        //                         getCompletion(text)
        //                             .then(ans => {
        //                                 console.log("Answer", ans)
        //                                 msg.channel.send({
        //                                     content: ans,
        //                                     tts: true
        //                                 })
        //                             })

        //                     })
        //                     .catch(err => {
        //                         console.log(err)
        //                     })
        //             })
        //             .catch(err => {
        //                 console.log(err)
        //             })
        //     })
        //     .catch(err => {
        //         console.log(err)
        //     })
    }

})

async function respond(userId: string, connection: VoiceConnection, msg: Message, username: string){
    await record(userId, connection)
            .then(() => {
                const output = `./recordings/${userId}.mp3`
                var outStream = fs.createWriteStream(output)

                convert2mp3(userId, outStream)
                    .then(() => {
                        getAudioTranscription(userId)
                            .then(text => {
                                console.log("Original", text)

                                getCompletion(`${username}: ${text}`)
                                    .then(ans => {
                                        console.log("Answer", ans)

                                        const timeout = (0.2 * ans.length) * 1000
                                        console.log(timeout)
                                        msg.channel.send({
                                            content: ans,
                                            tts: true
                                        })
                                        setTimeout(() => {
                                            notification(connection)
                                            respond(userId, connection, msg, username)
                                        }, timeout)
                                    })

                            })
                            .catch(err => {
                                console.log(err)
                            })
                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
            .catch(err => {
                console.log(err)
            })
}

async function record(userId: string, connection: VoiceConnection): Promise<any>{
    const opusStream = connection.receiver.subscribe(userId, {
        end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 1500,
        }
    })

    
    const oggStream = new OggLogicalBitstream({
        opusHead: new OpusHead({
            channelCount: 2,
            sampleRate: 48000
        }),
        pageSizeControl: {
            maxPackets: 10
        }

    })

    const saveTo = `./recordings/${userId}` 
    const unprocessedFile = saveTo + ".pcm"
    const out = fs.createWriteStream(unprocessedFile, {flags: "a"})

    console.log(`🦻Yui is hearing!`)
    
    if (fs.existsSync(unprocessedFile)){
        fs.unlink(unprocessedFile, err => {
            console.log(err)
        })
    }

    return new Promise((resolve, reject) => {
        pipeline(opusStream, oggStream, out, (err) => {
            if (err){
                reject(err)
            }else{
                console.log("🫶Recorded!")
                resolve("")
            }
        })
    })
}

async function convert2mp3(userId: string, output: fs.WriteStream): Promise<any>{
    const filename = `./recordings/${userId}.pcm`

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(filename)
            .audioQuality(96)
            .toFormat("mp3")
            .on("end", () => {
                resolve("")
            })
            .on("error", err => {
                reject(err)
            })
            .pipe(output, {end: true})
    })
}

async function getAudioTranscription(userId: string): Promise<string>{

    const mp3 = `./recordings/${userId}.mp3`

    const form = new FormData()

    form.append("file", fs.createReadStream(mp3))
    form.append("model", "whisper-1")

    const headers = {
        ...form.getHeaders(),
        "Authorization": `Bearer ${process.env.openai}`
    }

    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, { headers })
            resolve(response.data.text)
        } catch (err) {
            reject(err)
        }
    })
}

async function notification(connection: VoiceConnection){
    const sound = "./sounds/tone.wav"

    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause
        }
    })

    connection.subscribe(player)
    
    const audioSrc = createAudioResource(sound, {
        inputType: StreamType.Arbitrary
    })
    await player.play(audioSrc)
    await entersState(player, AudioPlayerStatus.Playing, 10 * 1000)
    await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000)
}

let talkHistory = new Array<string>
async function getCompletion(prompt: string): Promise<string> {
    console.log(talkHistory)

    const result = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": `あなたはプロのプログラマーです`
            },
            {
                "role": "user",
                "content": `
                ${talkHistory.join("\n")}
                ${prompt}
                `
            }
        ]
    })
    const res = String(result.data.choices[0].message?.content)
    if (talkHistory.length > 5){
        talkHistory.shift()
    }
    talkHistory.push(res)
    talkHistory.push(prompt)


    return res
}

client.login(process.env.token)