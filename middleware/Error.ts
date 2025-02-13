
import ErrorHandler from "../utils/ErrorHandler";
import { NextFunction, Request,Response } from "express";
export const ErrorMiddleWare =(err:any,req:Request,res:Response,next:NextFunction)=>{
    err.statusCode = err.statusCode || 500;
err.message = err.message || 'Internal Server Error'
//worng Db Id error
if(err.name === 'CastError'){
    const message = `Resource Not Found. Invalid:${err.path}`;
    err = new ErrorHandler(message,400);
}

//Duplicate 
if(err.code === 11000){
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
    err = new ErrorHandler(message,400)
}

//Wrong Jwt
if(err.name === 'JsonWebTokenError'){
    const message = `Json Web Token Is Invalid, try Again`
    err = new ErrorHandler(message,400)
}

//JWT Expiary
if(err.name === 'TokenExpiary'){
    const message = `Json Web Token Expiary, try Again`
    err = new ErrorHandler(message,400)
}

res.status(err.statusCode).json({
    success:false,
    message:err.message
})
}
