import { endpoints } from "@/lib/api/endpoints";
import { serverGetJson } from "@/lib/api/server";
import type { BlogPost, PaginatedResponse } from "@/types/blog";

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === "object" && value !== null;
}

function normalizeList<T>(value: unknown): T[] {
   if (Array.isArray(value)) return value as T[];
   if (isRecord(value)) {
      const data = (value as PaginatedResponse<T>).data as unknown;
      if (Array.isArray(data)) return data as T[];
   }
   return [];
}

export async function getPosts(params?: { q?: string }) {
   const search = new URLSearchParams();
   if (params?.q) search.set("q", params.q);

   const path = `${endpoints.posts}${search.size ? `?${search.toString()}` : ""}`;
   const json = await serverGetJson<unknown>(path, {
      revalidateSeconds: 10,
      tags: ["posts"],
   });

   return normalizeList<BlogPost>(json);
}

export async function getPostBySlug(slug: string) {
   const json = await serverGetJson<unknown>(endpoints.postBySlug(slug), {
      revalidateSeconds: 30,
      tags: ["posts", `post:${slug}`],
   });

   // backend যদি {data: post} দেয়
   if (isRecord(json) && "data" in json && json.data) {
      return json.data as BlogPost;
   }
   return json as BlogPost;
}
