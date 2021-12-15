import { Program } from "@project-serum/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { IndexProgram } from "../../../target/types/index_program";
import { PDA } from "../../../utils";

export type CreatePointerProps = {
  indexPDA: PDA;
  pointerPDA: PDA;
  proofPDA: PDA;
  owner: PublicKey;
  name: String;
  value: PublicKey;
};

export function createPointer(
  indexProgram: Program<IndexProgram>,
  { indexPDA, pointerPDA, proofPDA, owner, name, value }: CreatePointerProps
): TransactionInstruction {
  return indexProgram.instruction.createPointer(
    name,
    value,
    pointerPDA.bump,
    proofPDA.bump,
    {
      accounts: {
        index: indexPDA.address,
        pointer: pointerPDA.address,
        proof: proofPDA.address,
        owner: owner,
        systemProgram: SystemProgram.programId,
      },
    }
  );
}
