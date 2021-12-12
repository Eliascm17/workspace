import * as anchor from "@project-serum/anchor";
import assert from "assert";
import { Program } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { Indexor } from "../target/types/indexor";
import { airdrop } from "./utils";
import { findIndexPDA, findItemPDA, findProofPDA, PDA } from "./utils";

describe("indexor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const indexor = (anchor as any).workspace.Indexor as Program<Indexor>;

  // Shared test data.
  const owner = Keypair.generate();
  const pointerA = Keypair.generate().publicKey;
  const pointerB = Keypair.generate().publicKey;
  const namespace = "abc";
  const namespaceSerial = "abc_serial";
  let indexPDA: PDA, pointerPDA: PDA, proofPDA: PDA;

  before(async () => {
    await airdrop(1, owner.publicKey, indexor.provider.connection);
  });

  it("creates a serial index", async () => {
    // Genereate index PDA.
    indexPDA = await findIndexPDA(
      owner.publicKey,
      namespaceSerial,
      indexor.programId
    );

    // Run test.
    const isSerial = true;
    await indexor.rpc.createIndex(namespaceSerial, isSerial, indexPDA.bump, {
      accounts: {
        index: indexPDA.address,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [owner],
    });

    // Validate index account state.
    const indexData = await indexor.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespaceSerial);
    assert.ok(indexData.isSerial === isSerial);
    assert.ok(indexData.count.toNumber() === 0);
    assert.ok(indexData.bump === indexPDA.bump);
  });

  it('indexes an item at "0"', async () => {
    // Get index account data.
    let indexData = await indexor.account.index.fetch(indexPDA.address);

    // Genereate next item PDA.
    pointerPDA = await findItemPDA(
      indexPDA.address,
      indexData.count.toString(),
      indexor.programId
    );

    // Generate proof PDA.
    proofPDA = await findProofPDA(
      indexPDA.address,
      pointerA,
      indexor.programId
    );

    // Run test.
    await indexor.rpc.createPointer(
      indexData.count.toString(),
      pointerA,
      pointerPDA.bump,
      proofPDA.bump,
      {
        accounts: {
          index: indexPDA.address,
          pointer: pointerPDA.address,
          proof: proofPDA.address,
          owner: owner.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [owner],
      }
    );

    // Validate index account data.
    indexData = await indexor.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespaceSerial);
    assert.ok(indexData.isSerial === true);
    assert.ok(indexData.count.toNumber() === 1);
    assert.ok(indexData.bump === indexPDA.bump);

    // Validate pointer account data.
    const pointer = await indexor.account.pointer.fetch(pointerPDA.address);
    assert.ok(pointer.name === "0");
    assert.ok(pointer.value.toString() === pointerA.toString());
    assert.ok(pointer.bump === pointerPDA.bump);

    // Validate proof account data.
    const proofData = await indexor.account.proof.fetch(proofPDA.address);
    assert.ok(proofData.name === "0");
    assert.ok(proofData.bump === proofPDA.bump);
  });

  it('indexes an item at "1"', async () => {
    // Get index account data.
    let indexData = await indexor.account.index.fetch(indexPDA.address);

    // Genereate next item PDA.
    pointerPDA = await findItemPDA(
      indexPDA.address,
      indexData.count.toString(),
      indexor.programId
    );

    // Generate proof PDA.
    proofPDA = await findProofPDA(
      indexPDA.address,
      pointerB,
      indexor.programId
    );

    // Run test.
    await indexor.rpc.createPointer(
      indexData.count.toString(),
      pointerB,
      pointerPDA.bump,
      proofPDA.bump,
      {
        accounts: {
          index: indexPDA.address,
          pointer: pointerPDA.address,
          proof: proofPDA.address,
          owner: owner.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [owner],
      }
    );

    // Validate index account data.
    indexData = await indexor.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespaceSerial);
    assert.ok(indexData.isSerial === true);
    assert.ok(indexData.count.toNumber() === 2);
    assert.ok(indexData.bump === indexPDA.bump);

    // Validate pointer account data.
    const pointer = await indexor.account.pointer.fetch(pointerPDA.address);
    assert.ok(pointer.name === "1");
    assert.ok(pointer.value.toString() === pointerB.toString());
    assert.ok(pointer.bump === pointerPDA.bump);

    // Validate proof account data.
    const proofData = await indexor.account.proof.fetch(proofPDA.address);
    assert.ok(proofData.name === "1");
    assert.ok(proofData.bump === proofPDA.bump);
  });

  it("creates a freeform index", async () => {
    // Genereate index PDA.
    indexPDA = await findIndexPDA(
      owner.publicKey,
      namespace,
      indexor.programId
    );

    // Run test.
    await indexor.rpc.createIndex(namespace, false, indexPDA.bump, {
      accounts: {
        index: indexPDA.address,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [owner],
    });

    // Validate index account state.
    const indexData = await indexor.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespace);
    assert.ok(indexData.isSerial === false);
    assert.ok(indexData.count.toNumber() === 0);
    assert.ok(indexData.bump === indexPDA.bump);
  });

  it('indexes an item at "foo"', async () => {
    // Get index account data.
    let indexData = await indexor.account.index.fetch(indexPDA.address);

    // Genereate next item PDA.
    let name = "foo";
    pointerPDA = await findItemPDA(indexPDA.address, name, indexor.programId);

    // Generate proof PDA.
    proofPDA = await findProofPDA(
      indexPDA.address,
      pointerA,
      indexor.programId
    );

    // Run test.
    await indexor.rpc.createPointer(
      name,
      pointerA,
      pointerPDA.bump,
      proofPDA.bump,
      {
        accounts: {
          index: indexPDA.address,
          pointer: pointerPDA.address,
          proof: proofPDA.address,
          owner: owner.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [owner],
      }
    );

    // Validate index account data.
    indexData = await indexor.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespace);
    assert.ok(indexData.isSerial === false);
    assert.ok(indexData.count.toNumber() === 1);
    assert.ok(indexData.bump === indexPDA.bump);

    // Validate pointer account data.
    const pointer = await indexor.account.pointer.fetch(pointerPDA.address);
    assert.ok(pointer.name === name);
    assert.ok(pointer.value.toString() === pointerA.toString());
    assert.ok(pointer.bump === pointerPDA.bump);

    // Validate proof account data.
    const proofData = await indexor.account.proof.fetch(proofPDA.address);
    assert.ok(proofData.name === name);
    assert.ok(proofData.bump === proofPDA.bump);
  });

  it('indexes an item at "bar"', async () => {
    // Get index account data.
    let indexData = await indexor.account.index.fetch(indexPDA.address);

    // Genereate next item PDA.
    let name = "bar";
    pointerPDA = await findItemPDA(indexPDA.address, name, indexor.programId);

    // Generate proof PDA.
    proofPDA = await findProofPDA(
      indexPDA.address,
      pointerB,
      indexor.programId
    );

    // Run test.
    await indexor.rpc.createPointer(
      name,
      pointerB,
      pointerPDA.bump,
      proofPDA.bump,
      {
        accounts: {
          index: indexPDA.address,
          pointer: pointerPDA.address,
          proof: proofPDA.address,
          owner: owner.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [owner],
      }
    );

    // Validate index account data.
    indexData = await indexor.account.index.fetch(indexPDA.address);
    assert.ok(indexData.owner.toString() === owner.publicKey.toString());
    assert.ok(indexData.namespace === namespace);
    assert.ok(indexData.isSerial === false);
    assert.ok(indexData.count.toNumber() === 2);
    assert.ok(indexData.bump === indexPDA.bump);

    // Validate pointer account data.
    const pointer = await indexor.account.pointer.fetch(pointerPDA.address);
    assert.ok(pointer.name === name);
    assert.ok(pointer.value.toString() === pointerB.toString());
    assert.ok(pointer.bump === pointerPDA.bump);

    // Validate proof account data.
    const proofData = await indexor.account.proof.fetch(proofPDA.address);
    assert.ok(proofData.name === name);
    assert.ok(proofData.bump === proofPDA.bump);
  });
});
