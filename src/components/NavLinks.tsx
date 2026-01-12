"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const LINKS = [
   { href: "/", label: "মূলপাতা" },
   { href: "/activities", label: "আমাদের কার্যক্রম" },
   { href: "/lists", label: "তালিকাসমূহ" },
   { href: "/contact", label: "যোগাযোগ" },
] as const;

export function NavLinks({ className }: { className?: string }) {
   const pathname = usePathname();

   return (
      <nav
         aria-label="Primary"
         className={cn(
            "flex items-center gap-1 overflow-x-auto rounded-xl bg-white/60 p-1 text-sm shadow-sm ring-1 ring-[rgb(var(--border))] backdrop-blur dark:bg-slate-950/20",
            className
         )}
      >
         {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
               <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                     "whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-200",
                     active &&
                     "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                  )}
               >
                  {l.label}
               </Link>
            );
         })}
      </nav>
   );
}
