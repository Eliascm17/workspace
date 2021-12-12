import { airdrop } from "./airdrop";
import { Connection, Keypair } from "@solana/web3.js";

export async function generateSigner(connection: Connection): Promise<Keypair> {
  const signer = Keypair.generate();
  await airdrop(2, signer.publicKey, connection);
  return signer;
}
