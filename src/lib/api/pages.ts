import { endpoints } from "@/lib/api/endpoints";
import { serverGetJson } from "@/lib/api/server";
import type { SitePage, SitePageSlug } from "@/types/site";

export async function getPageBySlug(slug: SitePageSlug) {
   const json = await serverGetJson<unknown>(endpoints.pageBySlug(slug), {
      revalidateSeconds: 30,
      tags: ["pages", `page:${slug}`],
   });

   return json as SitePage;
}
