export type Operator = "eq" | "in" | "gte" | "lte" | "between" | "contains";

export interface EligibilityRule {
  field: string;
  operator: Operator;
  value: unknown;
  required: boolean;
}

export interface PolicyDocument {
  name: string;
  where_to_get: string;
  how_to_get: string;
}

export interface ApplicationStep {
  step: number;
  description: string;
  location: string;
  method: string;
  notes: string;
}

export interface Policy {
  id: string;
  name: string;
  category: string;
  description: string;
  eligibility_rules: EligibilityRule[];
  benefits: string;
  estimated_amount: string;
  required_documents: PolicyDocument[];
  application_steps: ApplicationStep[];
  incompatible_policies: string[];
  deadline: string | null;
  source_url: string;
  last_verified: string;
  status: "active" | "expired" | "upcoming";
}

export interface UserProfile {
  age: number | null;
  income_bracket: number | null; // 1-6, null = "모르겠음"
  household_type: string;
  region: string;
  disabilities: string[];
  life_situations: string[];
  current_benefits: string[];
}

export interface MatchResult {
  policy: Policy;
  qualified: boolean;
  reasons: string[];
  incompatible_with_current: boolean;
}
