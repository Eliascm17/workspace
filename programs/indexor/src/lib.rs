mod instructions;
pub mod state;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod indexor {
    use super::*;

    pub fn create_index(
        ctx: Context<CreateIndex>,
        namespace: String,
        is_serial: bool,
        bump: u8,
    ) -> ProgramResult {
        create_index::handler(ctx, namespace, is_serial, bump)
    }

    pub fn create_pointer(
        ctx: Context<CreatePointer>,
        name: String,
        value: Pubkey,
        pointer_bump: u8,
        proof_bump: u8,
    ) -> ProgramResult {
        create_pointer::handler(ctx, name, value, pointer_bump, proof_bump)
    }
}
