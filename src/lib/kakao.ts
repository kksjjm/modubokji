// 카카오톡 알림톡 발송
//
// 사전 준비:
// 1. 카카오 비즈니스 채널에서 알림톡 템플릿 등록 + 승인
// 2. 카카오 i 오픈빌더 또는 비즈메시지 API 사용
// 3. 환경변수: KAKAO_REST_API_KEY, KAKAO_SENDER_KEY
//
// 알림톡 템플릿 예시:
// [모두복지] 새로운 지원사업 안내
// #{사용자명}님, 새로운 지원사업이 등록되었습니다.
//
// #{프로그램명}
// 기관: #{주관기관}
// 혜택: #{혜택내용}
// 마감일: #{마감일}
//
// 자세히 보기: #{링크}

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY || "";
const KAKAO_SENDER_KEY = process.env.KAKAO_SENDER_KEY || "";
const KAKAO_TEMPLATE_CODE = process.env.KAKAO_TEMPLATE_CODE || "";

interface AlimtalkParams {
  recipientPhoneNumber: string;
  programName: string;
  organization: string;
  benefits: string;
  endDate: string;
  applicationUrl: string;
}

export async function sendAlimtalk(params: AlimtalkParams): Promise<boolean> {
  if (!KAKAO_REST_API_KEY || !KAKAO_SENDER_KEY) {
    console.warn("카카오 API 키가 설정되지 않았습니다.");
    return false;
  }

  try {
    const response = await fetch(
      "https://kapi.kakao.com/v2/api/talk/memo/default/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
        body: JSON.stringify({
          senderKey: KAKAO_SENDER_KEY,
          templateCode: KAKAO_TEMPLATE_CODE,
          recipientList: [
            {
              recipientNo: params.recipientPhoneNumber,
              templateParameter: {
                프로그램명: params.programName,
                주관기관: params.organization,
                혜택내용: params.benefits,
                마감일: params.endDate,
                링크: params.applicationUrl,
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("알림톡 발송 실패:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("알림톡 발송 에러:", error);
    return false;
  }
}
