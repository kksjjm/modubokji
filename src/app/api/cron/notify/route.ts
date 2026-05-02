import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
import { matchAll } from "@/lib/matching-engine";
import type { Policy, UserProfile } from "@/lib/types";

// Vercel Cron으로 호출: 새 지원사업과 구독자를 매칭하고 알림 발송
// vercel.json에서 cron 스케줄 설정 필요
export async function GET(request: NextRequest) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. 아직 알림을 보내지 않은 신규 지원사업 조회
    const today = new Date().toISOString().split("T")[0];
    const { data: newPrograms, error: programError } = await getSupabase()
      .from("programs")
      .select("*")
      .eq("notified", false)
      .gte("end_date", today);

    if (programError) throw programError;
    if (!newPrograms || newPrograms.length === 0) {
      return NextResponse.json({ message: "새 지원사업 없음", notified: 0 });
    }

    // 2. 알림 구독자 전체 조회
    const { data: subscribers, error: subError } = await getSupabase()
      .from("subscribers")
      .select("*");

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: "구독자 없음", notified: 0 });
    }

    // 3. 각 구독자별로 새 지원사업과 매칭
    let totalNotifications = 0;

    for (const subscriber of subscribers) {
      const profile = subscriber.profile as UserProfile;

      // 지원사업을 Policy 형태로 변환해서 매칭 엔진 사용
      const programsAsPolicies: Policy[] = newPrograms.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        eligibility_rules: p.eligibility_rules || [],
        benefits: p.benefits,
        estimated_amount: p.estimated_amount || "",
        required_documents: [],
        application_steps: [],
        incompatible_policies: [],
        deadline: p.end_date,
        source_url: p.source_url || "",
        last_verified: today,
        status: "active" as const,
      }));

      const matched = matchAll(profile, programsAsPolicies);

      if (matched.length === 0) continue;

      // 4. 매칭된 지원사업에 대해 알림 이력 생성
      for (const match of matched) {
        const channel = subscriber.notify_kakao ? "kakao" : "web";

        await getSupabase().from("notifications").insert({
          subscriber_id: subscriber.id,
          program_id: match.policy.id,
          channel,
          status: "pending",
        });

        totalNotifications++;
      }
    }

    // 5. 알림 발송 완료 표시
    const programIds = newPrograms.map((p) => p.id);
    await getSupabase()
      .from("programs")
      .update({ notified: true })
      .in("id", programIds);

    return NextResponse.json({
      message: `${newPrograms.length}개 지원사업, ${totalNotifications}건 알림 생성`,
      programs: newPrograms.length,
      notified: totalNotifications,
    });
  } catch (err) {
    console.error("Cron notify error:", err);
    return NextResponse.json({ error: "알림 처리 실패" }, { status: 500 });
  }
}
