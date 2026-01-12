import mongoose from "mongoose";

import { connectMongo } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { badRequest, notFound, ok, serverError } from "@/app/api/_utils/responses";
import { updatePostSchema } from "@/app/api/_utils/validators";

// PUT /api/admin/posts/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
   try {
      await connectMongo();

      const { id } = await params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
         return badRequest("সঠিক পোস্ট আইডি দিন");
      }

      const body = await req.json().catch(() => null);
      const parsed = updatePostSchema.safeParse(body);
      if (!parsed.success) {
         return badRequest(parsed.error.issues.map((i) => i.message).join(" | "));
      }

      const post = await Post.findById(id);
      if (!post) return notFound("পোস্ট পাওয়া যায়নি");

      const patch = parsed.data;

      if (typeof patch.title === "string") post.title = patch.title;
      if (typeof patch.excerpt === "string") post.excerpt = patch.excerpt;
      if (typeof patch.content === "string") post.content = patch.content;
      if (typeof patch.featuredImage === "string")
         post.featuredImage = patch.featuredImage;
      if (typeof patch.category === "string") post.category = patch.category;
      if (typeof patch.isPublished === "boolean") post.isPublished = patch.isPublished;

      await post.save();

      return ok(post);
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

// DELETE /api/admin/posts/[id]
export async function DELETE(
   _req: Request,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      await connectMongo();

      const { id } = await params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
         return badRequest("সঠিক পোস্ট আইডি দিন");
      }

      const deleted = await Post.findByIdAndDelete(id);
      if (!deleted) return notFound("পোস্ট পাওয়া যায়নি");

      return ok({ message: "পোস্ট ডিলিট হয়েছে" });
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
