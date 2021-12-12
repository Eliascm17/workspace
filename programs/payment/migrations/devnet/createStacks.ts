// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import {
  BN,
  Program,
  Provider,
  setProvider,
  Wallet,
} from "@project-serum/anchor";
import {
  Connection,
  ConfirmOptions,
  Keypair,
  SystemProgram,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// Initialize Web3 devnet provider.
const idl = require("../../target/idl/faktor.json");
const opts: ConfirmOptions = {
  preflightCommitment: "processed",
};
const wallet = new Wallet(Keypair.generate());
const endpoint = process.env.LOCALNET
  ? "http://localhost:8899"
  : clusterApiUrl("devnet");
const connection = new Connection(endpoint, opts.preflightCommitment);
const provider = new Provider(connection, wallet, opts);
const programID = new PublicKey(idl.metadata.address);
const program = new Program(idl as any, programID, provider);
setProvider(provider);

// Seeds
const SEED_CONFIG = Buffer.from("config");
const SEED_PROCESSOR = Buffer.from("processor");
const SEED_STACK = Buffer.from("stack");
const SEED_TREASURY = Buffer.from("treasury");

// Initial data.
const ONE_MINUTE = 60;
let now = new Date(new Date().setSeconds(0, 0));
const time1 = dateToSeconds(now);
const time2 = time1 + ONE_MINUTE;
const time3 = time2 + ONE_MINUTE;

// PDA type
type PDA = {
  address: PublicKey;
  bump: number;
};

// PDAs
let configPDA: PDA,
  processorPDA: PDA,
  treasuryPDA: PDA,
  stack1PDA: PDA,
  stack2PDA: PDA,
  stack3PDA: PDA;

// Helper function to airdrop SOL to an account.
async function airdrop(publicKey: PublicKey, amount: number) {
  console.log(`[INFO] Airdropping ${amount} SOL to ${publicKey.toString()}`);
  await provider.connection
    .requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL)
    .then((sig: any) =>
      provider.connection.confirmTransaction(sig, "confirmed")
    );
}

// Helper function to convert date to UNIX seconds.
export function dateToSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

// Helper function to initialize server.
async function initializeAddresses() {
  // Config
  const [configAddress, configBump] = await PublicKey.findProgramAddress(
    [SEED_CONFIG],
    program.programId
  );
  configPDA = {
    address: configAddress,
    bump: configBump,
  };

  // Config
  const [processorAddress, processorBump] = await PublicKey.findProgramAddress(
    [SEED_PROCESSOR],
    program.programId
  );
  processorPDA = {
    address: processorAddress,
    bump: processorBump,
  };

  // Treasury
  const [treasuryAddress, treasuryBump] = await PublicKey.findProgramAddress(
    [SEED_TREASURY],
    program.programId
  );
  treasuryPDA = {
    address: treasuryAddress,
    bump: treasuryBump,
  };
}

// Helper function execute the create_stack RPC call.
async function createStack() {
  // Get on-chain state.
  const processorData = await program.account.processor.fetch(
    processorPDA.address
  );
  const tailStackAddress = new PublicKey(processorData.tailStack);
  const tailStackData = await program.account.stack.fetch(tailStackAddress);

  // Generate new PDA.
  const processAt = tailStackData.processAt.toNumber() + ONE_MINUTE;
  const [newStackAddress, newStackBump] = await PublicKey.findProgramAddress(
    [SEED_STACK, Buffer.from(`${processAt}`)],
    program.programId
  );

  console.log(
    `Creating new stack at: `,
    new Date(processAt * 1000).toLocaleString()
  );
  await program.rpc.createStack(newStackBump, {
    accounts: {
      processor: processorPDA.address,
      newStack: newStackAddress,
      tailStack: tailStackAddress,
      signer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [wallet.payer],
  });
}

// Helper function to run the script.
async function run() {
  await airdrop(wallet.publicKey, 1);
  await initializeAddresses();
  while (true) {
    // Keep creating stacks until the signer runs out SOL
    await createStack();
  }
}

run();
