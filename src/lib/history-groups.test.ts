import { describe, expect, it } from "vitest";
import { groupByRecency } from "./history-groups";

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

describe("groupByRecency", () => {
  it("buckets items into Today, Yesterday, Last 7 Days, and Older", () => {
    const items = [
      { id: "1", created_at: daysAgo(0) },
      { id: "2", created_at: daysAgo(1) },
      { id: "3", created_at: daysAgo(3) },
      { id: "4", created_at: daysAgo(30) },
    ];

    const groups = groupByRecency(items);
    const labels = groups.map((g) => g.label);

    expect(labels).toEqual(["Today", "Yesterday", "Last 7 Days", "Older"]);
    expect(groups.find((g) => g.label === "Today")?.items).toHaveLength(1);
    expect(groups.find((g) => g.label === "Older")?.items).toHaveLength(1);
  });

  it("omits empty groups", () => {
    const groups = groupByRecency([{ id: "1", created_at: daysAgo(0) }]);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Today");
  });
});
