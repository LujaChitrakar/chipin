use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Milestone {
  pub owner_multisig: Pubkey, // aggregate multisig pubkey
  pub creator: Pubkey,        // who created the vault
  pub group_id: [u8; 16],     // uuid 
  pub mint: Pubkey,           // USDC
  pub target_amount: u64,     // target amount of the milestone
  pub deposited_amount: u64,  // total deposited
  pub deadline: i64,          // unix timestamp
  // pub bump: u8,
}
