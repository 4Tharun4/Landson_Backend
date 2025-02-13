import { app } from "./app";
import dbconnect from "./utils/db";
require('dotenv').config();
//creating server
const PORT = process.env.PORT ;
app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
    dbconnect();
})

