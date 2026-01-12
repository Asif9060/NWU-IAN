"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/States";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // চাইলে এখানে ক্লায়েন্ট লগিং যোগ করা যাবে
        console.error(error);
    }, [error]);

    return (
        <div className="space-y-4">
            <ErrorState title="অপ্রত্যাশিত ত্রুটি" message={error.message} />
            <button
                type="button"
                onClick={() => reset()}
                className="inline-flex rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
                আবার চেষ্টা করুন
            </button>
        </div>
    );
}
