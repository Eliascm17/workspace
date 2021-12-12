use anchor_lang::prelude::*;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub enum Role {
    Creditor,
    Debtor,
}
