import { connectMongo } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { created, ok, serverError, badRequest } from "@/app/api/_utils/responses";
import { createPostSchema } from "@/app/api/_utils/validators";
import { revalidateTag } from "next/cache";

const NO_STORE_HEADERS = {
   "Cache-Control": "no-store, max-age=0",
} as const;

// GET /api/admin/posts (draft + published)
export async function GET() {
   try {
      await connectMongo();
      const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
      return ok(posts, { headers: NO_STORE_HEADERS });
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

// POST /api/admin/posts
export async function POST(req: Request) {
   try {
      await connectMongo();

      const body = await req.json().catch(() => null);
      const parsed = createPostSchema.safeParse(body);
      if (!parsed.success) {
         return badRequest(parsed.error.issues.map((i) => i.message).join(" | "));
      }

      const input = parsed.data;

      const doc = await Post.create({
         title: input.title,
         excerpt: input.excerpt ?? "",
         content: input.content,
         featuredImage: input.featuredImage ?? "",
         category: input.category ?? "",
         isPublished: input.isPublished ?? false,
      });

      // Ensure all pages refetch immediately
      revalidateTag("posts", "max");
      if (doc.slug) revalidateTag(`post:${doc.slug}`, "max");

      return created(doc, { headers: NO_STORE_HEADERS });
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
