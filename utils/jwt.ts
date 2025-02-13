require('dotenv').config();
import  {  Response } from "express";
import { IUser } from "../models/UserModel";
import { redis } from "./redis";

interface ITokenOptions{
    expires:Date;
    maxAge:number;
    httpOnly:boolean;
    sameSite:'lax' | 'strict' | 'none' | undefined;
    secure?:boolean
}



 const AccessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300',10);
 const RefreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200',10);

 //options cookies

 export const AccessTokenOptions:ITokenOptions={
expires:new Date(Date.now() +  AccessTokenExpire *60*60*1000),
maxAge:AccessTokenExpire *60*60*1000,
httpOnly:true,
sameSite:"lax",
secure:true
 };

 //refresh token options
export const RefreshTokenOptions:ITokenOptions={
    expires:new Date(Date.now() +  RefreshTokenExpire*24*60*60*1000),
    maxAge:RefreshTokenExpire*24*60*60 *1000,
    httpOnly:true,
    sameSite:"lax",
    secure:true
     };




export const SentToken = (user:IUser,statusCode:number,res:Response)=>{
   
    
    const access_token = user.SignAccessToken();
    const Refresh_token = user.SignRefreshToken();


    //upload Session to redis
    redis.set(user._id as string, JSON.stringify(user) as any)

    //parse env to integrates with fallback value
    
if(process.env.NODE_ENV === 'production'){
    AccessTokenOptions.secure = true;
}

     res.cookie("Access_Token",access_token,AccessTokenOptions);
     res.cookie("Refresh_Token",Refresh_token,RefreshTokenOptions);

     res.status(statusCode).json({
        success:true,
        user,
        access_token
     })
}