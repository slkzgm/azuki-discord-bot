require('dotenv').config()
const config = require('./config.json');
const {Client, GatewayIntentBits} = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let clientReady = false;
let channel;

const initializeClient = async () => {
    channel = await getChannelById(config.channelIds.baseChannel);
    console.log('Client successfully initialized.');
}

const isReady = () => clientReady;

const readyPromise = () => new Promise((resolve) => {
    client.on('ready', async () => {
        console.log('Discord client logged.');
        await initializeClient();
        clientReady = true;
        resolve();
    });
});

client.login(process.env.DISCORD_TOKEN);

const getChannelById = async (id) => {
    return await client.channels.fetch(id);
};

const getChannel = () => channel;

module.exports = {
    client,
    getChannel,
    isReady,
    readyPromise,
};
