require('dotenv').config()
const WebSocket = require('ws');
const {getMetadata, greenBeanCheck, mysteryBeanCheck} = require("./lib/ethereum/azukiLib");
const DiscordClient = require("./lib/discord/discordClient");
const {createSaleEmbedMsg, createListingEmbedMsg} = require("./lib/discord/utils");

// ENHANCED WEBSOCKET \\
const webSocketServer = new WebSocket.Server({ port: process.env.ENHANCED_WS_PORT });

webSocketServer.on('connection', ws => {
    console.log('Enhanced websocket connected');
    ws.on('close', () => {
        console.log('Enhanced websocket disconnected');
    })
});

webSocketServer.on('error', error => {
    console.error(`Error starting enhanced websocket: ${error}`);
});
//--------------------\\


// BLUR ACTIVITY WEBSOCKET \\
const BLUR_WS = process.env.BLUR_WEBSOCKET;

// UTILS
const parseBuffer = (buffer) => {
    const bufferString = buffer.toString();
    const code = parseInt(bufferString);
    const arr = bufferString.indexOf('[');
    const obj = bufferString.indexOf('{');
    const firstChar = (arr === -1 || obj === -1) ?
        Math.max(arr, obj)
        : Math.min(arr, obj);
    const parsed = JSON.parse(bufferString.slice(firstChar));

    return {
        code,
        event: parsed[1] ? parsed[0] : 'unknown',
        payload: parsed[1] ? parsed[1] : parsed
    }
}

// WEBSOCKET SUBSCRIPTION RETRY
const MAX_RETRIES = 20;
const RETRY_DELAY = 1000;

let subscriptionRetryCount = 0;
let retryTimeout;

async function subscribe(ws) {
    if (subscriptionRetryCount < MAX_RETRIES) {
        ws.send('4261["subscribe",["0xed5af388653567af2f388e6224dc7c4b3241c544.feeds.activity.eventsCreated"]]');
        subscriptionRetryCount++;

        retryTimeout = setTimeout(async () => {
            console.log('Retrying subscription...')
            await subscribe(ws);
        }, RETRY_DELAY);
    } else {
        console.log("Maximum subscription retries amount has been reached.");
        webSocketServer.close();
    }
}

async function handleSaleEvent(item) {
    const {tokenId, marketplace, price, fromAddress, toAddress, canClaimGreen, canClaimMystery, metadata} = item;

    try {
        const embedMsg = createSaleEmbedMsg({
            tokenId,
            marketplace,
            price,
            buyer: toAddress,
            seller: fromAddress,
            canClaimGreen,
            canClaimMystery,
            metadata
        });

        const {base, sales} = DiscordClient.getChannel();

        if (base) {
            base.send({embeds: [embedMsg]});
        }

        if (sales) {
            sales.send({embeds: [embedMsg]});
        }

        webSocketServer.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(item));
            }
        })

        console.log(`${JSON.stringify(item)} sold`);
    } catch (e) {
        console.error(e);
    }
}

async function handleOrderCreatedEvent(item) {
    const {tokenId, marketplace, price, fromAddress, toAddress, canClaimGreen, canClaimMystery, metadata} = item;

    try {
        const embedMsg = createListingEmbedMsg({
            tokenId,
            marketplace,
            price,
            buyer: toAddress,
            seller: fromAddress,
            canClaimGreen,
            canClaimMystery,
            metadata
        });

        const {base, listings, greenBeans, mysteryBeans} = DiscordClient.getChannel();

        if (base) {
            base.send({embeds: [embedMsg]});
        }

        if (listings) {
            listings.send({embeds: [embedMsg]});
        }

        if (greenBeans && canClaimGreen) {
            greenBeans.send({embeds: [embedMsg]});
        }

        if (mysteryBeans && canClaimMystery) {
            mysteryBeans.send({embeds: [embedMsg]});
        }

        webSocketServer.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(item));
            }
        })

        console.log(`${JSON.stringify(item)} listed`);
    } catch (e) {
        console.error(e);
    }
}

async function handleAzukiEventCreated(payload) {
    payload.items.map(async (item) => {
        const [canClaimGreen, canClaimMystery, metadata] = await Promise.all([
            greenBeanCheck(item.tokenId),
            mysteryBeanCheck(item.tokenId),
            getMetadata(item.tokenId)
        ]);

        item.canClaimGreen = canClaimGreen;
        item.canClaimMystery = canClaimMystery;
        item.metadata = metadata;
        switch (item.eventType) {
            case 'SALE':
                await handleSaleEvent(item);
                break;
            case 'ORDER_CREATED':
                await handleOrderCreatedEvent(item);
                break;
            default:
                console.error('UNKNOWN EVENT_TYPE');
                break;
        }
    });
}

async function handleFortyTwo(fortyTwoEvent) {
    switch (fortyTwoEvent.event) {
        case 'unknown':
            console.error('Unknown event code 42');
            break;
        case '0xed5af388653567af2f388e6224dc7c4b3241c544.feeds.activity.eventsCreated':
            console.log('New event on Azuki collection:');
            await handleAzukiEventCreated(fortyTwoEvent.payload);
            break;
    }
}

const connect = async () => {
    try {
        // handle websocket stream
        const ws = new WebSocket(BLUR_WS);

        // prepare discord client
        if (!DiscordClient.isReady()) {
            console.log('Initiating discord client...');
            await DiscordClient.readyPromise();
            if (DiscordClient.isReady()) {
                console.log('Discord client is ready.');
            } else {
                console.log('Error initiating discord client.');
            }
        }

        ws.on('error', (err) => {
            console.error(err)
        });

        ws.on('open', async () => {
            console.log('Connected');
            ws.send(40);
            console.log('Subscribing to the activity feed...');
            await subscribe(ws);
        });

        ws.on('message', async (data) => {
            const event = parseBuffer(data);

            // check for subscription success
            if (event.event === 'subscribed') {
                console.log('Successfully subscribed!');
                clearTimeout(retryTimeout);
                subscriptionRetryCount = 0;
            }

            switch (event.code) {
                // PONG
                case 2:
                    ws.send(3);
                    break;
                // EVENT
                case 42:
                    await handleFortyTwo(event);
                    break;
                default:
                    return;
            }
        })

        ws.on('close', (code, reason) => {
            console.log(`Websocket closed with code ${code} and reason: ${reason}`);

            console.log('Reconnecting...');
            setTimeout(() => {
                connect();
            }, 1000);
        });
    } catch (e) {console.log(JSON.stringify(e))}
}
//-------------------------\\

connect();