import { connectMongo } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { ok, serverError } from "@/app/api/_utils/responses";

function escapeRegex(value: string) {
   return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/posts?q=
// শুধু published পোস্ট, latest first, সার্চ সাপোর্ট
export async function GET(req: Request) {
   try {
      await connectMongo();

      const { searchParams } = new URL(req.url);
      const q = (searchParams.get("q") ?? "").trim();

      const filter: Record<string, unknown> = { isPublished: true };
      if (q) {
         const re = new RegExp(escapeRegex(q), "i");
         filter.$or = [{ title: re }, { content: re }, { excerpt: re }, { category: re }];
      }

      const posts = await Post.find(filter).sort({ createdAt: -1 }).lean();
      return ok(posts);
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
