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

  const [stack1Address, stack1Bump] = await PublicKey.findProgramAddress(
    [SEED_STACK, Buffer.from(`${time1}`)],
    program.programId
  );
  stack1PDA = {
    address: stack1Address,
    bump: stack1Bump,
  };

  // Stack2
  const [stack2Address, stack2Bump] = await PublicKey.findProgramAddress(
    [SEED_STACK, Buffer.from(`${time2}`)],
    program.programId
  );
  stack2PDA = {
    address: stack2Address,
    bump: stack2Bump,
  };

  // Stack3
  const [stack3Address, stack3Bump] = await PublicKey.findProgramAddress(
    [SEED_STACK, Buffer.from(`${time3}`)],
    program.programId
  );
  stack3PDA = {
    address: stack3Address,
    bump: stack3Bump,
  };

  console.log(`[INFO] Config:`, configPDA.address.toString());
  console.log(`[INFO] Processor:`, processorPDA.address.toString());
  console.log(`[INFO] Treasury:`, treasuryPDA.address.toString());
  console.log(`[INFO] Stack 1:`, stack1PDA.address.toString());
  console.log(`[INFO] Stack 2:`, stack2PDA.address.toString());
  console.log(`[INFO] Stack 3:`, stack3PDA.address.toString());
}

// Helper function execute the initialize_program RPC call.
async function initializeProgram() {
  // Config data
  const transferFeeDistributor = 1000;
  const transferFeeProgram = 1000;

  // Execute RPC call
  console.log(`Initializing program...`);
  await program.rpc.initializeProgram(
    new BN(transferFeeDistributor),
    new BN(transferFeeProgram),
    new BN(time1),
    new BN(time2),
    new BN(time3),
    configPDA.bump,
    processorPDA.bump,
    stack1PDA.bump,
    stack2PDA.bump,
    stack3PDA.bump,
    treasuryPDA.bump,
    {
      accounts: {
        signer: wallet.publicKey,
        config: configPDA.address,
        processor: processorPDA.address,
        stackA: stack1PDA.address,
        stackB: stack2PDA.address,
        stackC: stack3PDA.address,
        treasury: treasuryPDA.address,
        systemProgram: SystemProgram.programId,
      },
      signers: [wallet.payer],
    }
  );
}

// Helper function to run the script.
async function run() {
  console.log(
    "[INFO] Initializing Faktor devent program:",
    program.programId.toString()
  );
  await airdrop(wallet.publicKey, 1);
  await initializeAddresses();
  await initializeProgram();
}

run();
