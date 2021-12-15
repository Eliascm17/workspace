import assert from "assert";

import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";

import { SEED_INDEX, SEED_POINTER, SEED_PROOF } from "./seeds";

import { createIndex, createPointer } from "../client";
import { IndexProgram } from "../../../target/types/index_program";
import { airdrop, findPDA, PDA, signAndSubmit } from "../../../utils";

describe("Index Program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const indexProgram = (anchor as any).workspace
    .IndexProgram as Program<IndexProgram>;

  // Shared test data.
  const owner = Keypair.generate();
  const pointerA = Keypair.generate().publicKey;
  const pointerB = Keypair.generate().publicKey;
  const signer = Keypair.generate();
  const namespace = "abc";
  const namespaceSerial = "abc_serial";
  let indexPDA: PDA, pointerPDA: PDA, proofPDA: PDA;

  before(async () => {
    await airdrop(1, owner.publicKey, indexProgram.provider.connection);
    await airdrop(1, signer.publicKey, indexProgram.provider.connection);
  });

  it("creates a serial index", async () => {
    // Find PDAs.
    indexPDA = await findPDA(
      [SEED_INDEX, owner.publicKey.toBuffer(), Buffer.from(namespaceSerial)],
      indexProgram.programId
    );

    // Generate instructions.
    const ix = createIndex(indexProgram, {
      indexPDA: indexPDA,
      signer: owner.publicKey,
      owner: owner.publicKey,
      namespace: namespaceSerial,
      isSerial: true,
    });

    // Sign and submit transaction.
    await signAndSubmit(indexProgram.provider.connection, [ix], owner);

    // Validate index account state.
    const indexData = await indexProgram.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespaceSerial);
    assert.ok(indexData.isSerial === true);
    assert.ok(indexData.count.toNumber() === 0);
    assert.ok(indexData.bump === indexPDA.bump);
  });

  it('indexes an item at "0"', async () => {
    // Get index account data.
    let indexData = await indexProgram.account.index.fetch(indexPDA.address);

    // Find next pointer PDA.
    pointerPDA = await findPDA(
      [
        SEED_POINTER,
        indexPDA.address.toBuffer(),
        Buffer.from(indexData.count.toString()),
      ],
      indexProgram.programId
    );

    // Find proof PDA.
    proofPDA = await findPDA(
      [SEED_PROOF, indexPDA.address.toBuffer(), pointerA.toBuffer()],
      indexProgram.programId
    );

    // Generate instructions.
    const ix = createPointer(indexProgram, {
      indexPDA,
      pointerPDA,
      proofPDA,
      owner: owner.publicKey,
      name: indexData.count.toString(),
      value: pointerA,
    });

    // Sign and submit transaction.
    await signAndSubmit(indexProgram.provider.connection, [ix], owner);

    // Validate index account data.
    indexData = await indexProgram.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespaceSerial);
    assert.ok(indexData.isSerial === true);
    assert.ok(indexData.count.toNumber() === 1);
    assert.ok(indexData.bump === indexPDA.bump);

    // Validate pointer account data.
    const pointer = await indexProgram.account.pointer.fetch(
      pointerPDA.address
    );
    assert.ok(pointer.name === "0");
    assert.ok(pointer.value.toString() === pointerA.toString());
    assert.ok(pointer.bump === pointerPDA.bump);

    // Validate proof account data.
    const proofData = await indexProgram.account.proof.fetch(proofPDA.address);
    assert.ok(proofData.name === "0");
    assert.ok(proofData.bump === proofPDA.bump);
  });

  it('indexes an item at "1"', async () => {
    // Get index account data.
    let indexData = await indexProgram.account.index.fetch(indexPDA.address);

    // Find next pointer PDA.
    pointerPDA = await findPDA(
      [
        SEED_POINTER,
        indexPDA.address.toBuffer(),
        Buffer.from(indexData.count.toString()),
      ],
      indexProgram.programId
    );

    // Find proof PDA.
    proofPDA = await findPDA(
      [SEED_PROOF, indexPDA.address.toBuffer(), pointerB.toBuffer()],
      indexProgram.programId
    );

    // Generate instructions.
    const ix = createPointer(indexProgram, {
      indexPDA,
      pointerPDA,
      proofPDA,
      owner: owner.publicKey,
      name: indexData.count.toString(),
      value: pointerB,
    });

    // Sign and submit transaction.
    await signAndSubmit(indexProgram.provider.connection, [ix], owner);

    // Validate index account data.
    indexData = await indexProgram.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespaceSerial);
    assert.ok(indexData.isSerial === true);
    assert.ok(indexData.count.toNumber() === 2);
    assert.ok(indexData.bump === indexPDA.bump);

    // Validate pointer account data.
    const pointer = await indexProgram.account.pointer.fetch(
      pointerPDA.address
    );
    assert.ok(pointer.name === "1");
    assert.ok(pointer.value.toString() === pointerB.toString());
    assert.ok(pointer.bump === pointerPDA.bump);

    // Validate proof account data.
    const proofData = await indexProgram.account.proof.fetch(proofPDA.address);
    assert.ok(proofData.name === "1");
    assert.ok(proofData.bump === proofPDA.bump);
  });

  it("creates a freeform index", async () => {
    // Find index PDA.
    indexPDA = await findPDA(
      [SEED_INDEX, owner.publicKey.toBuffer(), Buffer.from(namespace)],
      indexProgram.programId
    );

    // Generate instructions.
    const ix = createIndex(indexProgram, {
      indexPDA: indexPDA,
      signer: owner.publicKey,
      owner: owner.publicKey,
      namespace: namespace,
      isSerial: false,
    });

    // Sign and submit transaction.
    await signAndSubmit(indexProgram.provider.connection, [ix], owner);

    // Validate index account state.
    const indexData = await indexProgram.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespace);
    assert.ok(indexData.isSerial === false);
    assert.ok(indexData.count.toNumber() === 0);
    assert.ok(indexData.bump === indexPDA.bump);
  });

  it('indexes an item at "foo"', async () => {
    // Get index account data.
    let indexData = await indexProgram.account.index.fetch(indexPDA.address);

    // Find next pointer PDA.
    let name = "foo";
    pointerPDA = await findPDA(
      [SEED_POINTER, indexPDA.address.toBuffer(), Buffer.from(name)],
      indexProgram.programId
    );

    // Find proof PDA.
    proofPDA = await findPDA(
      [SEED_PROOF, indexPDA.address.toBuffer(), pointerA.toBuffer()],
      indexProgram.programId
    );

    // Generate instructions.
    const ix = createPointer(indexProgram, {
      indexPDA,
      pointerPDA,
      proofPDA,
      owner: owner.publicKey,
      name: name,
      value: pointerA,
    });

    // Sign and submit transaction.
    await signAndSubmit(indexProgram.provider.connection, [ix], owner);

    // Validate index account data.
    indexData = await indexProgram.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespace);
    assert.ok(indexData.isSerial === false);
    assert.ok(indexData.count.toNumber() === 1);
    assert.ok(indexData.bump === indexPDA.bump);

    // Validate pointer account data.
    const pointer = await indexProgram.account.pointer.fetch(
      pointerPDA.address
    );
    assert.ok(pointer.name === name);
    assert.ok(pointer.value.toString() === pointerA.toString());
    assert.ok(pointer.bump === pointerPDA.bump);

    // Validate proof account data.
    const proofData = await indexProgram.account.proof.fetch(proofPDA.address);
    assert.ok(proofData.name === name);
    assert.ok(proofData.bump === proofPDA.bump);
  });

  it('indexes an item at "bar"', async () => {
    // Get index account data.
    let indexData = await indexProgram.account.index.fetch(indexPDA.address);

    // Find next pointer PDA.
    let name = "bar";
    pointerPDA = await findPDA(
      [SEED_POINTER, indexPDA.address.toBuffer(), Buffer.from(name)],
      indexProgram.programId
    );

    // Find proof PDA.
    proofPDA = await findPDA(
      [SEED_PROOF, indexPDA.address.toBuffer(), pointerB.toBuffer()],
      indexProgram.programId
    );

    // Generate instructions.
    const ix = createPointer(indexProgram, {
      indexPDA,
      pointerPDA,
      proofPDA,
      owner: owner.publicKey,
      name: name,
      value: pointerB,
    });

    // Sign and submit transaction.
    await signAndSubmit(indexProgram.provider.connection, [ix], owner);

    // Validate index account data.
    indexData = await indexProgram.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespace);
    assert.ok(indexData.isSerial === false);
    assert.ok(indexData.count.toNumber() === 2);
    assert.ok(indexData.bump === indexPDA.bump);

    // Validate pointer account data.
    const pointer = await indexProgram.account.pointer.fetch(
      pointerPDA.address
    );
    assert.ok(pointer.name === name);
    assert.ok(pointer.value.toString() === pointerB.toString());
    assert.ok(pointer.bump === pointerPDA.bump);

    // Validate proof account data.
    const proofData = await indexProgram.account.proof.fetch(proofPDA.address);
    assert.ok(proofData.name === name);
    assert.ok(proofData.bump === proofPDA.bump);
  });
});
