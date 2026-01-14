import { badRequest, ok, serverError } from "@/app/api/_utils/responses";
import { getCloudinary, getCloudinaryFolder } from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

const NO_STORE_HEADERS = {
   "Cache-Control": "no-store, max-age=0",
} as const;

export async function POST(req: Request) {
   try {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
         return badRequest("file ফিল্ডে একটি ইমেজ ফাইল দিন");
      }

      if (!file.type.startsWith("image/")) {
         return badRequest("শুধু ইমেজ ফাইল আপলোড করা যাবে");
      }

      // 10MB soft limit (Cloudinary free tier friendliness)
      const maxBytes = 10 * 1024 * 1024;
      if (file.size > maxBytes) {
         return badRequest("ফাইল সাইজ 10MB এর বেশি");
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const cloudinary = getCloudinary();
      const folder = getCloudinaryFolder();

      const result = await new Promise<{
         secure_url: string;
         public_id: string;
         bytes: number;
         width?: number;
         height?: number;
         format?: string;
      }>((resolve, reject) => {
         const stream = cloudinary.uploader.upload_stream(
            {
               folder,
               resource_type: "image",
               overwrite: true,
            },
            (error, uploaded) => {
               if (error) return reject(error);
               if (!uploaded) return reject(new Error("Upload failed"));

               const up = uploaded as UploadApiResponse;
               resolve({
                  secure_url: up.secure_url,
                  public_id: up.public_id,
                  bytes: up.bytes,
                  width: up.width,
                  height: up.height,
                  format: up.format,
               });
            }
         );

         stream.end(buffer);
      });

      return ok(
         {
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            format: result.format,
         },
         { headers: NO_STORE_HEADERS }
      );
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
