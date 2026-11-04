import type { Permission } from '@bank/shared';

export interface NavItem {
  to: string;
  label: string;
  permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/accounts', label: 'Accounts', permission: 'accounts' },
  { to: '/cards', label: 'Cards', permission: 'cards' },
  { to: '/utility', label: 'Bill Payments', permission: 'utility' },
  { to: '/transfer', label: 'Fund Transfer', permission: 'transfer' },
  { to: '/beneficiary', label: 'Beneficiaries', permission: 'beneficiary' },
];
