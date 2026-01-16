"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { categorySchema, postSchema, type CategoryFormValues, type PostFormValues } from "@/app/admin/ui/schemas";
import { endpoints } from "@/lib/api/endpoints";
import { clientGetJson, clientJson } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatBnDate, toExcerpt } from "@/lib/format";
import { toOptimizedImageUrl } from "@/lib/images";
import type { BlogPost, Category } from "@/types/blog";
import type { SitePage, SitePageSlug } from "@/types/site";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";

type TabKey = "posts" | "new" | "categories" | "pages";

export function AdminPanel() {
    const [tab, setTab] = useState<TabKey>("posts");
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selected, setSelected] = useState<BlogPost | null>(null);

    const [pageSlug, setPageSlug] = useState<SitePageSlug>("activities");
    const [pageDraft, setPageDraft] = useState<Pick<SitePage, "title" | "content">>({
        title: "",
        content: "",
    });

    const [busy, setBusy] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const postForm = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: "",
            category: "",
            isPublished: false,
            featuredImage: "",
            content: "",
            excerpt: "",
        },
    });

    const categoryForm = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: "" },
    });

    const currentCategoryOptions = useMemo(() => {
        return [{ value: "", label: "(কোনো ক্যাটাগরি নয়)" }, ...categories.map((c) => ({ value: c.name, label: c.name }))];
    }, [categories]);

    async function loadAll() {
        setError(null);

        try {
            const [pData, cData] = await Promise.all([
                clientGetJson<BlogPost[]>(endpoints.adminPosts, { cache: "no-store" }),
                clientGetJson<Category[]>(endpoints.categories, { cache: "no-store" }),
            ]);

            setPosts(Array.isArray(pData) ? pData : []);
            setCategories(Array.isArray(cData) ? cData : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "ডাটা লোড করা যায়নি");
        }
    }

    async function loadPage(slug: SitePageSlug) {
        setError(null);
        try {
            const page = await clientGetJson<SitePage>(endpoints.adminPageBySlug(slug), {
                cache: "no-store",
            });

            setPageDraft({
                title: page?.title ?? "",
                content: page?.content ?? "",
            });
        } catch {
            // If not found yet, allow creating it
            setPageDraft({
                title: slug === "activities" ? "আমাদের কার্যক্রম" : "যোগাযোগ",
                content: "",
            });
        }
    }

    async function savePage() {
        setBusy(true);
        setMessage(null);
        setError(null);
        try {
            await clientJson(endpoints.adminPageBySlug(pageSlug), "PUT", {
                title: pageDraft.title,
                content: pageDraft.content,
            });
            setMessage("পেজ আপডেট হয়েছে");
        } catch (e) {
            setError(e instanceof Error ? e.message : "পেজ আপডেট করা যায়নি");
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    async function uploadFeaturedImage(file: File) {
        function isRecord(value: unknown): value is Record<string, unknown> {
            return typeof value === "object" && value !== null;
        }

        setUploadingImage(true);
        setMessage(null);
        setError(null);

        try {
            const form = new FormData();
            form.set("file", file);

            const res = await fetch(endpoints.adminUpload, {
                method: "POST",
                body: form,
            });

            const json = (await res.json().catch(() => null)) as unknown;
            if (!res.ok) {
                const maybeMsg = isRecord(json) ? json.message : undefined;
                throw new Error(typeof maybeMsg === "string" ? maybeMsg : "ইমেজ আপলোড করা যায়নি");
            }
            if (!isRecord(json)) {
                throw new Error("ইমেজ আপলোড করা যায়নি");
            }

            const url = json.url;
            if (typeof url !== "string" || !url) {
                throw new Error("ইমেজ URL পাওয়া যায়নি");
            }

            postForm.setValue("featuredImage", url, { shouldDirty: true, shouldTouch: true });
            setMessage("ইমেজ আপলোড হয়েছে");
        } catch (e) {
            setError(e instanceof Error ? e.message : "ইমেজ আপলোড করা যায়নি");
        } finally {
            setUploadingImage(false);
        }
    }

    function startCreate() {
        setSelected(null);
        postForm.reset({
            title: "",
            category: "",
            isPublished: false,
            featuredImage: "",
            content: "",
            excerpt: "",
        });
        setTab("new");
    }

    function startEdit(post: BlogPost) {
        setSelected(post);
        postForm.reset({
            title: post.title ?? "",
            category: post.category ?? "",
            isPublished: Boolean(post.isPublished),
            featuredImage: post.featuredImage ?? "",
            content: post.content ?? "",
            excerpt: post.excerpt ?? "",
        });
        setTab("new");
    }

    async function onSubmitPost(values: PostFormValues) {
        setBusy(true);
        setMessage(null);
        setError(null);

        try {
            const payload = {
                title: values.title,
                excerpt: values.excerpt || "",
                content: values.content,
                category: values.category || "",
                featuredImage: values.featuredImage || "",
                isPublished: Boolean(values.isPublished),
            };

            if (selected?._id) {
                await clientJson(endpoints.adminPostById(selected._id), "PUT", payload);
                setMessage("পোস্ট আপডেট হয়েছে");
            } else {
                await clientJson(endpoints.adminPosts, "POST", payload);
                setMessage("নতুন পোস্ট তৈরি হয়েছে");
            }

            await loadAll();
            setTab("posts");
        } catch (e) {
            setError(e instanceof Error ? e.message : "সংরক্ষণ করা যায়নি");
        } finally {
            setBusy(false);
        }
    }

    async function onDeletePost(post: BlogPost) {
        const ok = window.confirm(`আপনি কি নিশ্চিতভাবে "${post.title}" পোস্টটি ডিলিট করতে চান?`);
        if (!ok) return;

        setBusy(true);
        setMessage(null);
        setError(null);

        try {
            const res = await clientJson<{ message?: string }>(endpoints.adminPostById(post._id), "DELETE");
            setMessage(res?.message || "পোস্ট ডিলিট হয়েছে");
            await loadAll();
        } catch (e) {
            setError(e instanceof Error ? e.message : "ডিলিট করা যায়নি");
        } finally {
            setBusy(false);
        }
    }

    async function onSubmitCategory(values: CategoryFormValues) {
        setBusy(true);
        setMessage(null);
        setError(null);

        try {
            await clientJson(endpoints.categories, "POST", { name: values.name });
            setMessage("ক্যাটাগরি যোগ হয়েছে");
            categoryForm.reset({ name: "" });
            await loadAll();
            setTab("categories");
        } catch (e) {
            setError(e instanceof Error ? e.message : "ক্যাটাগরি যোগ করা যায়নি");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-6">
            <header className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                    অ্যাডমিন প্যানেল
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    এখান থেকে পোস্ট তৈরি/এডিট/ডিলিট ও ক্যাটাগরি যোগ করতে পারবেন (এখনো কোনো অথেনটিকেশন নেই)।
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                    <TabButton active={tab === "posts"} onClick={() => setTab("posts")}>
                        পোস্টসমূহ
                    </TabButton>
                    <TabButton active={tab === "new"} onClick={() => setTab("new")}>
                        {selected ? "পোস্ট এডিট" : "নতুন পোস্ট"}
                    </TabButton>
                    <TabButton
                        active={tab === "pages"}
                        onClick={() => {
                            setTab("pages");
                            void loadPage(pageSlug);
                        }}
                    >
                        পেজ কন্টেন্ট
                    </TabButton>
                    <TabButton
                        active={tab === "categories"}
                        onClick={() => setTab("categories")}
                    >
                        ক্যাটাগরি
                    </TabButton>

                    <button
                        type="button"
                        onClick={() => loadAll()}
                        className="ml-auto inline-flex rounded-full border border-[rgb(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900"
                    >
                        রিফ্রেশ
                    </button>
                </div>

                {message ? (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {message}
                    </div>
                ) : null}

                {error ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
                        {error}
                    </div>
                ) : null}
            </header>

            {tab === "posts" ? (
                <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                            পোস্ট তালিকা
                        </h2>
                        <button
                            type="button"
                            onClick={startCreate}
                            className="ml-auto inline-flex rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                            disabled={busy}
                        >
                            নতুন পোস্ট
                        </button>
                    </div>

                    <div className="mt-4 divide-y divide-[rgb(var(--border))]">
                        {posts.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-600 dark:text-slate-300">
                                কোনো পোস্ট পাওয়া যায়নি
                            </div>
                        ) : (
                            posts.map((p) => (
                                <div key={p._id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="truncate text-base font-bold text-slate-900 dark:text-slate-50">
                                                {p.title}
                                            </div>
                                            <span
                                                className={cn(
                                                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                                                    p.isPublished
                                                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
                                                        : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200",
                                                )}
                                            >
                                                {p.isPublished ? "প্রকাশিত" : "ড্রাফট"}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                            স্লাগ: <span className="font-mono">{p.slug}</span>
                                            {p.createdAt ? (
                                                <>
                                                    <span className="mx-2 opacity-60">•</span>
                                                    {formatBnDate(p.createdAt ?? null)}
                                                </>
                                            ) : null}
                                            {p.category ? (
                                                <>
                                                    <span className="mx-2 opacity-60">•</span>
                                                    ক্যাটাগরি: {p.category}
                                                </>
                                            ) : null}
                                        </div>
                                        <div className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                                            {p.excerpt ?? toExcerpt(p.content ?? "", 40)}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(p)}
                                            className="inline-flex rounded-full border border-[rgb(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900"
                                            disabled={busy}
                                        >
                                            এডিট
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeletePost(p)}
                                            className="inline-flex rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                                            disabled={busy}
                                        >
                                            ডিলিট
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            ) : null}

            {tab === "pages" ? (
                <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                            পেজ কন্টেন্ট (ডাইনামিক)
                        </h2>
                        <div className="ml-auto flex flex-wrap gap-2">
                            <TabButton
                                active={pageSlug === "activities"}
                                onClick={() => {
                                    setPageSlug("activities");
                                    void loadPage("activities");
                                }}
                            >
                                আমাদের কার্যক্রম
                            </TabButton>
                            <TabButton
                                active={pageSlug === "contact"}
                                onClick={() => {
                                    setPageSlug("contact");
                                    void loadPage("contact");
                                }}
                            >
                                যোগাযোগ
                            </TabButton>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4">
                        <Field label="পেজ টাইটেল">
                            <input
                                value={pageDraft.title}
                                onChange={(e) => setPageDraft((s) => ({ ...s, title: e.target.value }))}
                                placeholder={pageSlug === "activities" ? "আমাদের কার্যক্রম" : "যোগাযোগ"}
                                className={inputClass}
                                disabled={busy}
                            />
                        </Field>

                        <Field
                            label="কনটেন্ট (Markdown)"
                            hint="এই কনটেন্ট সরাসরি /activities বা /contact পেজে দেখাবে"
                        >
                            <MarkdownEditor
                                value={pageDraft.content}
                                onChange={(value) => setPageDraft((s) => ({ ...s, content: value }))}
                                rows={14}
                                placeholder={
                                    pageSlug === "contact"
                                        ? "আপনার যোগাযোগের তথ্য লিখুন…\n\n- ইমেইল: ...\n- ফেসবুক: ..."
                                        : "আপনাদের কার্যক্রম সম্পর্কে বিস্তারিত লিখুন…"
                                }
                                minHeightClassName="min-h-[300px]"
                            />
                        </Field>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={savePage}
                                className="inline-flex rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                            >
                                {busy ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
                            </button>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => loadPage(pageSlug)}
                                className="inline-flex rounded-full border border-[rgb(var(--border))] bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900"
                            >
                                রিলোড
                            </button>
                        </div>
                    </div>
                </section>
            ) : null}

            {tab === "new" ? (
                <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                            {selected ? "পোস্ট এডিট" : "নতুন পোস্ট"}
                        </h2>
                        {selected ? (
                            <button
                                type="button"
                                onClick={startCreate}
                                className="ml-auto inline-flex rounded-full border border-[rgb(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900"
                            >
                                নতুন পোস্টে যান
                            </button>
                        ) : null}
                    </div>

                    <form className="mt-5 grid gap-4" onSubmit={postForm.handleSubmit(onSubmitPost)}>
                        <Field label="শিরোনাম">
                            <input
                                {...postForm.register("title")}
                                placeholder="যেমন: ঈমান বৃদ্ধি করার উপায়"
                                className={inputClass}
                            />
                            <FieldError message={postForm.formState.errors.title?.message} />
                        </Field>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="ক্যাটাগরি" hint="(ঐচ্ছিক) তালিকা থেকে নিন বা খালি রাখুন">
                                <select {...postForm.register("category")} className={inputClass}>
                                    {currentCategoryOptions.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="প্রকাশ করবেন?">
                                <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-white px-3 text-sm text-slate-900 dark:bg-slate-950/30 dark:text-slate-50">
                                    <input
                                        type="checkbox"
                                        {...postForm.register("isPublished")}
                                        className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-300"
                                    />
                                    <span>প্রকাশিত</span>
                                </label>
                            </Field>
                        </div>

                        <Field label="সংক্ষিপ্তসার (Excerpt)" hint="(ঐচ্ছিক) হোমপেজ কার্ডে দেখাবে">
                            <Controller
                                control={postForm.control}
                                name="excerpt"
                                render={({ field }) => (
                                    <MarkdownEditor
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        rows={4}
                                        placeholder="ছোট করে ১-২ লাইনে সারাংশ লিখুন…"
                                        minHeightClassName="min-h-[120px]"
                                    />
                                )}
                            />
                            <FieldError message={postForm.formState.errors.excerpt?.message} />
                        </Field>

                        <Field label="ফিচার্ড ইমেজ" hint="(ঐচ্ছিক) ফাইল আপলোড করুন বা URL দিন">
                            <div className="grid gap-2">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={busy || uploadingImage}
                                        onChange={(e) => {
                                            const file = e.currentTarget.files?.[0];
                                            // allow selecting same file again
                                            e.currentTarget.value = "";
                                            if (file) void uploadFeaturedImage(file);
                                        }}
                                        className={cn(
                                            "block w-full rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-800",
                                            "dark:bg-slate-950/30 dark:text-slate-50",
                                            (busy || uploadingImage) && "opacity-70"
                                        )}
                                    />
                                    {uploadingImage ? (
                                        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                            আপলোড হচ্ছে…
                                        </div>
                                    ) : null}
                                </div>

                                <input
                                    {...postForm.register("featuredImage")}
                                    placeholder="https://... (অথবা আপলোড করলে অটো বসবে)"
                                    className={inputClass}
                                />

                                {postForm.watch("featuredImage") ? (
                                    <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-slate-50 dark:bg-slate-950/30">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={toOptimizedImageUrl(postForm.watch("featuredImage") as string, { width: 1200 })}
                                            alt="Featured preview"
                                            className="aspect-[16/9] w-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : null}

                                <FieldError message={postForm.formState.errors.featuredImage?.message} />
                            </div>
                        </Field>

                        <Field label="কনটেন্ট (Markdown)" hint="হেডিং, লিস্ট, কোট, কুরআন/হাদিস ব্লক এড করা যাবে">
                            <Controller
                                control={postForm.control}
                                name="content"
                                render={({ field }) => (
                                    <MarkdownEditor
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        rows={16}
                                        placeholder={
                                            "## শিরোনাম\n\nপ্যারাগ্রাফ...\n\n> কুরআন: ...\n\n- পয়েন্ট ১\n- পয়েন্ট ২"
                                        }
                                        minHeightClassName="min-h-[340px]"
                                    />
                                )}
                            />
                            <FieldError message={postForm.formState.errors.content?.message} />
                        </Field>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={busy}
                                className="inline-flex rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                            >
                                {busy ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
                            </button>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                    postForm.reset();
                                    setSelected(null);
                                }}
                                className="inline-flex rounded-full border border-[rgb(var(--border))] bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900"
                            >
                                ফর্ম রিসেট
                            </button>
                        </div>
                    </form>
                </section>
            ) : null}

            {tab === "categories" ? (
                <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                        ক্যাটাগরি
                    </h2>

                    <form
                        className="mt-4 flex flex-col gap-3 md:flex-row md:items-end"
                        onSubmit={categoryForm.handleSubmit(onSubmitCategory)}
                    >
                        <Field label="নতুন ক্যাটাগরি নাম">
                            <input
                                {...categoryForm.register("name")}
                                placeholder="যেমন: আকিদা"
                                className={inputClass}
                            />
                            <FieldError message={categoryForm.formState.errors.name?.message} />
                        </Field>

                        <button
                            type="submit"
                            disabled={busy}
                            className="inline-flex h-11 shrink-0 rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                        >
                            যোগ করুন
                        </button>
                    </form>

                    <div className="mt-6 grid gap-2">
                        {categories.length === 0 ? (
                            <div className="text-sm text-slate-600 dark:text-slate-300">
                                কোনো ক্যাটাগরি নেই
                            </div>
                        ) : (
                            categories.map((c) => (
                                <div
                                    key={c._id}
                                    className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-white px-4 py-3 dark:bg-slate-950/30"
                                >
                                    <div className="font-semibold text-slate-900 dark:text-slate-50">
                                        {c.name}
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-300">
                                        আইডি: <span className="font-mono">{c._id}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            ) : null}
        </div>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "inline-flex rounded-full px-4 py-2 text-sm font-semibold",
                active
                    ? "bg-emerald-700 text-white"
                    : "border border-[rgb(var(--border))] bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900",
            )}
        >
            {children}
        </button>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="w-full">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {label}
                </label>
                {hint ? (
                    <div className="text-xs text-slate-500 dark:text-slate-300">{hint}</div>
                ) : null}
            </div>
            {children}
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <div className="mt-1 text-xs font-semibold text-red-700 dark:text-red-300">{message}</div>;
}

const inputClass =
    "h-11 w-full rounded-xl border border-[rgb(var(--border))] bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:bg-slate-950/30 dark:text-slate-50 dark:placeholder:text-slate-400";
