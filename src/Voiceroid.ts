import "discord.js"
import { Message } from "discord.js";
import { VoiceConnection, EndBehaviorType, createAudioPlayer, NoSubscriberBehavior, createAudioResource, StreamType, entersState, AudioPlayerStatus} from '@discordjs/voice'
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import {pipeline} from "stream"
import { OggLogicalBitstream, OpusHead } from "prism-media/dist/opus";
import {Configuration, OpenAIApi} from "openai"
import FormData from "form-data"
import axios from "axios"
import {promisify} from "util"

require("dotenv").config()
require("dotenv").config({path: ".env.development", override: true})

const configuration = new Configuration({
    apiKey: process.env.openai
})
const openAI = new OpenAIApi(configuration)

export default class Voice{
    recordDir: string
    userId: string
    connection: VoiceConnection
    message: Message
    talkHistory: Array<any>

    constructor(recordDir: string, userId: string, connection: VoiceConnection, message: Message){
        // Directory that all recorded and converted file saved
        // E.g. ./recordings
        this.recordDir = recordDir
        // User id
        this.userId = userId
        // VoiceConnection
        this.connection = connection
        // Message
        this.message = message
        // Array to restore chats between user
        this.talkHistory = new Array<any>

        console.log("⏰Yui is waking up!")

    }

    async responder(speaker: number=14): Promise<boolean>{
        return new Promise(async (resolve, reject) => {
            try{
                await this.record(this.userId, this.connection)

                try{
                    await this.convert2mp3(this.userId)
                } catch (err) {
                    console.warn("convert", err)
                    reject()
                }

                const transcription = await this.getAudioTranscription(this.userId)
                    .catch(err => {
                        console.warn("transcription", err)
                        reject()
                        return ""
                    })

                console.log("💭Yui is thinking!")

                const response = await this.getCompletion(transcription)
                console.log("Original", transcription)
                console.log("Response", response) 

                const timeout = (0.225 * response.length)
                console.log(timeout)

                try{
                    await this.text2speech(this.userId, response, speaker)
                } catch (err) {
                    console.warn("speech", err)
                    reject()
                }

                await this.playSound(this.connection, `${this.recordDir}/${this.userId}-answer.wav`)

                this.message.channel.send({
                    content: response
                })

                console.log("🛏️Yui wants to take a nap!")

                setTimeout(() => {
                    this.playSound(this.connection, `./sounds/tone.wav`, 0.1)
                    setTimeout(() => {
                        this.responder()
                    }, 1000);
                }, timeout);


                this.deleteRecordedUserFile()

            } catch(err) {
                console.warn("record", err)
                reject()
            }

        })
    }

    // Start recording user voice
    async record(userId: string, connection: VoiceConnection): Promise<any>{

        // Create opus stream
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
    
        // Save directory and filename
        const saveTo = `${this.recordDir}/${userId}` 
        const unprocessedFile = saveTo + ".pcm"
        
        // Create stream / start recording
        const out = fs.createWriteStream(unprocessedFile, {flags: "a"})
    
        console.log(`🦻Yui is hearing!`)
    
        // Return Promise
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                pipeline(opusStream, oggStream, out, (err) => {
                    if (err){
                        reject(err)
                    }else{
                        console.log("🫶Recorded!")
                        resolve("")
                    }
                })
            }, 200);
        })
    }

    // Convert .pcm to .mp3
    async convert2mp3(userId: string): Promise<any>{
        const output = fs.createWriteStream(`${this.recordDir}/${userId}.mp3`)
        const filename = `${this.recordDir}/${userId}.pcm`
    
        return new Promise((resolve, reject) => {
            try{
                ffmpeg()
                    .input(filename)
                    .audioQuality(96)
                    .toFormat("mp3")
                    .on("end", () => {
                        resolve("")
                    })
                    .on("error", err => {
                        console.log("aaaa")
                        reject(err)
                    })
                    .pipe(output, {end: true})
    
            }catch(err){
                console.log("1111")
                reject(err)
            }
        })
    }

    // Send .mp3 to API and receive transcription
    async getAudioTranscription(userId: string): Promise<string>{

        const mp3 = `${this.recordDir}/${userId}.mp3`
    
        const form = new FormData()
    
        form.append("file", fs.createReadStream(mp3))
        form.append("model", "whisper-1")
    
        const headers = {
            ...form.getHeaders(),
            "Authorization": `Bearer ${process.env.openai}`
        }
    
        // Return transcription
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, { headers })
                resolve(response.data.text)
            } catch (err) {
                reject(err)
            }
        })
    }

    // get answer from chatGPT
    async getCompletion(prompt: string, verbose: boolean = false): Promise<string> {
        if (verbose) console.log(this.talkHistory)
    
        this.talkHistory.push({
            "role": "user",
            "content": prompt
        })
    
        const result = await openAI.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "system",
                    "content": process.env.character
                },
                ...this.talkHistory
            ]
        })
        const res = String(result.data.choices[0].message?.content)
        this.talkHistory.push({
            "role": "assistant",
            "content": res 
        })
        
    
        if (this.talkHistory.length > 5){
            this.talkHistory.shift()
        }
    
        return res
    }

    // Send text to Voicevox and get .mp3 data
    async text2speech(userId: string, text: string, speaker: number=14, endpoint: string="127.0.0.1:50021"): Promise<any>{
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
    
                await writeFile(`${this.recordDir}/${userId}-answer.wav`, synthesisResponse.data)
    
                resolve("")
            }catch(err){
                console.log(err)
                reject(err)
            }
        })
    }

    // Play sound
    async playSound(connection: VoiceConnection, sound_path: string, volume: number=1.0){
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            }
        })
    
        connection.subscribe(player)
        
        const audioSrc = createAudioResource(sound_path, {
            inputType: StreamType.Arbitrary,
            inlineVolume: true
        })
        audioSrc.volume?.setVolume(volume)
    
        player.play(audioSrc)
        await entersState(player, AudioPlayerStatus.Playing, 10 * 1000)
        await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000)
    }

    // Delete recoreded file
    async deleteRecordedUserFile(verbose: boolean=false){
        const saveTo = `${this.recordDir}/${this.userId}.pcm`
        if (fs.existsSync(saveTo)){
            fs.unlink(saveTo, err => {
                if (verbose) console.log("File deleting", err)
            })
        }
        console.log("🔨Yui managed to delete pcm file!")
    }
}