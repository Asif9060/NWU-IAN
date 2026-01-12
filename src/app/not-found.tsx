import Link from "next/link";

export default function NotFound() {
    return (
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-8 text-center shadow-sm dark:bg-slate-950/40">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
                পেজটি পাওয়া যায়নি
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                আপনি যে পেজটি খুঁজছেন সেটি নেই অথবা সরানো হয়েছে।
            </p>
            <div className="mt-6">
                <Link
                    href="/"
                    className="inline-flex rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                    হোমে ফিরে যান
                </Link>
            </div>
        </div>
    );
}
