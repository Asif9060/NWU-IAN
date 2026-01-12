export function formatBnDate(iso?: string | null) {
   if (!iso) return "";
   const date = new Date(iso);
   if (Number.isNaN(date.getTime())) return "";

   return new Intl.DateTimeFormat("bn-BD", {
      dateStyle: "long",
   }).format(date);
}

export function toExcerpt(text: string, maxWords = 120) {
   const clean = stripMarkdown(text).replace(/\s+/g, " ").trim();

   const words = clean.split(" ");
   if (words.length <= maxWords) return clean;
   return `${words.slice(0, maxWords).join(" ")}…`;
}

export function formatBnNumber(value: number) {
   return new Intl.NumberFormat("bn-BD").format(value);
}

export function estimateReadingMinutes(text: string) {
   const clean = stripMarkdown(text).replace(/\s+/g, " ").trim();

   const words = clean ? clean.split(" ").filter(Boolean).length : 0;
   // বাংলা কনটেন্টের জন্য একটি reasonable ডিফল্ট (≈ 170 wpm)
   const minutes = Math.max(1, Math.round(words / 170));
   return minutes;
}

export function stripMarkdown(text: string) {
   return (
      String(text ?? "")
         .replace(/<[^>]*>/g, " ")
         .replace(/\r?\n/g, " ")
         .replace(/\s+/g, " ")
         // remove common markdown tokens
         .replace(/[`*_>#~\[\]()-]/g, " ")
         .replace(/\s+/g, " ")
         .trim()
   );
}
