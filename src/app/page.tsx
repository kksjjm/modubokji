"use client";

import { useState, useEffect } from "react";
import type { UserProfile, MatchResult } from "@/lib/types";
import { matchAll, groupByCategory } from "@/lib/matching-engine";
import { getPolicies, CATEGORIES } from "@/lib/policies";
import {
  saveProfile,
  loadProfile,
  hasConsent,
  setConsent,
  DEFAULT_PROFILE,
} from "@/lib/profile-store";
import ProfileForm from "@/components/profile-form";
import PolicyCard from "@/components/policy-card";
import Disclaimer from "@/components/disclaimer";
import ConsentModal from "@/components/consent-modal";

type View = "form" | "results";

export default function Home() {
  const [view, setView] = useState<View>("form");
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [showConsent, setShowConsent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!hasConsent()) {
      setShowConsent(true);
    }
    const saved = loadProfile();
    if (saved) {
      setProfile(saved);
    }
  }, []);

  const handleConsent = () => {
    setConsent(true);
    setShowConsent(false);
  };

  const handleSubmit = (submittedProfile: UserProfile) => {
    setProfile(submittedProfile);
    saveProfile(submittedProfile);

    const policies = getPolicies();
    const matched = matchAll(submittedProfile, policies);
    setResults(matched);
    setView("results");
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setView("form");
    window.scrollTo(0, 0);
  };

  if (!mounted) return null;

  const grouped = groupByCategory(results);

  return (
    <>
      {showConsent && <ConsentModal onAccept={handleConsent} />}

      {view === "form" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">내 정보 입력</h2>
            <p className="text-gray-800 mb-6">
              기본 정보를 입력하면 받을 수 있는 복지 혜택을 찾아드립니다.
            </p>
            <ProfileForm initialProfile={profile} onSubmit={handleSubmit} />
          </div>
        </div>
      )}

      {view === "results" && (
        <div className="space-y-6">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:underline text-lg"
          >
            ← 정보 수정하기
          </button>

          <Disclaimer />

          {results.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <p className="text-xl text-gray-700">
                입력하신 조건에 맞는 복지 혜택을 찾지 못했습니다.
              </p>
              <p className="text-gray-600 mt-2">
                조건을 변경하거나, 주민센터에 직접 문의해 보세요.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-lg font-medium">
                  총 <span className="text-blue-600 font-bold">{results.length}개</span>의
                  복지 혜택을 찾았습니다
                </p>
              </div>

              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {CATEGORIES[category] || category}
                  </h3>
                  {items.map((result) => (
                    <PolicyCard key={result.policy.id} result={result} />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
}
