interface Coupon {
  code: string;
  discountPercent: number;
}

const VALID_COUPONS: Map<string, Coupon> = new Map([
  ["SALE20", { code: "SALE20", discountPercent: 20 }],
  ["STUDENT10", { code: "STUDENT10", discountPercent: 10 }],
]);

export function validateCoupon(code: string): Coupon | null {
  if (!code) return null;
  const coupon = VALID_COUPONS.get(code.toUpperCase());
  return coupon || null;
}