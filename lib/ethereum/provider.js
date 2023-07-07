require('dotenv').config()
const ethers = require('ethers');

const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_PROVIDER);

module.exports = provider;