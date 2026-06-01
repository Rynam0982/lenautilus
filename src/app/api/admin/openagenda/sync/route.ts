import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { importAllFromOpenAgenda } from "@/services/openagenda.service";

export async function POST() {
  await requireAdmin();

  try {
    const stats = await importAllFromOpenAgenda();
    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
