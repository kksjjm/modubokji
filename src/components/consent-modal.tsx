"use client";

interface ConsentModalProps {
  onAccept: () => void;
}

export default function ConsentModal({ onAccept }: ConsentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">개인정보 수집 동의</h2>

        <div className="text-sm text-gray-700 space-y-3 mb-6">
          <p>
            모두복지는 복지 혜택 추천을 위해 아래 정보를 수집합니다.
          </p>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium mb-1">수집하는 정보</p>
            <ul className="list-disc list-inside space-y-1">
              <li>나이</li>
              <li>소득 구간</li>
              <li>가구 유형</li>
              <li>거주 지역</li>
              <li>장애 여부</li>
              <li>생활 상황 (임신, 실업 등)</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium mb-1">수집 목적</p>
            <p>입력하신 정보에 맞는 복지 혜택을 추천하기 위해서만 사용됩니다.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium mb-1">저장 방식</p>
            <p>
              모든 정보는 <strong>사용자의 브라우저(localStorage)에만</strong> 저장됩니다.
              서버로 전송되거나 외부에 공유되지 않습니다.
              브라우저 데이터를 삭제하면 모든 정보가 제거됩니다.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            개인정보보호법 제15조에 따라 동의를 구합니다.{" "}
            <a href="/privacy" className="text-blue-500 hover:underline" target="_blank">
              개인정보처리방침 전문 보기
            </a>
          </p>
        </div>

        <button
          onClick={onAccept}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors"
        >
          동의하고 시작하기
        </button>
      </div>
    </div>
  );
}
