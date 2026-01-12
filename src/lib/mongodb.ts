import mongoose from "mongoose";

type MongooseCache = {
   conn: typeof mongoose | null;
   promise: Promise<typeof mongoose> | null;
};

declare global {
   var __mongooseCache: MongooseCache | undefined;
}

const globalCache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = globalCache;

export async function connectMongo() {
   if (globalCache.conn) return globalCache.conn;

   const uri = process.env.MONGODB_URI;
   if (!uri) {
      throw new Error("MONGODB_URI সেট করা নেই");
   }

   if (!globalCache.promise) {
      const forceIpv4 = process.env.MONGODB_FORCE_IPV4 === "1";
      const tlsInsecure = process.env.MONGODB_TLS_INSECURE === "1";

      globalCache.promise = mongoose
         .connect(uri, {
            // Vercel/serverless friendly defaults
            bufferCommands: false,

            // Slightly friendlier timeouts for local dev/network hiccups
            serverSelectionTimeoutMS: 10_000,
            connectTimeoutMS: 10_000,

            ...(forceIpv4 ? { family: 4 } : {}),

            // ONLY for local development if your network/AV intercepts TLS.
            // Do not enable in production.
            ...(tlsInsecure
               ? {
                    tlsAllowInvalidCertificates: true,
                    tlsAllowInvalidHostnames: true,
                 }
               : {}),
         })
         .then((m) => m)
         .catch((e: unknown) => {
            const msg = e instanceof Error ? e.message : String(e);
            if (
               /ssl routines|tlsv1 alert internal error|SSL alert number 80/i.test(msg)
            ) {
               throw new Error(
                  "MongoDB TLS সংযোগ ব্যর্থ হয়েছে। লোকালি চালালে Node.js 20 LTS ব্যবহার করুন (Node 22 এ OpenSSL/TLS সমস্যা হতে পারে)। এছাড়া VPN/অ্যান্টিভাইরাস/কর্পোরেট নেটওয়ার্ক TLS ইন্টারসেপ্ট করলে MONGODB_TLS_INSECURE=1 দিয়ে শুধু ডেভেলপমেন্টে চালিয়ে দেখুন।"
               );
            }
            throw e;
         });
   }

   globalCache.conn = await globalCache.promise;
   return globalCache.conn;
}
