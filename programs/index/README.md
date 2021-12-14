# 🔢 Index Program

The **Index Program** can create virtual namespaces for indexing Solana accounts on-chain. It provides [key-value stores (KVS)](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) for mapping account addresses to more predictable names. It supports creating indicies with either serial namespaces (0, 1, 2, 3 ... like an array) or freeform namespaces ("foo", "bar", "baz" ... like a hashmap). It additionally supports constant-time "reverse-lookup" searches from an address to its name in an index.


## 👉 Getting Started

### Integrate and build

To integrate with the Index program, add it to your dependencies (see [**CPI Examples**](https://github.com/faktorfi/programs/tree/main/programs/index/#cpi-examples) for sample code snippets):

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

### Submit an improvement

If you spot a bug or want to submit a improvement, join the [Faktor Discord](https://discord.gg/EdsWFHczfy) and come say hello! We're a group of people building [public key infrastructure (PKI)](https://en.wikipedia.org/wiki/Public_key_infrastructure) and [payments systems](https://faktor.finance) on Solana.



## ⚙️ How It Works

<img width="1311" alt="Frame 40158" src="https://user-images.githubusercontent.com/8634334/145928977-1381297e-85c7-4590-9633-cd40c527ae26.png">



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
        cpi::{accounts::CreateIndex, create_index},
        program::index_program,
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

    #[account(address = index_program::ID)]
    pub index_program: Program<'info, Index>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateMyIndex>, namespace: String, bump: u8) -> ProgramResult {
    // Get accounts.
    let authority = &ctx.accounts.authority;
    let index = &ctx.accounts.index;
    let index_program = &ctx.accounts.index_program;
    let system_program = &ctx.accounts.system_program;

    // Initialize index account.
    create_index(
        CpiContext::new_with_signer(
            index_program.to_account_info(),
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
