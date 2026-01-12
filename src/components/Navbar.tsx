"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { NavLinks } from "@/components/NavLinks";
import { SearchBox } from "@/components/SearchBox";
import { cn } from "@/lib/cn";

export function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Close mobile menu on navigation
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <header className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-white/85 backdrop-blur dark:bg-slate-950/70">
            <div className="mx-auto max-w-6xl px-4 py-3">
                {/* Mobile header row */}
                <div className="grid grid-cols-3 items-center md:hidden">
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="মেনু"
                        aria-expanded={open}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900"
                    >
                        <span className="sr-only">Menu</span>
                        <div className="flex flex-col gap-1">
                            <span className={cn("h-0.5 w-5 rounded bg-current transition", open && "translate-y-1.5 rotate-45")} />
                            <span className={cn("h-0.5 w-5 rounded bg-current transition", open && "opacity-0")} />
                            <span className={cn("h-0.5 w-5 rounded bg-current transition", open && "-translate-y-1.5 -rotate-45")} />
                        </div>
                    </button>

                    <Link
                        href="/"
                        className="justify-self-center rounded-lg px-2 py-1 text-lg font-extrabold tracking-tight text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                        aria-label="NWU IAN হোম"
                    >
                        NWU IAN
                    </Link>

                    <div />
                </div>

                {/* Desktop layout */}
                <div className="hidden items-center gap-3 md:flex">
                    <Link
                        href="/"
                        className="shrink-0 rounded-lg px-2 py-1 text-lg font-bold tracking-tight text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                        aria-label="NWU IAN হোম"
                    >
                        NWU IAN
                    </Link>

                    <NavLinks />

                    <div className="ml-auto w-[22rem]">
                        <SearchBox inputId="search-desktop" />
                    </div>
                </div>

                {/* Mobile drawer */}
                <div
                    className={cn(
                        "md:hidden",
                        "transition-[max-height,opacity] duration-200 ease-out",
                        open ? "max-h-[540px] opacity-100" : "pointer-events-none max-h-0 opacity-0",
                        "overflow-hidden",
                    )}
                >
                    <div className="mt-3 space-y-3">
                        <SearchBox inputId="search-mobile" />
                        <NavLinks variant="menu" onNavigate={() => setOpen(false)} />
                    </div>
                </div>
            </div>
        </header>
    );
}
