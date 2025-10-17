BEGIN;

-- Ajouter le champ is_active pour la gestion soft delete
ALTER TABLE public.france_customer_addresses 
ADD COLUMN is_active boolean DEFAULT true;

-- Ajouter le champ whatsapp_name pour stocker le nom WhatsApp du client
ALTER TABLE public.france_customer_addresses 
ADD COLUMN whatsapp_name character varying;

-- Mettre toutes les adresses existantes comme actives
UPDATE public.france_customer_addresses 
SET is_active = true 
WHERE is_active IS NULL;

-- Créer un index pour optimiser les requêtes sur les adresses actives
CREATE INDEX IF NOT EXISTS idx_france_customer_addresses_active 
ON public.france_customer_addresses(phone_number, is_active) 
WHERE is_active = true;

-- Vérification des modifications
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'france_customer_addresses' 
    AND table_schema = 'public'
    AND column_name IN ('is_active', 'whatsapp_name')
ORDER BY column_name;

-- Vérifier le nombre d'adresses mises à jour
SELECT 
    COUNT(*) as total_addresses,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_addresses,
    COUNT(CASE WHEN whatsapp_name IS NOT NULL THEN 1 END) as addresses_with_whatsapp_name
FROM public.france_customer_addresses;

COMMIT;