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
  // signer: PublicKey;
  owner: PublicKey;
  namespace: String;
  isSerial: boolean;
};

export function createIndex(
  indexProgram: Program<IndexProgram>,
  { indexPDA, owner, namespace, isSerial }: CreateIndexProps
): // { indexPDA, signer, owner, namespace, isSerial }: CreateIndexProps
TransactionInstruction {
  return indexProgram.instruction.createIndex(
    // owner,
    namespace,
    isSerial,
    indexPDA.bump,
    {
      accounts: {
        index: indexPDA.address,
        payer: owner,
        owner: owner,
        systemProgram: SystemProgram.programId,
      },
    }
  );
}
