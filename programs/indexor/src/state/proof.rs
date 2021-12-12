use anchor_lang::prelude::*;

/// Root seed for deriving Proof account PDAs.
pub const SEED_PROOF: &[u8] = b"prf";

/// Proof accounts record the existance of a pointer value in an index.
#[account]
pub struct Proof {
    pub name: String,
    pub bump: u8,
}
