import { Program } from "@project-serum/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { IndexProgram } from "../../../target/types/index_program";
import { PDA } from "../../../utils";

export type CreateIndexProps = {
  indexPDA: PDA;
  owner: PublicKey;
  payer: PublicKey;
  namespace: PublicKey;
  isSerial: boolean;
};

export function createIndex(
  indexProgram: Program<IndexProgram>,
  { indexPDA, owner, payer, namespace, isSerial }: CreateIndexProps
): // { indexPDA, signer, owner, namespace, isSerial }: CreateIndexProps
TransactionInstruction {
  return indexProgram.instruction.createIndex(
    // owner,
    // namespace,
    isSerial,
    indexPDA.bump,
    {
      accounts: {
        index: indexPDA.address,
        owner: owner,
        payer: payer,
        namespace: namespace,
        systemProgram: SystemProgram.programId,
      },
    }
  );
}
