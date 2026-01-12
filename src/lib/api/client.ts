"use client";

type JsonValue = unknown;

async function safeReadText(res: Response) {
   try {
      return await res.text();
   } catch {
      return "";
   }
}

export async function clientGetJson<T = JsonValue>(input: string, init?: RequestInit) {
   const res = await fetch(input, {
      ...init,
      method: "GET",
      headers: {
         Accept: "application/json",
         ...(init?.headers ?? {}),
      },
   });

   if (!res.ok) {
      const text = await safeReadText(res);
      try {
         const json = JSON.parse(text) as { message?: string };
         throw new Error(json?.message || `ডাটা আনা যায়নি (HTTP ${res.status})`);
      } catch {
         throw new Error(text || `ডাটা আনা যায়নি (HTTP ${res.status})`);
      }
   }

   return (await res.json()) as T;
}

export async function clientJson<T = JsonValue>(
   input: string,
   method: "POST" | "PUT" | "DELETE",
   body?: unknown
) {
   const res = await fetch(input, {
      method,
      headers: {
         Accept: "application/json",
         "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
   });

   if (!res.ok) {
      const text = await safeReadText(res);
      try {
         const json = JSON.parse(text) as { message?: string };
         throw new Error(json?.message || `অনুরোধ ব্যর্থ (HTTP ${res.status})`);
      } catch {
         throw new Error(text || `অনুরোধ ব্যর্থ (HTTP ${res.status})`);
      }
   }

   // DELETE অনেক সময় empty হতে পারে
   const text = await safeReadText(res);
   if (!text) return undefined as T;
   return JSON.parse(text) as T;
}
