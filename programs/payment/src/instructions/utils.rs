use anchor_lang::prelude::Pubkey;

use crate::state::Role;

pub const ONE_MINUTE: u64 = 60;

pub fn _payment_index_namespace(party: Pubkey, role: Role) -> String {
    match role {
        Role::Creditor => format!("cp_{}", party.to_string()),
        Role::Debtor => format!("dp_{}", party.to_string()),
    }
}

pub fn _task_index_namespace(process_at: u64) -> String {
    format!("faktor.tasks.{}", process_at)
}
