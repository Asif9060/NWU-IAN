import { estimateReadingMinutes, formatBnDate, formatBnNumber } from "@/lib/format";
import type { BlogPost } from "@/types/blog";

export function PostMeta({ post }: { post: BlogPost }) {
    const date = formatBnDate(post.createdAt ?? null);
    const category = post.category ?? "";
    const readingMinutes = estimateReadingMinutes(post.content ?? "");

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
            {date ? <span>{date}</span> : null}
            {date ? <span className="opacity-60">•</span> : null}
            <span>{formatBnNumber(readingMinutes)} মিনিট</span>
            {category ? <span className="opacity-60">•</span> : null}
            {category ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                    {category}
                </span>
            ) : null}
        </div>
    );
}
