import { connectMongo } from "@/lib/mongodb";
import { SitePage } from "@/models/SitePage";
import { notFound, ok, serverError } from "@/app/api/_utils/responses";

const DEFAULT_PAGES: Record<
   string,
   {
      title: string;
      content: string;
   }
> = {
   activities: {
      title: "আমাদের কার্যক্রম",
      content:
         "NWU ইসলামিক অ্যাওয়ারনেস নেটওয়ার্ক (NWU IAN) — ইসলামি সচেতনতা বৃদ্ধি, দাওয়াহ, নৈতিক শিক্ষা এবং সমাজকল্যাণমূলক বার্তা ছড়িয়ে দিতে আমরা বিভিন্ন কার্যক্রম পরিচালনা করি।\n\n## দাওয়াহ ও শিক্ষামূলক লেখা\nকুরআন-সুন্নাহভিত্তিক সহজ ভাষায় লেখা, নৈতিক শিক্ষা ও আত্মশুদ্ধির বার্তা।\n\n## জনসচেতনতা কার্যক্রম\nসমাজে ভালো কাজের প্রচার, ক্ষতিকর অভ্যাস থেকে দূরে থাকার আহ্বান, নৈতিকতা চর্চা।\n\n## সামাজিক উদ্যোগ\nপ্রয়োজনভিত্তিক সহায়তা, স্বেচ্ছাসেবী কাজ, এবং কমিউনিটি-ভিত্তিক উদ্যোগ।",
   },
   contact: {
      title: "যোগাযোগ",
      content:
         "আপনার মতামত, পরামর্শ বা সহযোগিতার জন্য আমাদের সাথে যোগাযোগ করুন।\n\n- ইমেইল: admin@nwuian.example\n- ফেসবুক: (লিংক দিন)\n- ইউটিউব: (লিংক দিন)",
   },
};

// GET /api/pages/[slug]
export async function GET(
   _req: Request,
   { params }: { params: Promise<{ slug: string }> }
) {
   try {
      await connectMongo();

      const { slug } = await params;
      if (slug !== "activities" && slug !== "contact") {
         return notFound("পেজ পাওয়া যায়নি");
      }

      const page = await SitePage.findOne({ slug }).lean();
      if (!page) {
         const fallback = DEFAULT_PAGES[slug];
         return ok({ slug, title: fallback.title, content: fallback.content });
      }

      return ok(page);
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
