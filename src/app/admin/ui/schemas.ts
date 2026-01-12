import { z } from "zod";

export const postSchema = z.object({
   title: z.string().min(3, "শিরোনাম কমপক্ষে ৩ অক্ষর হতে হবে"),
   category: z.string().optional().nullable().or(z.literal("")),
   isPublished: z.boolean(),
   featuredImage: z
      .string()
      .url("সঠিক ছবি URL দিন")
      .optional()
      .nullable()
      .or(z.literal("")),
   content: z.string().min(30, "কনটেন্ট কমপক্ষে ৩০ অক্ষর হতে হবে"),
   excerpt: z.string().optional().nullable().or(z.literal("")),
});

export type PostFormValues = z.infer<typeof postSchema>;

export const categorySchema = z.object({
   name: z.string().min(2, "ক্যাটাগরির নাম কমপক্ষে ২ অক্ষর হতে হবে"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
