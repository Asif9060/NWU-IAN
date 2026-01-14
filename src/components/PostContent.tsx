import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { Schema } from "hast-util-sanitize";

import { cn } from "@/lib/cn";

function getText(node: React.ReactNode): string {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getText).join("");
    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return getText(node.props.children);
    }
    return "";
}

export function PostContent({ content }: { content: string }) {
    const normalizedContent = String(content ?? "")
        // Older editor versions accidentally inserted escaped quotes into HTML attributes.
        // Normalize so rehype-raw can parse the HTML instead of showing it as text.
        .replace(/<div\s+align=\\"(left|center|right|justify)\\">/g, '<div align="$1">')
        .replace(/<p\s+align=\\"(left|center|right|justify)\\">/g, '<p align="$1">')
        .replace(/<span\s+align=\\"(left|center|right|justify)\\">/g, '<span align="$1">');

    const sanitizeSchema: Schema = {
        ...defaultSchema,
        tagNames: Array.from(new Set([...(defaultSchema.tagNames ?? []), "div", "span"])),
        attributes: {
            ...(defaultSchema.attributes ?? {}),
            div: [...(defaultSchema.attributes?.div ?? []), "align"],
            p: [...(defaultSchema.attributes?.p ?? []), "align"],
            span: [...(defaultSchema.attributes?.span ?? []), "align"],
        },
    };

    return (
        <article
            className={cn(
                "prose prose-slate max-w-none dark:prose-invert",
                "prose-headings:scroll-mt-24 prose-headings:tracking-tight",
                "prose-a:text-emerald-700 dark:prose-a:text-emerald-300",
                "prose-hr:border-[rgb(var(--border))]",
                "prose-img:rounded-2xl prose-img:border prose-img:border-[rgb(var(--border))]",
                "prose-pre:shadow-sm",
            )}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
                components={{
                    div: ({ className, ...props }) => {
                        const align = (props as unknown as { align?: string }).align;
                        return (
                            <div
                                className={cn(
                                    align === "left"
                                        ? "text-left"
                                        : align === "center"
                                            ? "text-center"
                                            : align === "right"
                                                ? "text-right"
                                                : align === "justify"
                                                    ? "text-justify"
                                                    : null,
                                    className,
                                )}
                                {...props}
                            />
                        );
                    },
                    p: ({ className, ...props }) => {
                        const align = (props as unknown as { align?: string }).align;
                        return (
                            <p
                                className={cn(
                                    align === "left"
                                        ? "text-left"
                                        : align === "center"
                                            ? "text-center"
                                            : align === "right"
                                                ? "text-right"
                                                : align === "justify"
                                                    ? "text-justify"
                                                    : null,
                                    className,
                                )}
                                {...props}
                            />
                        );
                    },
                    span: ({ className, ...props }) => {
                        const align = (props as unknown as { align?: string }).align;
                        return (
                            <span
                                className={cn(
                                    align === "left"
                                        ? "text-left"
                                        : align === "center"
                                            ? "text-center"
                                            : align === "right"
                                                ? "text-right"
                                                : align === "justify"
                                                    ? "text-justify"
                                                    : null,
                                    className,
                                )}
                                {...props}
                            />
                        );
                    },
                    h2: ({ className, ...props }) => (
                        <h2
                            className={cn(
                                "mt-10 border-b border-[rgb(var(--border))] pb-2",
                                className,
                            )}
                            {...props}
                        />
                    ),
                    h3: ({ className, ...props }) => (
                        <h3 className={cn("mt-8", className)} {...props} />
                    ),
                    blockquote: ({ children, className, ...props }) => {
                        const text = getText(children).trim();
                        const isQuran = /^কুরআন\s*[:：]/.test(text);
                        const isHadith = /^হাদিস\s*[:：]/.test(text);

                        return (
                            <blockquote
                                className={cn(
                                    "my-6 rounded-2xl border-l-4 bg-emerald-50/70 px-4 py-3",
                                    "border-emerald-500 text-slate-800",
                                    "dark:bg-emerald-950/25 dark:text-slate-100",
                                    className,
                                )}
                                {...props}
                            >
                                {(isQuran || isHadith) && (
                                    <div className="mb-2 text-xs font-bold text-emerald-800 dark:text-emerald-200">
                                        {isQuran ? "কুরআনের বাণী" : "হাদিস"}
                                    </div>
                                )}
                                {children}
                            </blockquote>
                        );
                    },
                    code: ({ className, children, ...props }) => (
                        <code
                            className={cn(
                                "rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]",
                                "dark:bg-slate-800",
                                className,
                            )}
                            {...props}
                        >
                            {children}
                        </code>
                    ),
                    pre: ({ className, children, ...props }) => (
                        <pre
                            className={cn(
                                "overflow-x-auto rounded-2xl border border-[rgb(var(--border))] bg-slate-950 p-4 text-slate-50",
                                className,
                            )}
                            {...props}
                        >
                            {children}
                        </pre>
                    ),
                }}
            >
                {normalizedContent}
            </ReactMarkdown>
        </article>
    );
}
