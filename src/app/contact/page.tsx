import type { Metadata } from "next";

export const metadata: Metadata = {
   title: "যোগাযোগ",
};

export default function ContactPage() {
   return (
      <div className="space-y-6">
         <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
               যোগাযোগ
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
               আপনার মতামত, পরামর্শ বা সহযোগিতার জন্য আমাদের সাথে যোগাযোগ করুন।
            </p>
         </section>

         <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
               <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">ইমেইল</h2>
               <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">admin@nwuian.example</span>
               </p>
               <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  (এটি প্লেসহোল্ডার। চাইলে আপনার আসল ইমেইল ঠিকানা দিন।)
               </p>
            </div>

            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
               <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">সোশ্যাল</h2>
               <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  ফেসবুক/ইউটিউব/হোয়াটসঅ্যাপ লিংক যুক্ত করতে বলুন।
               </p>
            </div>
         </section>
      </div>
   );
}
