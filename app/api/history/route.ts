import { NextResponse } from "next/server";
import { listCouncilHistory } from "@/lib/history";

export async function GET() {
  try {
    const items = await listCouncilHistory();
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
