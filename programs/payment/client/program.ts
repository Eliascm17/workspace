import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { PaymentProgram } from "../../../target/types/payment_program";

export const program = (anchor as any).workspace
  .PaymentProgram as Program<PaymentProgram>;

export function connection(): Connection {
  return program.provider.connection;
}
