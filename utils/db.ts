import mongoose from "mongoose";
require('dotenv').config();
const dburl:string = process.env.DATABASE_URL || "";


const dbconnect = async()=>{
    try {
        await mongoose.connect(dburl).then((data:any)=>{
            console.log(`Database Connnected With ${data.connection.host}` );
            
        })


    } catch (error:any) {
        console.log(error.message);
        setTimeout(dbconnect,5000)
    }
}

export default dbconnect