import { Program } from "@project-serum/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { IndexProgram } from "../../../target/types/index_program";
import { PaymentProgram } from "../../../target/types/payment_program";
import { PDA } from "../../../utils";

export type CreateRefProps = {
  authority: PublicKey;
  index: PublicKey;
  party: PublicKey;
  pointerPDA: PDA;
  proofPDA: PDA;
  signer: PublicKey;
};

export function createRef(
  paymentProgram: Program<PaymentProgram>,
  indexProgram: Program<IndexProgram>,
  { authority, index, party, pointerPDA, proofPDA, signer }: CreateRefProps
): TransactionInstruction {
  return paymentProgram.instruction.createRef(
    party,
    pointerPDA.bump,
    proofPDA.bump,
    {
      accounts: {
        authority: authority,
        index: index,
        indexProgram: indexProgram.programId,
        pointer: pointerPDA.address,
        proof: proofPDA.address,
        signer: signer,
        systemProgram: SystemProgram.programId,
      },
    }
  );
}
