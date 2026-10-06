import { describe, expect, it } from "vitest";
import { calculateRevenue, getAvailableSlots, hasOverlap, initialBookings } from "./domain";

describe("availability rules", () => {
  it("returns slots inside the configured opening window", () => {
    expect(getAvailableSlots("Tomorrow, Aug 29", "cleaning")).toContain("10:30 AM");
  });
  it("excludes slots already occupied by active bookings", () => {
    expect(getAvailableSlots("Tomorrow, Aug 29", "cleaning", ["10:30 AM"])).not.toContain("10:30 AM");
  });
  it("returns no slots for a closed day", () => {
    expect(getAvailableSlots("2024-08-25", "cleaning")).toEqual([]);
  });
  it("allows a slot after a cancelled booking through active-state filtering", () => {
    const activeTimes = initialBookings.filter((booking) => booking.status !== "CANCELLED").map((booking) => booking.time);
    expect(getAvailableSlots("Tomorrow, Aug 29", "cleaning", activeTimes)).toContain("10:30 AM");
  });
});

describe("double booking prevention", () => {
  it("uses the strict overlap definition", () => {
    expect(hasOverlap(10, 11, 10.5, 11.5)).toBe(true);
    expect(hasOverlap(10, 11, 11, 12)).toBe(false);
  });
});

describe("revenue", () => {
  it("counts paid bookings but excludes unpaid and refunded payments", () => {
    expect(calculateRevenue(initialBookings)).toBe(335);
  });
});
