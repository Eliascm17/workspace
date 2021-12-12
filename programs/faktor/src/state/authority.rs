use anchor_lang::prelude::*;

pub const SEED_AUTHORITY: &[u8] = b"aut";

#[account]
pub struct Authority {
    pub bump: u8,
}
