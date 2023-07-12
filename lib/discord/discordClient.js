require('dotenv').config()
const config = require('./config.json');
const {Client, GatewayIntentBits} = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let clientReady = false;
let channel = {};

const initializeClient = async () => {
    if (config.channelIds.baseChannel !==  '')
        channel.base = await getChannelById(config.channelIds.baseChannel);
    if (config.channelIds.listingsChannel !== '')
        channel.listings = await getChannelById(config.channelIds.listingsChannel);
    if (config.channelIds.salesChannel !== '')
        channel.sales = await getChannelById(config.channelIds.salesChannel);
    if (config.channelIds.greenBeanListingsChannel !== '')
        channel.greenBeans = await getChannelById(config.channelIds.greenBeanListingsChannel);
    if (config.channelIds.mysteryBeanListingsChannel !== '')
        channel.mysteryBeans = await getChannelById(config.channelIds.mysteryBeanListingsChannel);
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
