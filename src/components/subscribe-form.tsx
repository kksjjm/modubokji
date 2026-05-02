"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";

interface SubscribeFormProps {
  profile: UserProfile;
}

export default function SubscribeForm({ profile }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          email,
          notify_kakao: false,
          notify_web: true,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("알림 등록이 완료되었습니다. 새로운 지원사업이 나오면 알려드릴게요.");
      } else {
        setStatus("error");
        setMessage(data.error || "등록에 실패했습니다.");
      }
    } catch {
      setStatus("error");
      setMessage("네트워크 오류가 발생했습니다.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="font-medium text-green-800">{message}</p>
        <p className="text-sm text-green-700 mt-1">
          입력하신 조건에 맞는 새 지원사업이 등록되면 이메일로 알려드립니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
      <h3 className="text-lg font-bold mb-2">새 지원사업 알림 받기</h3>
      <p className="text-sm mb-4">
        내 조건에 맞는 새로운 지원사업이 나오면 알림을 보내드립니다.
        현재 입력하신 프로필 정보를 기반으로 매칭합니다.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소 입력"
          required
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? "등록 중..." : "알림 받기"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-sm text-red-600 mt-2">{message}</p>
      )}

      <p className="text-xs text-black mt-3">
        카카오톡 알림은 준비 중입니다. 카카오톡 알림이 연동되면 전환할 수 있습니다.
      </p>
    </div>
  );
}
