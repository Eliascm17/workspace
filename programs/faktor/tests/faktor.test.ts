import * as anchor from "@project-serum/anchor";
import { BN, Provider } from "@project-serum/anchor";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
// import {
//   validateAccountDoesNotExist,
//   validateConfigAccountData,
//   validateCreditorPaymentRefIndexAccountData,
//   validateDebtorPaymentIndexAccountData,
//   validatePaymentAccountData,
//   validateTaskAccountData,
//   validateTaskIndexAccountData,
//   validateTreasuryAccountData,
// } from "../../../tests/utils/validate";
import { dateToSeconds, newSigner, PDA } from "../../../utils";

// Mints
const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

// Seeds
const SEED_AUTHORITY = Buffer.from("aut");
const SEED_CONFIG = Buffer.from("cfg");
const SEED_CREDITOR_PAYMENT_REF_INDEX = Buffer.from("crd_pay_ref_idx");
const SEED_DEBTOR_PAYMENT_INDEX = Buffer.from("dbt_pay_idx");
const SEED_PAYMENT = Buffer.from("pay");
const SEED_PAYMENT_REF = Buffer.from("pay_ref");
const SEED_TASK = Buffer.from("tsk");
const SEED_TASK_INDEX = Buffer.from("tsk_idx");
const SEED_TREASURY = Buffer.from("trs");

// Time
const ONE_MINUTE = 60;

describe("faktor", () => {
  // Test environment
  const provider = Provider.local();
  const program = (anchor as any).workspace.Faktor;
  anchor.setProvider(provider);

  // Shared data
  let creditor: Keypair;
  let debtor: Keypair;
  let worker: Keypair;
  let authorityPDA: PDA, configPDA: PDA, treasuryPDA: PDA;
  let taskIndexProcessAt: number;

  before(async () => {
    const [authorityAddress, authorityBump] =
      await PublicKey.findProgramAddress([SEED_AUTHORITY], program.programId);
    authorityPDA = {
      address: authorityAddress,
      bump: authorityBump,
    };
    const [configAddress, configBump] = await PublicKey.findProgramAddress(
      [SEED_CONFIG],
      program.programId
    );
    configPDA = {
      address: configAddress,
      bump: configBump,
    };
    const [treasuryAddress, treasuryBump] = await PublicKey.findProgramAddress(
      [SEED_TREASURY],
      program.programId
    );
    treasuryPDA = {
      address: treasuryAddress,
      bump: treasuryBump,
    };
    creditor = await newSigner(provider.connection);
    debtor = await newSigner(provider.connection);
    worker = await newSigner(provider.connection);
  });

  it("initializes the program", async () => {
    // Generate test data.
    const signer = await newSigner(provider.connection);
    const transferFeeDistributor = 1000;
    const transferFeeProgram = 1000;

    // Run test.
    await program.rpc.initializeProgram(
      new BN(transferFeeDistributor),
      new BN(transferFeeProgram),
      authorityPDA.bump,
      configPDA.bump,
      treasuryPDA.bump,
      {
        accounts: {
          authority: authorityPDA.address,
          config: configPDA.address,
          signer: signer.publicKey,
          systemProgram: SystemProgram.programId,
          treasury: treasuryPDA.address,
        },
        signers: [signer],
      }
    );

    // Validate state.
    // TODO validate authority account data
    // await validateConfigAccountData(program, configPDA.address, {
    //   transferFeeDistributor,
    //   transferFeeProgram,
    //   bump: configPDA.bump,
    // });
    // await validateTreasuryAccountData(program, treasuryPDA.address, {
    //   bump: treasuryPDA.bump,
    // });
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
