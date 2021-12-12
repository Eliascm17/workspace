use {
    crate::state,
    anchor_lang::{prelude::*, solana_program::system_program},
    anchor_spl::token::{transfer, Token, TokenAccount, Transfer},
    index_program::state::*,
};

#[derive(Accounts)]
pub struct ProcessTask<'info> {
    pub clock: Sysvar<'info, Clock>,

    #[account(seeds = [state::SEED_CONFIG], bump = config.bump)]
    pub config: Account<'info, state::Config>,

    pub creditor: AccountInfo<'info>,

    #[account(
        mut,
        constraint = creditor_tokens.owner == payment.creditor,
        constraint = creditor_tokens.mint == payment.mint
    )]
    pub creditor_tokens: Account<'info, TokenAccount>,

    #[account(mut)]
    pub debtor: AccountInfo<'info>,

    #[account()]
    pub debtor_payment_index: Account<'info, Index>,

    #[account(
        mut,
        constraint = debtor_tokens.owner == payment.debtor,
        constraint = debtor_tokens.mint == payment.mint
    )]
    pub debtor_tokens: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            state::SEED_PAYMENT,
            debtor_payment_index.key().as_ref(),
            payment.id.to_string().as_bytes(),
        ],
        bump = payment.bump,
        has_one = debtor,
        has_one = debtor_tokens,
        has_one = creditor,
        has_one = creditor_tokens,
    )]
    pub payment: Box<Account<'info, state::Payment>>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    #[account(
        mut,
        seeds = [
            state::SEED_TASK,
            task_index.key().as_ref(),
            task.id.to_string().as_bytes()
        ],
        bump = task.bump,
        has_one = payment,
    )]
    pub task: Account<'info, state::Task>,

    #[account(
        seeds = [
            state::SEED_TASK_INDEX,
            task_index.process_at.to_string().as_bytes()
        ],
        bump = task_index.bump,
    )]
    pub task_index: Box<Account<'info, state::TaskIndex>>,

    #[account(mut, seeds = [state::SEED_TREASURY], bump = treasury.bump)]
    pub treasury: Account<'info, state::Treasury>,

    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ProcessTask>) -> ProgramResult {
    // Get accounts.
    let payment = &mut ctx.accounts.payment;
    let debtor_payment_index = &ctx.accounts.debtor_payment_index;
    let debtor_tokens = &ctx.accounts.debtor_tokens;
    let creditor_tokens = &ctx.accounts.creditor_tokens;
    let signer = &ctx.accounts.signer;
    let config = &ctx.accounts.config;
    let treasury = &ctx.accounts.treasury;
    let token_program = &ctx.accounts.token_program;

    // TODO If payment is ongoing, create a new task in future task set.
    // TODO mark task for replication if should repeat

    // Check if transfer is valid.
    let is_valid = debtor_tokens.delegate.is_some()
        && debtor_tokens.delegate.unwrap() == payment.key()
        && debtor_tokens.delegated_amount >= payment.amount
        && debtor_tokens.amount >= payment.amount;

    // Transfer tokens from debtor to creditor.
    if is_valid {
        transfer(
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                Transfer {
                    authority: payment.to_account_info(),
                    from: debtor_tokens.to_account_info(),
                    to: creditor_tokens.to_account_info(),
                },
                &[&[
                    state::SEED_PAYMENT,
                    debtor_payment_index.key().as_ref(),
                    payment.id.to_string().as_bytes(),
                    &[payment.bump],
                ]],
            ),
            payment.amount,
        )?;
    }

    // Pay transfer fee to distributor.
    **payment.to_account_info().try_borrow_mut_lamports()? -= config.transfer_fee_distributor;
    **signer.to_account_info().try_borrow_mut_lamports()? += config.transfer_fee_distributor;

    // Pay transfer fee to treasury.
    **payment.to_account_info().try_borrow_mut_lamports()? -= config.transfer_fee_program;
    **treasury.to_account_info().try_borrow_mut_lamports()? += config.transfer_fee_program;

    return Ok(());
}
