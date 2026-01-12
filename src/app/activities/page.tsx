import type { Metadata } from "next";

export const metadata: Metadata = {
   title: "আমাদের কার্যক্রম",
};

export default function ActivitiesPage() {
   return (
      <div className="space-y-6">
         <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
               আমাদের কার্যক্রম
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
               NWU ইসলামিক অ্যাওয়ারনেস নেটওয়ার্ক (NWU IAN) — ইসলামি সচেতনতা বৃদ্ধি, দাওয়াহ,
               নৈতিক শিক্ষা এবং সমাজকল্যাণমূলক বার্তা ছড়িয়ে দিতে আমরা বিভিন্ন কার্যক্রম পরিচালনা
               করি।
            </p>
         </section>

         <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm dark:bg-slate-950/40">
               <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  দাওয়াহ ও শিক্ষামূলক লেখা
               </h2>
               <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  কুরআন-সুন্নাহভিত্তিক সহজ ভাষায় লেখা, নৈতিক শিক্ষা ও আত্মশুদ্ধির বার্তা।
               </p>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm dark:bg-slate-950/40">
               <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  জনসচেতনতা কার্যক্রম
               </h2>
               <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  সমাজে ভালো কাজের প্রচার, ক্ষতিকর অভ্যাস থেকে দূরে থাকার আহ্বান, নৈতিকতা চর্চা।
               </p>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm dark:bg-slate-950/40">
               <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  সামাজিক উদ্যোগ
               </h2>
               <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  প্রয়োজনভিত্তিক সহায়তা, স্বেচ্ছাসেবী কাজ, এবং কমিউনিটি-ভিত্তিক উদ্যোগ।
               </p>
            </div>
         </section>
      </div>
   );
}
