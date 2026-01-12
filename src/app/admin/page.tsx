import type { Metadata } from "next";

import { AdminPanel } from "@/app/admin/ui/AdminPanel";

export const metadata: Metadata = {
    title: "অ্যাডমিন প্যানেল",
    description: "NWU IAN ব্লগ পরিচালনা",
};

export default function AdminPage() {
    return <AdminPanel />;
}
