use anchor_lang::prelude::*;

declare_id!("25v9ZPEcAnQGM5YxvFFhhzkzZDVobrAPcHtBHLeP1pvC");

#[program]
pub mod split {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
