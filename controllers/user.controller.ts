import express, { Request, Response, NextFunction } from "express";
import UserModel, { IUser } from "../models/UserModel";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import path from "path";
import ejs from "ejs";
import SendMail from "../utils/Send.Mail";
import { AccessTokenOptions, RefreshTokenOptions, SentToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getuserbyid } from "../service/userservice";
import { IAddress } from "../@types/custom";
import { log } from "console";
import { Address } from "../models/address.model";
require("dotenv").config();
//Register User

interface Register {
  firstname: string;
  lastname: string;
  password: string;
  PhoneNumber: Number;
  email: string;
  avatar?: string;
}

export const RegistractionUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstname, lastname, password, PhoneNumber, email, avatar } =
        req.body as Register;

      const EmailExists = await UserModel.findOne({ email });
      if (EmailExists) {
        return next(new ErrorHandler("Email Alrady Exists", 409));
      }
      const user: Register = {
        firstname,
        lastname,
        email,
        password,
        PhoneNumber,
      };

      const ActivationToken = CreateActivationToken(user);

      const ActivationCode = ActivationToken.Activationcode;

      const data = { user: { name: user.firstname }, ActivationCode };

      const html = await ejs.renderFile(
        path.join(__dirname, "../Email/Activation.Email.ejs"),
        data
      );

      try {
        await SendMail({
          email: user.email,
          subject: "Activate Your Account",
          template: "Activation.Email.ejs",
          data,
        });

        return res.status(201).json({
          success: true,
          message: `Please Check your Email ${user.email} to code`,
          ActivationToken: ActivationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationToken {
  token: string;
  Activationcode: string;
}

export const CreateActivationToken = (user: any): IActivationToken => {
  const Activationcode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      Activationcode,
    },
    process.env.ACTIVACTION_SECRECT as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, Activationcode };
};

//Account Activation

interface IActivationRequest {
  ActivationToken: string;
  ActivationCode: string;
}

export const ActivateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ActivationToken, ActivationCode } =
        req.body as IActivationRequest;
      
        
      const newuser: { user: IUser; Activationcode: string } = jwt.verify(
        ActivationToken,
        process.env.ACTIVACTION_SECRECT as string
      ) as { user: IUser; Activationcode: string };

      if (newuser.Activationcode !== ActivationCode) {
        return next(new ErrorHandler("Invalid Activation Code", 400));
      }

      const { email, password, firstname, lastname, PhoneNumber } =
        newuser.user;
      const existuser = await UserModel.findOne({ email });
      if (existuser) {
        return next(new ErrorHandler("Email Already Exists", 409));
      }

      const user = UserModel.create({
        firstname,
        lastname,
        password,
        email,
        PhoneNumber,
      });
      res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//login Feature

interface Login {
  email: string;
  password: string;
}
export const LoginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as Login;

      if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email And Password  ", 400));
      }

      const user = await UserModel.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Email Does Not Exists", 400));
      }
      const comparePasswords = await user.comparePassword(password);
      if (!comparePasswords) {
        return next(new ErrorHandler("Incorrect Password", 400));
      }
      SentToken(user, 200, res);
    } catch (error: any) {
      console.log(error.message);

      return next(new ErrorHandler("Something Went Worng", 500));
    }
  }
);

//Logout User Feature

export const LogoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Clear cookies properly
      res.clearCookie("Access_Token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      res.clearCookie("Refresh_Token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      const user = req.user?._id?.toString() || "";

      if (user) {
        redis.del(user);
      }
      res.status(200).json({
        success: true,
        message: "Logout Successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update AccessToken
export const UpdateAccessToken = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const Refresh_Token = req.cookies.Refresh_Token as string
        const decode = jwt.verify(Refresh_Token,process.env.REFRESH_TOKEN as string) as JwtPayload
        const message = 'Could Not Refresh token'
        if(!decode){
            return next(new ErrorHandler(message, 400));
        }
        const session = await redis.get(decode.id as string);
        if(!session){
            return next(new ErrorHandler(message, 400));
        }
        const user = JSON.parse(session);
        const Access_Token = jwt.sign({id:user._id},process.env.ACCESS_TOKEN as string,{
            expiresIn:'5m'
        });
        const new_Refresh_Token = jwt.sign({id:user._id},process.env.REFRESH_TOKEN as string,{
            expiresIn:'10d'
        });

        req.user= user;

        res.cookie("Access_Token",Access_Token,AccessTokenOptions);
        res.cookie("Refresh_Token",new_Refresh_Token,RefreshTokenOptions);

        res.status(200).json({
            status:"sucess",
            Access_Token
        })
     
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

//get user

export const getuserinfo = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
try {
    const userid = req.user?._id as string;
    getuserbyid(userid, res);
} catch (error:any) {
    return next(new ErrorHandler(error.message, 400));
}
})
//update

interface updateuserinfo {
  firstname?: string;
  email?: string;
  lastname?: string;
  PhoneNumber?: number;
}

// export const updateuserinfo = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
// try {
//     const {email,firstname,lastname,PhoneNumber} = req.body as updateuserinfo

//     const userid = req.user?._id;
//     const user = await UserModel.findById(userid);

//     if(email){
//         const emailexists = await UserModel.findOne({email});
//         if(emailexists){
//          return next(new ErrorHandler("Email Already Exists", 403));
//         }
//         if (user) {
//             user.email = email;
//         } else {
//             return next(new ErrorHandler("User not found", 404));
//         }

//     }

// } catch (error:any) {
//     return next(new ErrorHandler(error.message, 400));
// }
// })
export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, firstname, lastname, PhoneNumber } =
        req.body as updateuserinfo;

      // Get user from request (assuming authentication middleware sets `req.user`)
      const userId = req.user?._id;
      const user = await UserModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Check if email exists and is not the current user's email
      if (email && email !== user.email) {
        const emailExists = await UserModel.findOne({ email });
        if (emailExists) {
          return next(new ErrorHandler("Email already exists", 403));
        }
        user.email = email;
      }

      // Check if phone number exists and is not the current user's phone number
      if (PhoneNumber && PhoneNumber !== user.PhoneNumber) {
        const phoneExists = await UserModel.findOne({ PhoneNumber });
        if (phoneExists) {
          return next(new ErrorHandler("Phone number already exists", 403));
        }
        user.PhoneNumber = PhoneNumber;
      }

      // Update other fields if provided
      if (firstname) user.firstname = firstname;
      if (lastname) user.lastname = lastname;

      // Save updated user
      await user.save();

      await redis.set(userId as string, JSON.stringify(user));

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update password

interface UpdatePassword{
    oldpassword:string;
    newpassword:string
}

export const UpdatePassword = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {oldpassword,newpassword} = req.body as UpdatePassword;


        const user = await UserModel.findById(req.user?._id).select('+password')
  

        if(user?.password === undefined){
            return next(new ErrorHandler("invalid Password", 400));
        }
        const ispasswordmatch = await user?.comparePassword(oldpassword);
        if(!ispasswordmatch){
            return next(new ErrorHandler("invalid Password", 400));
        } 
user.password = newpassword;
await user.save();
await redis.set(req.user?._id as string,JSON.stringify(user));
res.status(201).json({
    message:true,
    user
})
        
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
})

//updat profile picure

//addaddress

// export const AddAddress = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
//   try {
//     const {label,country,state,street,zip,isDefault,city} = req.body as IAddress
//     const user = await UserModel.findById(req.user?._id);
//    ` // if(!label || city|| country|| state|| street|| zip|| isDefault|| city){
//     //   return next(new ErrorHandler("All fields Are Require", 400));
//     // }`
//     const AddAddres = await Address.create({
//      label,state,country,street,zip,isDefault,city,userId:user?.id
//     })
//     res.status(200).json({
//       sucess:true,
//       AddAddres
//     })
//     await AddAddres.save();
//   } catch (error:any) {
//     return next(new ErrorHandler(error.message, 400));
//   }
// })

export const AddAddress = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, fullName, phoneNumber, street, city, state, country, postalCode, isDefault } = req.body;

    // Ensure user exists
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Create new address
    const newAddress = await Address.create({ user: userId, fullName, phoneNumber, street, city, state, country, postalCode, isDefault });

    // Push the new address into user's addresses array
    user.addresses.push(newAddress._id);
    await user.save();
await redis.set(req.user?._id as string,JSON.stringify(user))
    return res.status(201).json({ success: true, address: newAddress });
  } catch (error:any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

//delete and address

export const DeleteAddress = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { addressId } = req.params;

    // ✅ Check if the address exists
    const address = await Address.findById(addressId);
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });

    // ✅ Remove the address from the User's address list
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.user?._id,
        { $pull: { addresses: addressId } },
        { new: true } // Returns updated user
      );

    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Delete the address (fixing the incorrect deletion)
    await Address.findByIdAndDelete(addressId);

    // ✅ Clear only the addresses cache for this user
    await redis.del(`user:${req.user?._id}:addresses`);
    console.log(`Cache cleared for user:${req.user?._id}:addresses`);

    return res.status(200).json({ success: true, message: "Address deleted successfully" });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

