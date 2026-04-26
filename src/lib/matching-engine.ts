import type { EligibilityRule, MatchResult, Policy, UserProfile } from "./types";

//
// 매칭 엔진 — 순수 함수, 사이드 이펙트 없음
//
// 데이터 플로우:
//   UserProfile
//       │
//       ▼
//   matchAll(profile, policies[])
//       │
//       ├── policies.forEach(policy =>
//       │     matchPolicy(profile, policy)
//       │       │
//       │       ├── policy.eligibility_rules.forEach(rule =>
//       │       │     evaluateRule(profile, rule)
//       │       │       │
//       │       │       ├── operator "eq"      → profile[field] === value
//       │       │       ├── operator "in"      → value.includes(profile[field])
//       │       │       ├── operator "gte"     → profile[field] >= value
//       │       │       ├── operator "lte"     → profile[field] <= value
//       │       │       ├── operator "between" → value[0] <= x <= value[1]
//       │       │       ├── operator "contains"→ profile[field].includes(value)
//       │       │       └── unknown            → false (safe default)
//       │       │   )
//       │       │
//       │       └── return { qualified, reasons[] }
//       │   )
//       │
//       └── filter(qualified) → group by category → return MatchResult[]
//

function getProfileValue(profile: UserProfile, field: string): unknown {
  switch (field) {
    case "age":
      return profile.age;
    case "income_bracket":
      return profile.income_bracket;
    case "household_type":
      return profile.household_type;
    case "region":
      return profile.region;
    case "disabilities":
      return profile.disabilities;
    case "life_situations":
      return profile.life_situations;
    default:
      return undefined;
  }
}

export function evaluateRule(
  profile: UserProfile,
  rule: EligibilityRule
): boolean {
  const profileValue = getProfileValue(profile, rule.field);

  // 소득 구간이 null(모르겠음)이면 소득 관련 규칙은 통과 처리
  if (rule.field === "income_bracket" && profileValue === null) {
    return true;
  }

  if (profileValue === undefined || profileValue === null) {
    return false;
  }

  switch (rule.operator) {
    case "eq":
      return profileValue === rule.value;

    case "in":
      return Array.isArray(rule.value) && rule.value.includes(profileValue);

    case "gte":
      return (
        typeof profileValue === "number" &&
        typeof rule.value === "number" &&
        profileValue >= rule.value
      );

    case "lte":
      return (
        typeof profileValue === "number" &&
        typeof rule.value === "number" &&
        profileValue <= rule.value
      );

    case "between":
      if (
        typeof profileValue === "number" &&
        Array.isArray(rule.value) &&
        rule.value.length === 2
      ) {
        return profileValue >= rule.value[0] && profileValue <= rule.value[1];
      }
      return false;

    case "contains":
      if (Array.isArray(profileValue) && typeof rule.value === "string") {
        return profileValue.includes(rule.value);
      }
      return false;

    default:
      return false;
  }
}

export function matchPolicy(
  profile: UserProfile,
  policy: Policy
): { qualified: boolean; reasons: string[] } {
  if (policy.eligibility_rules.length === 0) {
    return { qualified: true, reasons: ["조건 없음 (누구나 신청 가능)"] };
  }

  const reasons: string[] = [];
  let allRequiredPassed = true;

  for (const rule of policy.eligibility_rules) {
    const passed = evaluateRule(profile, rule);

    if (rule.required && !passed) {
      allRequiredPassed = false;
      break;
    }

    if (passed) {
      reasons.push(`${rule.field} 조건 충족`);
    }
  }

  return { qualified: allRequiredPassed, reasons };
}

export function matchAll(
  profile: UserProfile,
  policies: Policy[]
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const policy of policies) {
    if (policy.status !== "active") continue;

    const { qualified, reasons } = matchPolicy(profile, policy);

    if (qualified) {
      const incompatible_with_current = policy.incompatible_policies.some(
        (id) => profile.current_benefits.includes(id)
      );

      results.push({
        policy,
        qualified: true,
        reasons,
        incompatible_with_current,
      });
    }
  }

  return results;
}

export function groupByCategory(
  results: MatchResult[]
): Record<string, MatchResult[]> {
  const groups: Record<string, MatchResult[]> = {};

  for (const result of results) {
    const category = result.policy.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(result);
  }

  return groups;
}
