use anchor_lang::prelude::*;

pub const SEED_TREASURY: &[u8] = b"trs";

#[account]
pub struct Treasury {
    pub bump: u8,
}
