use {
    crate::state::*,
    anchor_lang::{prelude::*, solana_program::system_program},
    // index_program::cpi::accounts::CreateIndex,
    // index_program::cpi::accounts::CreateIndex,
    // index_program::cpi::create_index,
    // index_program::program::IndexProgram,
    // index_program::program::IndexProgram,
    // index_program::index_program::create_index,
    // index_program::instructions::CreateIndex,
    // index_program::state::*,
};

#[derive(Accounts)]
#[instruction(
    party: Pubkey,
    role: Role,
    bump: u8,
)]
pub struct CreatePaymentIndex<'info> {
    #[account(mut, seeds = [SEED_AUTHORITY], bump = authority.bump)]
    pub authority: Account<'info, Authority>,

    // #[account(mut)]
    // pub index: Account<'info, Index>,

    // #[account(address = index_program::ID)]
    // pub index_program: Program<'info, IndexProgram>,
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreatePaymentIndex>,
    _party: Pubkey,
    _role: Role,
    _bump: u8,
) -> ProgramResult {
    // Get accounts.
    // let authority = &ctx.accounts.authority;
    // let index = &ctx.accounts.index;
    let _signer = &ctx.accounts.signer;
    // let _index_program = &ctx.accounts.index_program;
    let _system_program = &ctx.accounts.system_program;

    // Create an index to lookup payments by (party, role) pairs.
    // (e.g. all the payments where Alice is a creditor or Bob is a debtor)
    // create_index(
    //     CpiContext::new_with_signer(
    //         index_program.to_account_info(),
    //         CreateIndex {
    //             index: index.to_account_info(),
    //             owner: authority.to_account_info(),
    //             system_program: system_program.to_account_info(),
    //         },
    //         &[&[SEED_AUTHORITY, &[authority.bump]]],
    //     ),
    //     payment_index_namespace(party, role),
    //     true,
    //     bump,
    // )

    return Ok(());
}
