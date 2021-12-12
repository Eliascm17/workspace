use anchor_lang::prelude::*;

#[error]
pub enum ErrorCode {
    #[msg("Insufficient SOL to pay transfer fees.")]
    InsufficientBalance,
    #[msg("The timestamps must be chronological.")]
    InvalidChronology,
    #[msg("Task sets cannot be scheduled for processing intra-minute.")]
    InvalidProcessAtIntraMinute,
    #[msg("Task sets cannot be scheduled for processing in the past.")]
    InvalidProcessAtPast,
}
