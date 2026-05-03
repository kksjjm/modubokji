import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const API_KEY = process.env.DATA_GO_KR_API_KEY || "";
const ODCLOUD_URL =
  "https://api.odcloud.kr/api/15083323/v1/uddi:48d6c839-ce02-4546-901e-e9ad9bae8e0d";

// Vercel Cron: 매일 새벽 3시에 복지서비스 데이터 동기화
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "DATA_GO_KR_API_KEY not set" }, { status: 500 });
  }

  try {
    // odcloud API에서 최신 복지서비스 가져오기 (최대 200개)
    const url = `${ODCLOUD_URL}?page=1&perPage=200&serviceKey=${encodeURIComponent(API_KEY)}`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: `API ${res.status}` }, { status: 502 });
    }

    const json = await res.json();
    const services = json.data || [];

    if (services.length === 0) {
      return NextResponse.json({ message: "조회된 서비스 없음", crawled: 0 });
    }

    const supabase = getSupabase();
    const { data: existing } = await supabase.from("programs").select("id");
    const existingIds = new Set((existing || []).map((p: { id: string }) => p.id));

    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    let added = 0;

    for (const svc of services) {
      const id = `gov-${svc.서비스아이디}`;
      if (existingIds.has(id)) continue;

      const name: string = svc.서비스명 || "";
      const org: string = svc.소관부처명 || "";
      const text = name + org;

      let category = "기타";
      if (/기초생활|생계급여|긴급복지/.test(text)) category = "기초생활";
      else if (/주거|임대|월세/.test(text)) category = "주거";
      else if (/의료|건강|진료|요양/.test(text)) category = "의료";
      else if (/교육|장학/.test(text)) category = "교육";
      else if (/고용|취업|구직|실업/.test(text)) category = "고용";
      else if (/아동|보육|양육|출산|가족|한부모/.test(text)) category = "아동가족";
      else if (/장애/.test(text)) category = "장애인";
      else if (/노인|어르신|치매/.test(text)) category = "노인";
      else if (/청년/.test(text)) category = "청년";

      const rules: Array<{ field: string; operator: string; value: unknown; required: boolean }> = [];
      if (/노인|어르신/.test(name)) rules.push({ field: "age", operator: "gte", value: 65, required: true });
      if (/청년/.test(name)) rules.push({ field: "age", operator: "between", value: [19, 34], required: true });
      if (/장애/.test(name)) rules.push({ field: "disabilities", operator: "contains", value: "중증장애", required: false });
      if (/임산|출산/.test(name)) rules.push({ field: "life_situations", operator: "contains", value: "임신", required: true });
      if (/보육|양육|돌봄/.test(name)) rules.push({ field: "life_situations", operator: "contains", value: "영유아양육", required: true });
      if (/한부모/.test(name)) rules.push({ field: "household_type", operator: "eq", value: "한부모", required: true });

      const { error } = await supabase.from("programs").insert({
        id,
        name,
        category,
        description: svc.서비스요약 || "",
        organization: org,
        eligibility_rules: rules,
        benefits: svc.서비스요약 || "",
        estimated_amount: "",
        application_url: svc.서비스URL || "",
        start_date: today,
        end_date: endDate,
        source_url: svc.서비스URL || "https://www.bokjiro.go.kr",
      });

      if (!error) added++;
    }

    return NextResponse.json({
      message: "크롤링 완료",
      total_fetched: services.length,
      new_added: added,
    });
  } catch (err) {
    console.error("Crawl error:", err);
    return NextResponse.json({ error: "크롤링 실패" }, { status: 500 });
  }
}
