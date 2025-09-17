export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  dailyTokens: number;
  features: string[];
  description: string;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 0,
    currency: 'INR',
    dailyTokens: 10,
    features: [
      '10 AI processing tokens per day',
      'Species recognition',
      'eDNA analysis',
      'Basic water quality monitoring',
      'Community support'
    ],
    description: 'Perfect for students and researchers getting started with marine biodiversity analysis.'
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 399,
    currency: 'INR',
    dailyTokens: 100,
    features: [
      '100 AI processing tokens per day',
      'Advanced species recognition',
      'Detailed eDNA analysis',
      'Comprehensive water quality monitoring',
      'Priority support',
      'Data export capabilities',
      'Custom analysis reports'
    ],
    description: 'Ideal for professional researchers and marine biologists.',
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 0, // Custom pricing
    currency: 'INR',
    dailyTokens: -1, // Unlimited
    features: [
      'Unlimited AI processing tokens',
      'Advanced species recognition',
      'Detailed eDNA analysis',
      'Comprehensive water quality monitoring',
      'Dedicated support',
      'Custom integrations',
      'API access',
      'White-label solutions',
      'Custom training data'
    ],
    description: 'For organizations and institutions requiring enterprise-level features.'
  }
};

export const getPlanById = (planId: string): SubscriptionPlan | null => {
  return SUBSCRIPTION_PLANS[planId] || null;
};

export const getDailyTokenLimit = (plan: string): number => {
  const planConfig = getPlanById(plan);
  return planConfig?.dailyTokens || 10;
};
