import {Redis} from 'ioredis'
require('dotenv').config();

const Redisclient =()=>{
    if(process.env.REDIS_URL){
        console.log(`Connected With Redis `);
        return process.env.REDIS_URL
        
    }
    throw new Error("Redis Connection Failed")
}

export const redis = new Redis(Redisclient())