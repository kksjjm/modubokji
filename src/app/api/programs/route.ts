import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// 현재 진행 중인 신규 지원사업 목록 조회
export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await getSupabase()
      .from("programs")
      .select("*")
      .gte("end_date", today)
      .order("end_date", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ programs: data || [] });
  } catch (err) {
    console.error("Programs fetch error:", err);
    return NextResponse.json({ programs: [] }, { status: 500 });
  }
}
