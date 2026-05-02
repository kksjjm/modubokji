"use client";

import { useState, useEffect } from "react";
import type { Program, UserProfile } from "@/lib/types";
import { evaluateRule } from "@/lib/matching-engine";

interface ProgramsListProps {
  profile: UserProfile;
}

export default function ProgramsList({ profile }: ProgramsListProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/programs")
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data.programs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center py-4">지원사업을 불러오는 중...</p>;
  }

  if (programs.length === 0) {
    return null;
  }

  // 프로필에 매칭되는 지원사업 필터링
  const matched = programs.filter((program) => {
    if (!program.eligibility_rules || program.eligibility_rules.length === 0) return true;
    return program.eligibility_rules
      .filter((r) => r.required)
      .every((rule) => evaluateRule(profile, rule));
  });

  if (matched.length === 0) return null;

  const daysLeft = (endDate: string) => {
    const diff = Math.ceil(
      (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold">
        신규 지원사업
        <span className="text-blue-600 ml-2">{matched.length}건</span>
      </h3>

      {matched.map((program) => {
        const days = daysLeft(program.end_date);
        const isOpen = openId === program.id;

        return (
          <div key={program.id} className="border border-blue-200 bg-blue-50 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : program.id)}
              className="w-full text-left p-4 hover:bg-blue-100 transition-colors"
              aria-expanded={isOpen}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-bold">{program.name}</h4>
                    {days <= 7 && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        마감 {days}일 전
                      </span>
                    )}
                    {days > 7 && days <= 30 && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        D-{days}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1">{program.organization}</p>
                  <p className="mt-1">{program.description}</p>
                  {program.estimated_amount && (
                    <p className="text-blue-700 font-medium mt-1">{program.estimated_amount}</p>
                  )}
                </div>
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-blue-200 p-4 space-y-3">
                <div>
                  <p className="font-medium">혜택</p>
                  <p>{program.benefits}</p>
                </div>
                <div>
                  <p className="font-medium">신청 기간</p>
                  <p>{program.start_date} ~ {program.end_date}</p>
                </div>
                {program.application_url && (
                  <a
                    href={program.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    신청하러 가기
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
