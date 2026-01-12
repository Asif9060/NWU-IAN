import Link from "next/link";
import { Suspense } from "react";

import { NavLinks } from "@/components/NavLinks";
import { SearchBox } from "@/components/SearchBox";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-white/85 backdrop-blur dark:bg-slate-950/70">
            <div className="mx-auto max-w-6xl px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/"
                        className="shrink-0 rounded-lg px-2 py-1 text-lg font-bold tracking-tight text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                        aria-label="NWU IAN হোম"
                    >
                        NWU IAN
                    </Link>

                    <NavLinks className="order-3 w-full md:order-none md:w-auto" />

                    <div className="order-2 w-full md:order-none md:ml-auto md:w-[22rem]">
                        <Suspense fallback={<SearchBoxSkeleton />}>
                            <SearchBox />
                        </Suspense>
                    </div>
                </div>
            </div>
        </header>
    );
}

function SearchBoxSkeleton() {
    return (
        <div className="w-full rounded-full border border-[rgb(var(--border))] bg-white/70 px-4 py-2 text-sm text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
            খুঁজুন…
        </div>
    );
}
