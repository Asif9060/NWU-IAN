"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { endpoints } from "@/lib/api/endpoints";
import { clientGetJson } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { BlogPost } from "@/types/blog";

export function SearchBox({ className }: { className?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initial = searchParams.get("q") ?? "";
    const [value, setValue] = useState(initial);
    const debounced = useDebouncedValue(value, 350);

    const [items, setItems] = useState<BlogPost[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const targetUrl = useMemo(() => {
        const sp = new URLSearchParams(searchParams.toString());
        if (debounced.trim()) sp.set("q", debounced.trim());
        else sp.delete("q");
        return `${pathname}?${sp.toString()}`.replace(/\?$/, "");
    }, [debounced, pathname, searchParams]);

    useEffect(() => {
        // URL আপডেট: live search experience (server component refetch হবে)
        router.replace(targetUrl, { scroll: false });
    }, [router, targetUrl]);

    useEffect(() => {
        const q = debounced.trim();
        if (!q) {
            queueMicrotask(() => {
                setItems([]);
                setLoading(false);
            });
            return;
        }

        let cancelled = false;
        queueMicrotask(() => setLoading(true));

        const url = `${endpoints.posts}?q=${encodeURIComponent(q)}`;
        clientGetJson<BlogPost[]>(url)
            .then((data) => {
                if (cancelled) return;
                setItems((data ?? []).slice(0, 6));
            })
            .catch(() => {
                if (cancelled) return;
                setItems([]);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [debounced]);

    return (
        <div className={cn("relative", className)}>
            <label className="sr-only" htmlFor="search">
                ব্লগ খুঁজুন
            </label>
            <input
                id="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                placeholder="শিরোনাম বা লেখার ভিতরে খুঁজুন…"
                className={cn(
                    "w-full rounded-full border border-[rgb(var(--border))] bg-white/90 px-4 py-2 text-sm",
                    "text-slate-900 placeholder:text-slate-500 outline-none",
                    "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
                    "dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-400",
                )}
            />

            {open && (items.length > 0 || loading) && (
                <div className="absolute right-0 mt-2 w-[min(28rem,90vw)] overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white shadow-lg dark:bg-slate-950">
                    <div className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300">
                        {loading ? "খোঁজা হচ্ছে…" : "ফলাফল"}
                    </div>
                    <div className="max-h-80 overflow-auto">
                        {items.map((p) => (
                            <Link
                                key={p._id}
                                href={`/posts/${p.slug}`}
                                className="block px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            >
                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                    {p.title}
                                </div>
                                <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                                    {p.excerpt ?? ""}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
