import * as anchor from "@project-serum/anchor";
import assert from "assert";
import { BN, Program, Provider } from "@project-serum/anchor";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import {
  dateToSeconds,
  findPDA,
  newSigner,
  PDA,
  signAndSubmit,
} from "../../../utils";
import { initializeProgram } from "./instructions";
import { SEED_AUTHORITY, SEED_CONFIG, SEED_TREASURY } from "./seeds";
import { PaymentProgram } from "../../../target/types/payment_program";

// Mints
const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

// Time
const ONE_MINUTE = 60;

describe("Payment Program", () => {
  // Test environment
  const provider = Provider.local();
  const paymentProgram = (anchor as any).workspace
    .PaymentProgram as Program<PaymentProgram>;
  anchor.setProvider(provider);

  // Shared data
  let creditor: Keypair;
  let debtor: Keypair;
  let worker: Keypair;
  let authorityPDA: PDA, configPDA: PDA, treasuryPDA: PDA;
  let taskIndexProcessAt: number;

  before(async () => {
    authorityPDA = await findPDA([SEED_AUTHORITY], paymentProgram.programId);
    configPDA = await findPDA([SEED_CONFIG], paymentProgram.programId);
    treasuryPDA = await findPDA([SEED_TREASURY], paymentProgram.programId);
    creditor = await newSigner(provider.connection);
    debtor = await newSigner(provider.connection);
    worker = await newSigner(provider.connection);
  });

  it("initializes the program", async () => {
    // Generate test data.
    const signer = await newSigner(provider.connection);
    const transferFeeDistributor = 1000;
    const transferFeeProgram = 1000;

    // Create instructions.
    const ix = initializeProgram(paymentProgram, {
      authorityPDA,
      configPDA,
      treasuryPDA,
      signer: signer.publicKey,
      transferFeeDistributor,
      transferFeeProgram,
    });

    // Sign and submit transaction.
    await signAndSubmit(paymentProgram.provider.connection, [ix], signer);

    // Validate config account data.
    const configData = await paymentProgram.account.config.fetch(
      configPDA.address
    );
    assert.ok(
      configData.transferFeeDistributor.toNumber() === transferFeeDistributor
    );
    assert.ok(configData.transferFeeProgram.toNumber() === transferFeeProgram);
    assert.ok(configData.bump === configPDA.bump);

    // Validate treasury account data.
    const treasuryData = await paymentProgram.account.treasury.fetch(
      treasuryPDA.address
    );
    assert.ok(treasuryData.bump === treasuryPDA.bump);
  });

  // it("creates a creditor payment index", async () => {
  //   // Generate test data.
  //   const SEED_INDEX = Buffer.from("idx");
  //   const namespace = `crd.pay.${creditor.publicKey.toString()}`;
  //   const [creditorPaymentIndexAddress, creditorPaymentIndexBump] =
  //     await PublicKey.findProgramAddress(
  //       [SEED_INDEX, creditor.publicKey.toBuffer(), Buffer.from(namespace)],
  //       program.programId
  //     );

  //   // Run test.
  //   await program.rpc.createCreditorPaymentRefIndex(
  //     creditorPaymentRefIndexBump,
  //     {
  //       accounts: {
  //         index: creditorPaymentRefIndexAddress,
  //         creditor: creditor.publicKey,
  //         signer: debtor.publicKey,
  //         systemProgram: SystemProgram.programId,
  //       },
  //       signers: [debtor],
  //     }
  //   );

  //   // Validate state.
  //   await validateCreditorPaymentRefIndexAccountData(
  //     program,
  //     creditorPaymentRefIndexAddress,
  //     {
  //       count: 0,
  //       creditor: creditor.publicKey,
  //       bump: creditorPaymentRefIndexBump,
  //     }
  //   );
  // });

  // it("creates a debtor payment index", async () => {
  //   // Generate test data.
  //   const [paymentIndexAddress, paymentIndexBump] =
  //     await PublicKey.findProgramAddress(
  //       [SEED_DEBTOR_PAYMENT_INDEX, debtor.publicKey.toBuffer()],
  //       program.programId
  //     );

  //   // Run test.
  //   await program.rpc.createDebtorPaymentIndex(paymentIndexBump, {
  //     accounts: {
  //       index: paymentIndexAddress,
  //       debtor: debtor.publicKey,
  //       signer: debtor.publicKey,
  //       systemProgram: SystemProgram.programId,
  //     },
  //     signers: [debtor],
  //   });

  //   // Validate state.
  //   await validateDebtorPaymentIndexAccountData(program, paymentIndexAddress, {
  //     count: 0,
  //     debtor: debtor.publicKey,
  //     bump: paymentIndexBump,
  //   });
  // });

  // it("creates a task index", async () => {
  //   // Generate test data.
  //   const thisMinute = new Date(new Date().setSeconds(0, 0));
  //   const nextMinute = new Date(thisMinute.getTime() + ONE_MINUTE * 1000);
  //   taskIndexProcessAt = dateToSeconds(nextMinute);

  //   // Generate PDA addresses.
  //   const [taskIndexAddress, taskIndexBump] =
  //     await PublicKey.findProgramAddress(
  //       [SEED_TASK_INDEX, Buffer.from(`${taskIndexProcessAt}`)],
  //       program.programId
  //     );

  //   // Run test.
  //   await program.rpc.createTaskIndex(
  //     new BN(taskIndexProcessAt),
  //     taskIndexBump,
  //     {
  //       accounts: {
  //         taskIndex: taskIndexAddress,
  //         signer: debtor.publicKey,
  //         systemProgram: SystemProgram.programId,
  //         clock: SYSVAR_CLOCK_PUBKEY,
  //       },
  //       signers: [debtor],
  //     }
  //   );

  //   // Validate state.
  //   await validateTaskIndexAccountData(program, taskIndexAddress, {
  //     count: 0,
  //     processAt: taskIndexProcessAt,
  //     bump: taskIndexBump,
  //   });
  // });

  // it("creates a payment", async () => {
  //   // Generate test data
  //   const id = new BN(1);
  //   const memo = "Test";
  //   const amount = LAMPORTS_PER_SOL / 2;
  //   const recurrenceInterval = 0;
  //   const startAt = taskIndexProcessAt;
  //   const endAt = startAt;

  //   // Generate PDA addresses.
  //   const [creditorPaymentRefIndexAddress, creditorPaymentIndexBump] =
  //     await PublicKey.findProgramAddress(
  //       [SEED_CREDITOR_PAYMENT_REF_INDEX, creditor.publicKey.toBuffer()],
  //       program.programId
  //     );
  //   const creditorPaymentRefIndexData =
  //     await program.account.creditorPaymentRefIndex.fetch(
  //       creditorPaymentRefIndexAddress
  //     );
  //   const [creditorPaymentRefAddress, creditorPaymentRefBump] =
  //     await PublicKey.findProgramAddress(
  //       [
  //         SEED_PAYMENT_REF,
  //         creditorPaymentRefIndexAddress.toBuffer(),
  //         Buffer.from(creditorPaymentRefIndexData.count.toString()),
  //       ],
  //       program.programId
  //     );
  //   const [debtorPaymentIndexAddress, debtorPaymentIndexBump] =
  //     await PublicKey.findProgramAddress(
  //       [SEED_DEBTOR_PAYMENT_INDEX, debtor.publicKey.toBuffer()],
  //       program.programId
  //     );
  //   const debtorPaymentIndexData =
  //     await program.account.debtorPaymentIndex.fetch(debtorPaymentIndexAddress);
  //   const [paymentAddress, paymentBump] = await PublicKey.findProgramAddress(
  //     [
  //       SEED_PAYMENT,
  //       // Buffer.from(id.toString()),
  //       debtorPaymentIndexAddress.toBuffer(),
  //       Buffer.from(debtorPaymentIndexData.count.toString()),
  //     ],
  //     program.programId
  //   );
  //   const [taskIndexAddress, taskIndexBump] =
  //     await PublicKey.findProgramAddress(
  //       [SEED_TASK_INDEX, Buffer.from(`${taskIndexProcessAt}`)],
  //       program.programId
  //     );
  //   const taskIndexData = await program.account.taskIndex.fetch(
  //     taskIndexAddress
  //   );

  //   const [taskAddress, taskBump] = await PublicKey.findProgramAddress(
  //     [
  //       SEED_TASK,
  //       taskIndexAddress.toBuffer(),
  //       Buffer.from(taskIndexData.count.toString()),
  //     ],
  //     program.programId
  //   );

  //   // Generate token accounts.
  //   const debtorTokensAddress = await Token.createWrappedNativeAccount(
  //     provider.connection,
  //     TOKEN_PROGRAM_ID,
  //     debtor.publicKey,
  //     debtor,
  //     LAMPORTS_PER_SOL
  //   );
  //   const creditorTokensAddress = await Token.createWrappedNativeAccount(
  //     provider.connection,
  //     TOKEN_PROGRAM_ID,
  //     creditor.publicKey,
  //     creditor,
  //     0
  //   );

  //   // Run test.
  //   await program.rpc.createPayment(
  //     // id,
  //     memo,
  //     new BN(amount),
  //     new BN(recurrenceInterval),
  //     new BN(startAt),
  //     new BN(endAt),
  //     paymentBump,
  //     taskBump,
  //     creditorPaymentRefBump,
  //     // debtorPaymentRefBump,
  //     {
  //       accounts: {
  //         clock: SYSVAR_CLOCK_PUBKEY,
  //         config: configPDA.address,
  //         creditor: creditor.publicKey,
  //         creditorPaymentRefIndex: creditorPaymentRefIndexAddress,
  //         creditorPaymentRef: creditorPaymentRefAddress,
  //         creditorTokens: creditorTokensAddress,
  //         debtor: debtor.publicKey,
  //         debtorPaymentIndex: debtorPaymentIndexAddress,
  //         debtorTokens: debtorTokensAddress,
  //         mint: WSOL_MINT,
  //         payment: paymentAddress,
  //         systemProgram: SystemProgram.programId,
  //         task: taskAddress,
  //         taskIndex: taskIndexAddress,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //       },
  //       signers: [debtor],
  //     }
  //   );

  //   // Validate state.
  //   await validatePaymentAccountData(program, paymentAddress, {
  //     memo: memo,
  //     debtor: debtor.publicKey,
  //     debtorTokens: debtorTokensAddress,
  //     creditor: creditor.publicKey,
  //     creditorTokens: creditorTokensAddress,
  //     mint: WSOL_MINT,
  //     amount: amount,
  //     recurrenceInterval: recurrenceInterval,
  //     startAt: startAt,
  //     endAt: endAt,
  //     bump: paymentBump,
  //   });
  //   await validateTaskAccountData(program, taskAddress, {
  //     id: 0,
  //     status: TaskStatus.Pending,
  //     payment: paymentAddress,
  //     bump: taskBump,
  //   });
  //   await validateTaskIndexAccountData(program, taskIndexAddress, {
  //     count: 1,
  //     processAt: taskIndexProcessAt,
  //     bump: taskIndexData.bump,
  //   });
  // });

  // it("processes a task", async () => {
  //   // Generate test data.
  //   const [debtorPaymentIndexAddress, debtorPaymentIndexBump] =
  //     await PublicKey.findProgramAddress(
  //       [SEED_DEBTOR_PAYMENT_INDEX, debtor.publicKey.toBuffer()],
  //       program.programId
  //     );
  //   const [taskIndexAddress, taskIndexBump] =
  //     await PublicKey.findProgramAddress(
  //       [SEED_TASK_INDEX, Buffer.from(`${taskIndexProcessAt}`)],
  //       program.programId
  //     );
  //   const [taskAddress, taskBump] = await PublicKey.findProgramAddress(
  //     [SEED_TASK, taskIndexAddress.toBuffer(), Buffer.from(`0`)],
  //     program.programId
  //   );
  //   const taskData = await program.account.task.fetch(taskAddress);
  //   const paymentAddress = new PublicKey(taskData.payment);
  //   const paymentData = await program.account.payment.fetch(paymentAddress);
  //   const creditorAddress = new PublicKey(paymentData.creditor);
  //   const creditorTokensAddress = new PublicKey(paymentData.creditorTokens);
  //   const debtorAddress = new PublicKey(paymentData.debtor);
  //   const debtorTokensAddress = new PublicKey(paymentData.debtorTokens);

  //   // Run test.
  //   await program.rpc.processTask({
  //     accounts: {
  //       clock: SYSVAR_CLOCK_PUBKEY,
  //       config: configPDA.address,
  //       debtor: debtorAddress,
  //       debtorPaymentIndex: debtorPaymentIndexAddress,
  //       debtorTokens: debtorTokensAddress,
  //       creditor: creditorAddress,
  //       creditorTokens: creditorTokensAddress,
  //       payment: paymentAddress,
  //       signer: worker.publicKey,
  //       systemProgram: SystemProgram.programId,
  //       task: taskAddress,
  //       taskIndex: taskIndexAddress,
  //       treasury: treasuryPDA.address,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     },
  //     signers: [worker],
  //   });

  //   // Validate state.
  //   await validateTaskAccountData(program, taskAddress, {
  //     id: 0,
  //     status: TaskStatus.Pending,
  //     payment: paymentAddress,
  //     bump: taskBump,
  //   });
  // });
});
