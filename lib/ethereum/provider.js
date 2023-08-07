import dotenv from 'dotenv';
dotenv.config();
import { JsonRpcProvider } from 'ethers';

export const provider = new JsonRpcProvider(process.env.ETHEREUM_PROVIDER);