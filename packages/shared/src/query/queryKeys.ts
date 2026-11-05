// Single source of cache keys for the host and every remote. Keys are
// hierarchical, so invalidating `accounts.all` also invalidates every
// `accounts.detail(id)`.
export const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    detail: (id: string | number) => ['accounts', String(id)] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    byAccount: (accountId: string | number) => ['transactions', 'account', String(accountId)] as const,
    recent: ['transactions', 'recent'] as const,
  },
  beneficiaries: {
    all: ['beneficiaries'] as const,
  },
  cards: {
    all: ['cards'] as const,
  },
  billers: {
    all: ['billers'] as const,
    detail: (id: string | number) => ['billers', String(id)] as const,
  },
};
