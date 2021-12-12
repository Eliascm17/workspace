use {
    crate::{errors::*, state::*, utils::*},
    anchor_lang::{
        prelude::*,
        solana_program::{program::invoke, system_instruction, system_program},
    },
    anchor_spl::token::{approve, Approve, Mint, Token, TokenAccount},
    indexor::{
        cpi::{accounts::CreatePointer, create_pointer},
        program::Indexor,
        state::*,
    },
    std::mem::size_of,
};

#[derive(Accounts)]
#[instruction(
    id: String,
    memo: String,
    amount: u64,
    recurrence_interval: u64,
    start_at: u64,
    end_at: u64,
    creditor_payment_pointer_bump: u8,
    creditor_payment_proof_bump: u8,
    debtor_payment_pointer_bump: u8,
    debtor_payment_proof_bump: u8,
    payment_bump: u8,
    task_bump: u8,
    task_pointer_bump: u8,
    task_proof_bump: u8,
)]
pub struct CreatePayment<'info> {

    #[account(seeds = [SEED_AUTHORITY], bump = authority.bump)]
    pub authority: Account<'info, Authority>,

    pub clock: Sysvar<'info, Clock>,

    #[account(seeds = [SEED_CONFIG], bump = config.bump)]
    pub config: Box<Account<'info, Config>>,

    pub creditor: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            SEED_INDEX, 
            authority.key().as_ref(), 
            payment_index_namespace(creditor.key(), Role::Creditor).as_bytes(),
        ],
        bump = creditor_payment_index.bump,
        owner = indexor::ID,
    )]
    pub creditor_payment_index: Account<'info, Index>,

    #[account(
        mut,
        seeds = [
            SEED_POINTER, 
            creditor_payment_index.key().as_ref(), 
            creditor_payment_index.count.to_string().as_bytes()
        ],
        bump = creditor_payment_pointer_bump,
        owner = indexor::ID,
    )]
    pub creditor_payment_pointer: Account<'info, Pointer>,

    #[account(
        mut,
        seeds = [
            SEED_PROOF, 
            creditor_payment_index.key().as_ref(), 
            payment.key().as_ref(),
        ],
        bump = creditor_payment_proof_bump,
        owner = indexor::ID,
    )]
    pub creditor_payment_proof: Account<'info, Proof>,

    #[account(
        constraint = creditor_tokens.owner == creditor.key(),
        constraint = creditor_tokens.mint == mint.key()
    )]
    pub creditor_tokens: Account<'info, TokenAccount>,

    #[account(mut)]
    pub debtor: Signer<'info>,

    #[account(
        mut,
        seeds = [
            SEED_INDEX, 
            authority.key().as_ref(), 
            payment_index_namespace(debtor.key(), Role::Debtor).as_bytes(),
        ],
        bump = debtor_payment_index.bump,
        owner = indexor::ID,
    )]
    pub debtor_payment_index: Account<'info, Index>,

    #[account(
        mut,
        seeds = [
            SEED_POINTER, 
            debtor_payment_index.key().as_ref(), 
            debtor_payment_index.count.to_string().as_bytes()
        ],
        bump = debtor_payment_pointer_bump,
        owner = indexor::ID,
    )]
    pub debtor_payment_pointer: Account<'info, Pointer>,

    #[account(
        mut,
        seeds = [
            SEED_PROOF, 
            debtor_payment_index.key().as_ref(), 
            payment.key().as_ref(),
        ],
        bump = debtor_payment_proof_bump,
        owner = indexor::ID,
    )]
    pub debtor_payment_proof: Account<'info, Proof>,

    #[account(
        mut,
        constraint = debtor_tokens.owner == debtor.key(),
        constraint = debtor_tokens.mint == mint.key()
    )]
    pub debtor_tokens: Account<'info, TokenAccount>,

    #[account(address = indexor::ID)]
    pub indexor_program: Program<'info, Indexor>,

    #[account()]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        seeds = [
            SEED_PAYMENT,
            debtor.key().as_ref(),
            debtor_payment_index.count.to_string().as_bytes(),
        ], 
        bump = payment_bump,
        payer = debtor,
        space = 8 + size_of::<Payment>(),
    )]
    pub payment: Box<Account<'info, Payment>>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    #[account(
        init,
        seeds = [
            SEED_TASK, 
            // task_index.key().as_ref(), 
            // task_index.count.to_string().as_bytes()
        ],
        bump = task_bump,
        payer = debtor,
        space = 8 + size_of::<Task>()
    )]
    pub task: Account<'info, Task>,

    #[account(
        mut,
        seeds = [
            SEED_INDEX, 
            authority.key().as_ref(), 
            task_index_namespace(start_at).as_bytes(),
        ],
        bump = task_index.bump,
        owner = indexor::ID,
    )]
    pub task_index: Account<'info, Index>,

    #[account(
        mut,
        seeds = [
            SEED_POINTER, 
            task_index.key().as_ref(), 
            task_index.count.to_string().as_bytes(),
        ],
        bump = task_pointer_bump,
        owner = indexor::ID,
    )]
    pub task_pointer: Account<'info, Pointer>,

    #[account(
        mut,
        seeds = [
            SEED_PROOF, 
            task_index.key().as_ref(), 
            task.key().as_ref(),
        ],
        bump = task_proof_bump,
        owner = indexor::ID,
    )]
    pub task_proof: Account<'info, Proof>,

    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<CreatePayment>,
    memo: String,
    amount: u64,
    recurrence_interval: u64,
    start_at: u64,
    end_at: u64,
    creditor_payment_pointer_bump: u8,
    creditor_payment_proof_bump: u8,
    debtor_payment_pointer_bump: u8,
    debtor_payment_proof_bump: u8,
    payment_bump: u8,
    task_bump: u8,
    task_pointer_bump: u8,
    task_proof_bump: u8,
) -> ProgramResult {
    // Get accounts.
    let authority = &ctx.accounts.authority;
    let config = &ctx.accounts.config;
    let creditor = &ctx.accounts.creditor;
    let creditor_tokens = &ctx.accounts.creditor_tokens;
    let creditor_payment_index = &mut ctx.accounts.creditor_payment_index;
    let creditor_payment_pointer = &ctx.accounts.creditor_payment_pointer;
    let creditor_payment_proof = &ctx.accounts.creditor_payment_proof;
    let debtor = &mut ctx.accounts.debtor;
    let debtor_payment_index = &mut ctx.accounts.debtor_payment_index;
    let debtor_payment_pointer = &ctx.accounts.debtor_payment_pointer;
    let debtor_payment_proof = &ctx.accounts.debtor_payment_proof;
    let debtor_tokens = &mut ctx.accounts.debtor_tokens;
    let indexor_program = &ctx.accounts.indexor_program;
    let mint = &ctx.accounts.mint;
    let payment = &mut ctx.accounts.payment;
    let system_program = &ctx.accounts.system_program;
    let task = &mut ctx.accounts.task;
    let task_index = &mut ctx.accounts.task_index;
    let task_pointer = &mut ctx.accounts.task_pointer;
    let task_proof = &mut ctx.accounts.task_proof;
    let token_program = &ctx.accounts.token_program;

    // Validate payment chronology.
    match recurrence_interval {
        0 => require!(start_at == end_at, ErrorCode::InvalidChronology), // One-time payment
        _ => require!(start_at <= end_at, ErrorCode::InvalidChronology)  // Recurring payment
    }

    // TODO validate the recurrence interval is in units of minutes
    // TODO validate the recurrence interval falls within the alloted time window

    // Calculate expected number of transfers.
    let num_transfers = match recurrence_interval {
        0 => 1,                                         // One-time payment
        _ => (end_at - start_at) / recurrence_interval, // Recurring payment 
    };

    // Calculate the transfer fee. 
    let transfer_fee = num_transfers * (
            config.transfer_fee_distributor + 
            config.transfer_fee_program
        );

    // Validate debtor has sufficient lamports to cover transfer fee.
    require!(
        debtor.to_account_info().lamports() >= transfer_fee,
        ErrorCode::InsufficientBalance
    );

    // Save payment data.
    payment.id = debtor_payment_index.count.to_string(); 
    payment.memo = memo;
    payment.debtor = debtor.key();
    payment.debtor_tokens = debtor_tokens.key();
    payment.creditor = creditor.key();
    payment.creditor_tokens = creditor_tokens.key();
    payment.mint = mint.key();
    payment.amount = amount;
    payment.recurrence_interval = recurrence_interval;
    payment.start_at = start_at;
    payment.end_at = end_at;
    payment.bump = payment_bump;

    // Save task data.
    task.id = task_index.count.to_string(); 
    task.payment = payment.key();
    task.status = TaskStatus::Pending;
    task.bump = task_bump;

    // Authorize payment account to transfer debtor's tokens.
    approve(
        CpiContext::new(
            token_program.to_account_info(),
            Approve {
                authority: debtor.to_account_info(),
                delegate: payment.to_account_info(),
                to: debtor_tokens.to_account_info(),
            },
        ),
        num_transfers * amount,
    )?;

    // Collect transfer fee from debtor. Hold funds in payment account.
    invoke(
        &system_instruction::transfer(
            &debtor.key(), 
            &payment.key(), 
            transfer_fee
        ),
        &[
            debtor.to_account_info().clone(),
            payment.to_account_info().clone(),
            system_program.to_account_info().clone(),
        ],
    )?;

    // Create pointer to payment in creditor's payment index.
    create_pointer(
        CpiContext::new_with_signer(
            indexor_program.to_account_info(), 
            CreatePointer {
                index: creditor_payment_index.to_account_info(),
                pointer: creditor_payment_pointer.to_account_info(),
                proof: creditor_payment_proof.to_account_info(),
                owner: authority.to_account_info(),
                system_program: system_program.to_account_info(),
            },
            &[&[SEED_AUTHORITY, &[authority.bump]]]
        ), 
        creditor_payment_index.count.to_string(), 
        payment.key(), 
        creditor_payment_pointer_bump, 
        creditor_payment_proof_bump
    )?;

    // Create pointer to payment in debtor's payment index.
    create_pointer(
        CpiContext::new_with_signer(
            indexor_program.to_account_info(), 
            CreatePointer {
                index: debtor_payment_index.to_account_info(),
                pointer: debtor_payment_pointer.to_account_info(),
                proof: debtor_payment_proof.to_account_info(),
                owner: authority.to_account_info(),
                system_program: system_program.to_account_info(),
            },
            &[&[SEED_AUTHORITY, &[authority.bump]]]
        ), 
        debtor_payment_index.count.to_string(), 
        payment.key(), 
        debtor_payment_pointer_bump, 
        debtor_payment_proof_bump
    )?;

    // Create pointer to task in time-bound task index.
    create_pointer(
        CpiContext::new_with_signer(
            indexor_program.to_account_info(), 
            CreatePointer {
                index: task_index.to_account_info(),
                pointer: task_pointer.to_account_info(),
                proof: task_proof.to_account_info(),
                owner: authority.to_account_info(),
                system_program: system_program.to_account_info(),
            },
            &[&[SEED_AUTHORITY, &[authority.bump]]]
        ), 
        task_index.count.to_string(), 
        task.key(), 
        task_pointer_bump, 
        task_proof_bump
    )?;

    return Ok(());
}
