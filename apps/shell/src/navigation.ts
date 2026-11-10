import type { Permission } from '@bank/shared';
import { Constants } from './i18n';

export interface NavItem {
  to: string;
  labelKey: string;
  label: string;
  permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    labelKey: Constants.menuDashboardKey,
    label: Constants.menuDashboard,
  },
  {
    to: '/accounts',
    labelKey: Constants.menuAccountsKey,
    label: Constants.menuAccounts,
    permission: 'accounts',
  },
  {
    to: '/cards',
    labelKey: Constants.menuCardsKey,
    label: Constants.menuCards,
    permission: 'cards',
  },
  {
    to: '/utility',
    labelKey: Constants.menuUtilityKey,
    label: Constants.menuUtility,
    permission: 'utility',
  },
  {
    to: '/transfer',
    labelKey: Constants.menuTransferKey,
    label: Constants.menuTransfer,
    permission: 'transfer',
  },
  {
    to: '/beneficiary',
    labelKey: Constants.menuBeneficiaryKey,
    label: Constants.menuBeneficiary,
    permission: 'beneficiary',
  },
];
