const start = Date.now()
require('dotenv').config()
const { BOT_TOKEN, TTS, PINGS_CATEGORY_ID, INTERVAL } = process.env
const { Client, TextChannel, WebhookClient, Collection } = require('discord.js')
const Webhooks = new Collection()
let created = 0
const client = new Client({
    apiRequestMethod: 'sequential',
    messageCacheMaxSize: 1,
    messageSweepInterval: 5,
    restWsBridgeTimeout: 300000,
    restTimeOffset: 30000
});
const TEXT = require('fs').readFileSync(__dirname + "/message.txt", "utf8")
client.once('ready', async _ => {
    console.log("Logged in as " + client.user.tag)
    console.log("Fetching webhook data.")
    client.channels.cache.get(PINGS_CATEGORY_ID).children
        .forEach(channel => {
            if (channel instanceof TextChannel) {
                channel
                    .fetchWebhooks()
                    .then(hooks => {
                        hooks.forEach(hook => {
                            Webhooks.set(hook.id, new WebhookClient(hook.id, hook.token))
                            console.log(`Total ${Webhooks.size}, Fetched ${Webhooks.size - created}, Created ${created}`)
                            if (Webhooks.size === client.channels.cache.get(PINGS_CATEGORY_ID).children.size * 10) {
                                const t = Date.now() - start
                                console.log("Time elasped: " + t + "ms")
                                console.log("Ready!")
                            }
                        })
                        if (hooks.size < 10) {
                            for (let i = 0; i < (10 - hooks.size); i++) {
                                channel
                                    .createWebhook(client.user.username, { avatar: client.user.displayAvatarURL({ dynamic: true }) })
                                    .then(hook => {
                                        created++
                                        Webhooks.set(hook.id, new WebhookClient(hook.id, hook.token))
                                        console.log(`Total ${Webhooks.size}, Fetched ${Webhooks.size - created}, Created ${created}`)
                                        if (Webhooks.size === client.channels.cache.get(PINGS_CATEGORY_ID).children.size * 10) {
                                            const t = Date.now() - start
                                            console.log("Time elasped: " + t + "ms")
                                            console.log("Ready!")
                                        }
                                    })
                                    .catch(console.error)
                            }
                        }
                    }).catch(console.error)
            }
        })
    setInterval(function () {
        Webhooks.forEach(hook => {
            hook.send(TEXT, { 
                tts: TTS,
                avatarURL: client.user.displayAvatarURL({ dynamic: true }), 
                username: client.user.username 
            })
        })
    }, INTERVAL)
})
client.login(BOT_TOKEN)