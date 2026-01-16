import { PostCard } from "@/components/PostCard";
import { PostExpanded } from "@/components/PostExpanded";
import { EmptyState, ErrorState } from "@/components/States";
import { getPosts } from "@/lib/api/posts";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;

  let posts = [] as Awaited<ReturnType<typeof getPosts>>;
  try {
    posts = await getPosts({ q });
  } catch (e) {
    return (
      <ErrorState
        title="পোস্ট লোড করা যায়নি"
        message={e instanceof Error ? e.message : "অজানা ত্রুটি"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 shadow-sm dark:bg-slate-950/40">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          NWU ইসলামিক অ্যাওয়ারনেস নেটওয়ার্ক (NWU IAN)
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          ইসলামি সচেতনতা, নৈতিক শিক্ষা এবং সমাজকল্যাণমূলক বার্তা ছড়িয়ে দিতে আমাদের বাংলা ব্লগ।
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href="https://islamic-ai-chatbot.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            AI ইসলামিক চ্যাটবট
          </a>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            প্রশ্ন করুন — নতুন ট্যাবে খুলবে
          </span>
        </div>
        {q ? (
          <div className="mt-4 text-sm text-slate-700 dark:text-slate-200">
            অনুসন্ধান: <span className="font-semibold">{q}</span>
          </div>
        ) : null}
      </section>

      {posts.length === 0 ? (
        <EmptyState
          title={q ? "এই শব্দে কোনো পোস্ট পাওয়া যায়নি" : "এখনো কোনো পোস্ট প্রকাশিত হয়নি"}
          message={
            q
              ? "শব্দ পরিবর্তন করে আবার চেষ্টা করুন।"
              : "অ্যাডমিন প্যানেল থেকে নতুন পোস্ট যোগ করুন।"
          }
        />
      ) : (
        <>
          {/* মোবাইল: কার্ড নয় — সম্পূর্ণ পোস্ট expanded */}
          <div className="grid grid-cols-1 gap-6 md:hidden">
            {posts.map((p) => (
              <PostExpanded key={p._id} post={p} />
            ))}
          </div>

          {/* ট্যাবলেট/ডেস্কটপ: কার্ড ফিড */}
          <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
