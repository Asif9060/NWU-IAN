import { PostContent } from "@/components/PostContent";
import { PostMeta } from "@/components/PostMeta";
import { toOptimizedImageUrl } from "@/lib/images";
import type { BlogPost } from "@/types/blog";

export function PostExpanded({ post }: { post: BlogPost }) {
    return (
        <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4 shadow-sm dark:bg-slate-950/40">
            {post.featuredImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={toOptimizedImageUrl(post.featuredImage, { width: 1200 })}
                    alt={post.title}
                    className="mb-4 aspect-[16/9] w-full rounded-xl object-cover"
                    loading="lazy"
                />
            ) : null}

            <PostMeta post={post} />

            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                {post.title}
            </h2>

            <div className="mt-4">
                <PostContent content={post.content ?? ""} />
            </div>
        </section>
    );
}
