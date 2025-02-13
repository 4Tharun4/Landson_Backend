//get user by id
import { Response,Request,NextFunction } from "express"
import { redis } from "../utils/redis"

export const getuserbyid = async(id:string,res:Response,) =>{
    const userjson = await  redis.get(id);
if(userjson){
    const user = JSON.parse(userjson)
    res.status(200).json({
        sucess:true,
        user
    })
}
   
}