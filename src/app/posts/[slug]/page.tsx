import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { PostContent } from "@/components/PostContent";
import { PostMeta } from "@/components/PostMeta";
import { PostShareBar } from "@/components/PostShareBar";
import { ErrorState } from "@/components/States";
import { getPostBySlug, getPosts } from "@/lib/api/posts";
import { stripMarkdown } from "@/lib/format";

function getPrevNext(posts: Array<{ slug: string; title: string }>, slug: string) {
    const index = posts.findIndex((p) => p.slug === slug);
    if (index < 0) return { prev: null as (typeof posts)[number] | null, next: null as (typeof posts)[number] | null };

    // posts are sorted latest-first; so:
    // - "Next" means newer (index - 1)
    // - "Previous" means older (index + 1)
    const next = index > 0 ? posts[index - 1] : null;
    const prev = index < posts.length - 1 ? posts[index + 1] : null;
    return { prev, next };
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const p = await params;

    try {
        const post = await getPostBySlug(p.slug);
        return {
            title: post.title,
            description: post.excerpt ?? "NWU IAN ব্লগ পোস্ট",
            alternates: {
                canonical: `/posts/${post.slug}`,
            },
            openGraph: {
                title: post.title,
                description: post.excerpt ?? "NWU IAN ব্লগ পোস্ট",
                images: post.featuredImage ? [post.featuredImage] : [],
                locale: "bn_BD",
                type: "article",
            },
        };
    } catch {
        return {
            title: "পোস্ট",
            description: "NWU IAN ব্লগ পোস্ট",
        };
    }
}

export default async function PostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const p = await params;

    let post;
    let prevNext: { prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null } = {
        prev: null,
        next: null,
    };
    try {
        post = await getPostBySlug(p.slug);

        // For previous/next navigation
        const list = await getPosts();
        prevNext = getPrevNext(
            list.map((x) => ({ slug: x.slug, title: x.title })),
            post.slug
        );
    } catch (e) {
        return (
            <ErrorState
                title="পোস্ট লোড করা যায়নি"
                message={e instanceof Error ? e.message : "অজানা ত্রুটি"}
            />
        );
    }

    if (!post || !post.slug) notFound();

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
            <article className="relative overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white shadow-sm dark:bg-slate-950/40">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_0%,rgba(16,185,129,0.10),transparent_45%),radial-gradient(900px_circle_at_80%_40%,rgba(14,165,233,0.08),transparent_50%)]" />

                <header className="relative p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900"
                        >
                            <span aria-hidden>←</span>
                            হোমে ফিরে যান
                        </Link>
                    </div>

                    <div className="mt-5">
                        <PostMeta post={post} />
                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                            {post.title}
                        </h1>
                        {post.excerpt ? (
                            <p className="mt-4 max-w-prose text-base leading-relaxed text-slate-600 dark:text-slate-300">
                                {stripMarkdown(post.excerpt)}
                            </p>
                        ) : null}
                    </div>
                </header>

                {post.featuredImage ? (
                    <div className="relative px-6 pb-2 md:px-8">
                        <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-slate-100 dark:bg-slate-900/40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="aspect-[16/9] w-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>
                ) : null}

                <div className="relative p-6 md:p-8">
                    <PostContent content={post.content ?? ""} />

                    <div className="mt-10 border-t border-[rgb(var(--border))] pt-6">
                        <PostShareBar title={post.title} slug={post.slug} />
                    </div>

                    <div className="mt-6 border-t border-[rgb(var(--border))] pt-6">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {prevNext.prev ? (
                                <Link
                                    href={`/posts/${prevNext.prev.slug}`}
                                    className="group rounded-2xl border border-[rgb(var(--border))] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 dark:bg-slate-950/30 dark:hover:bg-emerald-950/20"
                                    aria-label={`পূর্ববর্তী পোস্ট: ${prevNext.prev.title}`}
                                >
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        ← পূর্ববর্তী পোস্ট
                                    </div>
                                    <div className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-slate-50 dark:group-hover:text-emerald-200">
                                        {prevNext.prev.title}
                                    </div>
                                </Link>
                            ) : (
                                <div className="rounded-2xl border border-[rgb(var(--border))] bg-white/50 p-4 text-left text-sm text-slate-500 dark:bg-slate-950/20 dark:text-slate-400">
                                    <div className="text-xs font-semibold">← পূর্ববর্তী পোস্ট</div>
                                    <div className="mt-1">আর কোনো পোস্ট নেই</div>
                                </div>
                            )}

                            {prevNext.next ? (
                                <Link
                                    href={`/posts/${prevNext.next.slug}`}
                                    className="group rounded-2xl border border-[rgb(var(--border))] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 dark:bg-slate-950/30 dark:hover:bg-emerald-950/20 sm:text-right"
                                    aria-label={`পরবর্তী পোস্ট: ${prevNext.next.title}`}
                                >
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        পরবর্তী পোস্ট →
                                    </div>
                                    <div className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-emerald-800 dark:text-slate-50 dark:group-hover:text-emerald-200">
                                        {prevNext.next.title}
                                    </div>
                                </Link>
                            ) : (
                                <div className="rounded-2xl border border-[rgb(var(--border))] bg-white/50 p-4 text-left text-sm text-slate-500 dark:bg-slate-950/20 dark:text-slate-400 sm:text-right">
                                    <div className="text-xs font-semibold">পরবর্তী পোস্ট →</div>
                                    <div className="mt-1">আর কোনো পোস্ট নেই</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
