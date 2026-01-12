"use client";

import { useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { PostContent } from "@/components/PostContent";

type Action =
    | "bold"
    | "italic"
    | "h2"
    | "h3"
    | "alignLeft"
    | "alignCenter"
    | "alignRight"
    | "alignJustify"
    | "quote"
    | "quran"
    | "hadith"
    | "ul"
    | "ol"
    | "link"
    | "code"
    | "hr";

function applyActionToMarkdown(
    current: string,
    selectionStart: number,
    selectionEnd: number,
    action: Action,
) {
    const before = current.slice(0, selectionStart);
    const selected = current.slice(selectionStart, selectionEnd);
    const after = current.slice(selectionEnd);

    const toggleWrap = (left: string, right = left) => {
        // If text is selected and already wrapped, unwrap it.
        if (selectionEnd > selectionStart && selected.startsWith(left) && selected.endsWith(right)) {
            const unwrapped = selected.slice(left.length, selected.length - right.length);
            const next = `${before}${unwrapped}${after}`;
            const cursorStart = selectionStart;
            const cursorEnd = selectionStart + unwrapped.length;
            return { next, cursorStart, cursorEnd };
        }

        // If selection is inside wrappers (common UX expectation), unwrap around it.
        if (selectionEnd > selectionStart) {
            if (before.endsWith(left) && after.startsWith(right)) {
                const next = `${before.slice(0, before.length - left.length)}${selected}${after.slice(right.length)}`;
                const cursorStart = selectionStart - left.length;
                const cursorEnd = cursorStart + selected.length;
                return { next, cursorStart, cursorEnd };
            }
        }

        // If no selection and cursor is between wrappers, remove them.
        if (selectionEnd === selectionStart) {
            if (before.endsWith(left) && after.startsWith(right)) {
                const next = `${before.slice(0, before.length - left.length)}${after.slice(right.length)}`;
                const cursorStart = selectionStart - left.length;
                return { next, cursorStart, cursorEnd: cursorStart };
            }
        }

        // Otherwise, wrap selection (or insert empty wrapper).
        // Important: keep markers tight to the text; markdown like `** bold **` often renders literally.
        if (selectionEnd > selectionStart) {
            const match = selected.match(/^(\s*)([\s\S]*?)(\s*)$/);
            const leadingWs = match?.[1] ?? "";
            const core = match?.[2] ?? selected;
            const trailingWs = match?.[3] ?? "";

            // If selection is only whitespace, just wrap it normally.
            if (!core) {
                const next = `${before}${left}${selected}${right}${after}`;
                const cursorStart = selectionStart + left.length;
                const cursorEnd = cursorStart + selected.length;
                return { next, cursorStart, cursorEnd };
            }

            const wrapped = `${leadingWs}${left}${core}${right}${trailingWs}`;
            const next = `${before}${wrapped}${after}`;

            // Keep selection on the core text (not including markers/whitespace).
            const cursorStart = selectionStart + leadingWs.length + left.length;
            const cursorEnd = cursorStart + core.length;
            return { next, cursorStart, cursorEnd };
        }

        // No selection: insert empty wrapper and place cursor inside.
        const next = `${before}${left}${right}${after}`;
        const cursorStart = selectionStart + left.length;
        return { next, cursorStart, cursorEnd: cursorStart };
    };

    const linePrefix = (prefix: string) => {
        // Add prefix at line start of the selection.
        const sel = selected || "";
        const lines = sel.length ? sel.split(/\r?\n/) : [""];
        const nextSel = lines.map((l) => `${prefix}${l}`).join("\n");
        const next = `${before}${nextSel}${after}`;
        const cursorStart = selectionStart;
        const cursorEnd = selectionStart + nextSel.length;
        return { next, cursorStart, cursorEnd };
    };

    const insertBlock = (block: string) => {
        const needsNlBefore = before.length > 0 && !before.endsWith("\n");
        const needsNlAfter = after.length > 0 && !after.startsWith("\n");
        const left = `${needsNlBefore ? "\n" : ""}\n`;
        const right = `\n${needsNlAfter ? "\n" : ""}`;

        const next = `${before}${left}${block}${right}${after}`;
        const cursorStart = before.length + left.length;
        const cursorEnd = cursorStart + block.length;
        return { next, cursorStart, cursorEnd };
    };

    const wrapBlockHtml = (align: "left" | "center" | "right" | "justify") => {
        const sel = selected || "";
        const open = `<div align=\"${align}\">\n`;
        const close = `\n</div>`;

        // Toggle off if selection is already an exact alignment block.
        if (sel && sel.startsWith(open) && sel.endsWith(close)) {
            const unwrapped = sel.slice(open.length, sel.length - close.length);
            const next = `${before}${unwrapped}${after}`;
            const cursorStart = selectionStart;
            const cursorEnd = selectionStart + unwrapped.length;
            return { next, cursorStart, cursorEnd };
        }

        if (!sel) {
            const block = `${open}\n${close}`;
            const { next, cursorStart } = insertBlock(block);
            // place cursor on the empty line
            const start = cursorStart + open.length;
            return { next, cursorStart: start, cursorEnd: start };
        }

        // Wrap the selected text as a block.
        const needsNlBefore = before.length > 0 && !before.endsWith("\n");
        const needsNlAfter = after.length > 0 && !after.startsWith("\n");
        const left = `${needsNlBefore ? "\n" : ""}`;
        const right = `${needsNlAfter ? "\n" : ""}`;

        const nextSel = `${open}${sel}${close}`;
        const next = `${before}${left}${nextSel}${right}${after}`;
        const cursorStart = before.length + left.length;
        const cursorEnd = cursorStart + nextSel.length;
        return { next, cursorStart, cursorEnd };
    };

    switch (action) {
        case "bold":
            return toggleWrap("**", "**");
        case "italic":
            return toggleWrap("*", "*");
        case "code":
            return toggleWrap("`", "`");
        case "h2":
            return linePrefix("## ");
        case "h3":
            return linePrefix("### ");
        case "alignLeft":
            return wrapBlockHtml("left");
        case "alignCenter":
            return wrapBlockHtml("center");
        case "alignRight":
            return wrapBlockHtml("right");
        case "alignJustify":
            return wrapBlockHtml("justify");
        case "quote":
            return linePrefix("> ");
        case "quran":
            return insertBlock("> কুরআন: ");
        case "hadith":
            return insertBlock("> হাদিস: ");
        case "ul":
            return linePrefix("- ");
        case "ol":
            return linePrefix("1. ");
        case "hr":
            return insertBlock("---");
        case "link": {
            const text = selected || "লিংক টেক্সট";
            const block = `[${text}](https://)`;
            const next = `${before}${block}${after}`;
            const urlStart = before.length + block.indexOf("https://");
            const urlEnd = urlStart + "https://".length;
            return { next, cursorStart: urlStart, cursorEnd: urlEnd };
        }
    }
}

export function MarkdownEditor({
    value,
    onChange,
    placeholder,
    rows = 12,
    className,
    minHeightClassName,
}: {
    value: string;
    onChange: (next: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
    minHeightClassName?: string;
}) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [mode, setMode] = useState<"write" | "preview">("write");

    const toolbar = useMemo(
        () =>
            [
                { key: "h2", label: "H2" },
                { key: "h3", label: "H3" },
                { key: "alignLeft", label: "Left" },
                { key: "alignCenter", label: "Center" },
                { key: "alignRight", label: "Right" },
                { key: "alignJustify", label: "Justify" },
                { key: "bold", label: "B" },
                { key: "italic", label: "I" },
                { key: "quote", label: "Quote" },
                { key: "quran", label: "কুরআন" },
                { key: "hadith", label: "হাদিস" },
                { key: "ul", label: "• List" },
                { key: "ol", label: "1. List" },
                { key: "link", label: "Link" },
                { key: "code", label: "Code" },
                { key: "hr", label: "HR" },
            ] as const,
        [],
    );

    function run(action: Action) {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;

        const { next, cursorStart, cursorEnd } = applyActionToMarkdown(value || "", start, end, action);
        onChange(next);

        // Restore selection on next tick
        queueMicrotask(() => {
            try {
                el.focus();
                el.setSelectionRange(cursorStart, cursorEnd);
            } catch {
                // ignore
            }
        });
    }

    return (
        <div className={cn("md-editor rounded-2xl border border-[rgb(var(--border))] bg-white dark:bg-slate-950/30", className)}>
            <div className="flex flex-wrap items-center gap-2 border-b border-[rgb(var(--border))] p-2">
                <div className="flex flex-wrap gap-1">
                    {toolbar.map((b) => (
                        <button
                            key={b.key}
                            type="button"
                            onClick={() => run(b.key as Action)}
                            className={cn(
                                "inline-flex h-9 items-center rounded-xl border border-[rgb(var(--border))] bg-white px-3 text-sm font-semibold text-slate-800",
                                "hover:bg-slate-50 disabled:opacity-60",
                                "dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900",
                            )}
                        >
                            {b.label}
                        </button>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setMode("write")}
                        className={cn(
                            "inline-flex h-9 items-center rounded-xl px-3 text-sm font-semibold",
                            mode === "write"
                                ? "bg-emerald-700 text-white"
                                : "border border-[rgb(var(--border))] bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900",
                        )}
                    >
                        লিখুন
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("preview")}
                        className={cn(
                            "inline-flex h-9 items-center rounded-xl px-3 text-sm font-semibold",
                            mode === "preview"
                                ? "bg-emerald-700 text-white"
                                : "border border-[rgb(var(--border))] bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900",
                        )}
                    >
                        প্রিভিউ
                    </button>
                </div>
            </div>

            {mode === "write" ? (
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={rows}
                    placeholder={placeholder}
                    className={cn(
                        "w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500",
                        "dark:text-slate-50 dark:placeholder:text-slate-400",
                        // selection marker (emerald) inside editor
                        "selection:bg-emerald-200/70 selection:text-slate-900",
                        "dark:selection:bg-emerald-400/25 dark:selection:text-slate-50",
                        minHeightClassName,
                    )}
                />
            ) : (
                <div className={cn("px-3 py-4", minHeightClassName)}>
                    {value?.trim() ? (
                        <PostContent content={value} />
                    ) : (
                        <div className="text-sm text-slate-600 dark:text-slate-300">এখানে প্রিভিউ দেখাবে…</div>
                    )}
                </div>
            )}
        </div>
    );
}
