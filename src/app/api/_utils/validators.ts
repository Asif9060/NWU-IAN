import { z } from "zod";

export const createPostSchema = z.object({
   title: z.string().min(3, "শিরোনাম কমপক্ষে ৩ অক্ষর হতে হবে"),
   excerpt: z.string().optional().default(""),
   content: z.string().min(10, "কনটেন্ট কমপক্ষে ১০ অক্ষর হতে হবে"),
   featuredImage: z.string().url("সঠিক ইমেজ URL দিন").optional().or(z.literal("")),
   category: z.string().optional().default(""),
   isPublished: z.boolean().optional().default(false),
});

export const updatePostSchema = z
   .object({
      title: z.string().min(3, "শিরোনাম কমপক্ষে ৩ অক্ষর হতে হবে").optional(),
      excerpt: z.string().optional(),
      content: z.string().min(10, "কনটেন্ট কমপক্ষে ১০ অক্ষর হতে হবে").optional(),
      featuredImage: z.string().url("সঠিক ইমেজ URL দিন").optional().or(z.literal("")),
      category: z.string().optional(),
      isPublished: z.boolean().optional(),
   })
   .strict();

export const createCategorySchema = z.object({
   name: z.string().min(2, "ক্যাটাগরির নাম কমপক্ষে ২ অক্ষর হতে হবে"),
});
