// আপনার Express backend-এর route অনুযায়ী প্রয়োজন হলে শুধু এই ফাইলটাই বদলালেই হবে।

export const endpoints = {
   // Next.js Route Handlers (same-origin)
   posts: "/api/posts",
   postBySlug: (slug: string) => `/api/posts/${encodeURIComponent(slug)}`,

   adminPosts: "/api/admin/posts",
   adminPostById: (id: string) => `/api/admin/posts/${encodeURIComponent(id)}`,

   categories: "/api/categories",
};
