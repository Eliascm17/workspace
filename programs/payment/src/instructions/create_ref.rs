use index_program::state::Index;

use {
    crate::state::*,
    anchor_lang::{prelude::*, solana_program::system_program},
    // index_program::state::*,
};

#[derive(Accounts)]
#[instruction(
    party: Pubkey,
    pointer_bump: u8,
    proof_bump: u8,
    // role: Role,
    // bump: u8,
)]
pub struct CreateRef<'info> {
    #[account(mut, seeds = [SEED_AUTHORITY], bump = authority.bump)]
    pub authority: Account<'info, Authority>,

    #[account(
        mut,
        constraint = index.namespace == "abc",
        constraint = index.owner == authority.key()
    )]
    pub index: Account<'info, Index>,

    #[account(mut)]
    pub pointer: AccountInfo<'info>,

    #[account(mut)]
    pub proof: AccountInfo<'info>,

    #[account(address = index_program::ID)]
    pub index_program: Program<'info, index_program::program::IndexProgram>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateRef>,
    party: Pubkey,
    pointer_bump: u8,
    proof_bump: u8,
    // role: Role,
    // bump: u8,
) -> ProgramResult {
    // Get accounts.
    let authority = &ctx.accounts.authority;
    let index = &ctx.accounts.index;
    let proof = &ctx.accounts.proof;
    let pointer = &ctx.accounts.pointer;
    let index_program = &ctx.accounts.index_program;
    let system_program = &ctx.accounts.system_program;

    // Create an index to lookup payments by (party, role) pairs.
    // (e.g. all the payments where Alice is a creditor or Bob is a debtor)
    // index_program::cpi::create_index(
    //     CpiContext::new_with_signer(
    //         index_program.to_account_info(),
    //         index_program::cpi::accounts::CreateIndex {
    //             index: index.to_account_info(),
    //             signer: authority.to_account_info(),
    //             system_program: system_program.to_account_info(),
    //         },
    //         &[&[SEED_AUTHORITY, &[authority.bump]]],
    //     ),
    //     authority.key(),
    //     String::from("abc"),
    //     true,
    //     bump,
    // )

    index_program::cpi::create_pointer(
        CpiContext::new_with_signer(
            index_program.to_account_info(),
            index_program::cpi::accounts::CreatePointer {
                index: index.to_account_info(),
                pointer: pointer.to_account_info(),
                proof: proof.to_account_info(),
                owner: authority.to_account_info(),
                system_program: system_program.to_account_info(),
            },
            &[&[SEED_AUTHORITY, &[authority.bump]]],
        ),
        String::from("foo"),
        party,
        pointer_bump,
        proof_bump,
    )

    // return Ok(());
}
