export default function PrivacyPage() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
      <h2 className="text-2xl font-bold">개인정보처리방침</h2>
      <p className="text-sm text-gray-900">시행일: 2024년 3월 1일</p>

      <section className="space-y-2">
        <h3 className="text-lg font-bold">1. 수집하는 개인정보 항목</h3>
        <p>모두복지는 복지 혜택 추천을 위해 다음 정보를 수집합니다:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-900">
          <li>나이</li>
          <li>소득 구간 (자가 신고)</li>
          <li>가구 유형</li>
          <li>거주 지역</li>
          <li>장애 여부</li>
          <li>생활 상황 (임신, 실업 등)</li>
          <li>현재 수급 중인 복지 혜택</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold">2. 개인정보의 수집 및 이용 목적</h3>
        <p className="text-gray-900">
          수집된 정보는 사용자에게 적합한 복지 혜택을 추천하기 위한 목적으로만 사용됩니다.
          그 외의 목적으로는 일체 사용되지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold">3. 개인정보의 저장 및 보관</h3>
        <div className="bg-blue-50 rounded-lg p-4 text-gray-900">
          <p className="font-medium mb-2">모든 정보는 사용자의 브라우저(localStorage)에만 저장됩니다.</p>
          <ul className="list-disc list-inside space-y-1">
            <li>서버로 전송되지 않습니다</li>
            <li>외부 서비스에 공유되지 않습니다</li>
            <li>브라우저 데이터를 삭제하면 모든 정보가 즉시 제거됩니다</li>
            <li>다른 기기나 브라우저에서는 접근할 수 없습니다</li>
          </ul>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold">4. 개인정보의 파기</h3>
        <p className="text-gray-900">
          사용자가 브라우저의 사이트 데이터를 삭제하면 저장된 모든 개인정보가 즉시 파기됩니다.
          별도의 탈퇴 절차가 필요하지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold">5. 개인정보의 제3자 제공</h3>
        <p className="text-gray-900">
          모두복지는 수집한 개인정보를 제3자에게 제공하지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold">6. 이용자의 권리</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-900">
          <li>언제든지 브라우저 데이터 삭제를 통해 개인정보를 파기할 수 있습니다</li>
          <li>개인정보 수집에 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold">7. 면책 조항</h3>
        <p className="text-gray-900">
          모두복지의 복지 혜택 추천은 참고 목적으로만 제공됩니다.
          최종 수급 자격 여부는 반드시 해당 기관(주민센터, 시군구청 등)에서 확인하시기 바랍니다.
          모두복지는 추천 결과의 정확성을 보장하지 않으며, 이로 인한 어떠한 손해에 대해서도
          법적 책임을 지지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold">8. 개인정보 보호책임자</h3>
        <p className="text-gray-900">
          모두복지는 오픈소스 프로젝트입니다.
          개인정보 관련 문의사항은 GitHub 저장소의 Issues를 통해 접수할 수 있습니다.
        </p>
      </section>

      <div className="pt-4 border-t">
        <a href="/" className="text-blue-600 hover:underline">
          ← 홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}
