use anchor_lang::prelude::*;

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum Role {
    Creditor,
    Debtor,
}
