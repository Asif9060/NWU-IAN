import mongoose, { Schema, type Model } from "mongoose";
import slugify from "slugify";
import { transliterate } from "transliteration";

export type PostDoc = {
   title: string;
   slug: string;
   excerpt?: string;
   content: string;
   featuredImage?: string;
   category?: string;
   isPublished: boolean;
   createdAt?: Date;
   updatedAt?: Date;
};

function baseSlugFromBanglaTitle(title: string) {
   const ascii = transliterate(String(title ?? "")).trim();
   const raw = ascii.length > 0 ? ascii : String(title ?? "");

   const slug = slugify(raw, {
      lower: true,
      strict: true,
      trim: true,
   });

   // transliteration + strict slugify ব্যর্থ হলে fallback
   return slug && slug.length > 0 ? slug : `post-${Date.now()}`;
}

async function ensureUniqueSlug(
   model: Model<PostDoc>,
   title: string,
   excludeId?: unknown
) {
   const base = baseSlugFromBanglaTitle(title);
   let candidate = base;

   for (let i = 0; i < 50; i++) {
      const query: Record<string, unknown> = { slug: candidate };
      if (excludeId) query._id = { $ne: excludeId };

      const exists = await model.exists(query);
      if (!exists) return candidate;

      candidate = `${base}-${i + 2}`;
   }

   return `${base}-${Date.now()}`;
}

const PostSchema = new Schema<PostDoc>(
   {
      title: { type: String, required: [true, "শিরোনাম আবশ্যক"], trim: true },
      slug: { type: String, unique: true, index: true },
      excerpt: { type: String, default: "", trim: true },
      content: { type: String, required: [true, "কনটেন্ট আবশ্যক"] },
      featuredImage: { type: String, default: "", trim: true },
      category: { type: String, default: "", trim: true },
      isPublished: { type: Boolean, default: false, index: true },
   },
   { timestamps: true }
);

PostSchema.index({ title: "text", content: "text", excerpt: "text", category: "text" });

PostSchema.pre("save", async function preSave() {
   const doc = this as mongoose.Document & PostDoc;
   const postModel = this.constructor as Model<PostDoc>;

   if (!doc.slug || (doc.isModified("title") && doc.title)) {
      doc.slug = await ensureUniqueSlug(postModel, doc.title, doc._id);
   }
});

export const Post: Model<PostDoc> =
   (mongoose.models.Post as Model<PostDoc>) ||
   mongoose.model<PostDoc>("Post", PostSchema);
