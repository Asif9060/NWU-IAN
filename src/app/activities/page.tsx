import type { Metadata } from "next";

import { PostContent } from "@/components/PostContent";
import { ErrorState } from "@/components/States";
import { getPageBySlug } from "@/lib/api/pages";

export const metadata: Metadata = {
   title: "আমাদের কার্যক্রম",
};

export default async function ActivitiesPage() {
   try {
      const page = await getPageBySlug("activities");

      return (
         <div className="space-y-6">
            <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
               <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                  {page.title || "আমাদের কার্যক্রম"}
               </h1>
               <div className="mt-4">
                  <PostContent content={page.content ?? ""} />
               </div>
            </section>
         </div>
      );
   } catch (e) {
      return (
         <ErrorState
            title="পেজ লোড করা যায়নি"
            message={e instanceof Error ? e.message : "অজানা ত্রুটি"}
         />
      );
   }
}
