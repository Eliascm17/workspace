use anchor_lang::prelude::*;

pub const SEED_TASK: &[u8] = b"tsk";

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum TaskStatus {
    Pending,
    MarkedForRepitition,
}

#[account]
pub struct Task {
    pub id: String,
    pub payment: Pubkey,
    pub status: TaskStatus,
    pub bump: u8,
}
