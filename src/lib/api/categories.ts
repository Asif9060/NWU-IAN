import { endpoints } from "@/lib/api/endpoints";
import { serverGetJson } from "@/lib/api/server";
import type { Category, PaginatedResponse } from "@/types/blog";

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

export async function getCategories() {
   const json = await serverGetJson<unknown>(endpoints.categories, {
      revalidateSeconds: 60,
      tags: ["categories"],
   });
   return normalizeList<Category>(json);
}
