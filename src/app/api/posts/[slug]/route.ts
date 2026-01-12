import { connectMongo } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { notFound, ok, serverError } from "@/app/api/_utils/responses";

// GET /api/posts/[slug]
export async function GET(
   _req: Request,
   { params }: { params: Promise<{ slug: string }> }
) {
   try {
      await connectMongo();

      const { slug } = await params;

      const post = await Post.findOne({ slug, isPublished: true }).lean();
      if (!post) return notFound("পোস্ট পাওয়া যায়নি");

      return ok(post);
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
