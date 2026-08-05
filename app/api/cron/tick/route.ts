import { NextRequest, NextResponse } from "next/server";
import { tickAllPrices } from "@/lib/priceEngine";

export const dynamic = "force-dynamic";

/**
 * Backstop for the lazy-tick pattern used everywhere else: real requests
 * advance prices as a side effect of reading them, but with zero traffic
 * nothing would. Vercel Cron hits this on a schedule (see vercel.json) so
 * prices keep moving even when nobody's looking.
 */
export async function GET(request: NextRequest) {
  // Vercel attaches `Authorization: Bearer $CRON_SECRET` to its own cron
  // requests when CRON_SECRET is set — see
  // https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs.
  // Enforced only if the secret is configured, so local dev/build without
  // it keeps working.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await tickAllPrices();
  return NextResponse.json({ ok: true, tickedAt: Date.now() });
}
