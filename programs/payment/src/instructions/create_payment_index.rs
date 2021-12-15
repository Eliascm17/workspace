use {
    crate::state::*,
    anchor_lang::{prelude::*, solana_program::system_program},
    std::mem::size_of,
};

#[derive(Accounts)]
#[instruction(
    index_bump: u8,
    namespace_bump: u8
)]
pub struct CreatePaymentIndex<'info> {
    #[account(mut, seeds = [SEED_AUTHORITY], bump = authority.bump)]
    pub authority: Account<'info, Authority>,

    #[account(mut)]
    pub index: AccountInfo<'info>,

    #[account(address = index_program::ID)]
    pub index_program: Program<'info, index_program::program::IndexProgram>,

    #[account(
        init,
        seeds = [
            SEED_NAMESPACE,
            party.key().as_ref(),
        ],
        bump = namespace_bump,
        payer = payer,
        space = 8 + size_of::<Namespace>(),
    )]
    pub namespace: Account<'info, Namespace>,

    #[account(mut)]
    pub party: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreatePaymentIndex>,
    index_bump: u8,
    namespace_bump: u8,
) -> ProgramResult {
    // Get accounts.
    let authority = &ctx.accounts.authority;
    let index = &ctx.accounts.index;
    let namespace = &mut ctx.accounts.namespace;
    let payer = &ctx.accounts.payer;
    let party = &ctx.accounts.party;
    let index_program = &ctx.accounts.index_program;
    let system_program = &ctx.accounts.system_program;

    // Initialize namespace account.
    namespace.party = party.key();
    namespace.role = Role::Creditor;
    namespace.bump = namespace_bump;

    // Create an index to lookup payments by (party, role) pairs.
    // (e.g. all the payments where Alice is a creditor or Bob is a debtor)
    index_program::cpi::create_index(
        CpiContext::new_with_signer(
            index_program.to_account_info(),
            index_program::cpi::accounts::CreateIndex {
                index: index.to_account_info(),
                owner: authority.to_account_info(),
                payer: payer.to_account_info(),
                namespace: namespace.to_account_info(),
                system_program: system_program.to_account_info(),
            },
            &[&[SEED_AUTHORITY, &[authority.bump]]],
        ),
        true,
        index_bump,
    )
}
