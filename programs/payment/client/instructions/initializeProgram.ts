import { Program, BN } from "@project-serum/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { program } from "..";
import { authorityPDA, configPDA, treasuryPDA } from "../pda";

export type InitializeProgramProps = {
  signer: PublicKey;
  transferFeeDistributor: number;
  transferFeeProgram: number;
};

export function initializeProgram({
  signer,
  transferFeeDistributor,
  transferFeeProgram,
}: InitializeProgramProps): TransactionInstruction {
  return program.instruction.initializeProgram(
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
