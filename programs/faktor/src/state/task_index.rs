use anchor_lang::prelude::*;

pub const SEED_TASK_INDEX: &[u8] = b"tsk_idx";

#[account]
pub struct TaskIndex {
    pub count: u64,
    pub process_at: u64,
    pub bump: u8,
}
