/**
 * 복지 정책 크롤링 파이프라인
 *
 * 데이터 소스: 공공데이터포털 odcloud API
 * - 한국사회보장정보원_복지서비스정보 (372개 서비스)
 * - 엔드포인트: https://api.odcloud.kr/api/15083323/v1/uddi:48d6c839-ce02-4546-901e-e9ad9bae8e0d
 *
 * 실행:
 *   DATA_GO_KR_API_KEY="your_key" npx tsx scripts/crawl-welfare.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.DATA_GO_KR_API_KEY || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const ODCLOUD_ENDPOINT =
  "https://api.odcloud.kr/api/15083323/v1/uddi:48d6c839-ce02-4546-901e-e9ad9bae8e0d";

interface WelfareServiceRaw {
  서비스아이디: string;
  서비스명: string;
  서비스요약: string;
  서비스URL: string;
  소관부처명: string;
  소관조직명: string;
  대표문의: string;
  사이트: string;
  기준연도: number;
  최종수정일: string;
}

// 1. API에서 전체 복지서비스 목록 가져오기
async function fetchAllServices(): Promise<WelfareServiceRaw[]> {
  const all: WelfareServiceRaw[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${ODCLOUD_ENDPOINT}?page=${page}&perPage=${perPage}&serviceKey=${encodeURIComponent(API_KEY)}`;
    console.log(`[API] 페이지 ${page} 조회 중...`);

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  API 오류: ${res.status}`);
      break;
    }

    const json = await res.json();
    const items: WelfareServiceRaw[] = json.data || [];
    all.push(...items);

    console.log(`  ${items.length}개 수집 (누적 ${all.length}/${json.totalCount})`);

    if (all.length >= json.totalCount || items.length < perPage) break;
    page++;

    await new Promise((r) => setTimeout(r, 300));
  }

  return all;
}

// 2. 카테고리 추론
function inferCategory(name: string, org: string): string {
  const text = name + org;
  if (/기초생활|생계급여|긴급복지|에너지바우처/.test(text)) return "기초생활";
  if (/주거|임대|월세|전세/.test(text)) return "주거";
  if (/의료|건강|진료|요양|산재/.test(text)) return "의료";
  if (/교육|장학|학비|학자금/.test(text)) return "교육";
  if (/고용|취업|구직|실업|일자리|근로/.test(text)) return "고용";
  if (/아동|보육|양육|출산|임산|돌봄|가족|한부모/.test(text)) return "아동가족";
  if (/장애/.test(text)) return "장애인";
  if (/노인|어르신|치매|기초연금|경로/.test(text)) return "노인";
  if (/청년|청소년/.test(text)) return "청년";
  return "기타";
}

// 3. 자격 규칙 추론
function inferRules(name: string, category: string) {
  const rules: Array<{ field: string; operator: string; value: unknown; required: boolean }> = [];

  if (category === "노인" || /노인|어르신|경로/.test(name))
    rules.push({ field: "age", operator: "gte", value: 65, required: true });
  if (category === "청년" || /청년/.test(name))
    rules.push({ field: "age", operator: "between", value: [19, 34], required: true });
  if (/장애/.test(name))
    rules.push({ field: "disabilities", operator: "contains", value: "중증장애", required: false });
  if (/임산|출산/.test(name))
    rules.push({ field: "life_situations", operator: "contains", value: "임신", required: true });
  if (/보육|양육|아이돌봄|아동수당/.test(name))
    rules.push({ field: "life_situations", operator: "contains", value: "영유아양육", required: true });
  if (/한부모/.test(name))
    rules.push({ field: "household_type", operator: "eq", value: "한부모", required: true });
  if (/다자녀|다둥이/.test(name))
    rules.push({ field: "household_type", operator: "eq", value: "다자녀", required: true });
  if (/기초생활|수급/.test(name))
    rules.push({ field: "income_bracket", operator: "lte", value: 1, required: true });
  if (/차상위/.test(name))
    rules.push({ field: "income_bracket", operator: "lte", value: 2, required: true });
  if (/실업|구직/.test(name))
    rules.push({ field: "life_situations", operator: "contains", value: "실업", required: true });

  return rules;
}

// 4. 메인
async function main() {
  if (!API_KEY) {
    console.error("DATA_GO_KR_API_KEY 환경변수가 필요합니다.");
    console.error("사용법: DATA_GO_KR_API_KEY=your_key npx tsx scripts/crawl-welfare.ts");
    process.exit(1);
  }

  console.log("=== 복지 정책 크롤링 파이프라인 ===\n");

  // API에서 전체 데이터 수집
  const services = await fetchAllServices();
  console.log(`\n총 ${services.length}개 복지서비스 수집 완료\n`);

  if (services.length === 0) {
    console.log("수집된 데이터가 없습니다.");
    return;
  }

  // policies.json 업데이트
  const policiesPath = path.join(__dirname, "..", "data", "policies.json");
  const existingPolicies = JSON.parse(fs.readFileSync(policiesPath, "utf-8"));
  const existingIds = new Set(existingPolicies.map((p: { id: string }) => p.id));
  const today = new Date().toISOString().split("T")[0];

  let added = 0;

  for (const svc of services) {
    const id = `gov-${svc.서비스아이디}`;
    if (existingIds.has(id)) {
      // 기존 정책은 last_verified만 업데이트
      const idx = existingPolicies.findIndex((p: { id: string }) => p.id === id);
      if (idx >= 0) existingPolicies[idx].last_verified = today;
      continue;
    }

    const category = inferCategory(svc.서비스명, svc.소관부처명);
    const rules = inferRules(svc.서비스명, category);

    existingPolicies.push({
      id,
      name: svc.서비스명,
      category,
      description: svc.서비스요약,
      eligibility_rules: rules,
      benefits: svc.서비스요약,
      estimated_amount: "",
      required_documents: [],
      application_steps: [
        {
          step: 1,
          description: svc.대표문의 ? `문의: ${svc.대표문의}` : `${svc.소관부처명}에 문의`,
          location: svc.소관부처명,
          method: svc.서비스URL ? "온라인 또는 방문" : "방문",
          notes: "",
        },
      ],
      incompatible_policies: [],
      deadline: null,
      source_url: svc.서비스URL || "https://www.bokjiro.go.kr",
      last_verified: today,
      status: "active",
    });
    added++;
  }

  fs.writeFileSync(policiesPath, JSON.stringify(existingPolicies, null, 2), "utf-8");
  console.log(`=== policies.json 업데이트 ===`);
  console.log(`기존: ${existingIds.size}개, 신규: ${added}개, 총: ${existingPolicies.length}개\n`);

  // Supabase programs 테이블에도 저장
  if (SUPABASE_URL && SUPABASE_KEY && added > 0) {
    console.log("Supabase programs 테이블에 신규 서비스 저장 중...\n");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    let saved = 0;
    for (const svc of services) {
      const id = `gov-${svc.서비스아이디}`;
      if (existingIds.has(id)) continue;

      const { error } = await supabase.from("programs").upsert(
        {
          id,
          name: svc.서비스명,
          category: inferCategory(svc.서비스명, svc.소관부처명),
          description: svc.서비스요약,
          organization: svc.소관부처명,
          eligibility_rules: inferRules(svc.서비스명, inferCategory(svc.서비스명, svc.소관부처명)),
          benefits: svc.서비스요약,
          estimated_amount: "",
          application_url: svc.서비스URL || "",
          start_date: today,
          end_date: endDate,
          source_url: svc.서비스URL || "https://www.bokjiro.go.kr",
        },
        { onConflict: "id" }
      );
      if (!error) saved++;
    }
    console.log(`  ${saved}개 저장 완료\n`);
  }

  console.log("=== 크롤링 완료 ===");
}

main().catch(console.error);
