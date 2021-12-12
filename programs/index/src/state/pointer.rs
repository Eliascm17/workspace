use anchor_lang::prelude::*;

/// Root seed for deriving Pointer account PDAs.
pub const SEED_POINTER: &[u8] = b"ptr";

/// Pointer accounts store a named public address in an index.
#[account]
pub struct Pointer {
    pub name: String,
    pub value: Pubkey,
    pub bump: u8,
}
