import assert from "assert";
import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  ConfigAccountData,
  CreditorPaymentRefIndexAccountData,
  DebtorPaymentIndexAccountData,
  PaymentAccountData,
  TaskAccountData,
  TaskIndexAccountData,
  TreasuryAccountData,
} from "./data";

export async function validateConfigAccountData(
  program: Program,
  address: PublicKey,
  { transferFeeDistributor, transferFeeProgram, bump }: ConfigAccountData
) {
  const data = await program.account.config.fetch(address);
  assert.ok(data.transferFeeDistributor.toNumber() === transferFeeDistributor);
  assert.ok(data.transferFeeProgram.toNumber() === transferFeeProgram);
  assert.ok(data.bump === bump);
}

export async function validateCreditorPaymentRefIndexAccountData(
  program: Program,
  address: PublicKey,
  { count, creditor, bump }: CreditorPaymentRefIndexAccountData
) {
  const data = await program.account.creditorPaymentRefIndex.fetch(address);
  assert.ok(data.count.toNumber() === count);
  assert.ok(data.creditor.toString() === creditor.toString());
  assert.ok(data.bump === bump);
}

export async function validateDebtorPaymentIndexAccountData(
  program: Program,
  address: PublicKey,
  { count, debtor, bump }: DebtorPaymentIndexAccountData
) {
  const data = await program.account.debtorPaymentIndex.fetch(address);
  assert.ok(data.count.toNumber() === count);
  assert.ok(data.debtor.toString() === debtor.toString());
  assert.ok(data.bump === bump);
}

export async function validatePaymentAccountData(
  program: Program,
  address: PublicKey,
  {
    memo,
    debtor,
    debtorTokens,
    creditor,
    creditorTokens,
    mint,
    amount,
    recurrenceInterval,
    startAt,
    endAt,
    bump,
  }: PaymentAccountData
) {
  const data = await program.account.payment.fetch(address);
  assert.ok(data.memo === memo);
  assert.ok(data.debtor.toString() === debtor.toString());
  assert.ok(data.debtorTokens.toString() === debtorTokens.toString());
  assert.ok(data.creditor.toString() === creditor.toString());
  assert.ok(data.creditorTokens.toString() === creditorTokens.toString());
  assert.ok(data.mint.toString() === mint.toString());
  assert.ok(data.amount.toNumber() === amount);
  assert.ok(data.recurrenceInterval.toNumber() === recurrenceInterval);
  assert.ok(data.startAt.toNumber() === startAt);
  assert.ok(data.endAt.toNumber() === endAt);
  assert.ok(data.bump === bump);
}

export async function validateTaskAccountData(
  program: Program,
  address: PublicKey,
  { id, status, payment, bump }: TaskAccountData
) {
  const data = await program.account.task.fetch(address);
  assert.ok(data.id.toNumber() === id);
  assert.ok(Object.keys(data.status)[0] === status.toString());
  assert.ok(data.payment.toString() === payment.toString());
  assert.ok(data.bump === bump);
}

export async function validateTaskIndexAccountData(
  program: Program,
  address: PublicKey,
  { count, processAt, bump }: TaskIndexAccountData
) {
  const data = await program.account.taskIndex.fetch(address);
  assert.ok(data.count.toNumber() === count);
  assert.ok(data.processAt.toNumber() === processAt);
  assert.ok(data.bump === bump);
}

export async function validateTreasuryAccountData(
  program: Program,
  address: PublicKey,
  { bump }: TreasuryAccountData
) {
  const data = await program.account.treasury.fetch(address);
  assert.ok(data.bump === bump);
}

export async function validateAccountDoesNotExist(
  program: Program,
  address: PublicKey
) {
  const accountInfo = await program.provider.connection.getAccountInfo(address);
  assert.ok(accountInfo === null);
}
