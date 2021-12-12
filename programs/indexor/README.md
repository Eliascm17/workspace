# 🔢 Indexor

Indexor creates virtual namespaces for indexing Solana accounts on-chain. These indicies are [key-value stores (KVS)](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) and can be used to map account addresses to more predictable names. Indexor supports creating indicies with either serial namespaces (0, 1, 2, 3 ... like an array) or freeform namespaces ("foo", "bar", "baz" ... like a hashmap). It additionally supports an algorithm for constant-time "reverse-lookup" searches from an address to its name in an index.

If you spot a bug or want to make an improvement, join the [Faktor Discord](https://discord.gg/EdsWFHczfy) and come say hello! We're a group of people building [public key infrastructure (PKI)](https://en.wikipedia.org/wiki/Public_key_infrastructure) and [payments systems](https://faktor.finance) on Solana.

## ⚙️ How It Works

TODO write this section

- [program-derived addresses (PDA)](https://docs.solana.com/developing/programming-model/calling-between-programs#program-derived-addresses)

## 👉 Getting Started

### Integrate and build

To integrate with the Indexor program, add it to your dependencies (see [**CPI Examples**](https://github.com/faktorfi/indexor#cpi-examples) for sample code snippets):

```yaml
# Cargo.toml

[dependencies]
indexor = { version = "0.5.0", features = ["cpi"] }
```

### Hack around

To download and play with the code, clone the repo:

```sh
# Terminal

git clone git@github.com:faktorfi/indexor.git
cd indexor
yarn
anchor build
anchor test
```

## 🦀 CPI Examples

The code snippets in this section are for Solana programs that need to create and manage their own on-chain indices. These examples assume the program has a singleton "program authority account" for signing instructions on behalf of the program.

### Creating an index

This example instruction `create_my_index` displays a program creating a freeform index in a custom namespace. Since the program signs the `create_index` instruction with its authority account (a [PDA](https://docs.solana.com/developing/programming-model/calling-between-programs#program-derived-addresses)), Indexor marks the authority as the index's owner – guaranteeing only the program authority may write to the index.

```rs
// create_my_index.rs

use {
    crate::state::*,
    anchor_lang::{prelude::*, solana_program::system_program},
    indexor::{
        cpi::{accounts::CreateIndex, create_index},
        program::Indexor,
        state::Index,
    },
};

#[derive(Accounts)]
#[instruction(namespace: String, bump: u8)]
pub struct CreateMyIndex<'info> {
    #[account(mut, seeds = [SEED_AUTHORITY], bump = authority.bump)]
    pub authority: Account<'info, Authority>,

    #[account(mut)]
    pub index: Account<'info, Index>,

    #[account(address = indexor::ID)]
    pub indexor_program: Program<'info, Indexor>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateMyIndex>, namespace: String, bump: u8) -> ProgramResult {
    // Get accounts.
    let authority = &ctx.accounts.authority;
    let index = &ctx.accounts.index;
    let indexor_program = &ctx.accounts.indexor_program;
    let system_program = &ctx.accounts.system_program;

    // Initialize index account.
    create_index(
        CpiContext::new_with_signer(
            indexor_program.to_account_info(),
            CreateIndex {
                index: index.to_account_info(),
                signer: authority.to_account_info(),
                system_program: system_program.to_account_info(),
            },
            &[&[SEED_AUTHORITY, &[authority.bump]]],
        ),
        namespace,
        false,
        bump,
    )
}
```
