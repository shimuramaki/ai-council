import { NextRequest, NextResponse } from "next/server";
import { getCouncilHistory } from "@/lib/history";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getCouncilHistory(id);

    if (!record) {
      return NextResponse.json({ error: "履歴が見つかりません" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
