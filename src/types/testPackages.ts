/**
 * Test Packages Types
 * Sistema de pacotes de testes avulsos
 */

export interface TestPackage {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  descriptionShort: string | null;
  type: 'gauge_pro';
  credits: number;
  price: number;
  originalPrice: number | null;
  features: string[];
  badge: string | null;
  stripeProductIdTest: string | null;
  stripeProductIdLive: string | null;
  stripePriceIdTest: string | null;
  stripePriceIdLive: string | null;
  stripeSyncedAtTest: string | null;
  stripeSyncedAtLive: string | null;
  paymentMethods: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestCredit {
  id: string;
  companyId: string;
  packageId: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  status: 'active' | 'exhausted' | 'refunded';
  purchasedAt: string;
  createdAt: string;
  // Joined fields
  packageName?: string;
  packageSlug?: string;
}

export interface TestCreditTransaction {
  id: string;
  companyId: string;
  creditId: string;
  type: 'purchase' | 'consume' | 'refund';
  amount: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
}

export type CreateTestPackageInput = Omit<
  TestPackage,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'stripeProductIdTest'
  | 'stripeProductIdLive'
  | 'stripePriceIdTest'
  | 'stripePriceIdLive'
  | 'stripeSyncedAtTest'
  | 'stripeSyncedAtLive'
>;

export type UpdateTestPackageInput = Partial<CreateTestPackageInput>;
