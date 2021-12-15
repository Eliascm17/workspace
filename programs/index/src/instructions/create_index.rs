use {
    anchor_lang::{
        prelude::*,
        solana_program::system_program
    },
    crate::state::*,
    std::mem::size_of
};

#[derive(Accounts)]
#[instruction(
    is_serial: bool,
    bump: u8,
)]
pub struct CreateIndex<'info> {
    #[account(
        init, 
        seeds = [
            SEED_INDEX, 
            owner.key().as_ref(),
            namespace.key().as_ref()
        ],
        bump = bump, 
        payer = payer, 
        space = 8 + size_of::<Index>()
    )]
    pub index: Account<'info, Index>,

    #[account()]
    pub namespace: AccountInfo<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateIndex>, 
    is_serial: bool,
    bump: u8,
) -> ProgramResult {
    // Get accounts.
    let index = &mut ctx.accounts.index;
    let namespace = &ctx.accounts.namespace;
    let owner = &ctx.accounts.owner;

    // Initialize index account.
    index.owner = owner.key();
    index.namespace = namespace.key();
    index.count = 0;
    index.is_serial = is_serial;
    index.bump = bump;
    
    return Ok(());
}