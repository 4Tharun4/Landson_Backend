import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// ✅ Validate AWS Credentials
if (
  !process.env.AMAZON_S3_ACCESS_KEY ||
  !process.env.AMAZON_S3_SECRET_KEY ||
  !process.env.AMAZON_S3_AWS_REGION ||
  !process.env.AMAZON_S3_AWS_BUCKET_NAME
) {
  throw new Error("Missing required Amazon S3 environment variables.");
}

// ✅ Create S3 Client
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AMAZON_S3_ACCESS_KEY as string,
    secretAccessKey: process.env.AMAZON_S3_SECRET_KEY as string,
  },
  region: process.env.AMAZON_S3_AWS_REGION as string,
  forcePathStyle: false, // Required for AWS S3
});



// ✅ Configure Multer for S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AMAZON_S3_AWS_BUCKET_NAME as string,
    contentType: multerS3.AUTO_CONTENT_TYPE, 
    // Auto-detect file type
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;

      
      
      cb(null, `products/${uniqueSuffix}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size: 5MB
});

export default upload;
