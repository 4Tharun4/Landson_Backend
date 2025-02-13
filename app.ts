import express,{NextFunction, Request,Response}  from "express";

require('dotenv').config();
export const app = express();
import cors from 'cors'
import cookieParser from "cookie-parser";
import { ErrorMiddleWare } from "./middleware/Error";
import userouter from "./routes/user.routes";
//body parser
app.use(express.json({limit:"50mb"}));
//cookie Parser
app.use(cookieParser());
//cors
app.use(cors({
  origin: "http://localhost:3000", // ✅ Correct: No trailing slash
  credentials: true, // ✅ Allow cookies & authentication headers
}));


//testing route
app.get("/",(req:Request,res:Response,next:NextFunction)=>{
  res.status(200).json({
    success:true,
    message:"API is Working"
  })
})

app.use("/api/v1",userouter)

app.all("*",(req:Request,res:Response,next:NextFunction)=>{
    const err = new Error(`Route ${req.originalUrl} Not Found `) as any
    err.statuscode = 404;
    next(err)
})

//ErrorHandler
app.use(ErrorMiddleWare)