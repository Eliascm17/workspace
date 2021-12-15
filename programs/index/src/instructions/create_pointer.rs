use {
    anchor_lang::{
        prelude::*,
        solana_program::system_program
    },
    crate::state,
    std::mem::size_of
};

#[derive(Accounts)]
#[instruction(
    name: String,
    value: Pubkey,
    item_bump: u8,
    proof_bump: u8,
)]
pub struct CreatePointer<'info> {
    #[account(
        mut, 
        seeds = [
            state::SEED_INDEX, 
            index.owner.key().as_ref(), 
            index.namespace.as_ref()
        ],
        bump = index.bump, 
        has_one = owner,
        constraint = match index.is_serial {
            true => name == index.count.to_string(), // The index's namespace is serial. Require the new name be equal to the index's current count.
            false => true                            // The index's namespace is freeform. Allow all new names. 
        },
    )]
    pub index: Account<'info, state::Index>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        seeds = [
            state::SEED_POINTER,
            index.key().as_ref(),
            name.as_bytes(),
        ],
        bump = item_bump,
        payer = payer,
        space = 8 + size_of::<state::Pointer>(),
    )]
    pub pointer: Account<'info, state::Pointer>,

    #[account(
        init,
        seeds = [
            state::SEED_PROOF,
            index.key().as_ref(),
            value.as_ref(),
        ],
        bump = proof_bump,
        payer = payer,
        space = 8 + size_of::<state::Proof>(),
    )]
    pub proof: Account<'info, state::Proof>,
    
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreatePointer>,
    name: String,
    value: Pubkey,
    pointer_bump: u8,
    proof_bump: u8,
) -> ProgramResult {
    // Get accounts.
    let index = &mut ctx.accounts.index;
    let pointer = &mut ctx.accounts.pointer;
    let proof = &mut ctx.accounts.proof;

    // Initialize pointer account.
    pointer.name = name.clone();
    pointer.value = value;
    pointer.bump = pointer_bump;

    // Initialize proof account.
    proof.name = pointer.name.clone(); 
    proof.bump = proof_bump;

    // Increment index counter.
    index.count += 1;
    
    return Ok(());
}
