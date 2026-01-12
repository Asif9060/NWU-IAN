import Link from "next/link";

import { PostMeta } from "@/components/PostMeta";
import { cn } from "@/lib/cn";
import { stripMarkdown, toExcerpt } from "@/lib/format";
import type { BlogPost } from "@/types/blog";

export function PostCard({ post, className }: { post: BlogPost; className?: string }) {
    const excerpt = post.excerpt ? stripMarkdown(post.excerpt) : toExcerpt(post.content ?? "", 120);

    return (
        <Link
            href={`/posts/${post.slug}`}
            className={cn(
                "group overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white shadow-sm",
                "transition hover:-translate-y-0.5 hover:shadow-md",
                "dark:bg-slate-950/40",
                className,
            )}
        >
            <div className="aspect-[16/9] w-full overflow-hidden bg-emerald-50 dark:bg-emerald-950/20">
                {post.featuredImage ? (
                    // Next/Image domain config এড়াতে সাধারণ img ব্যবহার
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-emerald-800/70 dark:text-emerald-200/70">
                        ফিচার্ড ছবি নেই
                    </div>
                )}
            </div>

            <div className="space-y-3 p-5">
                <PostMeta post={post} />
                <h2 className="line-clamp-2 text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 dark:text-slate-50 dark:group-hover:text-emerald-200">
                    {post.title}
                </h2>
                <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {excerpt}
                </p>
                <div className="pt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    পুরোটা পড়ুন →
                </div>
            </div>
        </Link>
    );
}
