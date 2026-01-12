import type { Metadata } from "next";

import { ErrorState } from "@/components/States";
import { getPosts } from "@/lib/api/posts";

import { PostListClient } from "./PostListClient";

export const metadata: Metadata = {
   title: "তালিকাসমূহ",
};

export default async function ListsPage() {
   let posts = [] as Awaited<ReturnType<typeof getPosts>>;
   let errorMessage: string | null = null;

   try {
      posts = await getPosts();
   } catch (e) {
      errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
   }

   if (errorMessage) {
      return <ErrorState title="পোস্ট লোড করা যায়নি" message={errorMessage} />;
   }

   return <PostListClient posts={posts} />;
}
