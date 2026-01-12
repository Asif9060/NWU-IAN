"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { endpoints } from "@/lib/api/endpoints";
import { clientGetJson } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { stripMarkdown } from "@/lib/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { BlogPost } from "@/types/blog";

export function SearchBox({ className, inputId = "search" }: { className?: string; inputId?: string }) {
    const router = useRouter();
    const pathname = usePathname();

    // Avoid `useSearchParams()` here; it can break prerendering unless wrapped correctly.
    // We'll sync from window.location after mount.
    const [value, setValue] = useState("");
    const debounced = useDebouncedValue(value, 350);

    const [items, setItems] = useState<BlogPost[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const qValue = useMemo(() => debounced.trim(), [debounced]);

    useEffect(() => {
        // Initialize from current URL query (client-only)
        try {
            const sp = new URLSearchParams(window.location.search);
            const q = sp.get("q") ?? "";
            const t = setTimeout(() => setValue(q), 0);
            return () => clearTimeout(t);
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        // URL আপডেট: live search experience (server component refetch হবে)
        try {
            const sp = new URLSearchParams(window.location.search);
            if (qValue) sp.set("q", qValue);
            else sp.delete("q");
            const qs = sp.toString();
            const url = qs ? `${pathname}?${qs}` : pathname;
            router.replace(url, { scroll: false });
        } catch {
            const url = qValue ? `${pathname}?q=${encodeURIComponent(qValue)}` : pathname;
            router.replace(url, { scroll: false });
        }
    }, [router, pathname, qValue]);

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
            <label className="sr-only" htmlFor={inputId}>
                ব্লগ খুঁজুন
            </label>
            <input
                id={inputId}
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
                                    {stripMarkdown(p.excerpt ?? "")}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
