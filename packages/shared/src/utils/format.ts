const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export const formatCurrency = (value: number | string | undefined): string => inr.format(Number(value) || 0);

export const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const maskAccount = (number = ''): string => `XXXX${number.slice(-4)}`;
