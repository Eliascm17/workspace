use anchor_lang::prelude::*;

use super::Role;

pub const SEED_NAMESPACE: &[u8] = b"ns";

#[account]
pub struct Namespace {
    pub party: Pubkey,
    pub role: Role,
    pub bump: u8,
}
