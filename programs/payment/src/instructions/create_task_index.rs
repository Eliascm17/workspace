use {
    super::utils::*,
    crate::{errors, state::*},
    anchor_lang::{prelude::*, solana_program::system_program},
    index_program::{
        cpi::{accounts::CreateIndex, create_index},
        program::IndexProgram,
        state::*,
    },
};

#[derive(Accounts)]
#[instruction(
    process_at: u64,
    bump: u8,
)]
pub struct CreateTaskIndex<'info> {
    #[account(mut, seeds = [SEED_AUTHORITY], bump = authority.bump)]
    pub authority: Account<'info, Authority>,

    pub clock: Sysvar<'info, Clock>,

    #[account(address = index_program::ID)]
    pub index_program: Program<'info, IndexProgram>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub task_index: Account<'info, Index>,
}

pub fn handler(ctx: Context<CreateTaskIndex>, process_at: u64, bump: u8) -> ProgramResult {
    // Get accounts.
    let authority = &ctx.accounts.authority;
    let clock = &ctx.accounts.clock;
    let index_program = &ctx.accounts.index_program;
    let system_program = &ctx.accounts.system_program;
    let task_index = &ctx.accounts.task_index;

    // Validate process_at is at the top of the minute.
    require!(
        process_at % ONE_MINUTE == 0,
        errors::ErrorCode::InvalidProcessAtIntraMinute
    );

    // Validate process_at is not in the past.
    require!(
        process_at > clock.unix_timestamp as u64,
        errors::ErrorCode::InvalidProcessAtPast
    );

    // Create an index to lookup tasks by process_at time.
    create_index(
        CpiContext::new_with_signer(
            index_program.to_account_info(),
            CreateIndex {
                index: task_index.to_account_info(),
                owner: authority.to_account_info(),
                system_program: system_program.to_account_info(),
            },
            &[&[SEED_AUTHORITY, &[authority.bump]]],
        ),
        task_index_namespace(process_at),
        true,
        bump,
    )
}
