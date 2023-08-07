import greenBeanContract from './contracts/greenBeanContract.js';
import mysteryBeanContract from './contracts/mysteryBeanContract.js';
import {createHelia} from "helia";
import {unixfs} from "@helia/unixfs";

const IPFS_BASE_CAD = 'QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4/'
let helia, fs, decoder;
export let ready = false;

export async function prepareIpfsNode() {
    try {
        helia = await createHelia()
        fs = unixfs(helia)
        decoder = new TextDecoder()
        console.log('IPFS node ready.');
        ready = true;
    } catch (e) {
        console.error(e);
    }
}

export async function getMetadata(tokenId) {
    try {
        const cad = IPFS_BASE_CAD + tokenId;
        let metadata = ''

        for await (const chunk of fs.cat(cad)) {
            metadata += decoder.decode(chunk, {
                stream: true
            })
        }
        return JSON.parse(metadata);
    } catch (e) {
        console.error(e);
    }
}

export async function greenBeanCheck(tokenId) {
    try {
        return (await greenBeanContract.getCanClaims([tokenId]))[0];
    } catch (e) {
        console.error(e);
    }
}

export async function mysteryBeanCheck(tokenId) {
    try {
        return (await mysteryBeanContract.getCanClaims([tokenId]))[0];
    } catch (e) {
        console.error(e);
    }
}