import express from 'express'
import { RegistractionUser,ActivateUser,LoginUser, LogoutUser, updateUserInfo, UpdateAccessToken, getuserinfo, UpdatePassword, AddAddress, DeleteAddress } from '../controllers/user.controller'
import { AuthorizedRoles, isAuthenticate } from '../middleware/Auth';
import { ImageUploadroute } from '../models/Image';
import upload from '../service/s3';
const userrouter = express.Router();

userrouter.post("/register",RegistractionUser)
userrouter.post("/user-activation",ActivateUser)
userrouter.post("/login",LoginUser)
userrouter.get("/logout",isAuthenticate,LogoutUser)
userrouter.put("/update-userinfo",isAuthenticate,updateUserInfo)
userrouter.get("/refreshtoken",UpdateAccessToken);
userrouter.get("/me",isAuthenticate,getuserinfo);
userrouter.put("/update-password",isAuthenticate,UpdatePassword);
userrouter.post('/add-address',isAuthenticate,AddAddress)
userrouter.delete('/delete-address/:addressId',isAuthenticate,DeleteAddress)
// userrouter.post(
//     "/upload",
//     upload.array("images", 5), // Middleware to handle file uploads
//     async (req, res): Promise<void> => {
//       try {
//         if (!req.files || (req.files as Express.MulterS3.File[]).length === 0) {
//           res.status(400).json({ message: "No files uploaded" });
//           return;
//         }
  
//         const files = req.files as Express.MulterS3.File[];
//         const imageUrls = files.map((file) => file.location);
//   console.log(imageUrls);
  
//         res.json({ success: true, imageUrls });
//       } catch (error) {
//         console.error("Upload error:", error);
//         res.status(500).json({ message: "File upload failed" });
//       }
//     }
//   );
export default userrouter;