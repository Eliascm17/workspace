import { PublicKey } from "@solana/web3.js";

// PDA
export type PDA = {
  address: PublicKey;
  bump: number;
};

export async function findPDA(
  seeds: Array<Buffer | Uint8Array>,
  programId: PublicKey
): Promise<PDA> {
  const [indexAddress, indexBump] = await PublicKey.findProgramAddress(
    seeds,
    programId
  );
  return {
    address: indexAddress,
    bump: indexBump,
  };
}

// findIndexPDA ...
// export async function findIndexPDA(
//   owner: PublicKey,
//   namespace: String,
//   programId: PublicKey
// ): Promise<PDA> {
//   return findPDA(
//     [SEED_INDEX, owner.toBuffer(), Buffer.from(namespace)],
//     programId
//   );
// }

// findItemPDA ...
// export async function findItemPDA(
//   indexAddress: PublicKey,
//   name: String,
//   programId: PublicKey
// ): Promise<PDA> {
//   const [itemAddress, itemBump] = await PublicKey.findProgramAddress(
//     [SEED_POINTER, indexAddress.toBuffer(), Buffer.from(name)],
//     programId
//   );
//   return {
//     address: itemAddress,
//     bump: itemBump,
//   };
// }

// findProofPDA ...
// export async function findProofPDA(
//   indexAddress: PublicKey,
//   pointerValue: PublicKey,
//   programId: PublicKey
// ): Promise<PDA> {
//   const [proofAddress, proofBump] = await PublicKey.findProgramAddress(
//     [SEED_PROOF, indexAddress.toBuffer(), pointerValue.toBuffer()],
//     programId
//   );
//   return {
//     address: proofAddress,
//     bump: proofBump,
//   };
// }
