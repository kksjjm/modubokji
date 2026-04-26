import { describe, it, expect } from "vitest";
import policiesData from "../data/policies.json";
import { PoliciesArraySchema } from "@/lib/policies";

describe("policies.json data integrity", () => {
  it("passes Zod schema validation", () => {
    expect(() => PoliciesArraySchema.parse(policiesData)).not.toThrow();
  });

  it("all policy IDs are unique", () => {
    const ids = policiesData.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all incompatible_policies reference existing policy IDs", () => {
    const allIds = new Set(policiesData.map((p) => p.id));
    for (const policy of policiesData) {
      for (const incompatibleId of policy.incompatible_policies) {
        expect(allIds.has(incompatibleId)).toBe(true);
      }
    }
  });

  it("all policies have at least one application step", () => {
    for (const policy of policiesData) {
      expect(policy.application_steps.length).toBeGreaterThan(0);
    }
  });

  it("all active policies have a source_url", () => {
    for (const policy of policiesData) {
      if (policy.status === "active") {
        expect(policy.source_url).toBeTruthy();
      }
    }
  });
});
