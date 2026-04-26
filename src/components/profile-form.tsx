"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";

const INCOME_BRACKETS = [
  { value: 1, label: "기초생활 이하", description: "1인 약 71만원 이하" },
  { value: 2, label: "차상위", description: "1인 약 95만원 이하" },
  { value: 3, label: "중위소득 50%", description: "1인 약 111만원 이하" },
  { value: 4, label: "중위소득 100%", description: "1인 약 222만원 이하" },
  { value: 5, label: "중위소득 150%", description: "1인 약 334만원 이하" },
  { value: 6, label: "중위소득 150% 초과", description: "1인 약 334만원 초과" },
];

const HOUSEHOLD_TYPES = [
  { value: "단독", label: "1인 가구" },
  { value: "부부", label: "부부 가구" },
  { value: "한부모", label: "한부모 가구" },
  { value: "다자녀", label: "다자녀 가구" },
  { value: "다인", label: "기타 다인 가구" },
];

const REGIONS = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const DISABILITIES = [
  { value: "중증장애", label: "중증장애 (1~3급)" },
  { value: "경증장애", label: "경증장애 (4~6급)" },
];

const LIFE_SITUATIONS = [
  { value: "임신", label: "임신 중" },
  { value: "실업", label: "실업/구직 중" },
  { value: "긴급위기", label: "긴급 위기상황 (실직, 질병, 화재 등)" },
  { value: "영유아양육", label: "만 8세 미만 자녀 양육" },
];

interface ProfileFormProps {
  initialProfile: UserProfile;
  onSubmit: (profile: UserProfile) => void;
}

export default function ProfileForm({ initialProfile, onSubmit }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="age" className="block text-lg font-medium mb-2">
          나이
        </label>
        <input
          id="age"
          type="number"
          min={0}
          max={120}
          value={profile.age ?? ""}
          onChange={(e) =>
            setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : null })
          }
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="예: 35"
        />
      </div>

      <div>
        <label className="block text-lg font-medium mb-2">
          월 소득 구간
        </label>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setProfile({ ...profile, income_bracket: null })}
            className={`w-full text-left border rounded-xl px-4 py-3 transition-colors ${
              profile.income_bracket === null
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="font-medium">모르겠음</span>
            <span className="text-sm text-gray-500 ml-2">
              (소득 관계없이 모든 복지를 보여줍니다)
            </span>
          </button>
          {INCOME_BRACKETS.map((bracket) => (
            <button
              key={bracket.value}
              type="button"
              onClick={() => setProfile({ ...profile, income_bracket: bracket.value })}
              className={`w-full text-left border rounded-xl px-4 py-3 transition-colors ${
                profile.income_bracket === bracket.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">{bracket.label}</span>
              <span className="text-sm text-gray-500 ml-2">({bracket.description})</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="household" className="block text-lg font-medium mb-2">
          가구 유형
        </label>
        <select
          id="household"
          value={profile.household_type}
          onChange={(e) => setProfile({ ...profile, household_type: e.target.value })}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg"
        >
          <option value="">선택하세요</option>
          {HOUSEHOLD_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="region" className="block text-lg font-medium mb-2">
          거주 지역
        </label>
        <select
          id="region"
          value={profile.region}
          onChange={(e) => setProfile({ ...profile, region: e.target.value })}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg"
        >
          <option value="">선택하세요</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-lg font-medium mb-2">장애 여부</label>
        <div className="space-y-2">
          {DISABILITIES.map((d) => (
            <label key={d.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.disabilities.includes(d.value)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...profile.disabilities, d.value]
                    : profile.disabilities.filter((v) => v !== d.value);
                  setProfile({ ...profile, disabilities: next });
                }}
                className="w-5 h-5 rounded"
              />
              <span className="text-lg">{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium mb-2">생활 상황</label>
        <div className="space-y-2">
          {LIFE_SITUATIONS.map((s) => (
            <label key={s.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.life_situations.includes(s.value)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...profile.life_situations, s.value]
                    : profile.life_situations.filter((v) => v !== s.value);
                  setProfile({ ...profile, life_situations: next });
                }}
                className="w-5 h-5 rounded"
              />
              <span className="text-lg">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-xl hover:bg-blue-700 transition-colors"
      >
        내 복지 혜택 찾기
      </button>
    </form>
  );
}
