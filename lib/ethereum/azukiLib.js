const axios = require('axios');
const greenBeanContract = require("./contracts/greenBeanContract");
const mysteryBeanContract = require("./contracts/mysteryBeanContract");

const METADATA_BASE_URL = 'https://ipfs.io/ipfs/QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4/'

async function getMetadata(tokenId) {
    try {
        return (await axios.get(METADATA_BASE_URL + tokenId)).data;
    } catch (e) {
        console.error(e);
    }
}

async function greenBeanCheck(tokenId) {
    try {
        return (await greenBeanContract.getCanClaims([tokenId]))[0];
    } catch (e) {
        console.error(e);
    }
}

async function mysteryBeanCheck(tokenId) {
    try {
        return (await mysteryBeanContract.getCanClaims([tokenId]))[0];
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    getMetadata,
    greenBeanCheck,
    mysteryBeanCheck
}