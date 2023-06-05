import "discord.js"
import { Client, GatewayIntentBits, Message, Partials } from "discord.js";
import { joinVoiceChannel, VoiceConnection, EndBehaviorType, createAudioPlayer, NoSubscriberBehavior, createAudioResource, StreamType, entersState, AudioPlayerStatus} from '@discordjs/voice'
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import {pipeline} from "stream"
import { OggLogicalBitstream, OpusHead } from "prism-media/dist/opus";
import {Configuration, OpenAIApi} from "openai"
import FormData from "form-data"
import axios, {AxiosResponse} from "axios"
import {promisify} from "util"

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
                                console.log("💭Yui is thinking!")

                                getCompletion(`${username}: ${text}`)
                                    .then(ans => {
                                        console.log("Original", text)
                                        console.log("Answer", ans)

                                        // const timeout = (0.2 * ans.length) * 1000
                                        const timeout = (0.25 * ans.length) * 1000
                                        console.log(timeout)

                                        text2speech(userId, ans, 47)
                                            .then(() => {
                                                notification(connection, `./recordings/${userId}-answer.wav`)
                                                msg.channel.send({
                                                    content: ans,
                                                    // tts: true
                                                })
                                                
                                                console.log("🛏️Yui wants to take a nap!")
                                                setTimeout(() => {
                                                    notification(connection, "./sounds/tone.wav")
                                                    setTimeout(() => {
                                                        respond(userId, connection, msg, username)
                                                    }, 1000)
                                                }, timeout)

                                            })

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

async function notification(connection: VoiceConnection, sound_path: string){
    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        }
    })

    connection.subscribe(player)
    
    const audioSrc = createAudioResource(sound_path, {
        inputType: StreamType.Arbitrary
    })
    if (sound_path.includes("tone.wav")){
        console.log("fdsafdsafsda")
        audioSrc.volume?.setVolume(0.1)
    }

    player.play(audioSrc)
    await entersState(player, AudioPlayerStatus.Playing, 10 * 1000)
    await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000)
}

async function text2speech(userId: string, text: string, speaker: number=14, endpoint: string="127.0.0.1:50021"): Promise<any>{
    const writeFile = promisify(fs.writeFile)
    
    return new Promise(async (resolve, reject) => {
        try{
            const audioQueryUrl = `http://${endpoint}/audio_query?text=${text}&speaker=${speaker}`
            const audioQueryHeaders = { 'accept': 'application/json' };

            const response = await axios.post(audioQueryUrl, { headers: audioQueryHeaders })

            const payload = response.data

            const synthesisUrl = `http://${endpoint}/synthesis?speaker=${speaker}&enable_interrogative_upspeak=true`
            const synthesisHeaders = {
                'accept': 'audio/wav',
                'Content-Type': 'application/json'
            };
            const synthesisResponse = await axios.post(synthesisUrl, payload, {headers: synthesisHeaders, responseType: 'arraybuffer'})

            await writeFile(`./recordings/${userId}-answer.wav`, synthesisResponse.data)

            resolve("")
        }catch(err){
            console.log(err)
            reject(err)
        }
    })
}


let talkHistory_array = new Array<any>
async function getCompletion(prompt: string): Promise<string> {
    console.log(talkHistory_array)

    talkHistory_array.push({
        "role": "user",
        "content": prompt
    })

    const result = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": ``
            },
            ...talkHistory_array
        ]
    })
    const res = String(result.data.choices[0].message?.content)
    talkHistory_array.push({
        "role": "system",
        "content": "system: " + res 
    })
    

    if (talkHistory_array.length > 5){
        talkHistory_array.shift()
    }

    return res
}

client.login(process.env.token)