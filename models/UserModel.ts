import mongoose,{Document,Model,Schema,Types} from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Address } from "./address.model";
import { NextFunction } from "express";

require('dotenv').config();
const EmailRegex:RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


//address

export interface IUser extends Document{
    firstname:string,
    lastname:string,
    email:string,
    password:string,
    avatar:{
        public_id:string;
        url:string
    },
    PhoneNumber:Number;
    role:string
    isVerfied:boolean;
    addresses: Types.ObjectId[],   //multiple Address
    wishlist:[{ type: Schema.Types.ObjectId, ref: "Product" }]
    Orders:Array<{OrdersId:string}>;
    comparePassword :(password  :string)=>Promise<boolean>;
    SignAccessToken:()=>string;
    SignRefreshToken:()=>string;


};

const UserSchema:Schema<IUser> = new mongoose.Schema({
   firstname:{
    type:String,
    required:[true,"Please Enter Your First Name"]
   },
   lastname:{
    type:String,
    required:[true,"Please Enter Your Last Name"]
   },
   email:{
    type:String,
    required:[true,"Please Enter Your email"],
    validate:{
        validator:function(value:string){
            return EmailRegex.test(value)
        },
        message:"Please Enter A Valid unique"
    },
    unique:true,
   },
password:{
    type:String,
    required:[true,"Please Enter Your Password"],
    minlength:[6,"Password Must Be 6 Characters"],
    select:false
},
avatar:{
    public_id:String,
    url:String
},
role:{
    type:String,
    default:"user",
    enum:["user","admin","wherehouse","dealer"]
},
PhoneNumber:{
    type:Number,
    required:[true,"Phone Number Is Required"]
},
isVerfied:{
    type:Boolean,
    default:false
},
Orders:[{
    OrdersId:String,
}],
addresses: [{ type: Schema.Types.ObjectId, ref: "Address" }],



},{timestamps:true})



// 🛑 Cascade Delete Addresses when User is Deleted
UserSchema.pre<IUser>('deleteMany', { document: true, query: true }, async function (this: IUser, next: mongoose.CallbackWithoutResultAndOptionalError) {
    await Address.deleteMany({ userId: this._id });
    next();
  });
  
//HashPassword before Saving

UserSchema.pre<IUser>('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
    next();
})





UserSchema.methods.SignAccessToken = function(){

    
    return jwt.sign({id:this._id},process.env.ACCESS_TOKEN || '',{
        expiresIn:'5m'
    });
}

//Login Refresh Token

UserSchema.methods.SignRefreshToken = function(){
    return jwt.sign({id:this._id},process.env.REFRESH_TOKEN || '',{
        expiresIn:'10d'
    });

}

//compare Password

UserSchema.methods.comparePassword = async function(EnetredPassword:string):Promise<boolean>{
    return await bcrypt.compare(EnetredPassword,this.password)
}

const UserModel:Model<IUser> = mongoose.model("User",UserSchema)

export default UserModel;

//login access Token
