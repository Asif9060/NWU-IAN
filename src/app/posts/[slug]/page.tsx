import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { PostContent } from "@/components/PostContent";
import { PostMeta } from "@/components/PostMeta";
import { PostShareBar } from "@/components/PostShareBar";
import { ErrorState } from "@/components/States";
import { getPostBySlug } from "@/lib/api/posts";
import { stripMarkdown } from "@/lib/format";

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
    try {
        post = await getPostBySlug(p.slug);
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
                </div>
            </article>
        </div>
    );
}
