import { createClient } from '@supabase/supabase-js'

// Client DEV (par défaut)
export const supabaseDev = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Client PROD (pour gestion des icônes)
export const supabaseProd = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_PROD!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Client pour les icônes (toujours PROD)
export const supabaseIcons = supabaseProd

export default supabaseDev