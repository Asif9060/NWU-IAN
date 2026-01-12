import { LoadingCards } from "@/components/States";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
                <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <LoadingCards />
        </div>
    );
}
