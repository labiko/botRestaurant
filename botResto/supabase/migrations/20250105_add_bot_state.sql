-- Add bot_state column to france_user_sessions
ALTER TABLE public.france_user_sessions 
ADD COLUMN IF NOT EXISTS bot_state TEXT DEFAULT 'INITIAL';

-- Update existing records
UPDATE public.france_user_sessions 
SET bot_state = 'INITIAL' 
WHERE bot_state IS NULL;
