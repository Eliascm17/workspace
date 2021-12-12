use anchor_lang::prelude::*;

pub const SEED_CONFIG: &[u8] = b"cfg";

#[account]
pub struct Config {
    // pub time_granularity: u64,
    pub transfer_fee_program: u64,
    pub transfer_fee_distributor: u64,
    pub bump: u8,
}
