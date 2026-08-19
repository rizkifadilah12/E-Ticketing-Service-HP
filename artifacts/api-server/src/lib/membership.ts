export function isStoreActive(store: {
  membershipPlan: string;
  membershipExpiresAt: Date | null;
}): boolean {
  if (store.membershipPlan === "lifetime") return true;
  if (store.membershipPlan === "monthly") {
    return Boolean(
      store.membershipExpiresAt && store.membershipExpiresAt.getTime() > Date.now(),
    );
  }
  return false;
}

export function membershipFields(
  plan: string,
  expiresAt?: string | null,
): {
  membershipPlan: string;
  membershipExpiresAt: Date | null;
  active: boolean;
} {
  if (plan === "lifetime") {
    return {
      membershipPlan: "lifetime",
      membershipExpiresAt: null,
      active: true,
    };
  }
  if (plan === "monthly") {
    const membershipExpiresAt = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return {
      membershipPlan: "monthly",
      membershipExpiresAt,
      active: membershipExpiresAt.getTime() > Date.now(),
    };
  }
  return {
    membershipPlan: "unpaid",
    membershipExpiresAt: null,
    active: false,
  };
}

export function toStoreDto(store: {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  membershipPlan: string;
  membershipExpiresAt: Date | null;
}) {
  return {
    id: store.id,
    name: store.name,
    code: store.code,
    address: store.address,
    phone: store.phone,
    active: isStoreActive(store),
    membershipPlan: store.membershipPlan,
    membershipExpiresAt: store.membershipExpiresAt?.toISOString() ?? null,
  };
}
