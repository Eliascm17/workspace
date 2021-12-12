import { Program, BN } from "@project-serum/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { PaymentProgram } from "../../../../target/types/payment_program";
import { PDA } from "../../../../utils";

export type initializeProgramProps = {
  authorityPDA: PDA;
  configPDA: PDA;
  treasuryPDA: PDA;
  signer: PublicKey;
  transferFeeDistributor: number;
  transferFeeProgram: number;
};

export function initializeProgram(
  paymentProgram: Program<PaymentProgram>,
  {
    authorityPDA,
    configPDA,
    treasuryPDA,
    signer,
    transferFeeDistributor,
    transferFeeProgram,
  }: initializeProgramProps
): TransactionInstruction {
  return paymentProgram.instruction.initializeProgram(
    new BN(transferFeeDistributor),
    new BN(transferFeeProgram),
    authorityPDA.bump,
    configPDA.bump,
    treasuryPDA.bump,
    {
      accounts: {
        authority: authorityPDA.address,
        config: configPDA.address,
        signer: signer,
        systemProgram: SystemProgram.programId,
        treasury: treasuryPDA.address,
      },
    }
  );
}
