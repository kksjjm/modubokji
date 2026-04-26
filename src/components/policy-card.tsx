"use client";

import { useState } from "react";
import type { MatchResult } from "@/lib/types";

interface PolicyCardProps {
  result: MatchResult;
}

export default function PolicyCard({ result }: PolicyCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { policy, incompatible_with_current } = result;

  return (
    <div className={`border rounded-xl overflow-hidden ${
      incompatible_with_current ? "border-red-300 bg-red-50" : "border-gray-200"
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold">{policy.name}</h3>
            <p className="text-gray-600 mt-1">{policy.description}</p>
            <p className="text-blue-600 font-medium mt-1">{policy.estimated_amount}</p>
          </div>
          <span className="text-2xl flex-shrink-0" aria-hidden="true">
            {isOpen ? "−" : "+"}
          </span>
        </div>

        {incompatible_with_current && (
          <div className="mt-2 inline-block bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full">
            현재 수급 중인 혜택과 동시 수급 불가
          </div>
        )}
      </button>

      {isOpen && (
        <div className="border-t p-4 space-y-4">
          <div>
            <h4 className="font-bold text-lg mb-2">혜택 내용</h4>
            <p className="text-gray-700">{policy.benefits}</p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-2">준비 서류</h4>
            <ul className="space-y-2">
              {policy.required_documents.map((doc, i) => (
                <li key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-600">
                    발급처: {doc.where_to_get}
                    {doc.how_to_get && ` | 방법: ${doc.how_to_get}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-2">신청 절차</h4>
            <ol className="space-y-3">
              {policy.application_steps.map((step) => (
                <li key={step.step} className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </span>
                  <div>
                    <p className="font-medium">{step.description}</p>
                    <p className="text-sm text-gray-600">
                      장소: {step.location} | 방법: {step.method}
                    </p>
                    {step.notes && (
                      <p className="text-sm text-amber-700 mt-1">{step.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {policy.source_url && (
            <a
              href={policy.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:underline text-sm"
            >
              상세 정보 보기 (원문)
            </a>
          )}
        </div>
      )}
    </div>
  );
}
