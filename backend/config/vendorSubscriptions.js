export const VENDOR_SUBSCRIPTION_PLANS = {
  starter: { name: "Starter", amount: 199, maxCars: 10 },
  growth: { name: "Growth", amount: 499, maxCars: null },
  pro: { name: "Pro", amount: 999, maxCars: null },
};

export const getSubscriptionStatus = (user, now = new Date()) => {
  if (!user?.subscriptionExpiresAt) return "unpaid";
  return new Date(user.subscriptionExpiresAt) > now ? "active" : "expired";
};

export const getSubscriptionDaysRemaining = (user, now = new Date()) => {
  if (getSubscriptionStatus(user, now) !== "active") return null;
  return Math.max(
    0,
    Math.ceil(
      (new Date(user.subscriptionExpiresAt).getTime() - now.getTime()) /
        86400000,
    ),
  );
};

export const getVendorCarLimit = (user, now = new Date()) => {
  if (getSubscriptionStatus(user, now) !== "active") return 3;
  const plan = VENDOR_SUBSCRIPTION_PLANS[user.vendorPlan || user.plan];
  return plan ? plan.maxCars ?? Infinity : 3;
};

export const addOneSubscriptionMonth = (date) => {
  const result = new Date(date);
  const originalDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + 1);
  const lastDayOfMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(originalDay, lastDayOfMonth));
  return result;
};
