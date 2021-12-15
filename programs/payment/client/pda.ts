import { PublicKey } from "@solana/web3.js";
import { findPDA, PDA } from "../../../utils";

// PDAs
export let authorityPDA: PDA, configPDA: PDA, treasuryPDA: PDA;

// SEEDS
export const SEED_AUTHORITY = Buffer.from("aut");
export const SEED_CONFIG = Buffer.from("cfg");
export const SEED_TREASURY = Buffer.from("trs");
export const SEED_INDEX = Buffer.from("idx");
export const SEED_NAMESPACE = Buffer.from("ns");

// loadPDAs ...
export async function loadPDAs(programId: PublicKey) {
  authorityPDA = await findPDA([SEED_AUTHORITY], programId);
  configPDA = await findPDA([SEED_CONFIG], programId);
  treasuryPDA = await findPDA([SEED_TREASURY], programId);
}
