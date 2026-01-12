// Legacy axios wrapper (kept only for backward compatibility).
// New code should prefer Fetch helpers in src/lib/api/client.ts and same-origin /api routes.

type ApiResponse<T> = { data: T };

function withParams(
   url: string,
   params?: Record<string, string | number | boolean | null | undefined>
) {
   if (!params) return url;
   const sp = new URLSearchParams();
   for (const [k, v] of Object.entries(params)) {
      if (v === null || v === undefined || String(v).length === 0) continue;
      sp.set(k, String(v));
   }
   const qs = sp.toString();
   if (!qs) return url;
   return url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
}

async function request<T>(
   method: "GET" | "POST" | "PUT" | "DELETE",
   url: string,
   body?: unknown
): Promise<ApiResponse<T>> {
   const res = await fetch(url, {
      method,
      headers: {
         Accept: "application/json",
         ...(method === "GET" ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined || method === "GET" ? undefined : JSON.stringify(body),
   });

   const text = await res.text().catch(() => "");
   if (!res.ok) {
      try {
         const json = JSON.parse(text) as { message?: string; error?: string };
         throw new Error(
            json.message || json.error || `অনুরোধ ব্যর্থ (HTTP ${res.status})`
         );
      } catch {
         throw new Error(text || `অনুরোধ ব্যর্থ (HTTP ${res.status})`);
      }
   }

   const data = text ? (JSON.parse(text) as T) : (undefined as T);
   return { data };
}

export const api = {
   get: <T>(
      url: string,
      opts?: { params?: Record<string, string | number | boolean | null | undefined> }
   ) => request<T>("GET", withParams(url, opts?.params)),
   post: <T>(url: string, body?: unknown) => request<T>("POST", url, body),
   put: <T>(url: string, body?: unknown) => request<T>("PUT", url, body),
   delete: <T>(url: string) => request<T>("DELETE", url),
};
