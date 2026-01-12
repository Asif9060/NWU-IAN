import { connectMongo } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import {
   badRequest,
   conflict,
   created,
   ok,
   serverError,
} from "@/app/api/_utils/responses";
import { createCategorySchema } from "@/app/api/_utils/validators";

// GET /api/categories
export async function GET() {
   try {
      await connectMongo();
      const categories = await Category.find({}).sort({ name: 1 }).lean();
      return ok(categories);
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

// POST /api/categories
export async function POST(req: Request) {
   try {
      await connectMongo();

      const body = await req.json().catch(() => null);
      const parsed = createCategorySchema.safeParse(body);
      if (!parsed.success) {
         return badRequest(parsed.error.issues.map((i) => i.message).join(" | "));
      }

      const name = parsed.data.name.trim();
      const exists = await Category.exists({ name });
      if (exists) return conflict("এই ক্যাটাগরি ইতিমধ্যেই আছে");

      const doc = await Category.create({ name });
      return created(doc);
   } catch (e) {
      const message = e instanceof Error ? e.message : "সার্ভার ত্রুটি";
      return serverError(message);
   }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
