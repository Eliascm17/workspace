use anchor_lang::prelude::*;

/// Root seed for deriving Index account PDAs.
pub const SEED_INDEX: &[u8] = b"idx";

/// Index accounts store an index's metadata.
#[account]
pub struct Index {
    pub owner: Pubkey,
    pub namespace: Pubkey,
    pub count: u128,
    pub is_serial: bool,
    pub bump: u8,
}
