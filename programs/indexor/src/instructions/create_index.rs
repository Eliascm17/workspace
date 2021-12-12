use {
    anchor_lang::{
        prelude::*,
        solana_program::system_program
    },
    crate::state,
    std::mem::size_of
};

#[derive(Accounts)]
#[instruction(
    namespace: String,
    is_serial: bool,
    bump: u8,
)]
pub struct CreateIndex<'info> {
    #[account(
        init, 
        seeds = [
            state::SEED_INDEX, 
            owner.key().as_ref(), 
            namespace.as_ref()
        ],
        bump = bump, 
        payer = owner, 
        space = 8 + size_of::<state::Index>()
    )]
    pub index: Account<'info, state::Index>,

    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateIndex>, 
    namespace: String,
    is_serial: bool,
    bump: u8,
) -> ProgramResult {
    // Get accounts.
    let index = &mut ctx.accounts.index;
    let owner = &ctx.accounts.owner;

    // Initialize index account.
    index.owner = owner.key();
    index.namespace = namespace;
    index.count = 0;
    index.is_serial = is_serial;
    index.bump = bump;
    
    return Ok(());
}

#[test]
fn it_works() {
    assert_eq!(2 + 2, 4);
    let ctx = Context::new(
        &crate::ID, 
        CreateIndex {
            index: None,
            owner: None,
            system_program: None,
        },
        &[]
    );

    
}