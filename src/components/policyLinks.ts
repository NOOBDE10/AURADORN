export type PolicyKey = 'shipping' | 'returns' | 'care' | 'privacy' | 'terms' | 'contact';

const TITLES: Record<PolicyKey, string> = {
  shipping: 'Shipping & Delivery',
  returns: 'Returns & Exchange',
  care: 'Jewellery Care',
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  contact: 'Contact Us',
};

export const POLICY_PAGES = Object.keys(TITLES) as PolicyKey[];
export const policyTitle = (key: PolicyKey) => TITLES[key];
