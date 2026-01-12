"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PostMeta } from "@/components/PostMeta";
import { cn } from "@/lib/cn";
import { stripMarkdown } from "@/lib/format";
import type { BlogPost } from "@/types/blog";

type SortKey = "latest" | "oldest" | "title-asc" | "title-desc";

function safeTime(value?: string) {
   if (!value) return 0;
   const t = new Date(value).getTime();
   return Number.isFinite(t) ? t : 0;
}

export function PostListClient({ posts }: { posts: BlogPost[] }) {
   const [query, setQuery] = useState("");
   const [category, setCategory] = useState<string>("");
   const [sort, setSort] = useState<SortKey>("latest");

   const categories = useMemo(() => {
      const set = new Set<string>();
      for (const p of posts) {
         const c = (p.category ?? "").trim();
         if (c) set.add(c);
      }
      return Array.from(set).sort((a, b) => a.localeCompare(b, "bn"));
   }, [posts]);

   const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();

      let list = posts.filter((p) => {
         if (category && (p.category ?? "") !== category) return false;
         if (!q) return true;
         const hay = `${p.title} ${p.excerpt ?? ""} ${stripMarkdown(p.content ?? "")}`.toLowerCase();
         return hay.includes(q);
      });

      list = [...list].sort((a, b) => {
         if (sort === "latest") return safeTime(b.createdAt) - safeTime(a.createdAt);
         if (sort === "oldest") return safeTime(a.createdAt) - safeTime(b.createdAt);
         if (sort === "title-asc") return a.title.localeCompare(b.title, "bn");
         return b.title.localeCompare(a.title, "bn");
      });

      return list;
   }, [posts, query, category, sort]);

   return (
      <div className="space-y-6">
         <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
               <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                     তালিকাসমূহ
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                     সকল প্রকাশিত পোস্ট এক জায়গায়। সার্চ করুন, ক্যাটাগরি অনুযায়ী ফিল্টার করুন অথবা সাজিয়ে নিন।
                  </p>
               </div>

               <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="w-full sm:w-72">
                     <label className="sr-only" htmlFor="list-q">
                        খুঁজুন
                     </label>
                     <input
                        id="list-q"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="শিরোনাম/বিষয় দিয়ে খুঁজুন…"
                        className="w-full rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-emerald-200 placeholder:text-slate-400 focus:ring-4 dark:bg-slate-950/40 dark:text-slate-50"
                     />
                  </div>

                  <div className="w-full sm:w-48">
                     <label className="sr-only" htmlFor="list-category">
                        ক্যাটাগরি
                     </label>
                     <select
                        id="list-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-emerald-200 focus:ring-4 dark:bg-slate-950/40 dark:text-slate-50"
                     >
                        <option value="">সব ক্যাটাগরি</option>
                        {categories.map((c) => (
                           <option key={c} value={c}>
                              {c}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className="w-full sm:w-48">
                     <label className="sr-only" htmlFor="list-sort">
                        সাজানো
                     </label>
                     <select
                        id="list-sort"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        className="w-full rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-emerald-200 focus:ring-4 dark:bg-slate-950/40 dark:text-slate-50"
                     >
                        <option value="latest">সর্বশেষ আগে</option>
                        <option value="oldest">পুরোনো আগে</option>
                        <option value="title-asc">শিরোনাম (A→Z)</option>
                        <option value="title-desc">শিরোনাম (Z→A)</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
               মোট: <span className="font-semibold text-slate-700 dark:text-slate-200">{filtered.length}</span>
            </div>
         </section>

         <section className="rounded-2xl border border-[rgb(var(--border))] bg-white shadow-sm dark:bg-slate-950/40">
            <ul className="divide-y divide-[rgb(var(--border))]">
               {filtered.map((p) => {
                  const excerpt = stripMarkdown(p.excerpt ?? "").slice(0, 180);
                  return (
                     <li key={p._id} className="p-5">
                        <div className="flex items-start gap-4">
                           <div className="min-w-0 flex-1">
                              <Link
                                 href={`/posts/${p.slug}`}
                                 className="block text-base font-bold leading-7 text-slate-900 hover:text-emerald-800 dark:text-slate-50 dark:hover:text-emerald-200"
                              >
                                 {p.title}
                              </Link>

                              <div className="mt-2">
                                 <PostMeta post={p} />
                              </div>

                              {excerpt ? (
                                 <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {excerpt}
                                    {excerpt.length >= 180 ? "…" : ""}
                                 </p>
                              ) : null}
                           </div>

                           <Link
                              href={`/posts/${p.slug}`}
                              className={cn(
                                 "shrink-0 rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm hover:bg-emerald-50 dark:bg-slate-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/30"
                              )}
                           >
                              পড়ুন
                           </Link>
                        </div>
                     </li>
                  );
               })}

               {filtered.length === 0 ? (
                  <li className="p-10 text-center text-sm text-slate-600 dark:text-slate-300">
                     কোনো পোস্ট পাওয়া যায়নি।
                  </li>
               ) : null}
            </ul>
         </section>
      </div>
   );
}
