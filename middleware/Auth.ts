import { Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "./CatchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import jwt from 'jsonwebtoken'
import { redis } from "../utils/redis";

export const isAuthenticate = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    const Access_Token = req.cookies.Access_Token;
    if(!Access_Token){
        return next(new ErrorHandler("Please Login ",400));
    }
    const decoded = jwt.verify(Access_Token,process.env.ACCESS_TOKEN as string)

    if(!decoded){
        return next(new ErrorHandler("Access Token is Invalid",400));
    }

    if (typeof decoded === 'string' || !decoded.id) {
        return next(new ErrorHandler("Access Token is Invalid",400));
    }

 const user = await redis.get(decoded.id);

 
 if(!user){
    return next(new ErrorHandler("Invalid User",400));
 };
 req.user = JSON.parse(user);
 next();
})



//Validate Roles

export const AuthorizedRoles = (...roles:string[])=>{
    return (req:Request,res:Response,next:NextFunction)=>{
if(!roles.includes(req.user?.role||'')){

    
    return next(new ErrorHandler(`Role:${req.user?.role} is not allowed to access this Resource`,403))
}
next();
    }
}