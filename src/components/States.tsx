import Link from "next/link";

import { cn } from "@/lib/cn";

export function ErrorState({
    title = "কিছু একটা সমস্যা হয়েছে",
    message,
}: {
    title?: string;
    message?: string;
}) {
    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
            <div className="text-base font-bold">{title}</div>
            {message ? <div className="mt-2 text-sm opacity-90">{message}</div> : null}
            <div className="mt-4">
                <Link
                    href="/"
                    className="inline-flex rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                >
                    হোমে ফিরে যান
                </Link>
            </div>
        </div>
    );
}

export function EmptyState({
    title = "কোনো পোস্ট পাওয়া যায়নি",
    message = "অন্য কোনো শব্দ দিয়ে খুঁজে দেখুন।",
}: {
    title?: string;
    message?: string;
}) {
    return (
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 text-center text-slate-700 dark:bg-slate-950/40 dark:text-slate-200">
            <div className="text-lg font-bold">{title}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {message}
            </div>
        </div>
    );
}

export function LoadingCards({ className }: { className?: string }) {
    return (
        <div className={cn("grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3", className)}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white dark:bg-slate-950/40"
                >
                    <div className="aspect-[16/9] w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-3 p-5">
                        <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                </div>
            ))}
        </div>
    );
}
