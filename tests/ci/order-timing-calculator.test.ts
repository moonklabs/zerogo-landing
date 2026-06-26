import { describe, expect, it } from "vitest";
import { calculateOrderTiming } from "../../lib/order-timing-calculator";

describe("order timing calculator", () => {
  it.each([
    { stock: 120, status: "safe", displayReorder: 5, shareKey: "safe" },
    { stock: 96, status: "soon", displayReorder: 2, shareKey: "reorder" },
    { stock: 80, status: "reorder", displayReorder: 0, shareKey: "reorder" },
    { stock: 40, status: "danger", displayReorder: 0, shareKey: "danger" },
  ] as const)(
    "matches the Drive-defined case for stock $stock",
    ({ stock, status, displayReorder, shareKey }) => {
      const result = calculateOrderTiming({
        stock,
        daily: 8,
        lead: 7,
        safety: 3,
        target: 30,
      });

      expect(result.displayDaysLeft).toBe(Math.floor(stock / 8));
      expect(result.bufferDays).toBe(10);
      expect(result.displayDaysUntilReorder).toBe(displayReorder);
      expect(result.recommendQty).toBe(240);
      expect(result.status).toBe(status);
      expect(result.shareKey).toBe(shareKey);
    }
  );

  it("falls back to 30 target days when target is invalid", () => {
    const result = calculateOrderTiming({
      stock: 120,
      daily: 8,
      lead: 7,
      safety: 3,
      target: 0,
    });

    expect(result.targetDays).toBe(30);
    expect(result.recommendQty).toBe(240);
  });
});
