# 🔢 Index Program

The **Index Program** can create virtual namespaces for indexing Solana accounts on-chain. It provides [key-value stores (KVS)](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) for mapping account addresses to more predictable names. It supports creating indicies with either serial namespaces (0, 1, 2, 3 ... like an array) or freeform namespaces ("foo", "bar", "baz" ... like a hashmap). It additionally supports constant-time "reverse-lookup" searches from an address to its name in an index.

## 👉 Getting Started

### Integrate and build

To integrate with the Index program, add it to your dependencies (see [**CPI Examples**](https://github.com/faktorfi/programs/blob/main/programs/index/README.md#-cpi-examples) for sample code snippets):

```yaml
# Cargo.toml

[dependencies]
index-program = { version = "0.1.0" }
```

### Hack around

To download and play with the code, clone the repo:

```sh
# Terminal

git clone git@github.com:faktorfi/programs.git
cd programs
yarn
anchor build
anchor test
```

## ⚙️ How It Works

![Frame 40159](https://user-images.githubusercontent.com/8634334/146040947-f246e623-b105-447e-8ab4-bc4a59eabc52.png)

## 🦀 CPI Examples

The code snippets in this section are for Solana programs that need to create and manage their own on-chain indices. These examples assume the program has a singleton "program authority account" for signing instructions on behalf of the program.

### Creating an index

This example instruction `create_my_index` displays a program creating a freeform index in a custom namespace. Since the program signs the `create_index` instruction with its authority account (a [PDA](https://docs.solana.com/developing/programming-model/calling-between-programs#program-derived-addresses)), the Index Program marks the authority as the index's owner – guaranteeing only the program authority may write to the index.

```rs
// create_my_index.rs

use {
    crate::state::*,
    anchor_lang::{prelude::*, solana_program::system_program},
    index_program::{
        cpi::{
            accounts::CreateIndex,
            create_index,
        },
        program::IndexProgram,
    }
};

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct CreateMyIndex<'info> {
    #[account(mut, seeds = [SEED_AUTHORITY], bump = authority.bump)]
    pub authority: Account<'info, Authority>,

    #[account(mut)]
    pub index: AccountInfo<'info>,

    #[account(address = index_program::ID)]
    pub index_program: Program<'info, IndexProgram>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateMyIndex>, bump: u8) -> ProgramResult {
    // Get accounts.
    let authority = &ctx.accounts.authority;
    let index = &ctx.accounts.index;
    let signer = &ctx.accounts.signer;
    let index_program = &ctx.accounts.index_program;
    let system_program = &ctx.accounts.system_program;

    // TODO Create your own namespace accounts.
    let namespace = Pubkey::new_unique();

    // Create an index owned by the program authority.
    create_index(
        CpiContext::new_with_signer(
            index_program.to_account_info(),
            CreateIndex {
                index: index.to_account_info(),
                namespace: namespace,
                owner: authority.to_account_info(),
                payer: signer.to_account_info(),
                system_program: system_program.to_account_info(),
            },
            &[&[SEED_AUTHORITY, &[authority.bump]]],
        ),
        true,
        bump,
    )
}
```

## 👋 Getting involved

If you spot a bug or want to submit a improvement, join the [Faktor Discord](https://discord.gg/EdsWFHczfy) and come say hello! We're a group of people building [public key infrastructure (PKI)](https://en.wikipedia.org/wiki/Public_key_infrastructure) and [payments systems](https://faktor.finance) on Solana.
