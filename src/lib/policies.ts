import { z } from "zod";
import type { Policy } from "./types";
import policiesData from "../../data/policies.json";

const EligibilityRuleSchema = z.object({
  field: z.string(),
  operator: z.enum(["eq", "in", "gte", "lte", "between", "contains"]),
  value: z.unknown(),
  required: z.boolean(),
});

const PolicyDocumentSchema = z.object({
  name: z.string(),
  where_to_get: z.string(),
  how_to_get: z.string(),
});

const ApplicationStepSchema = z.object({
  step: z.number(),
  description: z.string(),
  location: z.string(),
  method: z.string(),
  notes: z.string(),
});

export const PolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  eligibility_rules: z.array(EligibilityRuleSchema),
  benefits: z.string(),
  estimated_amount: z.string(),
  required_documents: z.array(PolicyDocumentSchema),
  application_steps: z.array(ApplicationStepSchema),
  incompatible_policies: z.array(z.string()),
  deadline: z.string().nullable(),
  source_url: z.string(),
  last_verified: z.string(),
  status: z.enum(["active", "expired", "upcoming"]),
});

export const PoliciesArraySchema = z.array(PolicySchema);

export function validatePolicies(data: unknown): Policy[] {
  return PoliciesArraySchema.parse(data) as Policy[];
}

export function getPolicies(): Policy[] {
  return policiesData as Policy[];
}

export function getPolicyById(id: string): Policy | undefined {
  return (policiesData as Policy[]).find((p) => p.id === id);
}

export const CATEGORIES: Record<string, string> = {
  기초생활: "기초생활보장",
  주거: "주거 지원",
  의료: "의료 지원",
  교육: "교육 지원",
  고용: "고용/취업 지원",
  아동가족: "아동/가족 지원",
  장애인: "장애인 지원",
  노인: "노인 지원",
  청년: "청년 지원",
  기타: "기타 지원",
};
