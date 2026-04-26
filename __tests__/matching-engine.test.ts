import { describe, it, expect } from "vitest";
import { evaluateRule, matchPolicy, matchAll, groupByCategory } from "@/lib/matching-engine";
import type { EligibilityRule, Policy, UserProfile } from "@/lib/types";

const makeProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  age: 30,
  income_bracket: 3,
  household_type: "단독",
  region: "서울",
  disabilities: [],
  life_situations: [],
  current_benefits: [],
  ...overrides,
});

const makePolicy = (overrides: Partial<Policy> = {}): Policy => ({
  id: "test-policy",
  name: "테스트 정책",
  category: "기초생활",
  description: "테스트용",
  eligibility_rules: [],
  benefits: "테스트 혜택",
  estimated_amount: "월 10만원",
  required_documents: [],
  application_steps: [],
  incompatible_policies: [],
  deadline: null,
  source_url: "https://example.com",
  last_verified: "2024-01-01",
  status: "active",
  ...overrides,
});

describe("evaluateRule", () => {
  it("eq: returns true when profile value equals rule value", () => {
    const rule: EligibilityRule = { field: "household_type", operator: "eq", value: "한부모", required: true };
    expect(evaluateRule(makeProfile({ household_type: "한부모" }), rule)).toBe(true);
    expect(evaluateRule(makeProfile({ household_type: "단독" }), rule)).toBe(false);
  });

  it("in: returns true when profile value is in rule array", () => {
    const rule: EligibilityRule = { field: "household_type", operator: "in", value: ["단독", "한부모"], required: true };
    expect(evaluateRule(makeProfile({ household_type: "단독" }), rule)).toBe(true);
    expect(evaluateRule(makeProfile({ household_type: "부부" }), rule)).toBe(false);
  });

  it("gte: returns true when profile value >= rule value", () => {
    const rule: EligibilityRule = { field: "age", operator: "gte", value: 65, required: true };
    expect(evaluateRule(makeProfile({ age: 70 }), rule)).toBe(true);
    expect(evaluateRule(makeProfile({ age: 65 }), rule)).toBe(true);
    expect(evaluateRule(makeProfile({ age: 60 }), rule)).toBe(false);
  });

  it("lte: returns true when profile value <= rule value", () => {
    const rule: EligibilityRule = { field: "income_bracket", operator: "lte", value: 3, required: true };
    expect(evaluateRule(makeProfile({ income_bracket: 2 }), rule)).toBe(true);
    expect(evaluateRule(makeProfile({ income_bracket: 3 }), rule)).toBe(true);
    expect(evaluateRule(makeProfile({ income_bracket: 4 }), rule)).toBe(false);
  });

  it("between: returns true when profile value is in range", () => {
    const rule: EligibilityRule = { field: "age", operator: "between", value: [19, 34], required: true };
    expect(evaluateRule(makeProfile({ age: 25 }), rule)).toBe(true);
    expect(evaluateRule(makeProfile({ age: 19 }), rule)).toBe(true);
    expect(evaluateRule(makeProfile({ age: 34 }), rule)).toBe(true);
    expect(evaluateRule(makeProfile({ age: 35 }), rule)).toBe(false);
    expect(evaluateRule(makeProfile({ age: 18 }), rule)).toBe(false);
  });

  it("contains: returns true when profile array contains value", () => {
    const rule: EligibilityRule = { field: "life_situations", operator: "contains", value: "임신", required: true };
    expect(evaluateRule(makeProfile({ life_situations: ["임신", "실업"] }), rule)).toBe(true);
    expect(evaluateRule(makeProfile({ life_situations: ["실업"] }), rule)).toBe(false);
    expect(evaluateRule(makeProfile({ life_situations: [] }), rule)).toBe(false);
  });

  it("unknown operator returns false", () => {
    const rule = { field: "age", operator: "unknown" as never, value: 30, required: true };
    expect(evaluateRule(makeProfile(), rule)).toBe(false);
  });

  it("income_bracket null (모르겠음) passes income rules", () => {
    const rule: EligibilityRule = { field: "income_bracket", operator: "lte", value: 3, required: true };
    expect(evaluateRule(makeProfile({ income_bracket: null }), rule)).toBe(true);
  });
});

describe("matchPolicy", () => {
  it("returns qualified=true when all required rules pass", () => {
    const policy = makePolicy({
      eligibility_rules: [
        { field: "age", operator: "gte", value: 18, required: true },
        { field: "income_bracket", operator: "lte", value: 5, required: true },
      ],
    });
    const result = matchPolicy(makeProfile({ age: 30, income_bracket: 3 }), policy);
    expect(result.qualified).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("returns qualified=false when a required rule fails", () => {
    const policy = makePolicy({
      eligibility_rules: [
        { field: "age", operator: "gte", value: 65, required: true },
      ],
    });
    const result = matchPolicy(makeProfile({ age: 30 }), policy);
    expect(result.qualified).toBe(false);
  });

  it("returns qualified=true for policies with empty rules", () => {
    const policy = makePolicy({ eligibility_rules: [] });
    const result = matchPolicy(makeProfile(), policy);
    expect(result.qualified).toBe(true);
    expect(result.reasons).toContain("조건 없음 (누구나 신청 가능)");
  });

  it("optional rules affect reasons but not qualification", () => {
    const policy = makePolicy({
      eligibility_rules: [
        { field: "age", operator: "gte", value: 18, required: true },
        { field: "region", operator: "eq", value: "부산", required: false },
      ],
    });
    const result = matchPolicy(makeProfile({ age: 30, region: "서울" }), policy);
    expect(result.qualified).toBe(true);
  });
});

describe("matchAll", () => {
  it("returns only qualified policies", () => {
    const policies = [
      makePolicy({
        id: "a",
        eligibility_rules: [{ field: "age", operator: "gte", value: 65, required: true }],
      }),
      makePolicy({
        id: "b",
        eligibility_rules: [{ field: "age", operator: "gte", value: 18, required: true }],
      }),
    ];
    const results = matchAll(makeProfile({ age: 30 }), policies);
    expect(results.length).toBe(1);
    expect(results[0].policy.id).toBe("b");
  });

  it("returns empty array when no policies match", () => {
    const policies = [
      makePolicy({
        eligibility_rules: [{ field: "age", operator: "gte", value: 100, required: true }],
      }),
    ];
    const results = matchAll(makeProfile({ age: 30 }), policies);
    expect(results.length).toBe(0);
  });

  it("flags incompatible policies when user has current benefits", () => {
    const policies = [
      makePolicy({
        id: "youth-housing",
        eligibility_rules: [],
        incompatible_policies: ["youth-job-support"],
      }),
    ];
    const results = matchAll(
      makeProfile({ current_benefits: ["youth-job-support"] }),
      policies
    );
    expect(results[0].incompatible_with_current).toBe(true);
  });

  it("skips non-active policies", () => {
    const policies = [
      makePolicy({ id: "expired", status: "expired", eligibility_rules: [] }),
      makePolicy({ id: "active", status: "active", eligibility_rules: [] }),
    ];
    const results = matchAll(makeProfile(), policies);
    expect(results.length).toBe(1);
    expect(results[0].policy.id).toBe("active");
  });
});

describe("groupByCategory", () => {
  it("groups results by category", () => {
    const results = [
      { policy: makePolicy({ category: "기초생활" }), qualified: true, reasons: [], incompatible_with_current: false },
      { policy: makePolicy({ category: "청년" }), qualified: true, reasons: [], incompatible_with_current: false },
      { policy: makePolicy({ category: "기초생활" }), qualified: true, reasons: [], incompatible_with_current: false },
    ];
    const grouped = groupByCategory(results);
    expect(Object.keys(grouped).length).toBe(2);
    expect(grouped["기초생활"].length).toBe(2);
    expect(grouped["청년"].length).toBe(1);
  });
});
