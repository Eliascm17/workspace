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
    config_transfer_fee_distributor: u64,
    config_transfer_fee_program: u64,
    authority_bump: u8,
    config_bump: u8,
    treasury_bump: u8,
)]
pub struct InitializeProgram<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        seeds = [state::SEED_AUTHORITY],
        bump = authority_bump,
        payer = signer,
        space = 8 + size_of::<state::Authority>(),
    )]
    pub authority: Account<'info, state::Authority>,
    
    #[account(
        init, 
        seeds = [state::SEED_CONFIG], 
        bump = config_bump, 
        payer = signer, 
        space = 8 + size_of::<state::Config>()
    )]
    pub config: Account<'info, state::Config>,
    
    #[account(
        init, 
        seeds = [state::SEED_TREASURY], 
        bump = treasury_bump, 
        payer = signer, 
        space = 8 + size_of::<state::Treasury>()
    )]
    pub treasury: Account<'info, state::Treasury>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeProgram>, 
    config_transfer_fee_distributor: u64,
    config_transfer_fee_program: u64,
    authority_bump: u8,
    config_bump: u8,
    treasury_bump: u8,
) -> ProgramResult {
    // Get accounts.
    let authority = &mut ctx.accounts.authority;
    let config = &mut ctx.accounts.config;
    let treasury = &mut ctx.accounts.treasury;

    // Initialize authority account.
    authority.bump = authority_bump;

    // Initialize config account.
    config.transfer_fee_distributor = config_transfer_fee_distributor;
    config.transfer_fee_program = config_transfer_fee_program;
    config.bump = config_bump;

    // Initialize treasury account.
    treasury.bump = treasury_bump;

    return Ok(());
}
