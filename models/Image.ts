import express, { Request, Response } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncError";
import upload from "../service/s3";


export const ImageUploadroute = CatchAsyncError(async (req: Request, res: Response) => {
	await upload.array("images", 5)(req, res, () => {
console.log(req.files);

        if (!req.files) {
            return res.status(400).json({ message: "No files uploaded" });
          }
       
          
          const files = req.files as Express.MulterS3.File[];

          const imageUrls = files.map(file => file.location);
        
          res.json({ success: true, imageUrls });
    });
})