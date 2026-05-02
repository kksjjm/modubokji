import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// 알림 구독 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, email, notify_kakao, notify_web } = body;

    if (!profile || (!email && !notify_web)) {
      return NextResponse.json(
        { error: "프로필과 알림 수단(이메일 또는 웹)이 필요합니다." },
        { status: 400 }
      );
    }

    // 이메일로 기존 구독 확인
    if (email) {
      const { data: existing } = await getSupabase()
        .from("subscribers")
        .select("id")
        .eq("email", email)
        .single();

      if (existing) {
        // 기존 구독 업데이트
        const { error } = await getSupabase()
          .from("subscribers")
          .update({ profile, notify_kakao, notify_web })
          .eq("id", existing.id);

        if (error) throw error;
        return NextResponse.json({ message: "알림 설정이 업데이트되었습니다.", id: existing.id });
      }
    }

    // 신규 구독 등록
    const { data, error } = await getSupabase()
      .from("subscribers")
      .insert({
        profile,
        email,
        notify_kakao: notify_kakao || false,
        notify_web: notify_web || true,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "알림 구독이 등록되었습니다.", id: data.id });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "알림 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 알림 구독 해제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "이메일이 필요합니다." }, { status: 400 });
    }

    const { error } = await getSupabase()
      .from("subscribers")
      .delete()
      .eq("email", email);

    if (error) throw error;

    return NextResponse.json({ message: "알림 구독이 해제되었습니다." });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return NextResponse.json(
      { error: "구독 해제에 실패했습니다." },
      { status: 500 }
    );
  }
}
