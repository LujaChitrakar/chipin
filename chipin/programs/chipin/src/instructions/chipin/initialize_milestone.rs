use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::milestone::Milestone;

#[derive(Accounts)]
pub struct InitializeMilestone<'info>{
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init, 
        payer=payer, 
        space=8+Milestone::INIT_SPACE
    )]
    pub milestone: Account<'info, Milestone>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::authority=milestone,
        associated_token::mint=usdc_mint,
    )]
    pub milestone_vault: Account<'info, TokenAccount>,

    pub token_program:Program<'info,Token>,
    pub system_program: Program<'info, System>,

}