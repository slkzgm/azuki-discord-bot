# Azuki-Market-Discord-Bot

## Description

Introducing an advanced Discord bot designed to send alerts for Azuki listings and sales events. It leverages the power of the Blur websocket, supplementing events with additional details such as Green and Mystery Beans claim status, and metadata.

This enhanced websocket is sourced from the Blur websocket (since the Reservoir websocket is exclusive to paid plans). It enriches the event data with valuable information before broadcasting it to a new websocket and a Discord bot.

## Installation

1. Clone the repository
`git clone https://github.com/slkzgm/azuki-market-discord-bot.git`

2. Navigate to the project directory
`cd azuki-market-discord-bot`

3. Install the required dependencies
`npm install`

4. Copy the .env.example file to a new file named .env and fill out the required information
`cp .env.example .env`

5. Edit the /lib/discord/config.json file with your informations


## Usage

Run the following command to start the bot:
`node index.js`


## Future Enhancements

- Separate Logic Layers: Initially, the enhanced websocket was the sole focus. However, recognizing the need for immediate applicability, a Discord bot was integrated. The plan is to separate these two components, or at least provide the option to run the websocket independently from the Discord bot.

- Enhance Discord Bot Functionality: The aim is to expand the bot's capabilities so it can distribute messages across multiple channels – this includes channels for sales, listings, traits, unclaimed green beans, and more.

- Strengthen Websocket: Future updates will focus on enhancing the robustness of the websocket for improved performance and reliability.

## Contributing

We appreciate any contribution to Azuki-Market-Discord-Bot.

## License

This project is licensed under the [MIT license](LICENSE).
