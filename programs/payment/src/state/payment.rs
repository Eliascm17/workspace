use anchor_lang::prelude::*;

pub const SEED_PAYMENT: &[u8] = b"pay";

#[account]
pub struct Payment {
    pub id: String,
    pub memo: String,
    pub debtor: Pubkey,
    pub debtor_tokens: Pubkey,
    pub creditor: Pubkey,
    pub creditor_tokens: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub recurrence_interval: u64,
    pub start_at: u64,
    pub end_at: u64,
    pub bump: u8,
}
