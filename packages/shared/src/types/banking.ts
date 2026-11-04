// API contract shared by the host and every remote. Mirrors mock-api/db.json.

export type Permission = 'accounts' | 'cards' | 'utility' | 'transfer' | 'beneficiary';

export interface User {
  id: number;
  username: string;
  name: string;
  permissions: Permission[];
}

export interface Session {
  token: string;
  expiresIn: number;
  user: User;
}

export interface Account {
  id: number;
  number: string;
  type: string;
  branch: string;
  currency: string;
  balance: number;
}

export interface Transaction {
  id: number;
  accountId: number;
  date: string;
  description: string;
  type: 'CR' | 'DR';
  amount: number;
}

export type CardStatus = 'ACTIVE' | 'BLOCKED';

export interface Card {
  id: number;
  type: 'Debit' | 'Credit';
  network: string;
  number: string;
  holder: string;
  expiry: string;
  status: CardStatus;
  linkedAccountId?: number;
  limit?: number;
  outstanding?: number;
}

export interface Biller {
  id: number;
  name: string;
  category: string;
  consumerLabel: string;
}

export interface PaymentRequest {
  billerId: number;
  accountId: number;
  consumerNumber: string;
  amount: number;
}

export interface Payment extends PaymentRequest {
  id: number;
  reference: string;
  billerName: string;
  status: 'SUCCESS';
  createdAt: string;
}

export interface Beneficiary {
  id: number;
  name: string;
  accountNumber: string;
  ifsc: string;
  bank: string;
  nickname?: string;
}

export type NewBeneficiary = Omit<Beneficiary, 'id'>;

export interface TransferRequest {
  fromAccountId: number;
  beneficiaryId: number;
  amount: number;
  remarks: string;
}

export interface Transfer extends TransferRequest {
  id: number;
  reference: string;
  beneficiaryName: string;
  status: 'SUCCESS';
  createdAt: string;
}

export interface RequestOptions {
  signal?: AbortSignal;
}
