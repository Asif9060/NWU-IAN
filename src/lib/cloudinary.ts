import { v2 as cloudinary } from "cloudinary";

function getRequiredEnv(name: string): string {
   const value = process.env[name];
   if (!value) {
      throw new Error(`Missing required env var: ${name}`);
   }
   return value;
}

let configured = false;

export function getCloudinary() {
   if (!configured) {
      cloudinary.config({
         cloud_name: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
         api_key: getRequiredEnv("CLOUDINARY_API_KEY"),
         api_secret: getRequiredEnv("CLOUDINARY_API_SECRET"),
         secure: true,
      });
      configured = true;
   }

   return cloudinary;
}

export function getCloudinaryFolder() {
   return process.env.CLOUDINARY_FOLDER || "nwuian";
}
