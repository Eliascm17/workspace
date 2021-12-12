import { Program } from "@project-serum/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Indexor } from "../../../../target/types/indexor";
import { PDA } from "../../../../utils";

export type CreateIndexProps = {
  indexPDA: PDA;
  owner: PublicKey;
  namespace: String;
  isSerial: boolean;
};

export function createIndex(
  indexor: Program<Indexor>,
  { indexPDA, owner, namespace, isSerial }: CreateIndexProps
): TransactionInstruction {
  return indexor.instruction.createIndex(namespace, isSerial, indexPDA.bump, {
    accounts: {
      index: indexPDA.address,
      owner: owner,
      systemProgram: SystemProgram.programId,
    },
  });
}
