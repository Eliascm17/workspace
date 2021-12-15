import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { authorityPDA, program, SEED_INDEX, SEED_NAMESPACE } from "..";
import { findPDA, PDA } from "../../../../utils";

export type CreatePaymentIndexProps = {
  indexProgram: PublicKey;
  party: PublicKey;
  payer: PublicKey;
};

export type CreatePaymentIndexResponse = {
  ix: TransactionInstruction;
  indexPDA: PDA;
  namespacePDA: PDA;
};

export async function createPaymentIndex({
  indexProgram,
  party,
  payer,
}: CreatePaymentIndexProps): Promise<CreatePaymentIndexResponse> {
  const namespacePDA = await findPDA(
    [SEED_NAMESPACE, party.toBuffer()],
    program.programId
  );

  const indexPDA = await findPDA(
    [
      SEED_INDEX,
      authorityPDA.address.toBuffer(),
      namespacePDA.address.toBuffer(),
    ],
    indexProgram
  );

  const ix = program.instruction.createPaymentIndex(
    indexPDA.bump,
    namespacePDA.bump,
    {
      accounts: {
        authority: authorityPDA.address,
        index: indexPDA.address,
        indexProgram: indexProgram,
        namespace: namespacePDA.address,
        party: party,
        payer: payer,
        systemProgram: SystemProgram.programId,
      },
    }
  );

  return { ix, indexPDA, namespacePDA };
}
