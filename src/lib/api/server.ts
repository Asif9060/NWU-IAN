import { headers } from "next/headers";

export type ServerFetchOptions = {
   revalidateSeconds?: number;
   tags?: string[];
};

export async function serverGetJson<T>(path: string, options: ServerFetchOptions = {}) {
   // same-origin API: server component context থেকে host/proto নিয়ে absolute URL বানানো
   const h = await headers();
   const host = h.get("x-forwarded-host") ?? h.get("host");
   const proto = h.get("x-forwarded-proto") ?? "http";
   if (!host) {
      throw new Error("বেস URL নির্ধারণ করা যায়নি (host header পাওয়া যায়নি)");
   }
   const baseUrl = `${proto}://${host}`;

   const url = new URL(path, baseUrl).toString();
   const res = await fetch(url, {
      headers: {
         Accept: "application/json",
      },
      next: {
         revalidate: options.revalidateSeconds ?? 30,
         tags: options.tags,
      },
   });

   if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`ডাটা আনা যায়নি (HTTP ${res.status})${text ? `: ${text}` : ""}`);
   }

   return (await res.json()) as T;
}
