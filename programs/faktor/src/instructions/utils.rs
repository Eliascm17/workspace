use anchor_lang::prelude::Pubkey;

use crate::state::Role;

pub const ONE_MINUTE: u64 = 60;

pub fn payment_index_namespace(party: Pubkey, role: Role) -> String {
    match role {
        Role::Creditor => format!("faktor.payments.creditor.{}", party.to_string()),
        Role::Debtor => format!("faktor.payments.debtor.{}", party.to_string()),
    }
}

pub fn task_index_namespace(process_at: u64) -> String {
    format!("faktor.tasks.{}", process_at)
}
