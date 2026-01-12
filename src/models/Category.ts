import mongoose, { Schema, type Model } from "mongoose";

export type CategoryDoc = {
   name: string;
   createdAt?: Date;
   updatedAt?: Date;
};

const CategorySchema = new Schema<CategoryDoc>(
   {
      name: {
         type: String,
         required: [true, "ক্যাটাগরির নাম আবশ্যক"],
         unique: true,
         trim: true,
      },
   },
   { timestamps: true }
);

export const Category: Model<CategoryDoc> =
   (mongoose.models.Category as Model<CategoryDoc>) ||
   mongoose.model<CategoryDoc>("Category", CategorySchema);
