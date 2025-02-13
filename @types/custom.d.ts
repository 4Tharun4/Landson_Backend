import { Request } from "express";
import { IUser } from "../models/UserModel";
import { Types } from "mongoose";

declare global{
    namespace Express{
        interface Request{
            user?:IUser
        }
    }
}

export interface Iproductcategory extends Document{
    name:string,
    description?:string
    imageurl:string
}

interface IAddress extends Document {
    user: Types.ObjectId; // Reference to User
    fullName: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
  }