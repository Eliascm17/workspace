use {
    crate::state::*,
    anchor_lang::{prelude::*, solana_program::system_program},
};

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct CreatePaymentIndex<'info> {
    #[account(mut, seeds = [SEED_AUTHORITY], bump = authority.bump)]
    pub authority: Account<'info, Authority>,

    #[account(mut)]
    pub index: AccountInfo<'info>,

    #[account(address = index_program::ID)]
    pub index_program: Program<'info, index_program::program::IndexProgram>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreatePaymentIndex>, bump: u8) -> ProgramResult {
    // Get accounts.
    let authority = &ctx.accounts.authority;
    let index = &ctx.accounts.index;
    let signer = &ctx.accounts.signer;
    let index_program = &ctx.accounts.index_program;
    let system_program = &ctx.accounts.system_program;

    // Create an index to lookup payments by (party, role) pairs.
    // (e.g. all the payments where Alice is a creditor or Bob is a debtor)
    index_program::cpi::create_index(
        CpiContext::new_with_signer(
            index_program.to_account_info(),
            index_program::cpi::accounts::CreateIndex {
                index: index.to_account_info(),
                owner: authority.to_account_info(),
                payer: signer.to_account_info(),
                system_program: system_program.to_account_info(),
            },
            &[&[SEED_AUTHORITY, &[authority.bump]]],
        ),
        String::from("abc"),
        true,
        bump,
    )
}
