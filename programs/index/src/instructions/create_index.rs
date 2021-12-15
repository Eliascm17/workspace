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
    owner: Pubkey,
    namespace: String,
    is_serial: bool,
    bump: u8,
)]
pub struct CreateIndex<'info> {
    #[account(
        init, 
        seeds = [
            SEED_INDEX, 
            owner.as_ref(),
            namespace.as_ref()
        ],
        bump = bump, 
        payer = signer, 
        space = 8 + size_of::<Index>()
    )]
    pub index: Account<'info, Index>,

    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateIndex>, 
    owner: Pubkey,
    namespace: String,
    is_serial: bool,
    bump: u8,
) -> ProgramResult {
    // Get accounts.
    let index = &mut ctx.accounts.index;

    // Initialize index account.
    index.owner = owner;
    index.namespace = namespace;
    index.count = 0;
    index.is_serial = is_serial;
    index.bump = bump;
    
    return Ok(());
}