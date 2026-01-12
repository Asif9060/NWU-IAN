import { connectMongo } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { created, ok, serverError, badRequest } from "@/app/api/_utils/responses";
import { createPostSchema } from "@/app/api/_utils/validators";

// GET /api/admin/posts (draft + published)
export async function GET() {
   try {
      await connectMongo();
      const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
      return ok(posts);
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

      return created(doc);
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
