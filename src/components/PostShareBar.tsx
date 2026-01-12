"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";

export function PostShareBar({
    title,
    slug,
    className,
}: {
    title: string;
    slug: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);

    const path = useMemo(() => `/posts/${encodeURIComponent(slug)}`, [slug]);
    const url = useMemo(() => {
        if (typeof window === "undefined") return path;
        return `${window.location.origin}${path}`;
    }, [path]);

    async function onCopy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            // Clipboard API unavailable/blocked.
            // Fallback: do nothing (avoid console noise).
        }
    }

    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    const x = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;

    return (
        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">শেয়ার করুন</div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={onCopy}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-slate-800",
                        "hover:bg-slate-50 disabled:opacity-60",
                        "dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900",
                    )}
                >
                    <LinkIcon className="h-4 w-4" />
                    {copied ? "কপি হয়েছে" : "লিংক কপি"}
                </button>

                <a
                    href={fb}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-slate-800",
                        "hover:bg-slate-50",
                        "dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900",
                    )}
                >
                    <FacebookIcon className="h-4 w-4" />
                    Facebook
                </a>

                <a
                    href={x}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-slate-800",
                        "hover:bg-slate-50",
                        "dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900",
                    )}
                >
                    <XIcon className="h-4 w-4" />
                    X
                </a>

                <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-slate-800",
                        "hover:bg-slate-50",
                        "dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900",
                    )}
                >
                    <WhatsappIcon className="h-4 w-4" />
                    WhatsApp
                </a>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 sm:ml-auto">
                <span className="hidden sm:inline">লিংক:</span> <span className="font-mono">{path}</span>
            </div>
        </div>
    );
}

function LinkIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13" />
            <path d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 0 1-7-7L7 11" />
        </svg>
    );
}

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6H17V5c-.3 0-1.4-.1-2.7-.1-2.7 0-4.6 1.7-4.6 4.8V11H7v3h2.7v8h3.8Z" />
        </svg>
    );
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M18.9 2H22l-6.8 7.8L23 22h-6.9l-5.4-7.1L4.7 22H1.6l7.3-8.4L1 2h7.1l4.9 6.4L18.9 2Zm-1.2 18h1.7L7.2 3.9H5.4L17.7 20Z" />
        </svg>
    );
}

function WhatsappIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M20 12a8 8 0 0 1-12.3 6.8L4 20l1.3-3.7A8 8 0 1 1 20 12Zm-8 6.5c.9 0 1.9-.2 2.8-.6.3-.1.6-.3.9-.5.4-.2.8-.6.9-1.1l.2-1.5c0-.2-.1-.4-.3-.5l-1.6-.7c-.2-.1-.4 0-.6.1l-.7.9c-.1.1-.3.2-.5.1-1-.4-1.8-1.2-2.3-2.2-.1-.2 0-.4.1-.5l.9-.7c.2-.2.2-.4.1-.6l-.7-1.6c-.1-.2-.3-.3-.5-.3l-1.5.2c-.5.1-.9.5-1.1.9-.2.3-.4.6-.5.9-.4.9-.6 1.8-.6 2.8 0 3.6 2.9 6.5 6.5 6.5Z" />
        </svg>
    );
}
