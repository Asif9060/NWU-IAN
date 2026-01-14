export type SitePageSlug = "activities" | "contact";

export type SitePage = {
   _id: string;
   slug: SitePageSlug;
   title: string;
   content: string;
   createdAt?: string;
   updatedAt?: string;
};
