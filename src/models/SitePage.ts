import mongoose, { Schema, type Model } from "mongoose";

export type SitePageSlug = "activities" | "contact";

export type SitePageDoc = {
   slug: SitePageSlug;
   title: string;
   content: string;
   createdAt?: Date;
   updatedAt?: Date;
};

const SitePageSchema = new Schema<SitePageDoc>(
   {
      slug: { type: String, required: true, unique: true, index: true },
      title: { type: String, required: true, trim: true },
      content: { type: String, required: true },
   },
   { timestamps: true }
);

export const SitePage: Model<SitePageDoc> =
   (mongoose.models.SitePage as Model<SitePageDoc>) ||
   mongoose.model<SitePageDoc>("SitePage", SitePageSchema);
