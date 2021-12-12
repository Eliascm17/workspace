pub mod errors;
mod instructions;
pub mod state;

use {anchor_lang::prelude::*, instructions::*, state::*};

declare_id!("3uvTgoiGSBz6ntktxo3gwTJY3wDfG73LGNc21AHYiJg2");

#[program]
pub mod payment_program {
    use super::*;
    pub fn initialize_program(
        ctx: Context<InitializeProgram>,
        config_transfer_fee_distributor: u64,
        config_transfer_fee_program: u64,
        authority_bump: u8,
        config_bump: u8,
        treasury_bump: u8,
    ) -> ProgramResult {
        initialize_program::handler(
            ctx,
            config_transfer_fee_distributor,
            config_transfer_fee_program,
            authority_bump,
            config_bump,
            treasury_bump,
        )
    }

    pub fn create_payment(
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
        create_payment::handler(
            ctx,
            memo,
            amount,
            recurrence_interval,
            start_at,
            end_at,
            creditor_payment_pointer_bump,
            creditor_payment_proof_bump,
            debtor_payment_pointer_bump,
            debtor_payment_proof_bump,
            payment_bump,
            task_bump,
            task_pointer_bump,
            task_proof_bump,
        )
    }

    pub fn create_task_index(
        ctx: Context<CreateTaskIndex>,
        process_at: u64,
        bump: u8,
    ) -> ProgramResult {
        create_task_index::handler(ctx, process_at, bump)
    }

    pub fn create_payment_index(
        ctx: Context<CreatePaymentIndex>,
        party: Pubkey,
        role: Role,
        bump: u8,
    ) -> ProgramResult {
        create_payment_index::handler(ctx, party, role, bump)
    }

    pub fn process_task(ctx: Context<ProcessTask>) -> ProgramResult {
        process_task::handler(ctx)
    }
}
