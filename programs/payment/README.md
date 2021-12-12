# 💸 Payment Program

The **Payment Program** can schedule one-time and recurring token transfers on Solana. It uses [token delegation](https://spl.solana.com/token#authority-delegation) and a [bounty system](<https://en.wikipedia.org/wiki/Bounty_(reward)#Mathematics>) to schedule [token transfers](https://spl.solana.com/token#transferring-tokens) on a signer's behalf.

The Payment Program offers two optimizations over existing web3 "payments streaming" protocols:

1. Capital efficiency – The sender can hold onto their tokens right up until the moment they're sent. The Payment Program does not lockup future payments in a vesting contract. This is ideal for use-cases like payroll and consumer subscription payments.

2. Time efficiency – The recipient has tokens deposited directly to their wallet. The Payment Program does not force recipients to "claim" their received payments from a vesting contract. This is ideal for use-cases like streaming yield or royalties.

## ⚙️ How It Works

TODO write this section

## 👉 Getting Started

### Integrate and build

To integrate with the Payment Program, add it to your dependencies (see [**CPI Examples**](https://github.com/faktorfi/indexor#cpi-examples) for sample code snippets):

```yaml
# Cargo.toml

[dependencies]
streamor = { version = "0.1.0", features = ["cpi"] }
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

## 🦀 CPI Examples

The code snippets in this section are for Solana programs that need to schedule and manage on-chain payments. These examples assume the program has a singleton "program authority account" for signing instructions on behalf of the program.

### Creating an payment

This example instruction `create_my_payment` displays a program creating a one-time payment. Since the program signs the `create_payment` instruction with its authority account (a [PDA](https://docs.solana.com/developing/programming-model/calling-between-programs#program-derived-addresses)), Streamor marks the authority as the payment's owner – guaranteeing only the program authority may update it.

```rs
// create_my_payment.rs

use {
    crate::state::*,
    anchor_lang::{prelude::*, solana_program::system_program},
    payment_program::{
        cpi::{accounts::CreatePayment, create_payment},
        program::payment_program,
        state::Payment,
    },
};

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct CreateMyPayment<'info> {
    #[account(mut, seeds = [SEED_AUTHORITY], bump = authority.bump)]
    pub authority: Account<'info, Authority>,

    #[account(mut)]
    pub payment: Account<'info, Payment>,

    #[account(address = payment_program::ID)]
    pub payment_program: Program<'info, PaymentProgram>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateMyIndex>, bump: u8) -> ProgramResult {
    // Get accounts.
    let authority = &ctx.accounts.authority;
    let payment = &ctx.accounts.payment;
    let system_program = &ctx.accounts.system_program;

    // TODO Create my payment.
}
```
