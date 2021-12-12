import { PublicKey } from "@solana/web3.js";

export type ConfigAccountData = {
  transferFeeDistributor: number;
  transferFeeProgram: number;
  bump: number;
};

export type CreditorPaymentRefIndexAccountData = {
  count: number;
  creditor: PublicKey;
  bump: number;
};

export type DebtorPaymentIndexAccountData = {
  count: number;
  debtor: PublicKey;
  bump: number;
};

export type PaymentAccountData = {
  memo: String;
  debtor: PublicKey;
  debtorTokens: PublicKey;
  creditor: PublicKey;
  creditorTokens: PublicKey;
  mint: PublicKey;
  amount: number;
  recurrenceInterval: number;
  startAt: number;
  endAt: number;
  bump: number;
};

export type TaskIndexAccountData = {
  count: number;
  processAt: number;
  bump: number;
};

export enum TaskStatus {
  Pending = "pending",
  Failed = "failed",
  Succeeded = "succeeded",
}

export type TaskAccountData = {
  id: number;
  payment: PublicKey;
  status: TaskStatus;
  bump: number;
};

export type TreasuryAccountData = {
  bump: number;
};
