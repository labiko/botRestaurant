--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-09-18 23:38:09

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS postgres;
--
-- TOC entry 4580 (class 1262 OID 5)
-- Name: postgres; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = icu LOCALE = 'en_US.UTF-8' ICU_LOCALE = 'en-US';


\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4581 (class 0 OID 0)
-- Dependencies: 4580
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- TOC entry 4582 (class 0 OID 0)
-- Name: postgres; Type: DATABASE PROPERTIES; Schema: -; Owner: -
--

ALTER DATABASE postgres SET "app.settings.jwt_exp" TO '3600';
ALTER DATABASE postgres SET "TimeZone" TO 'Europe/Paris';


\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 138 (class 2615 OID 16494)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- TOC entry 12 (class 2615 OID 16386)
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- TOC entry 137 (class 2615 OID 52020)
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- TOC entry 6 (class 3079 OID 16689)
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- TOC entry 4583 (class 0 OID 0)
-- Dependencies: 6
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- TOC entry 2 (class 3079 OID 16389)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- TOC entry 4584 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 4 (class 3079 OID 16443)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- TOC entry 4585 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 5 (class 3079 OID 16654)
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- TOC entry 4586 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- TOC entry 3 (class 3079 OID 16432)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- TOC entry 4587 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1262 (class 1247 OID 16782)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- TOC entry 1286 (class 1247 OID 16923)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- TOC entry 1259 (class 1247 OID 16776)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- TOC entry 1256 (class 1247 OID 16771)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- TOC entry 1392 (class 1247 OID 19239)
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- TOC entry 1292 (class 1247 OID 16965)
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- TOC entry 1356 (class 1247 OID 17308)
-- Name: product_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_type_enum AS ENUM (
    'simple',
    'modular',
    'variant',
    'composite'
);


--
-- TOC entry 511 (class 1255 OID 16540)
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- TOC entry 4588 (class 0 OID 0)
-- Dependencies: 511
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 532 (class 1255 OID 16753)
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- TOC entry 465 (class 1255 OID 16539)
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- TOC entry 4589 (class 0 OID 0)
-- Dependencies: 465
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 488 (class 1255 OID 16538)
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- TOC entry 4590 (class 0 OID 0)
-- Dependencies: 488
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 513 (class 1255 OID 16387)
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- TOC entry 565 (class 1255 OID 58066)
-- Name: accept_order_atomic(character varying, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.accept_order_atomic(p_token character varying, p_order_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
  DECLARE
    v_driver_id INTEGER;
  BEGIN
    -- 0. Récupérer le driver_id depuis le token
    SELECT driver_id INTO v_driver_id
    FROM delivery_tokens
    WHERE token = p_token
      AND order_id = p_order_id
      AND used = FALSE
      AND suspended = FALSE
      AND expires_at > NOW();

    IF v_driver_id IS NULL THEN
      RAISE EXCEPTION 'Token invalide, expiré ou déjà utilisé';
    END IF;

    -- 1. Vérifier que la commande est encore disponible
    IF NOT EXISTS (
      SELECT 1 FROM france_orders
      WHERE id = p_order_id AND status = 'prete' AND driver_id IS NULL
    ) THEN
      RAISE EXCEPTION 'Commande déjà prise ou non disponible';
    END IF;

    -- 2. Prolonger le token à +3H
    UPDATE delivery_tokens
    SET
      used = TRUE,
      expires_at = NOW() + INTERVAL '3 hours',
      updated_at = NOW()
    WHERE token = p_token AND order_id = p_order_id;

    -- 3. Mettre à jour la commande
    UPDATE france_orders
    SET
      status = 'assignee',
      driver_id = v_driver_id,  -- Utilise le driver_id du token
      driver_assignment_status = 'assigned',
      assignment_started_at = NOW(),
      updated_at = NOW()
    WHERE id = p_order_id;

    -- 4. Suspendre tous les autres tokens
    UPDATE delivery_tokens
    SET suspended = TRUE, updated_at = NOW()
    WHERE order_id = p_order_id AND driver_id != v_driver_id AND used = FALSE;

    -- 5. Logger l'acceptation
    INSERT INTO delivery_driver_actions (
      order_id, driver_id, token_id, action_type, details
    ) VALUES (
      p_order_id,
      v_driver_id,  -- Utilise le driver_id du token
      (SELECT id FROM delivery_tokens WHERE token = p_token),
      'accepted',
      jsonb_build_object('token', p_token, 'timestamp', NOW())
    );

    RETURN TRUE;
  END;
  $$;


--
-- TOC entry 543 (class 1255 OID 67285)
-- Name: apply_composite_config(text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.apply_composite_config(category_name text, include_drinks boolean DEFAULT true) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    updated_count INTEGER;
    category_ids INTEGER[];
    current_product_id INTEGER;
    existing_drinks INTEGER;
    deleted_sizes INTEGER;
BEGIN
    -- Récupérer les IDs des catégories matching
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%';
    
    -- NOUVEAU: Supprimer les tailles existantes pour éviter les conflits
    DELETE FROM france_product_sizes 
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    
    GET DIAGNOSTICS deleted_sizes = ROW_COUNT;
    
    -- NOUVEAU: Supprimer les variantes existantes pour éviter les conflits  
    DELETE FROM france_product_variants
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    
    -- S'assurer que les options de boisson existent si nécessaire
    IF include_drinks THEN
        -- PLUS SÛR: Mettre à jour uniquement les produits de cette catégorie
        -- D'abord supprimer SEULEMENT pour les produits de la catégorie concernée
        DELETE FROM france_product_options
        WHERE product_id IN (
            SELECT p.id 
            FROM france_products p
            WHERE p.category_id = ANY(category_ids)
        )
        AND option_group = 'Boisson 33CL incluse';
        
        -- Recréer pour cette catégorie uniquement avec récupération automatique
        FOR current_product_id IN 
            SELECT p.id FROM france_products p 
            WHERE p.category_id = ANY(category_ids)
        LOOP
                -- Insérer les options de boisson récupérées automatiquement
                INSERT INTO france_product_options (
                    product_id, option_group, option_name, 
                    price_modifier, is_required, max_selections, display_order
                )
                SELECT 
                    current_product_id,
                    'Boisson 33CL incluse',
                    -- Format: numéro + icône + nom de boisson
                    CASE 
                        WHEN ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) <= 9 THEN
                            ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) || '️⃣ ' 
                        WHEN ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) = 10 THEN
                            '🔟 ' 
                        WHEN ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) = 11 THEN
                            '1️⃣1️⃣ '
                        WHEN ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) = 12 THEN
                            '1️⃣2️⃣ '
                        ELSE ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name) || '️⃣ '
                    END || 
                    -- Icône automatique
                    CASE 
                        WHEN dp.name ILIKE '%7 UP%' AND dp.name NOT ILIKE '%CHERRY%' AND dp.name NOT ILIKE '%TROPICAL%' THEN '🥤'
                        WHEN dp.name ILIKE '%CHERRY%' THEN '🍒'
                        WHEN dp.name ILIKE '%7UP TROPICAL%' THEN '🌴'
                        WHEN dp.name ILIKE '%COCA%' AND dp.name NOT ILIKE '%ZERO%' THEN '🥤'
                        WHEN dp.name ILIKE '%ZERO%' THEN '⚫'
                        WHEN dp.name ILIKE '%EAU%' THEN '💧'
                        WHEN dp.name ILIKE '%ICE TEA%' THEN '🧊'
                        WHEN dp.name ILIKE '%MIRANDA FRAISE%' THEN '🍓'
                        WHEN dp.name ILIKE '%MIRANDA TROPICAL%' THEN '🏝️'
                        WHEN dp.name ILIKE '%OASIS%' THEN '🌺'
                        WHEN dp.name ILIKE '%PERRIER%' THEN '💎'
                        WHEN dp.name ILIKE '%TROPICO%' THEN '🍊'
                        ELSE '🥤'
                    END || ' ' || dp.name,
                    0,
                    true,
                    1,
                    ROW_NUMBER() OVER (ORDER BY dp.display_order, dp.name)
                FROM (
                    -- Récupération automatique des boissons 33CL
                    SELECT DISTINCT p.name, p.display_order
                    FROM france_products p
                    JOIN france_menu_categories c ON p.category_id = c.id
                    JOIN france_product_variants pv ON pv.product_id = p.id
                    WHERE c.name = 'DRINKS'
                    AND c.restaurant_id = 1
                    AND (pv.variant_name = '33CL' OR (pv.quantity = 33 AND pv.unit = 'cl'))
                    AND p.is_active = true
                    AND pv.is_active = true
                ) dp;
            END LOOP;
    END IF;
    
    -- Mettre à jour les produits de la catégorie
    UPDATE france_products 
    SET 
        product_type = 'composite',
        workflow_type = 'composite_workflow',
        requires_steps = true,
        steps_config = CASE 
            WHEN include_drinks THEN
                json_build_object(
                    'steps', json_build_array(
                        json_build_object(
                            'type', 'options_selection',
                            'required', true,
                            'prompt', 'Choisissez votre boisson 33CL incluse',
                            'option_groups', json_build_array('Boisson 33CL incluse'),
                            'max_selections', 1
                        )
                    )
                )::json
            ELSE
                json_build_object('steps', json_build_array())::json
        END
    WHERE category_id = ANY(category_ids);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN 'SUCCESS: ' || updated_count || ' produits de la catégorie ' || category_name || ' configurés en composite' || 
           CASE WHEN include_drinks THEN ' avec boissons' ELSE '' END ||
           CASE WHEN deleted_sizes > 0 THEN '. ' || deleted_sizes || ' tailles supprimées' ELSE '' END;
END;
$$;


--
-- TOC entry 496 (class 1255 OID 67287)
-- Name: apply_simple_config(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.apply_simple_config(category_name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    updated_count INTEGER;
    category_ids INTEGER[];
    deleted_options INTEGER;
    deleted_sizes INTEGER;
BEGIN
    SELECT ARRAY_AGG(id) INTO category_ids
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%';
    
    -- NOUVEAU: Nettoyer toutes les options existantes
    DELETE FROM france_product_options
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    GET DIAGNOSTICS deleted_options = ROW_COUNT;
    
    -- NOUVEAU: Nettoyer toutes les tailles existantes
    DELETE FROM france_product_sizes
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    GET DIAGNOSTICS deleted_sizes = ROW_COUNT;
    
    -- Nettoyer les variantes
    DELETE FROM france_product_variants
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        WHERE p.category_id = ANY(category_ids)
    );
    
    UPDATE france_products 
    SET 
        product_type = 'simple',
        workflow_type = NULL,
        requires_steps = false,
        steps_config = NULL
    WHERE category_id = ANY(category_ids);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN 'SUCCESS: ' || updated_count || ' produits de la catégorie ' || category_name || ' configurés en simple. Nettoyé: ' ||
           deleted_options || ' options, ' || deleted_sizes || ' tailles';
END;
$$;


--
-- TOC entry 475 (class 1255 OID 71716)
-- Name: auto_add_drink_to_workflows_production(integer, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_add_drink_to_workflows_production(drink_product_id integer, drink_name text, variant_size text) RETURNS TABLE(status text, details text)
    LANGUAGE plpgsql
    AS $$
  DECLARE
      clean_name TEXT;
      emoji TEXT;
      workflow_product RECORD;
      next_order INTEGER;
      option_group_name TEXT;
      added_count INTEGER := 0;
      target_restaurant_id INTEGER;
  BEGIN
      SELECT p.restaurant_id INTO target_restaurant_id
      FROM france_products p WHERE p.id = drink_product_id;

      IF target_restaurant_id IS NULL THEN
          RETURN QUERY SELECT 'ERREUR'::TEXT, 'Produit boisson introuvable'::TEXT;
          RETURN;
      END IF;

      clean_name := TRIM(REPLACE(drink_name, '(Copie)', ''));

      emoji := CASE
          WHEN clean_name ILIKE '%MIRANDA TROPICAL%' THEN '🏝️'
          WHEN clean_name ILIKE '%MIRANDA FRAISE%' THEN '🍓'
          WHEN clean_name ILIKE '%7UP%' AND NOT clean_name ILIKE '%CHERRY%' AND NOT clean_name ILIKE '%TROPICAL%' THEN '🥤'
          WHEN clean_name ILIKE '%7UP CHERRY%' THEN '🍒'
          WHEN clean_name ILIKE '%7UP TROPICAL%' THEN '🌴'
          WHEN clean_name ILIKE '%COCA COLA%' AND NOT clean_name ILIKE '%ZERO%' THEN '🥤'
          WHEN clean_name ILIKE '%COCA ZERO%' THEN '⚫'
          WHEN clean_name ILIKE '%SPRITE%' THEN '🥤'
          WHEN clean_name ILIKE '%FANTA%' THEN '🍊'
          WHEN clean_name ILIKE '%OASIS%' THEN '🌺'
          WHEN clean_name ILIKE '%PERRIER%' THEN '💎'
          WHEN clean_name ILIKE '%EAU%' THEN '💧'
          WHEN clean_name ILIKE '%ICE TEA%' THEN '🧊'
          WHEN clean_name ILIKE '%TROPICO%' THEN '🍊'
          ELSE '🥤'
      END;

      option_group_name := CASE
          WHEN variant_size = '33CL' THEN 'Boisson 33CL incluse'
          WHEN variant_size = '1L5' THEN 'Boisson 1.5L incluse'
          ELSE 'Boisson 33CL incluse'
      END;

      -- Calculer display_order global
      SELECT COALESCE(MAX(po.display_order), 0) + 1 INTO next_order
      FROM france_product_options po
      JOIN france_products p ON p.id = po.product_id
      WHERE po.option_group = option_group_name
      AND p.restaurant_id = target_restaurant_id;

      FOR workflow_product IN
          SELECT DISTINCT ON (c.id)
              p.id as product_id,
              p.name as product_name,
              c.name as category_name,
              c.id as category_id
          FROM france_products p
          JOIN france_menu_categories c ON c.id = p.category_id
          WHERE c.is_active = true
          AND p.restaurant_id = target_restaurant_id
          AND EXISTS (
              SELECT 1
              FROM france_products p2
              JOIN france_product_options po ON po.product_id = p2.id
              WHERE p2.category_id = c.id
              AND p2.restaurant_id = target_restaurant_id
              AND po.option_group = option_group_name
              AND po.is_active = true
          )
          ORDER BY c.id, p.id
      LOOP
          IF NOT EXISTS (
              SELECT 1 FROM france_product_options
              WHERE product_id = workflow_product.product_id
              AND option_group = option_group_name
              AND option_name LIKE '%' || clean_name || '%'
          ) THEN
              -- 🔧 CORRECTION: Format avec numérotation intégrée
              INSERT INTO france_product_options (
                  product_id, option_group, option_name,
                  price_modifier, display_order, is_active
              ) VALUES (
                  workflow_product.product_id,
                  option_group_name,
                  next_order || '️⃣ ' || emoji || ' ' || clean_name,  -- Format standard
                  0.00,
                  next_order,
                  true
              );

              added_count := added_count + 1;

              RETURN QUERY
              SELECT 'AJOUTE'::TEXT,
                     format('Restaurant %s: %s️⃣ %s %s ajoutee a %s', target_restaurant_id, next_order, emoji, clean_name, workflow_product.category_name)::TEXT;
          ELSE
              RETURN QUERY
              SELECT 'EXISTE_DEJA'::TEXT,
                     format('Restaurant %s: Boisson %s existe deja dans %s', target_restaurant_id, clean_name, workflow_product.category_name)::TEXT;
          END IF;
      END LOOP;

      IF added_count = 0 THEN
          RETURN QUERY SELECT 'AUCUNE_CATEGORIE'::TEXT,
                             format('Restaurant %s: Aucune categorie compatible', target_restaurant_id)::TEXT;
      END IF;
  END;
  $$;


--
-- TOC entry 502 (class 1255 OID 71594)
-- Name: auto_add_drink_to_workflows_v2(integer, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_add_drink_to_workflows_v2(drink_product_id integer, drink_name text, variant_size text) RETURNS TABLE(status text, details text)
    LANGUAGE plpgsql
    AS $$
  DECLARE
      clean_name TEXT;
      emoji TEXT;
      workflow_product RECORD;
      next_order INTEGER;
      option_group_name TEXT;
      added_count INTEGER := 0;
  BEGIN
      clean_name := TRIM(REPLACE(REPLACE(drink_name, '(Copie)', ''), 'v2', ''));
      emoji := '🥤';

      option_group_name := CASE
          WHEN variant_size = '33CL' THEN 'boisson_test'
          WHEN variant_size = '1L5' THEN 'boisson_1l5_test'
          ELSE 'boisson_test'
      END;

      FOR workflow_product IN
          SELECT DISTINCT ON (c.id)
              p.id as product_id,
              p.name as product_name,
              c.name as category_name,
              c.id as category_id
          FROM france_products p
          JOIN france_menu_categories c ON c.id = p.category_id
          WHERE c.slug = 'test-automation'
          AND p.workflow_type IS NOT NULL
          AND p.requires_steps = true
      LOOP
          IF NOT EXISTS (
              SELECT 1 FROM france_product_options
              WHERE product_id = workflow_product.product_id
              AND option_group = option_group_name
              AND option_name LIKE '%' || clean_name || '%'
          ) THEN
              SELECT COALESCE(MAX(display_order), 0) + 1 INTO next_order
              FROM france_product_options
              WHERE product_id = workflow_product.product_id
              AND option_group = option_group_name;

              INSERT INTO france_product_options (
                  product_id, option_group, option_name,
                  price_modifier, display_order, is_active
              ) VALUES (
                  workflow_product.product_id,
                  option_group_name,
                  next_order || '️⃣ ' || emoji || ' ' || clean_name,
                  0.00,
                  next_order,
                  true
              );

              added_count := added_count + 1;

              RETURN QUERY
              SELECT 'AJOUTE'::TEXT,
                     format('Boisson %s ajoutee a %s', clean_name, workflow_product.category_name)::TEXT;
          ELSE
              RETURN QUERY
              SELECT 'IGNORE'::TEXT,
                     format('Boisson %s existe deja dans %s', clean_name, workflow_product.category_name)::TEXT;
          END IF;
      END LOOP;

      IF added_count = 0 THEN
          RETURN QUERY SELECT 'AUCUN'::TEXT, 'Aucune categorie test trouvee'::TEXT;
      END IF;
  END;
  $$;


--
-- TOC entry 527 (class 1255 OID 21641)
-- Name: calculate_distance_km(numeric, numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_distance_km(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric) RETURNS numeric
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    R DECIMAL := 6371; -- Rayon de la Terre en km
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    
    a := sin(dLat/2) * sin(dLat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dLon/2) * sin(dLon/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN R * c;
END;
$$;


--
-- TOC entry 501 (class 1255 OID 21642)
-- Name: cleanup_expired_assignments(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_assignments() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE france_delivery_assignments 
    SET assignment_status = 'expired'
    WHERE assignment_status = 'pending' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$;


--
-- TOC entry 599 (class 1255 OID 25804)
-- Name: cleanup_expired_tokens(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_tokens() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM delivery_tokens
  WHERE absolute_expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Logger le nettoyage
  INSERT INTO delivery_order_logs (
    order_id, action_type, details, created_at
  ) VALUES (
    NULL, 'TOKEN_CLEANUP', 
    'Cleaned ' || deleted_count || ' expired tokens',
    NOW()
  );
  
  RETURN deleted_count;
END;
$$;


--
-- TOC entry 536 (class 1255 OID 66832)
-- Name: configure_category_workflow(text, text, boolean, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.configure_category_workflow(category_name text, config_type text DEFAULT 'composite'::text, include_drinks boolean DEFAULT true, force_execution boolean DEFAULT false) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    result_message TEXT;
    category_count INTEGER;
    category_slug TEXT;
BEGIN
    -- Vérifier que la catégorie existe et récupérer le slug
    SELECT COUNT(*), MIN(slug) INTO category_count, category_slug
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%';
    
    IF category_count = 0 THEN
        RETURN 'ERREUR: Catégorie ' || category_name || ' non trouvée';
    END IF;
    
    -- PROTECTION: Vérifier si la catégorie a déjà des composite_items existants
    -- SAUF si force_execution = true
    IF config_type = 'composite' AND force_execution = false THEN
        DECLARE
            existing_composite_items INTEGER;
        BEGIN
            SELECT COUNT(*) INTO existing_composite_items
            FROM france_composite_items fci
            JOIN france_products p ON p.id = fci.composite_product_id
            JOIN france_menu_categories c ON c.id = p.category_id
            WHERE c.slug = category_slug;
            
            -- Si aucun composite_item existant, avertir mais permettre force
            IF existing_composite_items = 0 THEN
                RETURN 'PROTECTION: La catégorie ' || category_name || ' n''a pas de composite_items existants. ' ||
                       'Un workflow composite sans composants causera des erreurs. ' ||
                       'Utilisez force_execution=true pour forcer ou config_type=''simple'' pour nettoyer.';
            END IF;
        END;
    END IF;
    
    -- Appliquer la configuration selon le type
    IF config_type = 'composite' THEN
        SELECT apply_composite_config(category_name, include_drinks) INTO result_message;
    ELSIF config_type = 'simple' THEN
        SELECT apply_simple_config(category_name) INTO result_message;
    ELSE
        RETURN 'ERREUR: Type de configuration non supporté: ' || config_type;
    END IF;
    
    RETURN result_message;
END;
$$;


--
-- TOC entry 573 (class 1255 OID 67284)
-- Name: configure_category_workflow(text, text, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.configure_category_workflow(category_name text, config_type text DEFAULT 'composite'::text, source_category text DEFAULT NULL::text, force_execution boolean DEFAULT false) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    result_message TEXT;
    category_count INTEGER;
    category_slug TEXT;
BEGIN
    -- Vérifier que la catégorie existe et récupérer le slug
    SELECT COUNT(*), MIN(slug) INTO category_count, category_slug
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%';
    
    IF category_count = 0 THEN
        RETURN 'ERREUR: Catégorie ' || category_name || ' non trouvée';
    END IF;
    
    -- PROTECTION: Vérifier si la catégorie a déjà des composite_items existants
    -- SAUF si force_execution = true
    IF config_type = 'composite' AND force_execution = false THEN
        DECLARE
            existing_composite_items INTEGER;
        BEGIN
            SELECT COUNT(*) INTO existing_composite_items
            FROM france_composite_items fci
            JOIN france_products p ON p.id = fci.composite_product_id
            JOIN france_menu_categories c ON c.id = p.category_id
            WHERE c.slug = category_slug;
            
            -- Si aucun composite_item existant, avertir mais permettre force
            IF existing_composite_items = 0 THEN
                RETURN 'PROTECTION: La catégorie ' || category_name || ' n''a pas de composite_items existants. ' ||
                       'Un workflow composite sans composants causera des erreurs. ' ||
                       'Utilisez force_execution=true pour forcer ou ''copy_from'' pour copier une config.';
            END IF;
        END;
    END IF;
    
    -- Appliquer la configuration selon le type
    IF config_type = 'composite' THEN
        SELECT apply_composite_config(category_name, true) INTO result_message;
    ELSIF config_type = 'simple' THEN
        SELECT apply_simple_config(category_name) INTO result_message;
    ELSIF config_type = 'copy_from' THEN
        IF source_category IS NULL THEN
            RETURN 'ERREUR: source_category obligatoire pour copy_from. Usage: configure_category_workflow(''SANDWICHS'', ''copy_from'', ''GOURMETS'')';
        END IF;
        SELECT copy_working_config(source_category, category_name) INTO result_message;
    ELSE
        RETURN 'ERREUR: Types supportés: composite, simple, copy_from';
    END IF;
    
    RETURN result_message;
END;
$$;


--
-- TOC entry 489 (class 1255 OID 67283)
-- Name: copy_working_config(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.copy_working_config(source_category text, target_category text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    source_product_record RECORD;
    target_product_record RECORD;
    source_category_id INTEGER;
    target_category_id INTEGER;
    copied_options INTEGER := 0;
    updated_products INTEGER := 0;
    current_inserted INTEGER;
    sample_steps_config JSON;
BEGIN
    -- Récupérer les IDs des catégories
    SELECT id INTO source_category_id 
    FROM france_menu_categories 
    WHERE name ILIKE '%' || source_category || '%' LIMIT 1;
    
    SELECT id INTO target_category_id 
    FROM france_menu_categories 
    WHERE name ILIKE '%' || target_category || '%' LIMIT 1;
    
    IF source_category_id IS NULL THEN
        RETURN 'ERREUR: Catégorie source ' || source_category || ' non trouvée';
    END IF;
    
    IF target_category_id IS NULL THEN
        RETURN 'ERREUR: Catégorie cible ' || target_category || ' non trouvée';
    END IF;
    
    -- Récupérer un échantillon de steps_config depuis la source
    SELECT p.steps_config INTO sample_steps_config
    FROM france_products p
    WHERE p.category_id = source_category_id 
    AND p.steps_config IS NOT NULL
    AND p.is_active = true
    LIMIT 1;
    
    -- ÉTAPE 1: Nettoyer la catégorie cible
    DELETE FROM france_product_options
    WHERE product_id IN (
        SELECT id FROM france_products WHERE category_id = target_category_id
    );
    
    DELETE FROM france_composite_items
    WHERE composite_product_id IN (
        SELECT id FROM france_products WHERE category_id = target_category_id
    );
    
    -- ÉTAPE 2: Copier la configuration de base des produits
    UPDATE france_products 
    SET 
        product_type = (
            SELECT DISTINCT product_type 
            FROM france_products 
            WHERE category_id = source_category_id 
            AND is_active = true 
            LIMIT 1
        ),
        workflow_type = (
            SELECT DISTINCT workflow_type 
            FROM france_products 
            WHERE category_id = source_category_id 
            AND is_active = true 
            LIMIT 1
        ),
        requires_steps = (
            SELECT DISTINCT requires_steps 
            FROM france_products 
            WHERE category_id = source_category_id 
            AND is_active = true 
            LIMIT 1
        ),
        steps_config = sample_steps_config,
        updated_at = NOW()
    WHERE category_id = target_category_id 
    AND is_active = true;
    
    GET DIAGNOSTICS updated_products = ROW_COUNT;
    
    -- ÉTAPE 3: Copier les product_options pour chaque produit cible
    FOR target_product_record IN 
        SELECT id, name FROM france_products 
        WHERE category_id = target_category_id AND is_active = true
    LOOP
        -- Copier toutes les options depuis le premier produit source
        INSERT INTO france_product_options (
            product_id, option_group, option_name, price_modifier, 
            is_required, max_selections, display_order, group_order, is_active
        )
        SELECT 
            target_product_record.id, -- Nouveau product_id
            fpo.option_group,
            fpo.option_name,
            fpo.price_modifier,
            fpo.is_required,
            fpo.max_selections,
            fpo.display_order,
            fpo.group_order,
            fpo.is_active
        FROM france_products p
        JOIN france_product_options fpo ON fpo.product_id = p.id
        WHERE p.category_id = source_category_id
        AND p.is_active = true
        AND fpo.is_active = true
        LIMIT 12; -- Limiter aux 12 boissons standards
        
        GET DIAGNOSTICS current_inserted = ROW_COUNT;
        copied_options := copied_options + current_inserted;
    END LOOP;
    
    RETURN 'SUCCESS: Configuration ' || source_category || ' copiée vers ' || target_category || '. ' ||
           updated_products || ' produits mis à jour, ' ||
           copied_options || ' options copiées.';
END;
$$;


--
-- TOC entry 484 (class 1255 OID 66836)
-- Name: fix_category_configuration(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fix_category_configuration(category_name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    cleaned_options INTEGER;
    cleaned_items INTEGER;
    updated_products INTEGER;
    category_slug TEXT;
BEGIN
    -- Récupérer le slug de la catégorie
    SELECT slug INTO category_slug
    FROM france_menu_categories 
    WHERE name ILIKE '%' || category_name || '%'
    LIMIT 1;
    
    IF category_slug IS NULL THEN
        RETURN 'ERREUR: Catégorie ' || category_name || ' non trouvée';
    END IF;
    
    -- Nettoyer toute la configuration composite pour la catégorie
    DELETE FROM france_product_options
    WHERE product_id IN (
        SELECT p.id 
        FROM france_products p
        JOIN france_menu_categories c ON c.id = p.category_id
        WHERE c.slug = category_slug
    );
    GET DIAGNOSTICS cleaned_options = ROW_COUNT;
    
    DELETE FROM france_composite_items
    WHERE composite_product_id IN (
        SELECT p.id 
        FROM france_products p
        JOIN france_menu_categories c ON c.id = p.category_id
        WHERE c.slug = category_slug
    );
    GET DIAGNOSTICS cleaned_items = ROW_COUNT;
    
    -- Remettre en configuration simple
    UPDATE france_products 
    SET 
        product_type = 'simple',
        workflow_type = NULL,
        requires_steps = false,
        steps_config = NULL,
        updated_at = NOW()
    WHERE category_id IN (
        SELECT id FROM france_menu_categories 
        WHERE slug = category_slug
    );
    GET DIAGNOSTICS updated_products = ROW_COUNT;
    
    RETURN category_name || ' CORRIGÉ: ' || updated_products || ' produits remis en simple, ' ||
           cleaned_options || ' options supprimées, ' || cleaned_items || ' composite_items supprimés';
END;
$$;


--
-- TOC entry 558 (class 1255 OID 65476)
-- Name: fn_get_product_by_categorie(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_get_product_by_categorie(p_category_id integer) RETURNS TABLE(product_id integer, product_name character varying, description text, price_on_site numeric, price_delivery numeric, product_type character varying, is_active boolean, display_order integer, category_name character varying, category_icon character varying, base_price numeric, composition text, workflow_type character varying, requires_steps boolean, has_variants boolean, has_sizes boolean, has_options boolean)
    LANGUAGE plpgsql
    AS $$
  BEGIN
      RETURN QUERY
      SELECT
          p.id as product_id,
          p.name as product_name,
          p.description,
          COALESCE(p.price_on_site_base, p.base_price, 0) as price_on_site,
          COALESCE(p.price_delivery_base, p.base_price + 1, 0) as price_delivery,
          p.product_type::CHARACTER VARYING as product_type,
          p.is_active,
          p.display_order,
          mc.name as category_name,
          mc.icon as category_icon,
          p.base_price,
          p.composition,
          p.workflow_type,
          p.requires_steps,
          -- Vérifier s'il y a des variantes
          CASE WHEN EXISTS(
              SELECT 1 FROM france_product_variants pv WHERE pv.product_id = p.id
          ) THEN true ELSE false END as has_variants,
          -- Vérifier s'il y a des tailles
          CASE WHEN EXISTS(
              SELECT 1 FROM france_product_sizes ps WHERE ps.product_id = p.id
          ) THEN true ELSE false END as has_sizes,
          -- Vérifier s'il y a des options
          CASE WHEN EXISTS(
              SELECT 1 FROM france_product_options po WHERE po.product_id = p.id
          ) THEN true ELSE false END as has_options
      FROM france_products p
      INNER JOIN france_menu_categories mc ON p.category_id = mc.id
      WHERE p.category_id = p_category_id
        AND p.is_active = true
        AND mc.is_active = true
      ORDER BY p.display_order ASC, p.name ASC;
  END;
  $$;


--
-- TOC entry 547 (class 1255 OID 65602)
-- Name: fn_get_product_by_categorie_detailed(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_get_product_by_categorie_detailed(p_category_id integer) RETURNS TABLE(product_id integer, product_name character varying, description text, price_on_site numeric, price_delivery numeric, product_type character varying, is_active boolean, display_order integer, category_name character varying, category_icon character varying, option_groups_count integer, required_groups text, optional_groups text, total_options integer, price_range text)
    LANGUAGE plpgsql
    AS $$
  BEGIN
      RETURN QUERY
      SELECT
          p.id as product_id,
          p.name as product_name,
          p.description,
          COALESCE(p.price_on_site_base, p.base_price, 0) as price_on_site,
          COALESCE(p.price_delivery_base, p.base_price + 1, 0) as price_delivery,
          p.product_type::CHARACTER VARYING as product_type,
          p.is_active,
          p.display_order,
          mc.name as category_name,
          mc.icon as category_icon,

          -- Compter les groupes d'options
          COALESCE(opt_stats.group_count, 0) as option_groups_count,
          opt_stats.required_groups,
          opt_stats.optional_groups,
          COALESCE(opt_stats.total_options, 0) as total_options,
          CASE
              WHEN p.product_type = 'modular' THEN
                  COALESCE(p.price_on_site_base, p.base_price)::text || '€ + options'
              ELSE
                  COALESCE(p.price_on_site_base, p.base_price)::text || '€'
          END as price_range

      FROM france_products p
      INNER JOIN france_menu_categories mc ON p.category_id = mc.id
      LEFT JOIN (
          SELECT
              po.product_id,
              COUNT(DISTINCT po.option_group) as group_count,
              STRING_AGG(DISTINCT CASE WHEN po.is_required THEN po.option_group END, ', ') as required_groups,
              STRING_AGG(DISTINCT CASE WHEN NOT po.is_required THEN po.option_group END, ', ') as optional_groups,
              COUNT(*) as total_options
          FROM france_product_options po
          WHERE po.is_active = true
          GROUP BY po.product_id
      ) opt_stats ON opt_stats.product_id = p.id
      WHERE p.category_id = p_category_id
        AND p.is_active = true
        AND mc.is_active = true
      ORDER BY p.display_order ASC, p.name ASC;
  END;
  $$;


--
-- TOC entry 523 (class 1255 OID 25802)
-- Name: force_release_order(integer, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.force_release_order(p_order_id integer, p_restaurant_id integer, p_reason text DEFAULT 'Liberation forcee par restaurant'::text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 1. Vérifier que c'est bien le restaurant propriétaire
    IF NOT EXISTS (
        SELECT 1 FROM france_orders 
        WHERE id = p_order_id AND restaurant_id = p_restaurant_id
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- 2. Suspendre tous les tokens actifs
    UPDATE delivery_tokens 
    SET suspended = true, updated_at = NOW()
    WHERE order_id = p_order_id AND used = false;
    
    -- 3. Logger l'action
    INSERT INTO delivery_order_logs (
        order_id, action_type, details, created_at
    ) VALUES (
        p_order_id, 'FORCE_RELEASE', p_reason, NOW()
    );
    
    -- 4. Remettre la commande en recherche
    UPDATE france_orders 
    SET 
        status = 'prete',
        driver_id = NULL,
        updated_at = NOW()
    WHERE id = p_order_id;
    
    RETURN TRUE;
END;
$$;


--
-- TOC entry 569 (class 1255 OID 26570)
-- Name: get_order_delivery_stats(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_order_delivery_stats(p_order_id integer) RETURNS TABLE(notified_count integer, viewed_count integer, refused_count integer, accepted_count integer, last_action_driver_name text, last_action_type character varying, last_action_timestamp timestamp without time zone, last_token_update timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(stats.notified_count, 0)::INTEGER,
    COALESCE(stats.viewed_count, 0)::INTEGER,
    COALESCE(stats.refused_count, 0)::INTEGER,
    COALESCE(stats.accepted_count, 0)::INTEGER,
    last_act.driver_name,
    last_act.action_type,
    last_act.action_timestamp,
    token_update.last_updated
  FROM (
    SELECT 
      COUNT(*) FILTER (WHERE dda.action_type = 'notified') AS notified_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'link_viewed') AS viewed_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'refused') AS refused_count,
      COUNT(*) FILTER (WHERE dda.action_type = 'accepted') AS accepted_count
    FROM delivery_driver_actions dda
    WHERE dda.order_id = p_order_id
  ) stats
  LEFT JOIN (
    SELECT 
      fdd.first_name || ' ' || COALESCE(fdd.last_name, '') AS driver_name,
      dda.action_type,
      dda.action_timestamp
    FROM delivery_driver_actions dda
    JOIN france_delivery_drivers fdd ON dda.driver_id = fdd.id
    WHERE dda.order_id = p_order_id
    ORDER BY dda.action_timestamp DESC
    LIMIT 1
  ) last_act ON TRUE
  LEFT JOIN (
    SELECT 
      dt.updated_at as last_updated
    FROM delivery_tokens dt
    WHERE dt.order_id = p_order_id
    AND dt.used = false
    ORDER BY dt.updated_at DESC
    LIMIT 1
  ) token_update ON TRUE;
END;
$$;


--
-- TOC entry 468 (class 1255 OID 79568)
-- Name: load_orders_with_assignment_state(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.load_orders_with_assignment_state(p_restaurant_id integer) RETURNS TABLE(id integer, restaurant_id integer, phone_number character varying, customer_name character varying, items jsonb, total_amount numeric, delivery_mode character varying, delivery_address text, payment_mode character varying, payment_method character varying, status character varying, notes text, additional_notes text, order_number character varying, created_at timestamp without time zone, updated_at timestamp without time zone, delivery_address_id bigint, delivery_validation_code character varying, date_validation_code timestamp with time zone, driver_id integer, estimated_delivery_time timestamp with time zone, driver_assignment_status character varying, delivery_started_at timestamp with time zone, assignment_timeout_at timestamp with time zone, assignment_started_at timestamp with time zone, assignment_count integer, pending_assignment_count integer, expired_assignment_count integer, pending_driver_names text)
    LANGUAGE plpgsql
    AS $$
  BEGIN
    RETURN QUERY
    SELECT
      fo.id,
      fo.restaurant_id,
      fo.phone_number,
      fo.customer_name,
      fo.items,
      fo.total_amount,
      fo.delivery_mode,
      fo.delivery_address,
      fo.payment_mode,
      fo.payment_method,
      fo.status,
      fo.notes,
      fo.additional_notes,
      fo.order_number,
      fo.created_at,
      fo.updated_at,
      fo.delivery_address_id,
      fo.delivery_validation_code,
      fo.date_validation_code,
      fo.driver_id,
      fo.estimated_delivery_time,
      fo.driver_assignment_status,
      fo.delivery_started_at,
      fo.assignment_timeout_at,
      fo.assignment_started_at,
      COALESCE(agg.assignment_count, 0)::integer,
      COALESCE(agg.pending_assignment_count, 0)::integer,
      COALESCE(agg.expired_assignment_count, 0)::integer,
      agg.pending_driver_names
    FROM france_orders fo
    LEFT JOIN (
      SELECT
        fda.order_id,
        COUNT(*)::integer as assignment_count,
        COUNT(*) FILTER (WHERE fda.assignment_status = 'pending')::integer as pending_assignment_count,
        COUNT(*) FILTER (WHERE fda.assignment_status = 'expired')::integer as expired_assignment_count,
        string_agg(
          CASE
            WHEN fda.assignment_status IN ('pending', 'expired')
            THEN CONCAT(fdd.first_name, ' ', fdd.last_name)
            ELSE NULL
          END,
          ', '
        ) as pending_driver_names
      FROM france_delivery_assignments fda
      JOIN france_delivery_drivers fdd ON fdd.id = fda.driver_id
      GROUP BY fda.order_id
    ) agg ON agg.order_id = fo.id
    WHERE fo.restaurant_id = p_restaurant_id
    ORDER BY fo.created_at DESC;
  END;
  $$;


--
-- TOC entry 539 (class 1255 OID 71738)
-- Name: trigger_auto_add_drink_production(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_auto_add_drink_production() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
      product_record RECORD;
  BEGIN
      -- Récupérer infos produit + catégorie
      SELECT p.*, c.name as category_name
      INTO product_record
      FROM france_products p
      JOIN france_menu_categories c ON c.id = p.category_id
      WHERE p.id = NEW.product_id;

      -- Si c'est une boisson avec variante 33CL ou 1L5
      IF product_record.category_name = 'BOISSONS' AND
         NEW.variant_name IN ('33CL', '1L5') AND
         NEW.is_active = true THEN

          -- Exécuter l'automatisation (les résultats sont ignorés par le trigger)
          PERFORM auto_add_drink_to_workflows_production(
              NEW.product_id,
              product_record.name,
              NEW.variant_name
          );
      END IF;

      RETURN NEW;
  END;
  $$;


--
-- TOC entry 551 (class 1255 OID 47230)
-- Name: update_composite_items(integer, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_composite_items(p_product_id integer, p_items jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
  DECLARE
    item jsonb;
    item_id integer;
    existing_count integer;
    new_count integer;
  BEGIN
    -- Vérifier si des données sont fournies
    IF p_items IS NULL THEN
      -- Pas de données fournies = ne rien faire (préserver l'existant)
      RETURN;
    END IF;

    -- Compter les éléments existants et nouveaux
    SELECT COUNT(*) INTO existing_count
    FROM france_composite_items
    WHERE composite_product_id = p_product_id;

    SELECT jsonb_array_length(p_items) INTO new_count;

    -- Si tableau vide fourni ET éléments existants, ne rien faire (préservation)
    IF new_count = 0 AND existing_count > 0 THEN
      RAISE NOTICE 'Préservation des données existantes: % éléments conservés', existing_count;
      RETURN;
    END IF;

    -- Si tableau vide fourni ET aucun élément existant, OK (rien à faire)
    IF new_count = 0 AND existing_count = 0 THEN
      RETURN;
    END IF;

    -- UPSERT intelligent: mise à jour réelle seulement si changement
    -- 1. Marquer tous les éléments existants comme "à supprimer"
    UPDATE france_composite_items
    SET unit = unit || '_TO_DELETE'
    WHERE composite_product_id = p_product_id;

    -- 2. Insérer ou mettre à jour chaque élément
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      -- Vérifier si cet élément existe déjà (par nom de composant)
      SELECT id INTO item_id
      FROM france_composite_items
      WHERE composite_product_id = p_product_id
        AND component_name = (item->>'component_name')::varchar
        AND unit LIKE '%_TO_DELETE';

      IF item_id IS NOT NULL THEN
        -- Élément existant: mettre à jour
        UPDATE france_composite_items SET
          quantity = (item->>'quantity')::integer,
          unit = COALESCE((item->>'unit')::varchar, 'pièces')
        WHERE id = item_id;
      ELSE
        -- Nouvel élément: insérer
        INSERT INTO france_composite_items (
          composite_product_id,
          component_name,
          quantity,
          unit
        ) VALUES (
          p_product_id,
          (item->>'component_name')::varchar,
          (item->>'quantity')::integer,
          COALESCE((item->>'unit')::varchar, 'pièces')
        );
      END IF;
    END LOOP;

    -- 3. Supprimer les éléments non mis à jour (vraiment supprimés)
    DELETE FROM france_composite_items
    WHERE composite_product_id = p_product_id
      AND unit LIKE '%_TO_DELETE';

    RAISE NOTICE 'Mise à jour intelligente terminée pour le produit %', p_product_id;
  END;
  $$;


--
-- TOC entry 555 (class 1255 OID 21643)
-- Name: update_driver_location_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_driver_location_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_location_update := NOW();
    RETURN NEW;
END;
$$;


--
-- TOC entry 494 (class 1255 OID 20469)
-- Name: update_france_customer_addresses_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_france_customer_addresses_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- TOC entry 477 (class 1255 OID 20825)
-- Name: update_france_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_france_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- TOC entry 566 (class 1255 OID 25805)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 357 (class 1259 OID 16525)
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- TOC entry 4591 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 374 (class 1259 OID 16927)
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- TOC entry 4592 (class 0 OID 0)
-- Dependencies: 374
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- TOC entry 365 (class 1259 OID 16725)
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 4593 (class 0 OID 0)
-- Dependencies: 365
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 4594 (class 0 OID 0)
-- Dependencies: 365
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 356 (class 1259 OID 16518)
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- TOC entry 4595 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 369 (class 1259 OID 16814)
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- TOC entry 4596 (class 0 OID 0)
-- Dependencies: 369
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 368 (class 1259 OID 16802)
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- TOC entry 4597 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 367 (class 1259 OID 16789)
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- TOC entry 4598 (class 0 OID 0)
-- Dependencies: 367
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 406 (class 1259 OID 19243)
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_id text NOT NULL,
    client_secret_hash text NOT NULL,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- TOC entry 375 (class 1259 OID 16977)
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- TOC entry 355 (class 1259 OID 16507)
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- TOC entry 4599 (class 0 OID 0)
-- Dependencies: 355
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 354 (class 1259 OID 16506)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4600 (class 0 OID 0)
-- Dependencies: 354
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 372 (class 1259 OID 16856)
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- TOC entry 4601 (class 0 OID 0)
-- Dependencies: 372
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 373 (class 1259 OID 16874)
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- TOC entry 4602 (class 0 OID 0)
-- Dependencies: 373
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 358 (class 1259 OID 16533)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- TOC entry 4603 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 366 (class 1259 OID 16755)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- TOC entry 4604 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 4605 (class 0 OID 0)
-- Dependencies: 366
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 371 (class 1259 OID 16841)
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- TOC entry 4606 (class 0 OID 0)
-- Dependencies: 371
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 370 (class 1259 OID 16832)
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- TOC entry 4607 (class 0 OID 0)
-- Dependencies: 370
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 4608 (class 0 OID 0)
-- Dependencies: 370
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 353 (class 1259 OID 16495)
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- TOC entry 4609 (class 0 OID 0)
-- Dependencies: 353
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 4610 (class 0 OID 0)
-- Dependencies: 353
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 458 (class 1259 OID 70783)
-- Name: automation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_logs (
    id integer NOT NULL,
    action character varying(100) NOT NULL,
    details jsonb,
    created_at timestamp without time zone DEFAULT now(),
    success boolean DEFAULT true
);


--
-- TOC entry 457 (class 1259 OID 70782)
-- Name: automation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.automation_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4611 (class 0 OID 0)
-- Dependencies: 457
-- Name: automation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.automation_logs_id_seq OWNED BY public.automation_logs.id;


--
-- TOC entry 424 (class 1259 OID 25726)
-- Name: delivery_driver_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_driver_actions (
    id integer NOT NULL,
    order_id integer,
    driver_id integer,
    token_id integer,
    action_type character varying(20) NOT NULL,
    action_timestamp timestamp without time zone DEFAULT now(),
    details jsonb
);


--
-- TOC entry 423 (class 1259 OID 25725)
-- Name: delivery_driver_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delivery_driver_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4612 (class 0 OID 0)
-- Dependencies: 423
-- Name: delivery_driver_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.delivery_driver_actions_id_seq OWNED BY public.delivery_driver_actions.id;


--
-- TOC entry 428 (class 1259 OID 25776)
-- Name: delivery_order_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_order_logs (
    id integer NOT NULL,
    order_id integer,
    action_type character varying(20) NOT NULL,
    details text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 427 (class 1259 OID 25775)
-- Name: delivery_order_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delivery_order_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4613 (class 0 OID 0)
-- Dependencies: 427
-- Name: delivery_order_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.delivery_order_logs_id_seq OWNED BY public.delivery_order_logs.id;


--
-- TOC entry 426 (class 1259 OID 25751)
-- Name: delivery_refusals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_refusals (
    id integer NOT NULL,
    order_id integer,
    driver_id integer,
    token_id integer,
    reason character varying(20),
    custom_reason text,
    refused_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 425 (class 1259 OID 25750)
-- Name: delivery_refusals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delivery_refusals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4614 (class 0 OID 0)
-- Dependencies: 425
-- Name: delivery_refusals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.delivery_refusals_id_seq OWNED BY public.delivery_refusals.id;


--
-- TOC entry 422 (class 1259 OID 25702)
-- Name: delivery_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_tokens (
    id integer NOT NULL,
    token character varying(64) NOT NULL,
    order_id integer,
    driver_id integer,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    absolute_expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    suspended boolean DEFAULT false,
    reactivated boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 421 (class 1259 OID 25701)
-- Name: delivery_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delivery_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4615 (class 0 OID 0)
-- Dependencies: 421
-- Name: delivery_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.delivery_tokens_id_seq OWNED BY public.delivery_tokens.id;


--
-- TOC entry 414 (class 1259 OID 21577)
-- Name: france_delivery_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_delivery_assignments (
    id integer NOT NULL,
    order_id integer NOT NULL,
    driver_id integer NOT NULL,
    assignment_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    responded_at timestamp with time zone,
    expires_at timestamp with time zone,
    response_time_seconds integer,
    CONSTRAINT france_delivery_assignments_assignment_status_check CHECK (((assignment_status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'expired'::character varying])::text[]))),
    CONSTRAINT france_delivery_assignments_check CHECK (((responded_at IS NULL) OR (responded_at >= created_at)))
);


--
-- TOC entry 4616 (class 0 OID 0)
-- Dependencies: 414
-- Name: TABLE france_delivery_assignments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_delivery_assignments IS 'Toutes les tentatives d''assignation de commandes aux livreurs';


--
-- TOC entry 4617 (class 0 OID 0)
-- Dependencies: 414
-- Name: COLUMN france_delivery_assignments.assignment_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_delivery_assignments.assignment_status IS 'pending: en attente, accepted: accepté, rejected: refusé, expired: expiré';


--
-- TOC entry 4618 (class 0 OID 0)
-- Dependencies: 414
-- Name: COLUMN france_delivery_assignments.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_delivery_assignments.expires_at IS 'Date limite pour que le livreur réponde';


--
-- TOC entry 4619 (class 0 OID 0)
-- Dependencies: 414
-- Name: COLUMN france_delivery_assignments.response_time_seconds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_delivery_assignments.response_time_seconds IS 'Temps de réponse du livreur en secondes';


--
-- TOC entry 410 (class 1259 OID 20781)
-- Name: france_delivery_drivers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_delivery_drivers (
    id bigint NOT NULL,
    restaurant_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone_number character varying(30) NOT NULL,
    email character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_online boolean DEFAULT false,
    current_latitude numeric(10,8),
    current_longitude numeric(11,8),
    last_location_update timestamp with time zone DEFAULT now(),
    password character varying(6) DEFAULT '000000'::character varying NOT NULL,
    CONSTRAINT phone_06_07_check CHECK (((phone_number)::text ~ '^0[67][0-9]{8}$'::text))
);


--
-- TOC entry 4620 (class 0 OID 0)
-- Dependencies: 410
-- Name: COLUMN france_delivery_drivers.is_online; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_delivery_drivers.is_online IS 'Statut en ligne du livreur (disponible pour prendre des commandes)';


--
-- TOC entry 4621 (class 0 OID 0)
-- Dependencies: 410
-- Name: COLUMN france_delivery_drivers.current_latitude; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_delivery_drivers.current_latitude IS 'Latitude actuelle du livreur';


--
-- TOC entry 4622 (class 0 OID 0)
-- Dependencies: 410
-- Name: COLUMN france_delivery_drivers.current_longitude; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_delivery_drivers.current_longitude IS 'Longitude actuelle du livreur';


--
-- TOC entry 402 (class 1259 OID 17424)
-- Name: france_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_orders (
    id integer NOT NULL,
    restaurant_id integer,
    phone_number character varying(20) NOT NULL,
    customer_name character varying(255),
    items jsonb NOT NULL,
    total_amount numeric(8,2) NOT NULL,
    delivery_mode character varying(50),
    delivery_address text,
    payment_mode character varying(50),
    payment_method character varying(50),
    status character varying(50) DEFAULT 'en_attente'::character varying,
    notes text,
    order_number character varying(20),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    delivery_address_id bigint,
    delivery_validation_code character varying(4) DEFAULT NULL::character varying,
    date_validation_code timestamp with time zone,
    driver_id integer,
    estimated_delivery_time timestamp with time zone,
    driver_assignment_status character varying(20) DEFAULT 'none'::character varying,
    delivery_started_at timestamp with time zone,
    assignment_timeout_at timestamp with time zone,
    assignment_started_at timestamp with time zone,
    audio_played boolean DEFAULT false,
    additional_notes text,
    CONSTRAINT france_orders_driver_assignment_status_check CHECK (((driver_assignment_status)::text = ANY ((ARRAY['none'::character varying, 'searching'::character varying, 'assigned'::character varying, 'delivered'::character varying])::text[]))),
    CONSTRAINT france_orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmee'::character varying, 'preparation'::character varying, 'prete'::character varying, 'assignee'::character varying, 'en_livraison'::character varying, 'livree'::character varying, 'servie'::character varying, 'recuperee'::character varying, 'annulee'::character varying])::text[])))
);


--
-- TOC entry 4623 (class 0 OID 0)
-- Dependencies: 402
-- Name: TABLE france_orders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_orders IS 'Commandes des restaurants France';


--
-- TOC entry 4624 (class 0 OID 0)
-- Dependencies: 402
-- Name: COLUMN france_orders.delivery_validation_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_orders.delivery_validation_code IS 'Code à 4 chiffres pour validation de la livraison par le livreur';


--
-- TOC entry 4625 (class 0 OID 0)
-- Dependencies: 402
-- Name: COLUMN france_orders.date_validation_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_orders.date_validation_code IS 'Date et heure de validation du code par le livreur';


--
-- TOC entry 4626 (class 0 OID 0)
-- Dependencies: 402
-- Name: COLUMN france_orders.driver_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_orders.driver_id IS 'ID du livreur assigné à cette commande (colonne existante réutilisée)';


--
-- TOC entry 4627 (class 0 OID 0)
-- Dependencies: 402
-- Name: COLUMN france_orders.driver_assignment_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_orders.driver_assignment_status IS 'Statut assignation: none|searching|assigned|delivered';


--
-- TOC entry 4628 (class 0 OID 0)
-- Dependencies: 402
-- Name: COLUMN france_orders.delivery_started_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_orders.delivery_started_at IS 'Timestamp début livraison (quand livreur accepte)';


--
-- TOC entry 4629 (class 0 OID 0)
-- Dependencies: 402
-- Name: COLUMN france_orders.assignment_timeout_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_orders.assignment_timeout_at IS 'Timestamp limite pour trouver un livreur';


--
-- TOC entry 4630 (class 0 OID 0)
-- Dependencies: 402
-- Name: COLUMN france_orders.assignment_started_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_orders.assignment_started_at IS 'Date/heure de début de recherche d''assignation livreur - utilisé dans getNotificationTime()';


--
-- TOC entry 4631 (class 0 OID 0)
-- Dependencies: 402
-- Name: COLUMN france_orders.audio_played; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_orders.audio_played IS 'Indique si la notification audio a été jouée pour cette commande';


--
-- TOC entry 386 (class 1259 OID 17272)
-- Name: france_restaurants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_restaurants (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    address text,
    city character varying(100),
    postal_code character varying(10),
    phone character varying(20),
    whatsapp_number character varying(20) NOT NULL,
    delivery_zone_km integer DEFAULT 5,
    min_order_amount numeric(8,2) DEFAULT 0,
    delivery_fee numeric(8,2) DEFAULT 2.50,
    is_active boolean DEFAULT true,
    business_hours jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    password_hash character varying(255) NOT NULL,
    timezone character varying(50) DEFAULT 'Europe/Paris'::character varying,
    country_code character varying(2) DEFAULT 'FR'::character varying,
    hide_delivery_info boolean DEFAULT false,
    is_exceptionally_closed boolean DEFAULT false,
    latitude numeric(10,8),
    longitude numeric(11,8),
    audio_notifications_enabled boolean DEFAULT true,
    audio_volume integer DEFAULT 50,
    audio_enabled_since timestamp without time zone,
    CONSTRAINT france_restaurants_audio_volume_check CHECK (((audio_volume >= 0) AND (audio_volume <= 100)))
);


--
-- TOC entry 4632 (class 0 OID 0)
-- Dependencies: 386
-- Name: TABLE france_restaurants; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_restaurants IS 'Restaurants en France utilisant le bot WhatsApp';


--
-- TOC entry 4633 (class 0 OID 0)
-- Dependencies: 386
-- Name: COLUMN france_restaurants.audio_notifications_enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_restaurants.audio_notifications_enabled IS 'Active/désactive les notifications audio pour ce restaurant';


--
-- TOC entry 4634 (class 0 OID 0)
-- Dependencies: 386
-- Name: COLUMN france_restaurants.audio_volume; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_restaurants.audio_volume IS 'Volume des notifications audio (0-100)';


--
-- TOC entry 4635 (class 0 OID 0)
-- Dependencies: 386
-- Name: COLUMN france_restaurants.audio_enabled_since; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_restaurants.audio_enabled_since IS 'Timestamp depuis quand l''audio est activé (NULL si désactivé)';


--
-- TOC entry 419 (class 1259 OID 21650)
-- Name: france_active_assignments; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.france_active_assignments AS
 SELECT a.id,
    a.order_id,
    a.driver_id,
    a.assignment_status,
    a.created_at,
    a.responded_at,
    a.expires_at,
    a.response_time_seconds,
    o.order_number,
    o.restaurant_id,
    o.delivery_address,
    o.total_amount,
    (((d.first_name)::text || ' '::text) || (d.last_name)::text) AS driver_name,
    d.phone_number AS driver_phone,
    r.name AS restaurant_name
   FROM (((public.france_delivery_assignments a
     JOIN public.france_orders o ON ((a.order_id = o.id)))
     JOIN public.france_delivery_drivers d ON ((a.driver_id = d.id)))
     JOIN public.france_restaurants r ON ((o.restaurant_id = r.id)))
  WHERE ((a.assignment_status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying])::text[]));


--
-- TOC entry 412 (class 1259 OID 20804)
-- Name: france_auth_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_auth_sessions (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    user_type character varying(20) NOT NULL,
    session_token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    last_accessed timestamp with time zone DEFAULT now(),
    ip_address inet,
    user_agent text,
    CONSTRAINT france_auth_sessions_user_type_check CHECK (((user_type)::text = ANY ((ARRAY['restaurant'::character varying, 'driver'::character varying])::text[])))
);


--
-- TOC entry 411 (class 1259 OID 20803)
-- Name: france_auth_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_auth_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4636 (class 0 OID 0)
-- Dependencies: 411
-- Name: france_auth_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_auth_sessions_id_seq OWNED BY public.france_auth_sessions.id;


--
-- TOC entry 420 (class 1259 OID 22544)
-- Name: france_available_drivers; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.france_available_drivers AS
 SELECT id,
    restaurant_id,
    first_name,
    last_name,
    phone_number,
    email,
    is_active,
    created_at,
    updated_at,
    is_online,
    current_latitude,
    current_longitude,
    last_location_update,
    password,
        CASE
            WHEN (last_location_update > (now() - '00:05:00'::interval)) THEN 'recent'::text
            WHEN (last_location_update > (now() - '00:15:00'::interval)) THEN 'stale'::text
            ELSE 'offline'::text
        END AS location_freshness
   FROM public.france_delivery_drivers d
  WHERE ((is_active = true) AND (is_online = true));


--
-- TOC entry 398 (class 1259 OID 17389)
-- Name: france_composite_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_composite_items (
    id integer NOT NULL,
    composite_product_id integer,
    component_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit character varying(20) DEFAULT 'pièces'::character varying
);


--
-- TOC entry 4637 (class 0 OID 0)
-- Dependencies: 398
-- Name: TABLE france_composite_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_composite_items IS 'Composition des menus composites';


--
-- TOC entry 397 (class 1259 OID 17388)
-- Name: france_composite_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_composite_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4638 (class 0 OID 0)
-- Dependencies: 397
-- Name: france_composite_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_composite_items_id_seq OWNED BY public.france_composite_items.id;


--
-- TOC entry 408 (class 1259 OID 20455)
-- Name: france_customer_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_customer_addresses (
    id bigint NOT NULL,
    phone_number character varying(30) NOT NULL,
    address_label character varying(100) NOT NULL,
    full_address text NOT NULL,
    google_place_id character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    whatsapp_name character varying
);


--
-- TOC entry 407 (class 1259 OID 20454)
-- Name: france_customer_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_customer_addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4639 (class 0 OID 0)
-- Dependencies: 407
-- Name: france_customer_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_customer_addresses_id_seq OWNED BY public.france_customer_addresses.id;


--
-- TOC entry 413 (class 1259 OID 21576)
-- Name: france_delivery_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_delivery_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4640 (class 0 OID 0)
-- Dependencies: 413
-- Name: france_delivery_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_delivery_assignments_id_seq OWNED BY public.france_delivery_assignments.id;


--
-- TOC entry 409 (class 1259 OID 20780)
-- Name: france_delivery_drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_delivery_drivers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4641 (class 0 OID 0)
-- Dependencies: 409
-- Name: france_delivery_drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_delivery_drivers_id_seq OWNED BY public.france_delivery_drivers.id;


--
-- TOC entry 416 (class 1259 OID 21603)
-- Name: france_delivery_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_delivery_notifications (
    id integer NOT NULL,
    assignment_id integer NOT NULL,
    notification_type character varying(30) NOT NULL,
    recipient_type character varying(20) NOT NULL,
    recipient_id character varying(50) NOT NULL,
    notification_data jsonb DEFAULT '{}'::jsonb,
    sent_at timestamp with time zone DEFAULT now(),
    delivery_status character varying(20) DEFAULT 'pending'::character varying,
    error_message text,
    CONSTRAINT france_delivery_notifications_delivery_status_check CHECK (((delivery_status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'delivered'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT france_delivery_notifications_notification_type_check CHECK (((notification_type)::text = ANY ((ARRAY['assignment_offer'::character varying, 'assignment_accepted'::character varying, 'assignment_rejected'::character varying, 'delivery_started'::character varying, 'delivery_completed'::character varying])::text[]))),
    CONSTRAINT france_delivery_notifications_recipient_type_check CHECK (((recipient_type)::text = ANY ((ARRAY['driver'::character varying, 'restaurant'::character varying, 'customer'::character varying])::text[])))
);


--
-- TOC entry 4642 (class 0 OID 0)
-- Dependencies: 416
-- Name: TABLE france_delivery_notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_delivery_notifications IS 'Historique de toutes les notifications envoyées pour le système de livraison';


--
-- TOC entry 415 (class 1259 OID 21602)
-- Name: france_delivery_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_delivery_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4643 (class 0 OID 0)
-- Dependencies: 415
-- Name: france_delivery_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_delivery_notifications_id_seq OWNED BY public.france_delivery_notifications.id;


--
-- TOC entry 418 (class 1259 OID 21626)
-- Name: france_driver_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_driver_locations (
    id integer NOT NULL,
    driver_id integer NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    accuracy_meters integer,
    recorded_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_coordinates CHECK ((((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)) AND ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))))
);


--
-- TOC entry 4644 (class 0 OID 0)
-- Dependencies: 418
-- Name: TABLE france_driver_locations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_driver_locations IS 'Historique des positions des livreurs pour analytics';


--
-- TOC entry 417 (class 1259 OID 21625)
-- Name: france_driver_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_driver_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4645 (class 0 OID 0)
-- Dependencies: 417
-- Name: france_driver_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_driver_locations_id_seq OWNED BY public.france_driver_locations.id;


--
-- TOC entry 388 (class 1259 OID 17290)
-- Name: france_menu_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_menu_categories (
    id integer NOT NULL,
    restaurant_id integer,
    name character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    icon character varying(10) DEFAULT '🍽️'::character varying,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 4646 (class 0 OID 0)
-- Dependencies: 388
-- Name: TABLE france_menu_categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_menu_categories IS 'Catégories de menu par restaurant';


--
-- TOC entry 387 (class 1259 OID 17289)
-- Name: france_menu_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_menu_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4647 (class 0 OID 0)
-- Dependencies: 387
-- Name: france_menu_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_menu_categories_id_seq OWNED BY public.france_menu_categories.id;


--
-- TOC entry 401 (class 1259 OID 17423)
-- Name: france_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4648 (class 0 OID 0)
-- Dependencies: 401
-- Name: france_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_orders_id_seq OWNED BY public.france_orders.id;


--
-- TOC entry 453 (class 1259 OID 39346)
-- Name: france_pizza_display_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_pizza_display_settings (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    use_unified_display boolean DEFAULT true,
    custom_settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 452 (class 1259 OID 39345)
-- Name: france_pizza_display_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_pizza_display_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4649 (class 0 OID 0)
-- Dependencies: 452
-- Name: france_pizza_display_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_pizza_display_settings_id_seq OWNED BY public.france_pizza_display_settings.id;


--
-- TOC entry 444 (class 1259 OID 31592)
-- Name: france_product_display_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_product_display_configs (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    product_id integer NOT NULL,
    display_type character varying(50) NOT NULL,
    template_name character varying(100),
    show_variants_first boolean DEFAULT false,
    custom_header_text text,
    custom_footer_text text,
    emoji_icon character varying(10),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 443 (class 1259 OID 31591)
-- Name: france_product_display_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_product_display_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4650 (class 0 OID 0)
-- Dependencies: 443
-- Name: france_product_display_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_product_display_configs_id_seq OWNED BY public.france_product_display_configs.id;


--
-- TOC entry 394 (class 1259 OID 17358)
-- Name: france_product_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_product_options (
    id integer NOT NULL,
    product_id integer,
    option_group character varying(100) NOT NULL,
    option_name character varying(255) NOT NULL,
    price_modifier numeric(8,2) DEFAULT 0,
    is_required boolean DEFAULT false,
    max_selections integer DEFAULT 1,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    group_order integer DEFAULT 0,
    next_group_order integer,
    conditional_next_group jsonb
);


--
-- TOC entry 4651 (class 0 OID 0)
-- Dependencies: 394
-- Name: TABLE france_product_options; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_product_options IS 'Options pour produits modulaires';


--
-- TOC entry 393 (class 1259 OID 17357)
-- Name: france_product_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_product_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4652 (class 0 OID 0)
-- Dependencies: 393
-- Name: france_product_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_product_options_id_seq OWNED BY public.france_product_options.id;


--
-- TOC entry 396 (class 1259 OID 17375)
-- Name: france_product_sizes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_product_sizes (
    id integer NOT NULL,
    product_id integer,
    size_name character varying(50) NOT NULL,
    price_on_site numeric(8,2) NOT NULL,
    includes_drink boolean DEFAULT false,
    display_order integer DEFAULT 0,
    price_delivery numeric,
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 4653 (class 0 OID 0)
-- Dependencies: 396
-- Name: TABLE france_product_sizes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_product_sizes IS 'Tailles pour produits modulaires';


--
-- TOC entry 395 (class 1259 OID 17374)
-- Name: france_product_sizes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_product_sizes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4654 (class 0 OID 0)
-- Dependencies: 395
-- Name: france_product_sizes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_product_sizes_id_seq OWNED BY public.france_product_sizes.id;


--
-- TOC entry 392 (class 1259 OID 17341)
-- Name: france_product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_product_variants (
    id integer NOT NULL,
    product_id integer,
    variant_name character varying(255) NOT NULL,
    price_on_site numeric(8,2) NOT NULL,
    quantity integer,
    unit character varying(20),
    is_menu boolean DEFAULT false,
    includes_description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    price_delivery numeric
);


--
-- TOC entry 4655 (class 0 OID 0)
-- Dependencies: 392
-- Name: TABLE france_product_variants; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_product_variants IS 'Variantes pour produits à portions multiples';


--
-- TOC entry 391 (class 1259 OID 17340)
-- Name: france_product_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_product_variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4656 (class 0 OID 0)
-- Dependencies: 391
-- Name: france_product_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_product_variants_id_seq OWNED BY public.france_product_variants.id;


--
-- TOC entry 390 (class 1259 OID 17318)
-- Name: france_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_products (
    id integer NOT NULL,
    restaurant_id integer,
    category_id integer,
    name character varying(255) NOT NULL,
    description text,
    product_type public.product_type_enum NOT NULL,
    base_price numeric(8,2),
    composition text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    price_on_site_base numeric,
    price_delivery_base numeric,
    workflow_type character varying,
    requires_steps boolean DEFAULT false,
    steps_config json
);


--
-- TOC entry 4657 (class 0 OID 0)
-- Dependencies: 390
-- Name: TABLE france_products; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_products IS 'Produits avec 4 types : simple, modular, variant, composite';


--
-- TOC entry 389 (class 1259 OID 17317)
-- Name: france_products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4658 (class 0 OID 0)
-- Dependencies: 389
-- Name: france_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_products_id_seq OWNED BY public.france_products.id;


--
-- TOC entry 430 (class 1259 OID 29429)
-- Name: france_restaurant_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_restaurant_features (
    id integer NOT NULL,
    restaurant_id integer,
    feature_type character varying NOT NULL,
    is_enabled boolean DEFAULT true,
    config json
);


--
-- TOC entry 429 (class 1259 OID 29428)
-- Name: france_restaurant_features_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_restaurant_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4659 (class 0 OID 0)
-- Dependencies: 429
-- Name: france_restaurant_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_restaurant_features_id_seq OWNED BY public.france_restaurant_features.id;


--
-- TOC entry 450 (class 1259 OID 37979)
-- Name: france_restaurant_service_modes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_restaurant_service_modes (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    service_mode character varying(50) NOT NULL,
    is_enabled boolean DEFAULT true,
    display_name character varying(100) NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    config jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT france_restaurant_service_modes_service_mode_check CHECK (((service_mode)::text = ANY ((ARRAY['sur_place'::character varying, 'a_emporter'::character varying, 'livraison'::character varying])::text[])))
);


--
-- TOC entry 449 (class 1259 OID 37978)
-- Name: france_restaurant_service_modes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_restaurant_service_modes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4660 (class 0 OID 0)
-- Dependencies: 449
-- Name: france_restaurant_service_modes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_restaurant_service_modes_id_seq OWNED BY public.france_restaurant_service_modes.id;


--
-- TOC entry 385 (class 1259 OID 17271)
-- Name: france_restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4661 (class 0 OID 0)
-- Dependencies: 385
-- Name: france_restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_restaurants_id_seq OWNED BY public.france_restaurants.id;


--
-- TOC entry 405 (class 1259 OID 17646)
-- Name: france_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    phone_whatsapp character varying(20) NOT NULL,
    state character varying(50) DEFAULT 'INITIAL'::character varying,
    context jsonb DEFAULT '{}'::jsonb,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 4662 (class 0 OID 0)
-- Dependencies: 405
-- Name: TABLE france_sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_sessions IS 'Sessions utilisateurs pour le bot WhatsApp France';


--
-- TOC entry 4663 (class 0 OID 0)
-- Dependencies: 405
-- Name: COLUMN france_sessions.phone_whatsapp; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_sessions.phone_whatsapp IS 'Numéro de téléphone WhatsApp de l''utilisateur';


--
-- TOC entry 4664 (class 0 OID 0)
-- Dependencies: 405
-- Name: COLUMN france_sessions.state; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_sessions.state IS 'État actuel de la conversation (INITIAL, VIEWING_MENU, etc.)';


--
-- TOC entry 4665 (class 0 OID 0)
-- Dependencies: 405
-- Name: COLUMN france_sessions.context; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_sessions.context IS 'Données de contexte de la session (restaurant sélectionné, panier, etc.)';


--
-- TOC entry 4666 (class 0 OID 0)
-- Dependencies: 405
-- Name: COLUMN france_sessions.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.france_sessions.expires_at IS 'Date d''expiration de la session (30 minutes par défaut)';


--
-- TOC entry 400 (class 1259 OID 17402)
-- Name: france_user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_user_sessions (
    id integer NOT NULL,
    phone_number character varying(20) NOT NULL,
    chat_id character varying(255),
    restaurant_id integer,
    current_step character varying(100),
    session_data jsonb DEFAULT '{}'::jsonb,
    cart_items jsonb DEFAULT '[]'::jsonb,
    total_amount numeric(8,2) DEFAULT 0,
    expires_at timestamp without time zone DEFAULT (now() + '00:30:00'::interval),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    workflow_state jsonb DEFAULT '{}'::jsonb,
    current_step_id character varying(100),
    step_data jsonb DEFAULT '{}'::jsonb,
    workflow_context jsonb DEFAULT '{}'::jsonb,
    bot_state jsonb DEFAULT '{"mode": "menu_browsing", "context": {}, "language": "fr"}'::jsonb,
    current_workflow_id character varying,
    workflow_data jsonb DEFAULT '{}'::jsonb,
    workflow_step_id character varying
);


--
-- TOC entry 4667 (class 0 OID 0)
-- Dependencies: 400
-- Name: TABLE france_user_sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_user_sessions IS 'Sessions utilisateur avec panier et état';


--
-- TOC entry 399 (class 1259 OID 17401)
-- Name: france_user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4668 (class 0 OID 0)
-- Dependencies: 399
-- Name: france_user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_user_sessions_id_seq OWNED BY public.france_user_sessions.id;


--
-- TOC entry 404 (class 1259 OID 17441)
-- Name: france_whatsapp_numbers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_whatsapp_numbers (
    id integer NOT NULL,
    restaurant_id integer,
    whatsapp_number character varying(20) NOT NULL,
    description character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 4669 (class 0 OID 0)
-- Dependencies: 404
-- Name: TABLE france_whatsapp_numbers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.france_whatsapp_numbers IS 'Numéros WhatsApp autorisés par restaurant';


--
-- TOC entry 403 (class 1259 OID 17440)
-- Name: france_whatsapp_numbers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_whatsapp_numbers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4670 (class 0 OID 0)
-- Dependencies: 403
-- Name: france_whatsapp_numbers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_whatsapp_numbers_id_seq OWNED BY public.france_whatsapp_numbers.id;


--
-- TOC entry 446 (class 1259 OID 31606)
-- Name: france_workflow_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.france_workflow_templates (
    id integer NOT NULL,
    restaurant_id integer,
    template_name character varying(100) NOT NULL,
    description text,
    steps_config jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 445 (class 1259 OID 31605)
-- Name: france_workflow_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.france_workflow_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4671 (class 0 OID 0)
-- Dependencies: 445
-- Name: france_workflow_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.france_workflow_templates_id_seq OWNED BY public.france_workflow_templates.id;


--
-- TOC entry 438 (class 1259 OID 31169)
-- Name: message_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_templates (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    template_key character varying(100) NOT NULL,
    language character varying(10) DEFAULT 'fr'::character varying NOT NULL,
    template_content text NOT NULL,
    variables jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 437 (class 1259 OID 31168)
-- Name: message_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4672 (class 0 OID 0)
-- Dependencies: 437
-- Name: message_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_templates_id_seq OWNED BY public.message_templates.id;


--
-- TOC entry 432 (class 1259 OID 31101)
-- Name: restaurant_bot_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.restaurant_bot_configs (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    config_name character varying(100) DEFAULT 'main'::character varying NOT NULL,
    brand_name character varying(200) NOT NULL,
    welcome_message text NOT NULL,
    available_workflows jsonb DEFAULT '[]'::jsonb NOT NULL,
    features jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 431 (class 1259 OID 31100)
-- Name: restaurant_bot_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.restaurant_bot_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4673 (class 0 OID 0)
-- Dependencies: 431
-- Name: restaurant_bot_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.restaurant_bot_configs_id_seq OWNED BY public.restaurant_bot_configs.id;


--
-- TOC entry 442 (class 1259 OID 31259)
-- Name: state_transitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.state_transitions (
    id integer NOT NULL,
    from_state character varying(100),
    to_state character varying(100) NOT NULL,
    trigger_condition jsonb NOT NULL,
    priority integer DEFAULT 100,
    is_active boolean DEFAULT true
);


--
-- TOC entry 441 (class 1259 OID 31258)
-- Name: state_transitions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.state_transitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4674 (class 0 OID 0)
-- Dependencies: 441
-- Name: state_transitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.state_transitions_id_seq OWNED BY public.state_transitions.id;


--
-- TOC entry 440 (class 1259 OID 31245)
-- Name: step_executor_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.step_executor_mappings (
    id integer NOT NULL,
    step_type character varying(50) NOT NULL,
    executor_class character varying(100) NOT NULL,
    configuration jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 439 (class 1259 OID 31244)
-- Name: step_executor_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.step_executor_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4675 (class 0 OID 0)
-- Dependencies: 439
-- Name: step_executor_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.step_executor_mappings_id_seq OWNED BY public.step_executor_mappings.id;


--
-- TOC entry 451 (class 1259 OID 38002)
-- Name: v_restaurant_available_modes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_restaurant_available_modes AS
 SELECT r.id AS restaurant_id,
    r.name AS restaurant_name,
    rsm.service_mode,
    rsm.display_name,
    rsm.is_enabled,
    rsm.display_order,
    rsm.config
   FROM (public.france_restaurants r
     LEFT JOIN public.france_restaurant_service_modes rsm ON ((r.id = rsm.restaurant_id)))
  WHERE ((r.is_active = true) AND ((rsm.is_enabled = true) OR (rsm.is_enabled IS NULL)))
  ORDER BY r.id, rsm.display_order;


--
-- TOC entry 454 (class 1259 OID 39365)
-- Name: v_restaurant_pizza_display_config; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_restaurant_pizza_display_config AS
 SELECT r.id AS restaurant_id,
    r.name AS restaurant_name,
    COALESCE(s.use_unified_display, true) AS use_unified_display,
        CASE
            WHEN (rt.steps_config IS NOT NULL) THEN rt.steps_config
            ELSE COALESCE(( SELECT france_workflow_templates.steps_config
               FROM public.france_workflow_templates
              WHERE ((france_workflow_templates.restaurant_id IS NULL) AND ((france_workflow_templates.template_name)::text = 'pizza_unified_display_default'::text))), '{}'::jsonb)
        END AS display_config,
    COALESCE(s.custom_settings, '{}'::jsonb) AS custom_settings
   FROM ((public.france_restaurants r
     LEFT JOIN public.france_pizza_display_settings s ON ((r.id = s.restaurant_id)))
     LEFT JOIN public.france_workflow_templates rt ON (((r.id = rt.restaurant_id) AND ((rt.template_name)::text = 'pizza_unified_display'::text))));


--
-- TOC entry 434 (class 1259 OID 31123)
-- Name: workflow_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_definitions (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    workflow_id character varying(100) NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    trigger_conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
    steps jsonb DEFAULT '[]'::jsonb NOT NULL,
    max_duration_minutes integer DEFAULT 30,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 433 (class 1259 OID 31122)
-- Name: workflow_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4676 (class 0 OID 0)
-- Dependencies: 433
-- Name: workflow_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_definitions_id_seq OWNED BY public.workflow_definitions.id;


--
-- TOC entry 436 (class 1259 OID 31145)
-- Name: workflow_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_steps (
    id integer NOT NULL,
    workflow_id integer NOT NULL,
    step_id character varying(100) NOT NULL,
    step_order integer NOT NULL,
    step_type character varying(50) NOT NULL,
    title character varying(300) NOT NULL,
    description text,
    selection_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    validation_rules jsonb DEFAULT '[]'::jsonb NOT NULL,
    display_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    next_step_logic jsonb DEFAULT '{}'::jsonb NOT NULL,
    error_handling jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 435 (class 1259 OID 31144)
-- Name: workflow_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4677 (class 0 OID 0)
-- Dependencies: 435
-- Name: workflow_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_steps_id_seq OWNED BY public.workflow_steps.id;


--
-- TOC entry 455 (class 1259 OID 52021)
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- TOC entry 456 (class 1259 OID 52028)
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- TOC entry 3846 (class 2604 OID 16510)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4016 (class 2604 OID 70786)
-- Name: automation_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_logs ALTER COLUMN id SET DEFAULT nextval('public.automation_logs_id_seq'::regclass);


--
-- TOC entry 3954 (class 2604 OID 25729)
-- Name: delivery_driver_actions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_driver_actions ALTER COLUMN id SET DEFAULT nextval('public.delivery_driver_actions_id_seq'::regclass);


--
-- TOC entry 3958 (class 2604 OID 25779)
-- Name: delivery_order_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_order_logs ALTER COLUMN id SET DEFAULT nextval('public.delivery_order_logs_id_seq'::regclass);


--
-- TOC entry 3956 (class 2604 OID 25754)
-- Name: delivery_refusals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_refusals ALTER COLUMN id SET DEFAULT nextval('public.delivery_refusals_id_seq'::regclass);


--
-- TOC entry 3948 (class 2604 OID 25705)
-- Name: delivery_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_tokens ALTER COLUMN id SET DEFAULT nextval('public.delivery_tokens_id_seq'::regclass);


--
-- TOC entry 3936 (class 2604 OID 20807)
-- Name: france_auth_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_auth_sessions ALTER COLUMN id SET DEFAULT nextval('public.france_auth_sessions_id_seq'::regclass);


--
-- TOC entry 3893 (class 2604 OID 17392)
-- Name: france_composite_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_composite_items ALTER COLUMN id SET DEFAULT nextval('public.france_composite_items_id_seq'::regclass);


--
-- TOC entry 3924 (class 2604 OID 20458)
-- Name: france_customer_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_customer_addresses ALTER COLUMN id SET DEFAULT nextval('public.france_customer_addresses_id_seq'::regclass);


--
-- TOC entry 3939 (class 2604 OID 21580)
-- Name: france_delivery_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_assignments ALTER COLUMN id SET DEFAULT nextval('public.france_delivery_assignments_id_seq'::regclass);


--
-- TOC entry 3929 (class 2604 OID 20784)
-- Name: france_delivery_drivers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_drivers ALTER COLUMN id SET DEFAULT nextval('public.france_delivery_drivers_id_seq'::regclass);


--
-- TOC entry 3942 (class 2604 OID 21606)
-- Name: france_delivery_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_notifications ALTER COLUMN id SET DEFAULT nextval('public.france_delivery_notifications_id_seq'::regclass);


--
-- TOC entry 3946 (class 2604 OID 21629)
-- Name: france_driver_locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_driver_locations ALTER COLUMN id SET DEFAULT nextval('public.france_driver_locations_id_seq'::regclass);


--
-- TOC entry 3866 (class 2604 OID 17293)
-- Name: france_menu_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_menu_categories ALTER COLUMN id SET DEFAULT nextval('public.france_menu_categories_id_seq'::regclass);


--
-- TOC entry 3907 (class 2604 OID 17427)
-- Name: france_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_orders ALTER COLUMN id SET DEFAULT nextval('public.france_orders_id_seq'::regclass);


--
-- TOC entry 4011 (class 2604 OID 39349)
-- Name: france_pizza_display_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_pizza_display_settings ALTER COLUMN id SET DEFAULT nextval('public.france_pizza_display_settings_id_seq'::regclass);


--
-- TOC entry 3998 (class 2604 OID 31595)
-- Name: france_product_display_configs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_display_configs ALTER COLUMN id SET DEFAULT nextval('public.france_product_display_configs_id_seq'::regclass);


--
-- TOC entry 3881 (class 2604 OID 17361)
-- Name: france_product_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_options ALTER COLUMN id SET DEFAULT nextval('public.france_product_options_id_seq'::regclass);


--
-- TOC entry 3888 (class 2604 OID 17378)
-- Name: france_product_sizes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_sizes ALTER COLUMN id SET DEFAULT nextval('public.france_product_sizes_id_seq'::regclass);


--
-- TOC entry 3877 (class 2604 OID 17344)
-- Name: france_product_variants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_variants ALTER COLUMN id SET DEFAULT nextval('public.france_product_variants_id_seq'::regclass);


--
-- TOC entry 3871 (class 2604 OID 17321)
-- Name: france_products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_products ALTER COLUMN id SET DEFAULT nextval('public.france_products_id_seq'::regclass);


--
-- TOC entry 3960 (class 2604 OID 29432)
-- Name: france_restaurant_features id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_restaurant_features ALTER COLUMN id SET DEFAULT nextval('public.france_restaurant_features_id_seq'::regclass);


--
-- TOC entry 4005 (class 2604 OID 37982)
-- Name: france_restaurant_service_modes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_restaurant_service_modes ALTER COLUMN id SET DEFAULT nextval('public.france_restaurant_service_modes_id_seq'::regclass);


--
-- TOC entry 3852 (class 2604 OID 17275)
-- Name: france_restaurants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_restaurants ALTER COLUMN id SET DEFAULT nextval('public.france_restaurants_id_seq'::regclass);


--
-- TOC entry 3895 (class 2604 OID 17405)
-- Name: france_user_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_user_sessions ALTER COLUMN id SET DEFAULT nextval('public.france_user_sessions_id_seq'::regclass);


--
-- TOC entry 3914 (class 2604 OID 17444)
-- Name: france_whatsapp_numbers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_whatsapp_numbers ALTER COLUMN id SET DEFAULT nextval('public.france_whatsapp_numbers_id_seq'::regclass);


--
-- TOC entry 4002 (class 2604 OID 31609)
-- Name: france_workflow_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_workflow_templates ALTER COLUMN id SET DEFAULT nextval('public.france_workflow_templates_id_seq'::regclass);


--
-- TOC entry 3985 (class 2604 OID 31172)
-- Name: message_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_templates ALTER COLUMN id SET DEFAULT nextval('public.message_templates_id_seq'::regclass);


--
-- TOC entry 3962 (class 2604 OID 31104)
-- Name: restaurant_bot_configs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_bot_configs ALTER COLUMN id SET DEFAULT nextval('public.restaurant_bot_configs_id_seq'::regclass);


--
-- TOC entry 3995 (class 2604 OID 31262)
-- Name: state_transitions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.state_transitions ALTER COLUMN id SET DEFAULT nextval('public.state_transitions_id_seq'::regclass);


--
-- TOC entry 3991 (class 2604 OID 31248)
-- Name: step_executor_mappings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_executor_mappings ALTER COLUMN id SET DEFAULT nextval('public.step_executor_mappings_id_seq'::regclass);


--
-- TOC entry 3969 (class 2604 OID 31126)
-- Name: workflow_definitions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_definitions ALTER COLUMN id SET DEFAULT nextval('public.workflow_definitions_id_seq'::regclass);


--
-- TOC entry 3976 (class 2604 OID 31148)
-- Name: workflow_steps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps ALTER COLUMN id SET DEFAULT nextval('public.workflow_steps_id_seq'::regclass);


--
-- TOC entry 4574 (class 0 OID 70783)
-- Dependencies: 458
-- Data for Name: automation_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automation_logs (id, action, details, created_at, success) FROM stdin;
\.


--
-- TOC entry 4544 (class 0 OID 25726)
-- Dependencies: 424
-- Data for Name: delivery_driver_actions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_driver_actions (id, order_id, driver_id, token_id, action_type, action_timestamp, details) FROM stdin;
41	147	6	30	notified	2025-09-18 19:03:40.127231	{"method": "whatsapp", "expires_at": "2025-09-18T19:18:39", "token_generated_at": "2025-09-18T17:03:39.703Z"}
42	147	6	30	accepted	2025-09-18 19:05:24.939843	{"token": "0r5EkUVPu0uRUxjVK4Wf5qDf5nAq28BU", "timestamp": "2025-09-18T19:05:24.939843+02:00"}
\.


--
-- TOC entry 4548 (class 0 OID 25776)
-- Dependencies: 428
-- Data for Name: delivery_order_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_order_logs (id, order_id, action_type, details, created_at) FROM stdin;
\.


--
-- TOC entry 4546 (class 0 OID 25751)
-- Dependencies: 426
-- Data for Name: delivery_refusals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_refusals (id, order_id, driver_id, token_id, reason, custom_reason, refused_at) FROM stdin;
\.


--
-- TOC entry 4542 (class 0 OID 25702)
-- Dependencies: 422
-- Data for Name: delivery_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_tokens (id, token, order_id, driver_id, created_at, expires_at, absolute_expires_at, used, suspended, reactivated, updated_at) FROM stdin;
30	0r5EkUVPu0uRUxjVK4Wf5qDf5nAq28BU	147	6	2025-09-18 19:03:40.040719	2025-09-18 22:05:24.939843	2025-09-18 21:03:39	t	f	f	2025-09-18 19:05:24.939843
\.


--
-- TOC entry 4534 (class 0 OID 20804)
-- Dependencies: 412
-- Data for Name: france_auth_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_auth_sessions (id, user_id, user_type, session_token, expires_at, created_at, last_accessed, ip_address, user_agent) FROM stdin;
1	1	restaurant	1756844185217_U4x4PKnMnHVQgennvWYYC5i4PW6XRxXN	2025-09-03 22:16:25.217+02	2025-09-02 22:16:29.194405+02	2025-09-02 22:16:29.194405+02	\N	\N
2	1	restaurant	1756844237737_Lrae2NuC9nyQVBqyLWpVrU6gDsE2ePYY	2025-09-03 22:17:17.737+02	2025-09-02 22:17:21.689119+02	2025-09-02 22:17:21.689119+02	\N	\N
3	1	restaurant	1756844397950_wQi5XKszlLtbumJsfVQ3IStai1eea6HF	2025-09-03 22:19:57.95+02	2025-09-02 22:20:01.911981+02	2025-09-02 22:20:01.911981+02	\N	\N
4	1	restaurant	1756844434071_FRdHrvMSTnkYf55gdrtIrx2woFHArmqg	2025-09-03 22:20:34.071+02	2025-09-02 22:20:38.031214+02	2025-09-02 22:20:38.031214+02	\N	\N
5	1	restaurant	1756844698946_SUMTYnB8LERpck2rif9BDoJt60JgjCb6	2025-09-03 22:24:58.947+02	2025-09-02 22:25:02.929708+02	2025-09-02 22:25:02.929708+02	\N	\N
6	1	restaurant	1756844777036_UayPmNTfACE5WQ7FffLgBCPv4tuNOOjd	2025-09-03 22:26:17.036+02	2025-09-02 22:26:20.990427+02	2025-09-02 22:26:20.990427+02	\N	\N
7	1	restaurant	1756844827529_vLDXdECzFcM8kBqoraUOYlWGifD3iDCf	2025-09-03 22:27:07.529+02	2025-09-02 22:27:11.485833+02	2025-09-02 22:27:11.485833+02	\N	\N
8	1	restaurant	1756844883232_qwS5pm3ybJvNpeetUi5FMIdSDIUHUQ3b	2025-09-03 22:28:03.232+02	2025-09-02 22:28:07.18317+02	2025-09-02 22:28:07.18317+02	\N	\N
9	1	restaurant	1756845162744_qsJuY5sNixYZAnKIiaHPZ10cPKBEq6zi	2025-09-03 22:32:42.744+02	2025-09-02 22:32:46.726501+02	2025-09-02 22:32:46.726501+02	\N	\N
10	1	restaurant	1756845808872_GNZ0K8qS41tV36fp9GjZpkScv8cXL0Hj	2025-09-03 22:43:28.872+02	2025-09-02 22:43:32.87336+02	2025-09-02 22:43:32.87336+02	\N	\N
11	1	restaurant	1756846003949_1cs21TBSXczjzre1cxs9PjouDNDr9X5X	2025-09-03 22:46:43.949+02	2025-09-02 22:46:47.945214+02	2025-09-02 22:46:47.945214+02	\N	\N
12	1	restaurant	1756846029944_SiPS8v09yOarGhNv4aB3tw4rLCSyaxaI	2025-09-03 22:47:09.944+02	2025-09-02 22:47:13.952511+02	2025-09-02 22:47:13.952511+02	\N	\N
13	1	restaurant	1756846049574_5QAirstOFe5yKCZEL9kzZzukcukYenwj	2025-09-03 22:47:29.574+02	2025-09-02 22:47:33.562379+02	2025-09-02 22:47:33.562379+02	\N	\N
14	1	restaurant	1756847517195_Z5EOKhtWwSsmZemN7IAmXx7HLsDrlElt	2025-09-03 23:11:57.195+02	2025-09-02 23:12:01.229354+02	2025-09-02 23:12:01.229354+02	\N	\N
15	1	restaurant	1756847720692_Rdh610exYXEPa9tnB1xetwNJbNDIgBlJ	2025-09-03 23:15:20.692+02	2025-09-02 23:15:24.721301+02	2025-09-02 23:15:24.721301+02	\N	\N
16	1	restaurant	1756847740832_agZPYywW1iKRGiSwyc7QWyt2EeT4G1Tg	2025-09-03 23:15:40.832+02	2025-09-02 23:15:44.850803+02	2025-09-02 23:15:44.850803+02	\N	\N
17	1	restaurant	1756847750613_vw5uQ0wJjuy45mH1L7yuvNUM0P4Nb1A4	2025-09-03 23:15:50.613+02	2025-09-02 23:15:54.637146+02	2025-09-02 23:15:54.637146+02	\N	\N
18	1	restaurant	1756848229256_0bmkFv4hmoJPJZd3hvftLwg61JKgqwKf	2025-09-03 23:23:49.256+02	2025-09-02 23:23:53.336534+02	2025-09-02 23:23:53.336534+02	\N	\N
19	1	restaurant	1756848360626_dcA6E4SfSsN8lqz4iFmvBolS5KlqcVfV	2025-09-03 23:26:00.626+02	2025-09-02 23:26:04.668671+02	2025-09-02 23:26:04.668671+02	\N	\N
20	1	restaurant	1756848497792_vZ8RYa2ALl4yk7iPXKN5kWezW8G9IyRh	2025-09-03 23:28:17.792+02	2025-09-02 23:28:21.834148+02	2025-09-02 23:28:21.834148+02	\N	\N
21	1	restaurant	1756848564386_d1MD8XTXq2Slf1YuFq7q8JNJ6Kxu4WJO	2025-09-03 23:29:24.386+02	2025-09-02 23:29:28.448159+02	2025-09-02 23:29:28.448159+02	\N	\N
22	1	restaurant	1756848683812_n25u0V9uWETmT7SDP70uKA6obzFHxM0h	2025-09-03 23:31:23.812+02	2025-09-02 23:31:27.866469+02	2025-09-02 23:31:27.866469+02	\N	\N
23	1	restaurant	1756848849522_wmdRetTdLvBz5P4BUUCfmQqOAPX3unR2	2025-09-03 23:34:09.522+02	2025-09-02 23:34:13.572193+02	2025-09-02 23:34:13.572193+02	\N	\N
24	1	restaurant	1756848924882_3QLbGmTzoH6NyTAozhkjnd4fINH9gbFj	2025-09-03 23:35:24.882+02	2025-09-02 23:35:28.922341+02	2025-09-02 23:35:28.922341+02	\N	\N
25	1	restaurant	1756849092474_1c4ShBo4OjiU3RMUKXJotfM3iSJCVg9k	2025-09-03 23:38:12.474+02	2025-09-02 23:38:16.525769+02	2025-09-02 23:38:16.525769+02	\N	\N
26	1	restaurant	1756849170465_JYUeAChIpmjcBLeDMQ62OJlqZbiLSbQ4	2025-09-03 23:39:30.465+02	2025-09-02 23:39:34.516463+02	2025-09-02 23:39:34.516463+02	\N	\N
27	1	restaurant	1756849300898_3h6VdfxqS4U5GPFjYoU3Pd3lJQhOuGgT	2025-09-03 23:41:40.898+02	2025-09-02 23:41:44.953982+02	2025-09-02 23:41:44.953982+02	\N	\N
28	1	restaurant	1756849785233_JXyRvfrT1Ylh9yY9jWZjY0InePzr5Zyr	2025-09-03 23:49:45.233+02	2025-09-02 23:49:49.297854+02	2025-09-02 23:49:49.297854+02	\N	\N
29	1	restaurant	1756850038280_O3iA5HYe1aX6FXbytSKhidK3MQm3kxFD	2025-09-03 23:53:58.28+02	2025-09-02 23:54:02.450349+02	2025-09-02 23:54:02.450349+02	\N	\N
30	1	restaurant	1756850546291_HRh9fi0MWT2rs651RH5vRdBaAU4UsJvC	2025-09-04 00:02:26.291+02	2025-09-03 00:02:30.39509+02	2025-09-03 00:02:30.39509+02	\N	\N
31	1	restaurant	1756850751059_bNJOzJU5e6yGKQbjp2GBKNaTk0FHxidi	2025-09-04 00:05:51.059+02	2025-09-03 00:05:55.14387+02	2025-09-03 00:05:55.14387+02	\N	\N
32	1	restaurant	1756851096106_BevFADHRMuAwSdYHGRdQtifsJLGieB69	2025-09-04 00:11:36.106+02	2025-09-03 00:11:40.203747+02	2025-09-03 00:11:40.203747+02	\N	\N
33	1	restaurant	1756851188301_GkHbtYT1CycxMgiWxwqnYpt4LVsQ5Ne4	2025-09-04 00:13:08.301+02	2025-09-03 00:13:12.412176+02	2025-09-03 00:13:12.412176+02	\N	\N
34	1	restaurant	1756851594397_PyLE8TA1X7ZnFEKs869fYrweK8ejTwiM	2025-09-04 00:19:54.397+02	2025-09-03 00:19:58.495346+02	2025-09-03 00:19:58.495346+02	\N	\N
35	1	restaurant	1756851623029_Bur3wZ5CToD2nXwDCyDzk5v2IHxUmTen	2025-09-04 00:20:23.029+02	2025-09-03 00:20:27.136403+02	2025-09-03 00:20:27.136403+02	\N	\N
36	1	restaurant	1756851934749_3H8ibO4M7o0z6k3WDoU0SnY0qKL26DTh	2025-09-04 00:25:34.749+02	2025-09-03 00:25:38.895826+02	2025-09-03 00:25:38.895826+02	\N	\N
37	1	restaurant	1756852296258_JEAEfmyeSU0gmRIfmAmZFjhTFB7H4q8m	2025-09-04 00:31:36.258+02	2025-09-03 00:31:40.418135+02	2025-09-03 00:31:40.418135+02	\N	\N
38	1	restaurant	1756852420005_nO4yfO60fWtsnns0RsrRz61Hlbzpe4KV	2025-09-04 00:33:40.005+02	2025-09-03 00:33:44.129013+02	2025-09-03 00:33:44.129013+02	\N	\N
39	1	restaurant	1756852896854_YFyZFCHzKPfHVnkD6URkm73EacqmlNPM	2025-09-04 00:41:36.854+02	2025-09-03 00:41:41.018535+02	2025-09-03 00:41:41.018535+02	\N	\N
40	1	restaurant	1756853054066_XIImOCAXrrWouFidfQKd6p6g6p1vJzWd	2025-09-04 00:44:14.066+02	2025-09-03 00:44:18.199672+02	2025-09-03 00:44:18.199672+02	\N	\N
41	1	restaurant	1756853274017_opOVuArtsZXEbNpDSb7zHvSb6loZOXmT	2025-09-04 00:47:54.018+02	2025-09-03 00:47:58.162464+02	2025-09-03 00:47:58.162464+02	\N	\N
42	1	restaurant	1756883180834_zmGC7ACHsLGGPTeFVi9UkHSLzCvYIViY	2025-09-04 09:06:20.834+02	2025-09-03 09:06:25.101541+02	2025-09-03 09:06:25.101541+02	\N	\N
43	1	restaurant	1756883345964_XbOnRxmG79M9UL2QROmC7YiMgKvsHLTa	2025-09-04 09:09:05.964+02	2025-09-03 09:09:10.17985+02	2025-09-03 09:09:10.17985+02	\N	\N
44	1	restaurant	1756884936761_MSvdacOPSZw5mdI3FqCw5QQONZY6shrn	2025-09-04 09:35:36.761+02	2025-09-03 09:35:41.041847+02	2025-09-03 09:35:41.041847+02	\N	\N
45	1	restaurant	1756886471287_rPzg4ypraZrqy0PfaFo8d3Q9MEhNKEGo	2025-09-04 10:01:11.287+02	2025-09-03 10:01:15.974111+02	2025-09-03 10:01:15.974111+02	\N	\N
46	1	restaurant	1756886499802_spGlnEWp68TpClMBroD4BVGrgnU5n5Am	2025-09-04 10:01:39.802+02	2025-09-03 10:01:44.452075+02	2025-09-03 10:01:44.452075+02	\N	\N
47	1	restaurant	1756886948301_vf7lo7FxvHufvx3Lh0SoA7GEIdLuEz4k	2025-09-04 10:09:08.301+02	2025-09-03 10:09:12.891385+02	2025-09-03 10:09:12.891385+02	\N	\N
48	1	restaurant	1756887185768_ppNeznxwnPsmZTcuvkTDT3ED1kNa1aso	2025-09-04 10:13:05.768+02	2025-09-03 10:13:10.365548+02	2025-09-03 10:13:10.365548+02	\N	\N
49	1	restaurant	1756887316214_lfIBhGafXO7aFpdwHNWv0NdKKBl2cGwM	2025-09-04 10:15:16.214+02	2025-09-03 10:15:20.907303+02	2025-09-03 10:15:20.907303+02	\N	\N
50	1	restaurant	1756887676973_HZN34rl9JYyTND3JBBWJwEry17vDj761	2025-09-04 10:21:16.973+02	2025-09-03 10:21:21.631375+02	2025-09-03 10:21:21.631375+02	\N	\N
51	1	restaurant	1756887961800_fZRfyAuw5HomRJIigHMYVM1BSXZ0zOAQ	2025-09-04 10:26:01.8+02	2025-09-03 10:26:06.4158+02	2025-09-03 10:26:06.4158+02	\N	\N
52	1	restaurant	1756890024736_JXQIIsPi4ct5o6K9GUhpDCJaJ2BPbVsP	2025-09-04 11:00:24.736+02	2025-09-03 11:00:29.421829+02	2025-09-03 11:00:29.421829+02	\N	\N
53	1	restaurant	1756890144537_vYhHZ1TTwRnDnliZR7W1sGF4QPYeNCal	2025-09-04 11:02:24.537+02	2025-09-03 11:02:29.257277+02	2025-09-03 11:02:29.257277+02	\N	\N
54	1	restaurant	1756890249863_y8QrgOvbKi4zEnKxVXSrHN79cx1mq6Kj	2025-09-04 11:04:09.863+02	2025-09-03 11:04:14.52761+02	2025-09-03 11:04:14.52761+02	\N	\N
55	1	restaurant	1756891948954_teasytsW17TZRBdJXF9Ur6kgx49rtS0K	2025-09-04 11:32:28.954+02	2025-09-03 11:32:33.665575+02	2025-09-03 11:32:33.665575+02	\N	\N
56	1	driver	1756892010961_ORSysikq8kKmpR7pl7QVsao33X311Ovg	2025-09-04 11:33:30.961+02	2025-09-03 11:33:35.72646+02	2025-09-03 11:33:35.72646+02	\N	\N
57	1	driver	1756892234347_Uas5dlxzVSEdiCNdMGt5Mx7d5KeMNUsA	2025-09-04 11:37:14.348+02	2025-09-03 11:37:19.09244+02	2025-09-03 11:37:19.09244+02	\N	\N
58	1	driver	1756892348268_p7w2ERlUXEwY89YcSGhGacdToC20IjlQ	2025-09-04 11:39:08.268+02	2025-09-03 11:39:12.994258+02	2025-09-03 11:39:12.994258+02	\N	\N
59	1	driver	1756892516722_U4LdMffDwHBMpkxEV4FYWTUZYNkHW3Mz	2025-09-04 11:41:56.722+02	2025-09-03 11:42:01.445542+02	2025-09-03 11:42:01.445542+02	\N	\N
60	1	driver	1756892890239_DTMD1s77WcEC0OPt5TDILH72skEA9Bof	2025-09-04 11:48:10.24+02	2025-09-03 11:48:14.992435+02	2025-09-03 11:48:14.992435+02	\N	\N
61	1	driver	1756894154149_CF2hVmeeMYq4i0NRVLcgj8oaeRKfvJUf	2025-09-04 12:09:14.149+02	2025-09-03 12:09:18.964301+02	2025-09-03 12:09:18.964301+02	\N	\N
62	1	driver	1756894732729_8psWAffxNTgMFc8RcWOij5U8VKrM5Wen	2025-09-04 12:18:52.729+02	2025-09-03 12:18:57.534821+02	2025-09-03 12:18:57.534821+02	\N	\N
63	1	restaurant	1756894813068_7j22PRPdZDbYs5eZpJtRXoRzidIPPvUV	2025-09-04 12:20:13.068+02	2025-09-03 12:20:17.902247+02	2025-09-03 12:20:17.902247+02	\N	\N
64	1	driver	1756895265076_KFAXmaX1DnqTRKIHc1u6gKtzgRBiFisZ	2025-09-04 12:27:45.076+02	2025-09-03 12:27:49.896138+02	2025-09-03 12:27:49.896138+02	\N	\N
65	1	driver	1756895688117_1szQnbMvKcMDz2O2WPeMpM4gxDk4c3tR	2025-09-04 12:34:48.118+02	2025-09-03 12:34:52.982139+02	2025-09-03 12:34:52.982139+02	\N	\N
66	1	driver	1756895936822_PSfXCGPVlhxZ4No44bCb4OG0VkuQASTH	2025-09-04 12:38:56.822+02	2025-09-03 12:39:01.653382+02	2025-09-03 12:39:01.653382+02	\N	\N
67	1	driver	1756896376282_c8hzXAsq4qrrRZsk3Lt3i4hnfO6tRkEN	2025-09-04 12:46:16.282+02	2025-09-03 12:46:21.141097+02	2025-09-03 12:46:21.141097+02	\N	\N
68	1	driver	1756896963066_Lhm8kysRDHzdUQJx3FdK21CFHOsBUSx0	2025-09-04 12:56:03.066+02	2025-09-03 12:56:07.931553+02	2025-09-03 12:56:07.931553+02	\N	\N
69	1	restaurant	1756896989239_qWISjB0ph9d9acpHAtUTA3DNByeeij5E	2025-09-04 12:56:29.239+02	2025-09-03 12:56:34.083168+02	2025-09-03 12:56:34.083168+02	\N	\N
70	1	driver	1756897419546_F7S62uc4WF3Q0R699xIf5h16kumHvyyf	2025-09-04 13:03:39.546+02	2025-09-03 13:03:44.49304+02	2025-09-03 13:03:44.49304+02	\N	\N
71	1	driver	1756897865555_ZmHZep2peNexA82KvCCG8MbeKAJZPu2f	2025-09-04 13:11:05.555+02	2025-09-03 13:11:10.447892+02	2025-09-03 13:11:10.447892+02	\N	\N
72	1	driver	1756898010559_MXmT7nwNluI9jXSuH4RxHOHuWs1Cpe6G	2025-09-04 13:13:30.559+02	2025-09-03 13:13:35.441136+02	2025-09-03 13:13:35.441136+02	\N	\N
73	1	driver	1756898078623_wT5w5GJwv2Cg6RZWbZ1RgpM0id9IXeN2	2025-09-04 13:14:38.623+02	2025-09-03 13:14:43.494556+02	2025-09-03 13:14:43.494556+02	\N	\N
74	1	driver	1756898191029_7CaeVRwOMX29sKyCOMDY255c0Qw6tFdy	2025-09-04 13:16:31.029+02	2025-09-03 13:16:35.914188+02	2025-09-03 13:16:35.914188+02	\N	\N
75	1	driver	1756898408026_t6ud2iKdPTMlKAl1Of6Vw5sT9y7CXIyv	2025-09-04 13:20:08.026+02	2025-09-03 13:20:12.932642+02	2025-09-03 13:20:12.932642+02	\N	\N
76	1	driver	1756898842984_CS6Rywyh2Z8Kj2JFXUQ1L2ChgX7Va4ZV	2025-09-04 13:27:22.984+02	2025-09-03 13:27:27.885532+02	2025-09-03 13:27:27.885532+02	\N	\N
77	1	driver	1756898950975_cZTk2pFB3Qdqcf86bukBOLPlK4gR1Xgk	2025-09-04 13:29:10.975+02	2025-09-03 13:29:15.873004+02	2025-09-03 13:29:15.873004+02	\N	\N
78	1	driver	1756899022373_qS9xAS7c3eEZfNmaBgomaIwMo2Thrp5w	2025-09-04 13:30:22.373+02	2025-09-03 13:30:27.277059+02	2025-09-03 13:30:27.277059+02	\N	\N
79	1	driver	1756899181105_t8BfcpwQfistnrVfn4ZFxUbHI3dm1c00	2025-09-04 13:33:01.105+02	2025-09-03 13:33:06.010802+02	2025-09-03 13:33:06.010802+02	\N	\N
80	1	driver	1756899407905_SIbUnJg4hHYHsV35QrSLLFF5Q1uafvf8	2025-09-04 13:36:47.905+02	2025-09-03 13:36:52.846135+02	2025-09-03 13:36:52.846135+02	\N	\N
81	1	driver	1756899754786_clJ8u14nM1dvqKWwDsrrm78NpKJvnaXj	2025-09-04 13:42:34.786+02	2025-09-03 13:42:39.709584+02	2025-09-03 13:42:39.709584+02	\N	\N
82	1	driver	1756899788287_JYVUqpcZVdA4UmyZPE8KKqmnEAwjL4Jp	2025-09-04 13:43:08.287+02	2025-09-03 13:43:13.20847+02	2025-09-03 13:43:13.20847+02	\N	\N
83	1	driver	1756900092489_7UgDguzAXiBwUnarDRn9KHrnREIXRY8Y	2025-09-04 13:48:12.489+02	2025-09-03 13:48:17.422692+02	2025-09-03 13:48:17.422692+02	\N	\N
85	1	driver	1756902372202_WR6ImXrRBxw3x4hO27PH20KAE2vCcz2l	2025-09-04 14:26:12.202+02	2025-09-03 14:26:17.210453+02	2025-09-03 14:26:17.210453+02	\N	\N
86	1	driver	1756902440156_lHRRw7LfVthzVXLUps6mBBK5ob8psvCG	2025-09-04 14:27:20.156+02	2025-09-03 14:27:25.151806+02	2025-09-03 14:27:25.151806+02	\N	\N
87	1	driver	1756902707321_t7eh4vzcFFGTl8O0QWJVGFm3xrm45MyP	2025-09-04 14:31:47.321+02	2025-09-03 14:31:52.348942+02	2025-09-03 14:31:52.348942+02	\N	\N
88	1	driver	1756902841009_HXod06sDxQE1Ph63Oon5Ll6MDf8y5SYh	2025-09-04 14:34:01.009+02	2025-09-03 14:34:06.044389+02	2025-09-03 14:34:06.044389+02	\N	\N
89	1	driver	1756902952223_nMxTsl5RdzZNyByqzZnNluhOFM023hZj	2025-09-04 14:35:52.223+02	2025-09-03 14:35:57.248954+02	2025-09-03 14:35:57.248954+02	\N	\N
90	1	driver	1756903046504_G77Z9O3757gQaZrRozzpCKLAwGCyVLYr	2025-09-04 14:37:26.504+02	2025-09-03 14:37:31.575415+02	2025-09-03 14:37:31.575415+02	\N	\N
91	1	driver	1756903187875_LD1rxdFyAAw4G1LCCSoFNZcegm1PET1E	2025-09-04 14:39:47.875+02	2025-09-03 14:39:52.901167+02	2025-09-03 14:39:52.901167+02	\N	\N
92	1	driver	1756903370010_sdv6JgiEDcSPCllTu7c4k6hTEMWFMr4H	2025-09-04 14:42:50.01+02	2025-09-03 14:42:55.047473+02	2025-09-03 14:42:55.047473+02	\N	\N
93	1	driver	1756903389572_bxwhKqFah4BQY0RGbOJHCprnXRj5bJRI	2025-09-04 14:43:09.572+02	2025-09-03 14:43:14.606465+02	2025-09-03 14:43:14.606465+02	\N	\N
94	1	driver	1756903640466_SQfILGJv84AH46uAsPQI3QJdfwhSHfbf	2025-09-04 14:47:20.467+02	2025-09-03 14:47:25.497059+02	2025-09-03 14:47:25.497059+02	\N	\N
95	1	driver	1756903724785_fCILzeDWbTYGwYcxl6YnqITRX2YoAull	2025-09-04 14:48:44.785+02	2025-09-03 14:48:49.838247+02	2025-09-03 14:48:49.838247+02	\N	\N
96	1	driver	1756903869428_2fi33t0w5XK9Azo946POWOIjJTEfprtp	2025-09-04 14:51:09.428+02	2025-09-03 14:51:14.480981+02	2025-09-03 14:51:14.480981+02	\N	\N
97	1	driver	1756904050748_s3jpkprM2hqw3HknDFqd0IRjxuDMZqqY	2025-09-04 14:54:10.748+02	2025-09-03 14:54:15.811479+02	2025-09-03 14:54:15.811479+02	\N	\N
98	1	restaurant	1756904098620_b9extTsPQ4dos7HGIOIZkus47OOzu8qJ	2025-09-04 14:54:58.621+02	2025-09-03 14:55:03.703904+02	2025-09-03 14:55:03.703904+02	\N	\N
99	1	driver	1756904223922_IQTCW9sx8NwC0pEWfA2EBkBckssRR3ip	2025-09-04 14:57:03.922+02	2025-09-03 14:57:08.96494+02	2025-09-03 14:57:08.96494+02	\N	\N
100	1	driver	1756904252673_KIJPFjkFjfNFBjbiwbFLwiQiUhFcaZn1	2025-09-04 14:57:32.673+02	2025-09-03 14:57:37.727495+02	2025-09-03 14:57:37.727495+02	\N	\N
101	1	driver	1756904429599_8KvwiFKRG5Wx7yiDTc8Ho4c7ZSrElkMe	2025-09-04 15:00:29.599+02	2025-09-03 15:00:34.701548+02	2025-09-03 15:00:34.701548+02	\N	\N
102	1	driver	1756904518342_Juwf1jzGQfEUfE4ZhcAI8ckl0WHYKzeY	2025-09-04 15:01:58.342+02	2025-09-03 15:02:03.394952+02	2025-09-03 15:02:03.394952+02	\N	\N
103	1	driver	1756904639812_YIpGOhdv6MRpcfATxOByLyvH6wlqRNLg	2025-09-04 15:03:59.812+02	2025-09-03 15:04:04.87772+02	2025-09-03 15:04:04.87772+02	\N	\N
104	1	restaurant	1756904650463_Npgv3AglPhWaLE4i1gV9HpmBReAiZ3SL	2025-09-04 15:04:10.463+02	2025-09-03 15:04:15.512193+02	2025-09-03 15:04:15.512193+02	\N	\N
105	1	driver	1756904764296_Wm3u0mPTekacwSOMpMwVEDWgGUXCelWJ	2025-09-04 15:06:04.296+02	2025-09-03 15:06:09.352005+02	2025-09-03 15:06:09.352005+02	\N	\N
106	1	driver	1756904777864_aW3xH5d6baLuNN81DgIHnJiu65Qyl9kH	2025-09-04 15:06:17.864+02	2025-09-03 15:06:22.929239+02	2025-09-03 15:06:22.929239+02	\N	\N
107	1	driver	1756904863762_EtF6v5SKYHyEF1L8P0m7fi03CUWWAzY7	2025-09-04 15:07:43.762+02	2025-09-03 15:07:48.827814+02	2025-09-03 15:07:48.827814+02	\N	\N
108	1	driver	1756904916188_tNbNp1QKRQxSHMqMpzDpEt2KIvVIp0yy	2025-09-04 15:08:36.188+02	2025-09-03 15:08:41.269963+02	2025-09-03 15:08:41.269963+02	\N	\N
109	1	driver	1756905001286_1zDvrRGbqaJbnYKNhUD9LrvdLBWK1gJm	2025-09-04 15:10:01.286+02	2025-09-03 15:10:06.367463+02	2025-09-03 15:10:06.367463+02	\N	\N
110	1	driver	1756905051604_qORj1tkt33qw4ZLRAhfxOLqK2wqjNVZh	2025-09-04 15:10:51.604+02	2025-09-03 15:10:56.674191+02	2025-09-03 15:10:56.674191+02	\N	\N
111	1	driver	1756905115368_OcQUZ23QvnDQUFeosJEBB5VfZp6eZbbm	2025-09-04 15:11:55.368+02	2025-09-03 15:12:00.440763+02	2025-09-03 15:12:00.440763+02	\N	\N
112	1	driver	1756905219024_VgEqeTWj3ZNrjdrmQNgaSGfDf4Etne2T	2025-09-04 15:13:39.024+02	2025-09-03 15:13:44.110419+02	2025-09-03 15:13:44.110419+02	\N	\N
113	1	driver	1756905270434_2uHqY4fBuP6MfXy5g29HlFJjI4nuAQFR	2025-09-04 15:14:30.435+02	2025-09-03 15:14:35.518532+02	2025-09-03 15:14:35.518532+02	\N	\N
114	1	restaurant	1756905289981_30wrCmSrdMR3d3fwF3zU36CzJmd704Sd	2025-09-04 15:14:49.981+02	2025-09-03 15:14:55.078892+02	2025-09-03 15:14:55.078892+02	\N	\N
115	1	driver	1756905502050_0pidlk10r3e9krw83xPGsQS213oYOsMN	2025-09-04 15:18:22.05+02	2025-09-03 15:18:27.148657+02	2025-09-03 15:18:27.148657+02	\N	\N
116	1	driver	1756905591450_wbPs68KhSXAoaJ1DFLSSNrgLQVqgqbnc	2025-09-04 15:19:51.45+02	2025-09-03 15:19:56.541194+02	2025-09-03 15:19:56.541194+02	\N	\N
117	1	driver	1756905791275_F2AiKjvLDzy0Cp6o40MupwBO2djmLdSw	2025-09-04 15:23:11.275+02	2025-09-03 15:23:16.371517+02	2025-09-03 15:23:16.371517+02	\N	\N
118	1	driver	1756905855604_4DWJyCqvTumzE3GLCm2nVfBn0DUX2JnX	2025-09-04 15:24:15.604+02	2025-09-03 15:24:20.708725+02	2025-09-03 15:24:20.708725+02	\N	\N
119	1	driver	1756905900685_40it7zNjCWQK49LLxn3dr1sJuScZNtwY	2025-09-04 15:25:00.685+02	2025-09-03 15:25:05.78747+02	2025-09-03 15:25:05.78747+02	\N	\N
120	1	driver	1756907491944_Ailc6Jg9qj1eTExfhGglxqM23EnzkdC7	2025-09-04 15:51:31.944+02	2025-09-03 15:51:37.122805+02	2025-09-03 15:51:37.122805+02	\N	\N
121	1	driver	1756907596889_HEYnGoXiUhEXgkGW1i6RTjcnHMdg7UM6	2025-09-04 15:53:16.889+02	2025-09-03 15:53:22.020813+02	2025-09-03 15:53:22.020813+02	\N	\N
122	1	driver	1756907673285_OuxAq6Bx8AmDduE20z42ANlyFvNgc943	2025-09-04 15:54:33.285+02	2025-09-03 15:54:38.424295+02	2025-09-03 15:54:38.424295+02	\N	\N
123	1	driver	1756907780194_Hxz5A8cIdy5W3VFceMEn8htUKM75FkG1	2025-09-04 15:56:20.195+02	2025-09-03 15:56:25.353688+02	2025-09-03 15:56:25.353688+02	\N	\N
124	1	driver	1756908197429_FsFegz3ptPfXUH9ADYXEMnHc18823oPc	2025-09-04 16:03:17.429+02	2025-09-03 16:03:22.613292+02	2025-09-03 16:03:22.613292+02	\N	\N
125	1	driver	1756908715955_VuO4o2UyP5C8WLEJSYzeSN1K0lrdIxW4	2025-09-04 16:11:55.955+02	2025-09-03 16:12:01.149221+02	2025-09-03 16:12:01.149221+02	\N	\N
126	1	driver	1756908901224_4Z6N7AaNxKVqWVuX9I74TIPBpTN5gbVg	2025-09-04 16:15:01.225+02	2025-09-03 16:15:06.395933+02	2025-09-03 16:15:06.395933+02	\N	\N
127	1	driver	1756909009803_T0tTLBaW1qDTNWyRGA1BKuLRVq6omgs0	2025-09-04 16:16:49.803+02	2025-09-03 16:16:54.992675+02	2025-09-03 16:16:54.992675+02	\N	\N
128	1	restaurant	1756909178810_RKhrSJbHlhruWFl5HaU5y5B8uH2gsUI5	2025-09-04 16:19:38.811+02	2025-09-03 16:19:44.050656+02	2025-09-03 16:19:44.050656+02	\N	\N
129	1	restaurant	1756909364320_WiZGKszR3FlnjMmnecisWcot2HL4Lbau	2025-09-04 16:22:44.32+02	2025-09-03 16:22:49.524088+02	2025-09-03 16:22:49.524088+02	\N	\N
130	1	driver	1756909435231_h1SIwYkINC2s9qvga95xb8vLVlo6Asng	2025-09-04 16:23:55.231+02	2025-09-03 16:24:00.440981+02	2025-09-03 16:24:00.440981+02	\N	\N
131	1	driver	1756910592487_v3yVpa70MVpq4Ty5eKGAM82k3QQWHkb2	2025-09-04 16:43:12.487+02	2025-09-03 16:43:17.73856+02	2025-09-03 16:43:17.73856+02	\N	\N
132	1	driver	1756910608591_FURYeSmYcxsKzVDU2pPutJmVPsFoUdgq	2025-09-04 16:43:28.591+02	2025-09-03 16:43:33.82649+02	2025-09-03 16:43:33.82649+02	\N	\N
133	1	driver	1756910634904_cd8s2uZuxcCBqIZhWzT0KGWUPypBnWL5	2025-09-04 16:43:54.904+02	2025-09-03 16:44:00.13523+02	2025-09-03 16:44:00.13523+02	\N	\N
134	1	driver	1756910695457_wMiSTJjJvnvDUkTaI6yMrh4q8oegAvg7	2025-09-04 16:44:55.457+02	2025-09-03 16:45:00.695941+02	2025-09-03 16:45:00.695941+02	\N	\N
135	1	driver	1756910975051_g0zEfEiRmFg7F6qwxJBPe6rPqy1hbR1t	2025-10-03 16:49:35.051+02	2025-09-03 16:49:40.311355+02	2025-09-03 16:49:40.311355+02	\N	\N
136	1	restaurant	1756973861552_pDCnnj2b9wEScRJ1ayLPfzdiN5CU3NMS	2025-09-05 10:17:41.552+02	2025-09-04 10:17:47.513534+02	2025-09-04 10:17:47.513534+02	\N	\N
137	1	restaurant	1756974089031_E1vB3ay3QkZXuaceisq5iO7MgEU2FpI4	2025-09-05 10:21:29.031+02	2025-09-04 10:21:34.9815+02	2025-09-04 10:21:34.9815+02	\N	\N
138	1	restaurant	1756974107301_Q3z55t0L2YaP61MmYKynSLQUp6AsRx51	2025-09-05 10:21:47.301+02	2025-09-04 10:21:53.235298+02	2025-09-04 10:21:53.235298+02	\N	\N
139	1	restaurant	1756974208652_7wgTiSwbbzDAGttrt0mcCopl9XNr0Hgl	2025-09-05 10:23:28.652+02	2025-09-04 10:23:34.592219+02	2025-09-04 10:23:34.592219+02	\N	\N
140	1	restaurant	1756974365134_Wz4g6qToYx1erWCtoTGrohK0FxKOTAET	2025-09-05 10:26:05.134+02	2025-09-04 10:26:11.079396+02	2025-09-04 10:26:11.079396+02	\N	\N
141	1	restaurant	1756974734928_q7zDL5Y2lvIumAJUbSadUJHZZYJahXYV	2025-09-05 10:32:14.928+02	2025-09-04 10:32:20.920888+02	2025-09-04 10:32:20.920888+02	\N	\N
142	1	restaurant	1756974833053_JhmMXXKGxVeWk71KH8TMRMXnjeR6XoOu	2025-09-05 10:33:53.053+02	2025-09-04 10:33:59.023193+02	2025-09-04 10:33:59.023193+02	\N	\N
143	1	restaurant	1756975043225_jR5sxdsfiCS4bnbL0bS2WDOhPmo0c2jn	2025-09-05 10:37:23.226+02	2025-09-04 10:37:29.212131+02	2025-09-04 10:37:29.212131+02	\N	\N
144	1	restaurant	1756975456338_HFNoIsnGJ9glW9A4JhYKjvB3FPh0z2Be	2025-09-05 10:44:16.338+02	2025-09-04 10:44:22.322645+02	2025-09-04 10:44:22.322645+02	\N	\N
145	1	restaurant	1756977796524_cwAh9sIVBOFhfrg5Hp9yrzqPcEp7iYgu	2025-09-05 11:23:16.525+02	2025-09-04 11:23:22.627798+02	2025-09-04 11:23:22.627798+02	\N	\N
146	1	restaurant	1756977943015_5eIqiNhJoaTMQFSk6WjiOjLc1AWelJ58	2025-09-05 11:25:43.015+02	2025-09-04 11:25:49.054122+02	2025-09-04 11:25:49.054122+02	\N	\N
147	1	restaurant	1756979824818_43cKuyv5Ia3E9OXsK4RqABOoimbiAdpZ	2025-09-05 11:57:04.818+02	2025-09-04 11:57:10.939988+02	2025-09-04 11:57:10.939988+02	\N	\N
148	1	restaurant	1756982406093_lY5YOT6AT0h5zYbpjPR25AzYa2HcFKbS	2025-09-05 12:40:06.093+02	2025-09-04 12:40:12.304333+02	2025-09-04 12:40:12.304333+02	\N	\N
149	1	restaurant	1756986179532_RPMmlaAakaXstHQbqff7NHxavto2riJp	2025-09-05 13:42:59.532+02	2025-09-04 13:43:05.882748+02	2025-09-04 13:43:05.882748+02	\N	\N
150	1	restaurant	1756987030796_wYdoGPDx8yYsqo37ZdBF8Ie8nr5JN0hH	2025-09-05 13:57:10.796+02	2025-09-04 13:57:17.113015+02	2025-09-04 13:57:17.113015+02	\N	\N
151	1	restaurant	1756990529032_8CTA5fG4K8NM6DYKzye3poybkgOPzBly	2025-09-05 14:55:29.032+02	2025-09-04 14:55:35.54606+02	2025-09-04 14:55:35.54606+02	\N	\N
152	1	restaurant	1756990832871_dMtKZ46Ox2KNeTeLQ6ZRHR71nGmtw5Xx	2025-09-05 15:00:32.872+02	2025-09-04 15:00:39.279609+02	2025-09-04 15:00:39.279609+02	\N	\N
153	1	restaurant	1756990844833_lz9OxWqCGhFqSKPi4G8JOATDf4n37WXe	2025-09-05 15:00:44.833+02	2025-09-04 15:00:51.223857+02	2025-09-04 15:00:51.223857+02	\N	\N
154	1	restaurant	1756990879490_7yUMmt0Mx66LFgVIDPuuoe87eQMAf2wl	2025-09-05 15:01:19.49+02	2025-09-04 15:01:25.880012+02	2025-09-04 15:01:25.880012+02	\N	\N
155	1	restaurant	1756990927095_L9xY9CswbxgbevaRQmwdRNy4EcHLnlNW	2025-09-05 15:02:07.095+02	2025-09-04 15:02:13.498522+02	2025-09-04 15:02:13.498522+02	\N	\N
156	1	restaurant	1756991332127_kuRzqzOXa5TOsgEbQ5X5TzZzc9oiHHSx	2025-09-05 15:08:52.127+02	2025-09-04 15:08:58.534722+02	2025-09-04 15:08:58.534722+02	\N	\N
157	1	restaurant	1756991486309_yFm5sT5NSKK76uyHPZlVYLiEDKl47ZJj	2025-09-05 15:11:26.309+02	2025-09-04 15:11:32.722974+02	2025-09-04 15:11:32.722974+02	\N	\N
158	1	restaurant	1756991585902_GiDRjxDAaAAJBkDzbs41d0P9cCLvh1Mt	2025-09-05 15:13:05.902+02	2025-09-04 15:13:12.314453+02	2025-09-04 15:13:12.314453+02	\N	\N
159	1	restaurant	1756991653984_mWYG5v55wCLdqu2W3Gb0LW6UBQJTX94D	2025-09-05 15:14:13.984+02	2025-09-04 15:14:20.410282+02	2025-09-04 15:14:20.410282+02	\N	\N
160	1	restaurant	1756991746382_CEcLylzW1sVw9J3ctsMLDtjlp0bF9jye	2025-09-05 15:15:46.383+02	2025-09-04 15:15:52.793894+02	2025-09-04 15:15:52.793894+02	\N	\N
161	1	restaurant	1756993429025_1b8RC2H6xk3nEZBzlfJcFWmE186lC4bK	2025-09-05 15:43:49.025+02	2025-09-04 15:43:55.518484+02	2025-09-04 15:43:55.518484+02	\N	\N
162	1	restaurant	1756993736320_9bwQtfBvwVPUzv0wDZ1chuvDkhkDQ9yI	2025-09-05 15:48:56.32+02	2025-09-04 15:49:02.781882+02	2025-09-04 15:49:02.781882+02	\N	\N
163	1	restaurant	1756993878695_njNMHh4V1UP8DkdS8Zm3w9ZBL4Z0ZkmS	2025-09-05 15:51:18.695+02	2025-09-04 15:51:25.173334+02	2025-09-04 15:51:25.173334+02	\N	\N
164	1	restaurant	1756994610538_w18LLVZKDdNCddO8suNTkZV2RZFIZZxl	2025-09-05 16:03:30.538+02	2025-09-04 16:03:37.049206+02	2025-09-04 16:03:37.049206+02	\N	\N
165	1	restaurant	1756994922449_Uk3cPzZgJjmFPRBtrr7RVh2pkYNRWDMn	2025-09-05 16:08:42.449+02	2025-09-04 16:08:48.988729+02	2025-09-04 16:08:48.988729+02	\N	\N
166	1	restaurant	1756998894259_EswiC1ue7VlGg6pep5AmkE1wGDTH4UsE	2025-09-05 17:14:54.259+02	2025-09-04 17:15:00.893758+02	2025-09-04 17:15:00.893758+02	\N	\N
167	1	restaurant	1756999534823_gh8ueX5lQSHjj9K5zA6697BTcnRlK8FX	2025-09-05 17:25:34.824+02	2025-09-04 17:25:41.472749+02	2025-09-04 17:25:41.472749+02	\N	\N
168	1	restaurant	1757000480017_cJINp1RS2dhDkuxISmyj3ycIqH2ShG9x	2025-09-05 17:41:20.018+02	2025-09-04 17:41:26.679266+02	2025-09-04 17:41:26.679266+02	\N	\N
169	1	restaurant	1757000971555_zWtx2SvqImI351yT0q1S8CRfC3Z7oQy4	2025-09-05 17:49:31.555+02	2025-09-04 17:49:38.232017+02	2025-09-04 17:49:38.232017+02	\N	\N
170	1	restaurant	1757002996216_vam9rvU8G7VgOb9nScSTCF7m6fBc5Isn	2025-09-05 18:23:16.216+02	2025-09-04 18:23:23.010004+02	2025-09-04 18:23:23.010004+02	\N	\N
171	1	restaurant	1757003205732_BCfQUPQfVCYpQhW4UNwrBw42nhUuWnHm	2025-09-05 18:26:45.733+02	2025-09-04 18:26:52.465906+02	2025-09-04 18:26:52.465906+02	\N	\N
173	1	restaurant	1757004364466_OEosSOJCjGqaanGrX3fMzdrINU73acBW	2025-09-05 18:46:04.467+02	2025-09-04 18:46:11.268896+02	2025-09-04 18:46:11.268896+02	\N	\N
174	1	restaurant	1757004991009_UxNKE0fNhCMqQoDvXLYGl5TiOwE5kf1z	2025-09-05 18:56:31.009+02	2025-09-04 18:56:37.799738+02	2025-09-04 18:56:37.799738+02	\N	\N
175	1	restaurant	1757009734660_6TDbtKlxb4hpzbbY6dEh6JV7gb95sq7f	2025-09-05 20:15:34.66+02	2025-09-04 20:15:34.832813+02	2025-09-04 20:15:34.832813+02	\N	\N
176	1	restaurant	1757009829061_PlqeUt1cJaRudHwz6yEGwNMSNOfR6FZ1	2025-09-05 20:17:09.061+02	2025-09-04 20:17:09.21545+02	2025-09-04 20:17:09.21545+02	\N	\N
177	1	restaurant	1757009988790_bw6znCY2WyHra49gdd28nFiPpOPLwJ4i	2025-09-05 20:19:48.79+02	2025-09-04 20:19:48.955827+02	2025-09-04 20:19:48.955827+02	\N	\N
178	1	restaurant	1757010521153_N8ds1Xe68hDZA2ULZVDUNIx0l8K30rPO	2025-09-05 20:28:41.153+02	2025-09-04 20:28:41.344966+02	2025-09-04 20:28:41.344966+02	\N	\N
179	1	restaurant	1757010726105_dFEb6uIGcXovR6kQMnoBSSzzlyixJq9x	2025-09-05 20:32:06.106+02	2025-09-04 20:32:06.287791+02	2025-09-04 20:32:06.287791+02	\N	\N
180	1	restaurant	1757010813599_u4kxLXfqFcBaTH3igb7zQcT70x2HKzMI	2025-09-05 20:33:33.599+02	2025-09-04 20:33:33.767688+02	2025-09-04 20:33:33.767688+02	\N	\N
181	1	restaurant	1757010949833_92jioi4oFNBtuWg8wdEnhC4ZOf8ysLAV	2025-09-05 20:35:49.833+02	2025-09-04 20:35:50.01479+02	2025-09-04 20:35:50.01479+02	\N	\N
182	1	restaurant	1757011075216_AzseJ9h4ibfWJOPsd6EFmVQ2qhSewHxR	2025-09-05 20:37:55.216+02	2025-09-04 20:37:55.399452+02	2025-09-04 20:37:55.399452+02	\N	\N
183	1	restaurant	1757011117286_foULQrVAq4QZPOxvsXXuyZhyDSfaCCzW	2025-09-05 20:38:37.286+02	2025-09-04 20:38:37.467235+02	2025-09-04 20:38:37.467235+02	\N	\N
184	1	restaurant	1757011270862_bJqgd1YTilrwBKBa8N2iDEemnprbNZMB	2025-09-05 20:41:10.862+02	2025-09-04 20:41:11.054627+02	2025-09-04 20:41:11.054627+02	\N	\N
186	1	restaurant	1757011847795_1CFcB26JSN3wE6K5HJsTTbBdDJMhMmKG	2025-09-05 20:50:47.795+02	2025-09-04 20:50:47.995166+02	2025-09-04 20:50:47.995166+02	\N	\N
187	1	restaurant	1757011899595_42tbXN5ZIEZJcy7gFLJkYabfnkYie6RO	2025-09-05 20:51:39.595+02	2025-09-04 20:51:39.790415+02	2025-09-04 20:51:39.790415+02	\N	\N
188	1	restaurant	1757012136667_HXNe2r5LEdRzrQLcDtGm98lzuvASLvlS	2025-09-05 20:55:36.667+02	2025-09-04 20:55:36.870858+02	2025-09-04 20:55:36.870858+02	\N	\N
189	1	restaurant	1757012901454_5I4J0KOJCY4Ss70btjpFVvD1anZ7jnNP	2025-09-05 21:08:21.454+02	2025-09-04 21:08:21.72792+02	2025-09-04 21:08:21.72792+02	\N	\N
190	1	restaurant	1757012933413_fGSryJ4mUniKopvYstaTHP0b4StMsEJi	2025-09-05 21:08:53.413+02	2025-09-04 21:08:53.639822+02	2025-09-04 21:08:53.639822+02	\N	\N
191	1	restaurant	1757013016216_GjJk6lVQEKRtGrlFiTt8bhP4aIiZg02O	2025-09-05 21:10:16.216+02	2025-09-04 21:10:16.444521+02	2025-09-04 21:10:16.444521+02	\N	\N
192	1	restaurant	1757013099542_s6JFCumabBhGCNegReZmuumWQUuBBVhd	2025-09-05 21:11:39.542+02	2025-09-04 21:11:39.815449+02	2025-09-04 21:11:39.815449+02	\N	\N
193	1	restaurant	1757013577423_hiTBWeZEWF3pWD9sSknvmhIowxnTVUca	2025-09-05 21:19:37.423+02	2025-09-04 21:19:37.694214+02	2025-09-04 21:19:37.694214+02	\N	\N
195	1	restaurant	1757013805634_9OoSQtpVM8cxcK2bNN5OCV5FfhovtNel	2025-09-05 21:23:25.634+02	2025-09-04 21:23:25.880129+02	2025-09-04 21:23:25.880129+02	\N	\N
196	1	restaurant	1757013965659_70tNpbGYzXWXTTgxfw6g3mPKBgbY7FUd	2025-09-05 21:26:05.659+02	2025-09-04 21:26:05.95339+02	2025-09-04 21:26:05.95339+02	\N	\N
197	3	driver	1757013973559_OOAQjtdUZjLD1vjW3OXmB4rbrGKtUnvH	2025-10-04 21:26:13.56+02	2025-09-04 21:26:13.823117+02	2025-09-04 21:26:13.823117+02	\N	\N
198	3	driver	1757014092798_a2Pgda2keGvE8otjzbam1yga1bCX9Nf9	2025-10-04 21:28:12.798+02	2025-09-04 21:28:13.060542+02	2025-09-04 21:28:13.060542+02	\N	\N
199	1	restaurant	1757169627799_3y0Hg2Um2pIN9ywmqhcUUSMSFj2AXEKX	2025-09-07 16:40:27.799+02	2025-09-06 16:40:28.092608+02	2025-09-06 16:40:28.092608+02	\N	\N
200	1	restaurant	1757169811181_74rbHQaMIHrpiNipvwyIrnkvX3QwLFak	2025-09-07 16:43:31.181+02	2025-09-06 16:43:31.437533+02	2025-09-06 16:43:31.437533+02	\N	\N
201	1	restaurant	1757169833729_lyThWEoWHV5EOzyeIxFMtHdLiFHq3LBE	2025-09-07 16:43:53.729+02	2025-09-06 16:43:53.967419+02	2025-09-06 16:43:53.967419+02	\N	\N
202	1	restaurant	1757170098271_avBmEVtIU1SCoqtY5VWV1FW8tOhEiXf5	2025-09-07 16:48:18.271+02	2025-09-06 16:48:18.521361+02	2025-09-06 16:48:18.521361+02	\N	\N
203	1	restaurant	1757170318941_KcKQv2cdP7kQgQSkbTaPKbPzlqY6GsEz	2025-09-07 16:51:58.941+02	2025-09-06 16:51:59.209078+02	2025-09-06 16:51:59.209078+02	\N	\N
204	1	restaurant	1757170423564_SvmZqnuuJp0ZN9wtOPqcBRGoJZpC1C6Q	2025-09-07 16:53:43.564+02	2025-09-06 16:53:43.875175+02	2025-09-06 16:53:43.875175+02	\N	\N
205	1	restaurant	1757170848640_Aa24ndjIix31hKPz8EwWbGwzIozFK1yJ	2025-09-07 17:00:48.64+02	2025-09-06 17:00:48.924959+02	2025-09-06 17:00:48.924959+02	\N	\N
206	1	restaurant	1757171007484_Y4cqlXGIfSGpHiqbQdutOUadxz6MpWKR	2025-09-07 17:03:27.484+02	2025-09-06 17:03:27.755207+02	2025-09-06 17:03:27.755207+02	\N	\N
207	1	restaurant	1757171292734_MGEITM4y4HWWGZzmRgKHilIIfYuzfnnV	2025-09-07 17:08:12.734+02	2025-09-06 17:08:13.016128+02	2025-09-06 17:08:13.016128+02	\N	\N
208	1	restaurant	1757171371911_fIWIqu3zEM2AInBjCQdcpeB2O9HmbSqO	2025-09-07 17:09:31.911+02	2025-09-06 17:09:32.185932+02	2025-09-06 17:09:32.185932+02	\N	\N
209	1	restaurant	1757171818579_KQklwIeFMVfXdAPwzhaakMU0CdOXeNBy	2025-09-07 17:16:58.579+02	2025-09-06 17:16:58.880355+02	2025-09-06 17:16:58.880355+02	\N	\N
210	1	restaurant	1757172184082_dVoXlbWSDCusCAEYs9NGui7EFIhoyFlN	2025-09-07 17:23:04.082+02	2025-09-06 17:23:04.38485+02	2025-09-06 17:23:04.38485+02	\N	\N
211	1	restaurant	1757172545348_FdKSymcq2iycvtASdG0PPCSI0OOJ1S65	2025-09-07 17:29:05.348+02	2025-09-06 17:29:05.677129+02	2025-09-06 17:29:05.677129+02	\N	\N
212	1	restaurant	1757173205347_7oy87SUzQPaxMnZ2YGMXnNsh2waIJ19V	2025-09-07 17:40:05.347+02	2025-09-06 17:40:05.69956+02	2025-09-06 17:40:05.69956+02	\N	\N
213	1	restaurant	1757173749923_FmTbIOk9TfenXPs4d3gAq8PPTp9ej4sR	2025-09-07 17:49:09.923+02	2025-09-06 17:49:10.310338+02	2025-09-06 17:49:10.310338+02	\N	\N
214	1	restaurant	1757174128155_tVW14zsw3lGivzZTGj0x4oMqCkepQemT	2025-09-07 17:55:28.155+02	2025-09-06 17:55:28.552732+02	2025-09-06 17:55:28.552732+02	\N	\N
215	1	restaurant	1757174368820_YI8nHP78BWCW6tyRhn0VBfqFDvh7OQrs	2025-09-07 17:59:28.82+02	2025-09-06 17:59:29.194413+02	2025-09-06 17:59:29.194413+02	\N	\N
216	1	restaurant	1757174517434_lrxet0KnPFXi0O7kcyvULWc5TwDvbYrF	2025-09-07 18:01:57.434+02	2025-09-06 18:01:57.849167+02	2025-09-06 18:01:57.849167+02	\N	\N
217	1	restaurant	1757175668725_jkufUwZ5rQLLajsKwtWBokUXzkaKMLg9	2025-09-07 18:21:08.725+02	2025-09-06 18:21:09.141335+02	2025-09-06 18:21:09.141335+02	\N	\N
218	1	restaurant	1757175905904_ufc39BCtqqR44nbFYUAXFMZDPVzjlLCl	2025-09-07 18:25:05.904+02	2025-09-06 18:25:06.313165+02	2025-09-06 18:25:06.313165+02	\N	\N
219	1	restaurant	1757175920608_h5lubDGwAKQrBjIfrRxPbAyRZTrIiwfh	2025-09-07 18:25:20.608+02	2025-09-06 18:25:21.009557+02	2025-09-06 18:25:21.009557+02	\N	\N
220	1	restaurant	1757176274118_Guha7CVqyNHXW1wboElLopFt0ETIdOcp	2025-09-07 18:31:14.118+02	2025-09-06 18:31:14.552543+02	2025-09-06 18:31:14.552543+02	\N	\N
221	1	restaurant	1757176294418_hamXBaVaJza1DFNiA8GZ6EQBelMG1Vm8	2025-09-07 18:31:34.418+02	2025-09-06 18:31:34.831011+02	2025-09-06 18:31:34.831011+02	\N	\N
222	1	restaurant	1757176302430_Vofjrd31oabQNLnlMbXeROZ9Dx5DWJYg	2025-09-07 18:31:42.43+02	2025-09-06 18:31:42.846413+02	2025-09-06 18:31:42.846413+02	\N	\N
223	1	restaurant	1757176311326_qhK68BWDYm54PAIAmCHKop0CNedkIkcY	2025-09-07 18:31:51.326+02	2025-09-06 18:31:51.740875+02	2025-09-06 18:31:51.740875+02	\N	\N
224	1	restaurant	1757176738680_BlJrEfwKkZKCJo1CaiaHQTE9auEdR0dn	2025-09-07 18:38:58.68+02	2025-09-06 18:38:59.145913+02	2025-09-06 18:38:59.145913+02	\N	\N
225	1	restaurant	1757177030370_IFTqoHZJHIekJuCLEzJpQflOws11JgqX	2025-09-07 18:43:50.37+02	2025-09-06 18:43:50.834947+02	2025-09-06 18:43:50.834947+02	\N	\N
226	1	restaurant	1757177492172_veScr3AM4mXjG6OT7nNcorbOF1NpxmRH	2025-09-07 18:51:32.172+02	2025-09-06 18:51:32.659129+02	2025-09-06 18:51:32.659129+02	\N	\N
227	1	restaurant	1757177752771_wmSfwtLBuIYJNydE8iQN3nrQ5xJ7Jzl6	2025-09-07 18:55:52.771+02	2025-09-06 18:55:53.21985+02	2025-09-06 18:55:53.21985+02	\N	\N
228	1	restaurant	1757178201472_ZEmsOKDgLuv6o0rCXqZsPywX38VLDXYy	2025-09-07 19:03:21.472+02	2025-09-06 19:03:21.954002+02	2025-09-06 19:03:21.954002+02	\N	\N
229	1	restaurant	1757179042087_wa4CXoKP90OtWh7YJBl5uWq4TEB3st2z	2025-09-07 19:17:22.087+02	2025-09-06 19:17:22.584842+02	2025-09-06 19:17:22.584842+02	\N	\N
230	1	restaurant	1757179255572_ssq7pP3XaAUsnPCOlz5Bs8eTeCUKUwdj	2025-09-07 19:20:55.572+02	2025-09-06 19:20:56.092767+02	2025-09-06 19:20:56.092767+02	\N	\N
231	1	restaurant	1757179325568_RSui6SHdAxfbf14srye35evIbCNLxh7Z	2025-09-07 19:22:05.568+02	2025-09-06 19:22:06.061352+02	2025-09-06 19:22:06.061352+02	\N	\N
232	1	restaurant	1757179378597_27kKY0etYBZaLa0ws9FRhvCf3uE5hhvo	2025-09-07 19:22:58.597+02	2025-09-06 19:22:59.104892+02	2025-09-06 19:22:59.104892+02	\N	\N
233	1	restaurant	1757179981626_XErdl0FHbsV04qZ3d3yPQzBLbb6xUEvD	2025-09-07 19:33:01.627+02	2025-09-06 19:33:02.158981+02	2025-09-06 19:33:02.158981+02	\N	\N
234	1	restaurant	1757180261898_iSbJR2FMXDuwJcG0CCA14s32OqJ166Tc	2025-09-07 19:37:41.898+02	2025-09-06 19:37:42.433596+02	2025-09-06 19:37:42.433596+02	\N	\N
235	1	restaurant	1757181142492_3pmtUHp68qImjnBcroashyfc3X6yYQkM	2025-09-07 19:52:22.492+02	2025-09-06 19:52:23.084947+02	2025-09-06 19:52:23.084947+02	\N	\N
236	1	restaurant	1757184110852_vKhjR38kUQobOk0fTuUA2see2f0LIjgd	2025-09-07 20:41:50.853+02	2025-09-06 20:41:51.484276+02	2025-09-06 20:41:51.484276+02	\N	\N
237	1	restaurant	1757184239454_rdeKVSQwqwLuwfVtrr1BZanEsptfVXXs	2025-09-07 20:43:59.454+02	2025-09-06 20:44:00.112303+02	2025-09-06 20:44:00.112303+02	\N	\N
238	1	restaurant	1757184381742_yEigm2dDSqg1sXirchyVRKtZSnyyBsQP	2025-09-07 20:46:21.742+02	2025-09-06 20:46:22.406024+02	2025-09-06 20:46:22.406024+02	\N	\N
239	1	restaurant	1757184738080_jK3YvMW2CMuH1Z1luGKU88Vyw2ldbm8V	2025-09-07 20:52:18.08+02	2025-09-06 20:52:18.752805+02	2025-09-06 20:52:18.752805+02	\N	\N
240	1	restaurant	1757184909992_umVl6m9RmAvE0klCfEzQcVLRAYE1HRMs	2025-09-07 20:55:09.992+02	2025-09-06 20:55:10.683369+02	2025-09-06 20:55:10.683369+02	\N	\N
241	1	restaurant	1757185155384_gRMnGzxjUeF0vy0Hr1MIKOZS1C4Kgc0z	2025-09-07 20:59:15.384+02	2025-09-06 20:59:16.052165+02	2025-09-06 20:59:16.052165+02	\N	\N
242	1	restaurant	1757185630894_r2XMdMjuCcjxtSQdhnpASZ4ZAIzCAfEU	2025-09-07 21:07:10.894+02	2025-09-06 21:07:11.606839+02	2025-09-06 21:07:11.606839+02	\N	\N
243	1	restaurant	1757186121971_6hlKHduIUX5fUS6GoqOq9CLr6wdWukUj	2025-09-07 21:15:21.971+02	2025-09-06 21:15:22.675639+02	2025-09-06 21:15:22.675639+02	\N	\N
244	1	restaurant	1757186402988_xdWbY7ZuLi7czocVt8bLEYzs3IANgKXl	2025-09-07 21:20:02.988+02	2025-09-06 21:20:03.699815+02	2025-09-06 21:20:03.699815+02	\N	\N
245	1	restaurant	1757186899898_d2KqTniMDoPcHGXEeqXgswd8toBbXIVj	2025-09-07 21:28:19.898+02	2025-09-06 21:28:20.644102+02	2025-09-06 21:28:20.644102+02	\N	\N
246	1	restaurant	1757187119177_046oNRZv2JHrkgGUTz8Vlbh7xROHZ7Xv	2025-09-07 21:31:59.177+02	2025-09-06 21:31:59.890022+02	2025-09-06 21:31:59.890022+02	\N	\N
247	1	restaurant	1757187302453_ln6rmZboSjaYaCCTjWGlerG1WWssRwbq	2025-09-07 21:35:02.453+02	2025-09-06 21:35:03.174869+02	2025-09-06 21:35:03.174869+02	\N	\N
248	1	restaurant	1757187456613_IJWncrdOsUdf5CIThJ0OrZRU3NuwxWED	2025-09-07 21:37:36.614+02	2025-09-06 21:37:37.369668+02	2025-09-06 21:37:37.369668+02	\N	\N
249	1	restaurant	1757188402242_QcQ8vk3V1hQ0P403aSXWQOHuCjA0Sf9Z	2025-09-07 21:53:22.242+02	2025-09-06 21:53:23.008996+02	2025-09-06 21:53:23.008996+02	\N	\N
250	1	restaurant	1757191609637_DF34l7cYaZXGyaILY750hyvZ84W5pYj5	2025-09-07 22:46:49.637+02	2025-09-06 22:46:50.520061+02	2025-09-06 22:46:50.520061+02	\N	\N
251	1	restaurant	1757191667417_rjnBAc0PQ2t5S3OJByGoh5bEvNSVFoUh	2025-09-07 22:47:47.418+02	2025-09-06 22:47:48.260269+02	2025-09-06 22:47:48.260269+02	\N	\N
252	1	restaurant	1757191730100_MYSb2n2Zc45N7YgdpKotIyg3POF1ehTC	2025-09-07 22:48:50.1+02	2025-09-06 22:48:50.938663+02	2025-09-06 22:48:50.938663+02	\N	\N
253	1	restaurant	1757191963895_NzS2onFsGnEMUNttrNyClK0xqtJ44mu9	2025-09-07 22:52:43.895+02	2025-09-06 22:52:44.857532+02	2025-09-06 22:52:44.857532+02	\N	\N
254	1	restaurant	1757192200203_tFyVRbcV87Pye6ZiXlRnBhI2FoxPoRbk	2025-09-07 22:56:40.204+02	2025-09-06 22:56:41.055964+02	2025-09-06 22:56:41.055964+02	\N	\N
255	1	restaurant	1757192353377_sXiZp2Il55ALpOI23d8E4UgSs6YKyd8t	2025-09-07 22:59:13.377+02	2025-09-06 22:59:14.234718+02	2025-09-06 22:59:14.234718+02	\N	\N
256	1	restaurant	1757192614958_4uZgtkRdGhoSDEhZuIstZGOil4qvYxkb	2025-09-07 23:03:34.958+02	2025-09-06 23:03:35.825529+02	2025-09-06 23:03:35.825529+02	\N	\N
257	1	restaurant	1757192695087_wTyh1WeG5wqLrgXXhhwforADTh4Bp3ed	2025-09-07 23:04:55.087+02	2025-09-06 23:04:55.950443+02	2025-09-06 23:04:55.950443+02	\N	\N
258	1	restaurant	1757193258378_ERFUaP2mnAFtAl9JT4cHUEhg2og8krWF	2025-09-07 23:14:18.378+02	2025-09-06 23:14:19.310641+02	2025-09-06 23:14:19.310641+02	\N	\N
259	1	restaurant	1757193428620_vmzyYNhmShG7VWBHGrYdF0J2l1JIDwbp	2025-09-07 23:17:08.62+02	2025-09-06 23:17:09.510404+02	2025-09-06 23:17:09.510404+02	\N	\N
260	1	restaurant	1757195056753_VnFCutzHQBFKuGXGdJnxaRqdx4KmfeWV	2025-09-07 23:44:16.753+02	2025-09-06 23:44:17.694382+02	2025-09-06 23:44:17.694382+02	\N	\N
261	1	restaurant	1757196908700_LjS1obYClKRlhWLjNs4Bd8vDjBfbfwFq	2025-09-08 00:15:08.701+02	2025-09-07 00:15:09.704059+02	2025-09-07 00:15:09.704059+02	\N	\N
262	1	restaurant	1757229190597_1eghpdTMNe1Pcauyo46fixmufmnKiQZ9	2025-09-08 09:13:10.598+02	2025-09-07 09:13:11.489391+02	2025-09-07 09:13:11.489391+02	\N	\N
263	1	restaurant	1757230900525_EoUhmqoAlKTbxZfhzJvmj9GugHnD8Sb2	2025-09-08 09:41:40.525+02	2025-09-07 09:41:41.463892+02	2025-09-07 09:41:41.463892+02	\N	\N
264	1	restaurant	1757231401394_g7QTQJtbY4UHooIZ4nNrkvMLVn5Oo075	2025-09-08 09:50:01.394+02	2025-09-07 09:50:02.329416+02	2025-09-07 09:50:02.329416+02	\N	\N
265	1	restaurant	1757231464554_BuHzuegX7jw5p6XrHWEJVZwvo5R0yAYZ	2025-09-08 09:51:04.554+02	2025-09-07 09:51:05.484695+02	2025-09-07 09:51:05.484695+02	\N	\N
266	1	restaurant	1757231834779_WC58UmlZosR6yxD4E9udlQl5u9p5nE6C	2025-09-08 09:57:14.779+02	2025-09-07 09:57:15.730827+02	2025-09-07 09:57:15.730827+02	\N	\N
267	1	restaurant	1757231914135_VMukOjR9Xi3qSC0TGyrt7o6wLD6YLLMk	2025-09-08 09:58:34.135+02	2025-09-07 09:58:35.080727+02	2025-09-07 09:58:35.080727+02	\N	\N
268	1	restaurant	1757232086003_IO02Sczp95rUSVv62IcrJgcUAVD8Me3U	2025-09-08 10:01:26.004+02	2025-09-07 10:01:26.972809+02	2025-09-07 10:01:26.972809+02	\N	\N
269	1	restaurant	1757232332937_cwe2Tphi4j8hM1Gs4GQplBxLSeGS0JTU	2025-09-08 10:05:32.937+02	2025-09-07 10:05:33.897102+02	2025-09-07 10:05:33.897102+02	\N	\N
270	1	restaurant	1757232482936_lhhY4tSizqKSnvAZyAcWUJZ4RLEmgTY2	2025-09-08 10:08:02.936+02	2025-09-07 10:08:03.889987+02	2025-09-07 10:08:03.889987+02	\N	\N
271	1	restaurant	1757232651800_19zOs3WRXNlpPDRK51Cbm7pwklylGZIJ	2025-09-08 10:10:51.8+02	2025-09-07 10:10:52.776672+02	2025-09-07 10:10:52.776672+02	\N	\N
272	1	restaurant	1757232775916_t2KiasbWMNRs49rIRHDdYtc8AzCGiq0E	2025-09-08 10:12:55.916+02	2025-09-07 10:12:56.875057+02	2025-09-07 10:12:56.875057+02	\N	\N
273	1	restaurant	1757232801448_kbM7zCLVlVuZGlOhBwtnvaXWqVMcRTUi	2025-09-08 10:13:21.448+02	2025-09-07 10:13:22.42701+02	2025-09-07 10:13:22.42701+02	\N	\N
274	1	restaurant	1757233772674_q9zie6F4TKExBQzARr2TueiOzDLnCrO9	2025-09-08 10:29:32.675+02	2025-09-07 10:29:33.676955+02	2025-09-07 10:29:33.676955+02	\N	\N
275	1	restaurant	1757234226506_z9r0O1QlLP49lFL5qBj97kvUhwExiCdg	2025-09-08 10:37:06.507+02	2025-09-07 10:37:07.515097+02	2025-09-07 10:37:07.515097+02	\N	\N
276	1	restaurant	1757234486528_Pr8JkXRp3CMzAFlXJ1LqUxq7IsFJnMZP	2025-09-08 10:41:26.528+02	2025-09-07 10:41:27.530691+02	2025-09-07 10:41:27.530691+02	\N	\N
277	1	restaurant	1757234733759_6fVKJlVzZMxyXzh9bZhZc4QEuqlwQPw7	2025-09-08 10:45:33.759+02	2025-09-07 10:45:34.77424+02	2025-09-07 10:45:34.77424+02	\N	\N
278	1	restaurant	1757235709309_tS10rMnL7CdbbWSu2Folsn9CX2tsyws4	2025-09-08 11:01:49.309+02	2025-09-07 11:01:50.356925+02	2025-09-07 11:01:50.356925+02	\N	\N
279	1	restaurant	1757236821030_gFVZPgG5CkCWpgVP2E2ZlzpxGJu9qYQ0	2025-09-08 11:20:21.03+02	2025-09-07 11:20:22.129175+02	2025-09-07 11:20:22.129175+02	\N	\N
280	1	restaurant	1757237022966_VaVZNxZIYgpAMsU3fBa1OQM6SKBnNSef	2025-09-08 11:23:42.966+02	2025-09-07 11:23:44.059761+02	2025-09-07 11:23:44.059761+02	\N	\N
281	1	restaurant	1757237064238_P9UZVwq2J3u3tx2zKAKW5LD8JpY8StPB	2025-09-08 11:24:24.238+02	2025-09-07 11:24:25.31992+02	2025-09-07 11:24:25.31992+02	\N	\N
282	1	restaurant	1757237714361_8VGOdKetY8IBqkZtNflSkODmDUnpFe21	2025-09-08 11:35:14.362+02	2025-09-07 11:35:15.494151+02	2025-09-07 11:35:15.494151+02	\N	\N
283	1	restaurant	1757238623682_sBHMUrmlITTw13Mft3NLf4vegXjxF9Zx	2025-09-08 11:50:23.682+02	2025-09-07 11:50:24.840717+02	2025-09-07 11:50:24.840717+02	\N	\N
284	1	restaurant	1757238894537_TOqSxvwF5XEbIZqB68WWBDBqIsBT8ff4	2025-09-08 11:54:54.537+02	2025-09-07 11:54:55.671719+02	2025-09-07 11:54:55.671719+02	\N	\N
285	1	restaurant	1757239144788_P5A88DkUz57ZtEvnFSGxfBjhbFXKa1w5	2025-09-08 11:59:04.789+02	2025-09-07 11:59:05.935873+02	2025-09-07 11:59:05.935873+02	\N	\N
286	1	restaurant	1757239499154_kbB3yOj1xMd3tGIe4UQPvWwokkUuiX2u	2025-09-08 12:04:59.154+02	2025-09-07 12:05:00.316153+02	2025-09-07 12:05:00.316153+02	\N	\N
287	1	restaurant	1757239611138_cHFS5YkLtjFKzW9Ma5ukct6xfabRf1cQ	2025-09-08 12:06:51.138+02	2025-09-07 12:06:52.285624+02	2025-09-07 12:06:52.285624+02	\N	\N
288	3	driver	1757241008644_aJeALUt5cBHY2m76LXzuFvjMPcUlY2Oj	2025-10-07 12:30:08.644+02	2025-09-07 12:30:09.889956+02	2025-09-07 12:30:09.889956+02	\N	\N
289	1	restaurant	1757245963627_GjmPS5ErTvYFrFrEV5NUqNYQuCuzR7yW	2025-09-08 13:52:43.627+02	2025-09-07 13:52:44.982526+02	2025-09-07 13:52:44.982526+02	\N	\N
290	1	restaurant	1757246243379_jvhTG6OmFJj5LCiOI0wcUo6zOGolHfOM	2025-09-08 13:57:23.379+02	2025-09-07 13:57:24.710092+02	2025-09-07 13:57:24.710092+02	\N	\N
291	1	restaurant	1757246703001_of558BV84Mx4hkToydYI5dJNfogDXVeq	2025-09-08 14:05:03.001+02	2025-09-07 14:05:04.374854+02	2025-09-07 14:05:04.374854+02	\N	\N
292	1	restaurant	1757246849640_cpU7Kmfvd4gjeTNF7ADNfNPpgC26u7HV	2025-09-08 14:07:29.64+02	2025-09-07 14:07:30.987364+02	2025-09-07 14:07:30.987364+02	\N	\N
293	1	restaurant	1757246896637_CJnhfytETksmRebf6OlgRW0bjRe1nFYZ	2025-09-08 14:08:16.637+02	2025-09-07 14:08:17.98358+02	2025-09-07 14:08:17.98358+02	\N	\N
294	1	restaurant	1757246962087_mAORJVmTdIWf4roKvdgj7QzIWDML47NE	2025-09-08 14:09:22.087+02	2025-09-07 14:09:23.445441+02	2025-09-07 14:09:23.445441+02	\N	\N
295	1	restaurant	1757260129397_siGxChypR8ZusR7k8aBkvl1zYcogn2Z4	2025-09-08 17:48:49.398+02	2025-09-07 17:48:52.268988+02	2025-09-07 17:48:52.268988+02	\N	\N
296	1	restaurant	1757261040940_DUguIvQA30QvVC55SrT6j4PfXlzeLMWq	2025-09-08 18:04:00.94+02	2025-09-07 18:04:03.809323+02	2025-09-07 18:04:03.809323+02	\N	\N
297	1	restaurant	1757261593510_knnuLvboFRD6ezk0DyuJeLdRRrIVZ4W0	2025-09-08 18:13:13.51+02	2025-09-07 18:13:16.348962+02	2025-09-07 18:13:16.348962+02	\N	\N
298	1	restaurant	1757261844853_UQEWC8v2iIFKmrwQc7WjfoynK9c6GTSM	2025-09-08 18:17:24.853+02	2025-09-07 18:17:27.680137+02	2025-09-07 18:17:27.680137+02	\N	\N
299	1	restaurant	1757262498681_R8u3l41VGPM0XLxQgUGxwy5O4kXMaxyE	2025-09-08 18:28:18.681+02	2025-09-07 18:28:21.575427+02	2025-09-07 18:28:21.575427+02	\N	\N
300	1	restaurant	1757262749083_tOmvOHu3pxRzZuK9YzWLfoNOdSHE5k2g	2025-09-08 18:32:29.083+02	2025-09-07 18:32:31.947741+02	2025-09-07 18:32:31.947741+02	\N	\N
301	1	restaurant	1757263012219_T6BXsLhoJparOfmqOxLM9cf4qZRq9HPn	2025-09-08 18:36:52.22+02	2025-09-07 18:36:55.095606+02	2025-09-07 18:36:55.095606+02	\N	\N
302	1	restaurant	1757263114334_VCHckYUmPvWnGeqUPtfHBfrNlFgad8Se	2025-09-08 18:38:34.334+02	2025-09-07 18:38:37.202361+02	2025-09-07 18:38:37.202361+02	\N	\N
303	1	restaurant	1757263133203_2rEnA1xXGFuCSZV1ve1kVWTyOhkVKpuM	2025-09-08 18:38:53.203+02	2025-09-07 18:38:56.059268+02	2025-09-07 18:38:56.059268+02	\N	\N
304	1	restaurant	1757263429639_k09QtPG4X0i57wXiAEABkOVyyVly4z3F	2025-09-08 18:43:49.639+02	2025-09-07 18:43:52.578921+02	2025-09-07 18:43:52.578921+02	\N	\N
305	1	restaurant	1757263593253_xOzzZW7ROWWwE5jEq0pewyOYF3mfK9uu	2025-09-08 18:46:33.253+02	2025-09-07 18:46:36.126821+02	2025-09-07 18:46:36.126821+02	\N	\N
306	1	restaurant	1757263645999_WkOX0aZ3PROlGEgpZJtvYbKdwJAjZL4I	2025-09-08 18:47:25.999+02	2025-09-07 18:47:28.872227+02	2025-09-07 18:47:28.872227+02	\N	\N
307	1	restaurant	1757263791575_UvdegdBAR3JdnifVgOcMBGVKZxHLaZbT	2025-09-08 18:49:51.575+02	2025-09-07 18:49:54.479603+02	2025-09-07 18:49:54.479603+02	\N	\N
308	1	restaurant	1757264181692_AyXCIRsPy71Vb7AXjwzltrk4MlvEoWRP	2025-09-08 18:56:21.692+02	2025-09-07 18:56:24.57744+02	2025-09-07 18:56:24.57744+02	\N	\N
309	1	restaurant	1757264289497_c93mU9xGSKHn9h0srV4PUqSMqRbd6M4S	2025-09-08 18:58:09.497+02	2025-09-07 18:58:12.386534+02	2025-09-07 18:58:12.386534+02	\N	\N
310	1	restaurant	1757264317343_E3cFv4KlvW6cKPbWCSix0Ecmq0xuX0J1	2025-09-08 18:58:37.343+02	2025-09-07 18:58:40.22765+02	2025-09-07 18:58:40.22765+02	\N	\N
311	1	restaurant	1757264567970_4MghM1EHyrbNulZPwuwPowshotQbpnMG	2025-09-08 19:02:47.97+02	2025-09-07 19:02:50.868272+02	2025-09-07 19:02:50.868272+02	\N	\N
312	1	restaurant	1757264865036_oZvztQ7htwEvelZSSqscOMUqogG8172g	2025-09-08 19:07:45.036+02	2025-09-07 19:07:47.950159+02	2025-09-07 19:07:47.950159+02	\N	\N
313	1	restaurant	1757264933576_mvyRymyP5N8ShxXzILaqdnc4DD8D3iEe	2025-09-08 19:08:53.576+02	2025-09-07 19:08:56.507169+02	2025-09-07 19:08:56.507169+02	\N	\N
314	1	restaurant	1757264966353_HRnJxvcAKOWnNA9bZWStOrMxVdoZ67tC	2025-09-08 19:09:26.353+02	2025-09-07 19:09:29.27368+02	2025-09-07 19:09:29.27368+02	\N	\N
315	1	restaurant	1757265165329_Yiwtese6uXDSoJf9vrYA4vVZ701kRPIu	2025-09-08 19:12:45.329+02	2025-09-07 19:12:48.260834+02	2025-09-07 19:12:48.260834+02	\N	\N
316	1	restaurant	1757265254164_KFSoTgRTKRznBb4cMUA5vY79gvX1zGi7	2025-09-08 19:14:14.164+02	2025-09-07 19:14:17.105152+02	2025-09-07 19:14:17.105152+02	\N	\N
317	1	restaurant	1757265446822_01JjC3xnugtrlSJSLboUyAuiehb1Gxrp	2025-09-08 19:17:26.823+02	2025-09-07 19:17:29.73371+02	2025-09-07 19:17:29.73371+02	\N	\N
318	1	restaurant	1757265585484_AtmEXpDYSEs3DCOLyODJIXieHCY1XuYw	2025-09-08 19:19:45.484+02	2025-09-07 19:19:48.407976+02	2025-09-07 19:19:48.407976+02	\N	\N
319	1	restaurant	1757265620291_dfZroZ103O8fg6dH8AKhtLJ3f3t5D9eH	2025-09-08 19:20:20.291+02	2025-09-07 19:20:23.207749+02	2025-09-07 19:20:23.207749+02	\N	\N
320	1	restaurant	1757265796759_XtEOS4d33yhEOLDREo38ydFWjcSO2wlh	2025-09-08 19:23:16.759+02	2025-09-07 19:23:19.699446+02	2025-09-07 19:23:19.699446+02	\N	\N
321	1	restaurant	1757266032393_J2ufn7CqsHHSWfWrW8gFya8Lgz2c4Ash	2025-09-08 19:27:12.393+02	2025-09-07 19:27:15.316404+02	2025-09-07 19:27:15.316404+02	\N	\N
322	1	restaurant	1757266069796_OBpY3NmGUtnYrxQSOERKdv25zqnfZlgA	2025-09-08 19:27:49.796+02	2025-09-07 19:27:52.728251+02	2025-09-07 19:27:52.728251+02	\N	\N
323	1	restaurant	1757266123803_Iuuqmt2NK9ojMs6XrwhHQ2xGUXjAxF9m	2025-09-08 19:28:43.803+02	2025-09-07 19:28:46.733142+02	2025-09-07 19:28:46.733142+02	\N	\N
324	1	restaurant	1757266281945_Bb9hG4uCbmBt2JMjkW7AHotHG5aian3t	2025-09-08 19:31:21.946+02	2025-09-07 19:31:24.898005+02	2025-09-07 19:31:24.898005+02	\N	\N
325	1	restaurant	1757266499679_0BoO2Xy6Loct3BM8qCDrvipSdzZBqLSv	2025-09-08 19:34:59.68+02	2025-09-07 19:35:02.619231+02	2025-09-07 19:35:02.619231+02	\N	\N
326	1	restaurant	1757266664976_4TmnZAkdpWtirgAPQdEvyNLQ2H4e24Nc	2025-09-08 19:37:44.976+02	2025-09-07 19:37:47.941522+02	2025-09-07 19:37:47.941522+02	\N	\N
327	1	restaurant	1757267840677_O8ijz8VLUrjUBRycSkc0zcI1x8SnLYFJ	2025-09-08 19:57:20.677+02	2025-09-07 19:57:23.714522+02	2025-09-07 19:57:23.714522+02	\N	\N
328	1	restaurant	1757268136095_j0QqYonIoT9fp8CYO1GPkLImki5I6acv	2025-09-08 20:02:16.095+02	2025-09-07 20:02:19.107046+02	2025-09-07 20:02:19.107046+02	\N	\N
329	1	restaurant	1757268237639_wnvCrZsjZNS623nNIk6ZEVwRO156TYQT	2025-09-08 20:03:57.639+02	2025-09-07 20:04:00.624979+02	2025-09-07 20:04:00.624979+02	\N	\N
330	1	restaurant	1757270218018_qhr25hSqZYMTpZpP3sOXrVVTJYwluSkO	2025-09-08 20:36:58.018+02	2025-09-07 20:37:01.080991+02	2025-09-07 20:37:01.080991+02	\N	\N
331	1	restaurant	1757271330786_QxRTEyBM19hrvH76XH5zJEbJq4HOdLUw	2025-09-08 20:55:30.786+02	2025-09-07 20:55:33.871428+02	2025-09-07 20:55:33.871428+02	\N	\N
332	1	restaurant	1757271923620_NpaA0aipt1tp9LOrznsY1AyWRLqUumi3	2025-09-08 21:05:23.62+02	2025-09-07 21:05:26.728747+02	2025-09-07 21:05:26.728747+02	\N	\N
333	1	restaurant	1757272140226_ISIYMpCazwQeQtFizpMC2MXPpABbn9HH	2025-09-08 21:09:00.226+02	2025-09-07 21:09:03.342655+02	2025-09-07 21:09:03.342655+02	\N	\N
334	1	restaurant	1757272221745_EiLThg8xzuhPyn1HIOc1H3igWeGMv1bL	2025-09-08 21:10:21.746+02	2025-09-07 21:10:24.844445+02	2025-09-07 21:10:24.844445+02	\N	\N
335	1	restaurant	1757272308803_LmfGyrOfyRD71NF58AXZlq82qDpcSrRH	2025-09-08 21:11:48.803+02	2025-09-07 21:11:51.901609+02	2025-09-07 21:11:51.901609+02	\N	\N
336	1	restaurant	1757272787661_4YtK3twCRX1YRT9VNAS5GbrQAI0PVTat	2025-09-08 21:19:47.661+02	2025-09-07 21:19:50.786745+02	2025-09-07 21:19:50.786745+02	\N	\N
337	1	restaurant	1757275089135_aHBj7B2svQ2GSY7jqzjMtB6J8GQqdrWj	2025-09-08 21:58:09.135+02	2025-09-07 21:58:12.410141+02	2025-09-07 21:58:12.410141+02	\N	\N
338	1	restaurant	1757275352859_DGcXWpQg373jbMw5mrsyxodgDq19Got8	2025-09-08 22:02:32.86+02	2025-09-07 22:02:36.067052+02	2025-09-07 22:02:36.067052+02	\N	\N
339	1	restaurant	1757275491286_iiu1zVXqq16MaSZplM8y7Wxo2fSdF3oK	2025-09-08 22:04:51.286+02	2025-09-07 22:04:54.478731+02	2025-09-07 22:04:54.478731+02	\N	\N
340	1	restaurant	1757275637286_KKnPYek6G8QrqRPtID3YeEFslkkArSv8	2025-09-08 22:07:17.286+02	2025-09-07 22:07:20.515437+02	2025-09-07 22:07:20.515437+02	\N	\N
341	1	restaurant	1757275783706_uJJunKlW63AzG830oVMhyG5keYnFKugc	2025-09-08 22:09:43.706+02	2025-09-07 22:09:46.909237+02	2025-09-07 22:09:46.909237+02	\N	\N
342	1	restaurant	1757315398488_tbf6R2GrKtxyfonov2ccN04SzeTdpRNn	2025-09-09 09:09:58.488+02	2025-09-08 09:09:58.836712+02	2025-09-08 09:09:58.836712+02	\N	\N
343	1	restaurant	1757324762804_GqV86py7yuz84du4i49IrfMmG2fIhr7v	2025-09-09 11:46:02.804+02	2025-09-08 11:46:03.361634+02	2025-09-08 11:46:03.361634+02	\N	\N
344	1	restaurant	1757324865094_353wUN9sT0BrxZQz1TPmaDSM1ICamzdF	2025-09-09 11:47:45.094+02	2025-09-08 11:47:45.602177+02	2025-09-08 11:47:45.602177+02	\N	\N
345	1	restaurant	1757324881419_d2NmlNUrlCz0eVzrPBhzcRXUvp76ShLu	2025-09-09 11:48:01.419+02	2025-09-08 11:48:01.921631+02	2025-09-08 11:48:01.921631+02	\N	\N
346	1	restaurant	1757324940873_JXcaF4Dehw8WLBlCsbVZN4SDhXLdIsVd	2025-09-09 11:49:00.873+02	2025-09-08 11:49:01.380091+02	2025-09-08 11:49:01.380091+02	\N	\N
347	1	restaurant	1757359898721_NyJVI1ga9UiE8mqvRFdo2SGiwZmr7uaU	2025-09-09 21:31:38.721+02	2025-09-08 21:31:40.199813+02	2025-09-08 21:31:40.199813+02	\N	\N
348	1	restaurant	1757400651614_F5Lh9HQUS2268nbramAYrfBCfppOqWQb	2025-09-10 08:50:51.615+02	2025-09-09 08:50:53.348861+02	2025-09-09 08:50:53.348861+02	\N	\N
349	1	restaurant	1757502005089_4vDQRX8mCqYufv43gL1P49IYv2os4gva	2025-09-11 13:00:05.089+02	2025-09-10 13:00:05.115696+02	2025-09-10 13:00:05.115696+02	\N	\N
350	1	restaurant	1757502345717_S99v5EaHm5cUnOstHm0EkRb7g9kmaJdE	2025-09-11 13:05:45.717+02	2025-09-10 13:05:45.719264+02	2025-09-10 13:05:45.719264+02	\N	\N
351	1	restaurant	1757502459603_PqEwNY8QvRtytBua0t4ZiHXj5SbR2FV9	2025-09-11 13:07:39.603+02	2025-09-10 13:07:39.600208+02	2025-09-10 13:07:39.600208+02	\N	\N
352	1	restaurant	1757502618492_Na4Z7ccI0At93XTKTpUjwzfCwYahZMyO	2025-09-11 13:10:18.492+02	2025-09-10 13:10:18.503015+02	2025-09-10 13:10:18.503015+02	\N	\N
353	1	restaurant	1757504025284_3gv5Xwg7G17tK89YBoHLoTpjn3HkdwE4	2025-09-11 13:33:45.285+02	2025-09-10 13:33:45.327779+02	2025-09-10 13:33:45.327779+02	\N	\N
354	1	restaurant	1757504435441_rr9u16NtU3dcAFDZk4NWbvu02agGm7qG	2025-09-11 13:40:35.441+02	2025-09-10 13:40:35.51818+02	2025-09-10 13:40:35.51818+02	\N	\N
355	1	restaurant	1757504467403_xK92KSIfoLwwwZkzaQWkrxkSC7E88m4z	2025-09-11 13:41:07.403+02	2025-09-10 13:41:07.443391+02	2025-09-10 13:41:07.443391+02	\N	\N
356	1	restaurant	1757507973240_09oF4VzlkntlPWoP7EBfyL2N4im7V9ww	2025-09-11 14:39:33.24+02	2025-09-10 14:39:33.409719+02	2025-09-10 14:39:33.409719+02	\N	\N
357	1	restaurant	1757508409063_ErKmN3lE1pzC33Px3hSOCIJa2zhA0bwu	2025-09-11 14:46:49.063+02	2025-09-10 14:46:49.208529+02	2025-09-10 14:46:49.208529+02	\N	\N
358	1	restaurant	1757508607509_s17mC5nFiX8RvP8mPiyBumrB7VL0jvBB	2025-09-11 14:50:07.509+02	2025-09-10 14:50:07.653702+02	2025-09-10 14:50:07.653702+02	\N	\N
359	1	restaurant	1757508812384_OAT0Ai3fyPkbQSRVSs3yBVuFVuKUNsHR	2025-09-11 14:53:32.384+02	2025-09-10 14:53:32.544397+02	2025-09-10 14:53:32.544397+02	\N	\N
360	1	restaurant	1757508974368_5lq3tl5hanUG5ISf1UkP0JE7smzmfBya	2025-09-11 14:56:14.368+02	2025-09-10 14:56:14.530611+02	2025-09-10 14:56:14.530611+02	\N	\N
361	1	restaurant	1757509053632_BY0cF3jxnS9HQQi9RYCFEum1XfB1MLaX	2025-09-11 14:57:33.633+02	2025-09-10 14:57:33.789953+02	2025-09-10 14:57:33.789953+02	\N	\N
362	1	restaurant	1757509156865_1WoFhKc9UHXnPJGyrGAsA01O4APLU13J	2025-09-11 14:59:16.866+02	2025-09-10 14:59:17.010852+02	2025-09-10 14:59:17.010852+02	\N	\N
363	1	restaurant	1757509286459_XuygxSKxeczRqzVK4qCW3V59pW5nGjvF	2025-09-11 15:01:26.46+02	2025-09-10 15:01:26.603695+02	2025-09-10 15:01:26.603695+02	\N	\N
364	1	restaurant	1757509487697_y1GNo6e3uiVJPWsGKfpD5ZWWDiJh9C5P	2025-09-11 15:04:47.697+02	2025-09-10 15:04:47.840662+02	2025-09-10 15:04:47.840662+02	\N	\N
365	1	restaurant	1757509548463_wRFQJ8fL307ZtmndR2S6QQ3OYC65CIpF	2025-09-11 15:05:48.463+02	2025-09-10 15:05:48.616152+02	2025-09-10 15:05:48.616152+02	\N	\N
366	1	restaurant	1757509932548_2dJymShsusFWaGGp0DTvq2Ka984x6e77	2025-09-11 15:12:12.548+02	2025-09-10 15:12:12.709766+02	2025-09-10 15:12:12.709766+02	\N	\N
367	1	restaurant	1757509966992_KCtjnNBidb5yIU7PfgpBrJydbft4o3HP	2025-09-11 15:12:46.992+02	2025-09-10 15:12:47.154755+02	2025-09-10 15:12:47.154755+02	\N	\N
368	1	restaurant	1757515816353_qyNRvW2B77IN09gVPOJC00jeU5wioWu4	2025-09-11 16:50:16.353+02	2025-09-10 16:50:16.862989+02	2025-09-10 16:50:16.862989+02	\N	\N
369	1	restaurant	1757516007043_pukhqumehgPfCMmj5DQEVj3svsO055xb	2025-09-11 16:53:27.043+02	2025-09-10 16:53:27.490059+02	2025-09-10 16:53:27.490059+02	\N	\N
370	1	restaurant	1757516713321_9h87yjzBcSvpPCR0uiG7HeMRJHH9WoJh	2025-09-11 17:05:13.321+02	2025-09-10 17:05:13.813445+02	2025-09-10 17:05:13.813445+02	\N	\N
371	1	restaurant	1757516823432_1lz77UTtrleMVONUQHNTFNbLfGs8PZH9	2025-09-11 17:07:03.432+02	2025-09-10 17:07:03.915225+02	2025-09-10 17:07:03.915225+02	\N	\N
372	1	restaurant	1757517081443_QiNL5NRanrvKG400CoCjMCeVhdRmYvvO	2025-09-11 17:11:21.443+02	2025-09-10 17:11:21.985602+02	2025-09-10 17:11:21.985602+02	\N	\N
373	1	restaurant	1757517112922_agwOD9EEFd0bAakp2zRlSFIAWWf5kBst	2025-09-11 17:11:52.922+02	2025-09-10 17:11:53.405785+02	2025-09-10 17:11:53.405785+02	\N	\N
374	1	restaurant	1757517523350_qwepGU2VC6twGUnhAeU0Nj2rtEAkIcx4	2025-09-11 17:18:43.35+02	2025-09-10 17:18:43.870112+02	2025-09-10 17:18:43.870112+02	\N	\N
375	1	restaurant	1757519868657_gj96jjO0dKqGCs2mx3wb6MTETYCcbNRD	2025-09-11 17:57:48.658+02	2025-09-10 17:57:49.215046+02	2025-09-10 17:57:49.215046+02	\N	\N
376	1	restaurant	1757519976409_Z1z7MtkhINiuI8XqMQfT6yXywyPN53IJ	2025-09-11 17:59:36.409+02	2025-09-10 17:59:36.928457+02	2025-09-10 17:59:36.928457+02	\N	\N
377	1	restaurant	1757520206040_jp6W3Tu69uI1ldcGfePweqSznEexDgV7	2025-09-11 18:03:26.041+02	2025-09-10 18:03:26.550674+02	2025-09-10 18:03:26.550674+02	\N	\N
378	1	restaurant	1757520312179_wY0bhNj3gTG5bqB6Tr7iQGTB3SkKIZVF	2025-09-11 18:05:12.179+02	2025-09-10 18:05:12.757104+02	2025-09-10 18:05:12.757104+02	\N	\N
379	1	restaurant	1757520813735_GqS1FJdce7M3Z8r33tXfinBQMGBSSkaj	2025-09-11 18:13:33.735+02	2025-09-10 18:13:34.264221+02	2025-09-10 18:13:34.264221+02	\N	\N
380	1	restaurant	1757520891434_dzoW9wd7GV5MPifoOivmPab6hz1wXKnP	2025-09-11 18:14:51.434+02	2025-09-10 18:14:51.983244+02	2025-09-10 18:14:51.983244+02	\N	\N
381	1	restaurant	1757520963389_hs3QxuoJtVbPKXyzVMjzP58JPblvOqQd	2025-09-11 18:16:03.389+02	2025-09-10 18:16:03.920933+02	2025-09-10 18:16:03.920933+02	\N	\N
382	1	restaurant	1757522160449_rrZGpk9zxadH7MAotGeRdgZNw5bBGT8S	2025-09-11 18:36:00.449+02	2025-09-10 18:36:01.011251+02	2025-09-10 18:36:01.011251+02	\N	\N
383	1	restaurant	1757522189261_CB0xx3g9058Y0xgYbvUhELqBG87Hijya	2025-09-11 18:36:29.261+02	2025-09-10 18:36:29.809233+02	2025-09-10 18:36:29.809233+02	\N	\N
384	1	restaurant	1757522974383_Iw6E6KsSUWfjAYKemQ1VdgG9VYVKTBpn	2025-09-11 18:49:34.383+02	2025-09-10 18:49:34.957457+02	2025-09-10 18:49:34.957457+02	\N	\N
385	1	restaurant	1757523106739_5yFktCEj1Xv0sz9n8UuVxsEq86cm9PJ4	2025-09-11 18:51:46.739+02	2025-09-10 18:51:47.329316+02	2025-09-10 18:51:47.329316+02	\N	\N
386	1	restaurant	1757523159369_dcrAzNDTdrlXNTD4LxESfyG5wpCRZYl0	2025-09-11 18:52:39.369+02	2025-09-10 18:52:39.954016+02	2025-09-10 18:52:39.954016+02	\N	\N
387	1	restaurant	1757523210245_kPedE5gdGX07RMEnkBVFWWDVSwgrnkkX	2025-09-11 18:53:30.245+02	2025-09-10 18:53:30.816629+02	2025-09-10 18:53:30.816629+02	\N	\N
388	1	restaurant	1757523463797_tBsnsgyZyD8YbanFa68JCGUCeg33362B	2025-09-11 18:57:43.798+02	2025-09-10 18:57:44.396185+02	2025-09-10 18:57:44.396185+02	\N	\N
389	1	restaurant	1757535432831_tcJiaQ1LeRoPbZabQMUYxQLiWillceHl	2025-09-11 22:17:12.831+02	2025-09-10 22:17:13.663665+02	2025-09-10 22:17:13.663665+02	\N	\N
390	1	restaurant	1757535946584_73TQ7okAe6E3tE1J6ysL9ZRkL8wktw97	2025-09-11 22:25:46.584+02	2025-09-10 22:25:47.363505+02	2025-09-10 22:25:47.363505+02	\N	\N
391	1	restaurant	1757536318685_fqNtXvltIgu6aWLupdCIgG6k1AynfHL6	2025-09-11 22:31:58.685+02	2025-09-10 22:31:59.531798+02	2025-09-10 22:31:59.531798+02	\N	\N
392	1	restaurant	1757572372553_YzeUpNZ53ltQTwlXnuexH5kkBQuVudSo	2025-09-12 08:32:52.553+02	2025-09-11 08:32:53.800839+02	2025-09-11 08:32:53.800839+02	\N	\N
393	1	restaurant	1757597911870_jWV3qWVENeVkBQIcl6mdUh8zufGRTQUy	2025-09-12 15:38:31.87+02	2025-09-11 15:38:33.605703+02	2025-09-11 15:38:33.605703+02	\N	\N
394	1	restaurant	1757598788960_cZw3xbY9CSbuOmTGsmylmdalrvtc1Hrp	2025-09-12 15:53:08.96+02	2025-09-11 15:53:10.691775+02	2025-09-11 15:53:10.691775+02	\N	\N
395	1	restaurant	1757599155920_jXCP1m7KyF6mhEteXF4rroiL8xgcgp3W	2025-09-12 15:59:15.92+02	2025-09-11 15:59:17.666152+02	2025-09-11 15:59:17.666152+02	\N	\N
396	1	restaurant	1757599348365_241lKVm8tVkYRUFafGxtBE04YifxyZGe	2025-09-12 16:02:28.365+02	2025-09-11 16:02:30.118104+02	2025-09-11 16:02:30.118104+02	\N	\N
397	1	restaurant	1757599582995_VbP6o4PqRqnyJYsqNX1LjmoqfNdbWMOL	2025-09-12 16:06:22.995+02	2025-09-11 16:06:24.779788+02	2025-09-11 16:06:24.779788+02	\N	\N
398	1	restaurant	1757602200838_hYyZzeq9dqGBFd7wvO8PpL5UeO5USvGp	2025-09-12 16:50:00.838+02	2025-09-11 16:50:02.725972+02	2025-09-11 16:50:02.725972+02	\N	\N
399	1	restaurant	1757602238086_RsN8qsHCmGBJCp05S65GWYXKVyKkUQQw	2025-09-12 16:50:38.086+02	2025-09-11 16:50:39.890672+02	2025-09-11 16:50:39.890672+02	\N	\N
400	1	restaurant	1757602409018_IU81QKr8ejBNLnZGm7ULwyyA8nsJj9W3	2025-09-12 16:53:29.018+02	2025-09-11 16:53:30.833552+02	2025-09-11 16:53:30.833552+02	\N	\N
401	1	restaurant	1757602443519_6bK6V8cEYlj0jv2pxHCp1R4WSefOlplo	2025-09-12 16:54:03.519+02	2025-09-11 16:54:05.327459+02	2025-09-11 16:54:05.327459+02	\N	\N
402	1	restaurant	1757602600516_MyzKaQQujKFKdmu7aMlI5sU9BANXxv02	2025-09-12 16:56:40.516+02	2025-09-11 16:56:42.360491+02	2025-09-11 16:56:42.360491+02	\N	\N
403	1	restaurant	1757654325933_g0JAqrgNwS40piRQjtdcuOOLevKNJSca	2025-09-13 07:18:45.933+02	2025-09-12 07:18:48.610139+02	2025-09-12 07:18:48.610139+02	\N	\N
404	1	restaurant	1757679706517_cpde2dY2v7Gusdz8IwMc2zGaZxhj466q	2025-09-13 14:21:46.517+02	2025-09-12 14:21:49.032041+02	2025-09-12 14:21:49.032041+02	\N	\N
405	1	restaurant	1757681886099_GKTIeCaYVrlvBViOkkvnPNx1k21tTJG7	2025-09-13 14:58:06.099+02	2025-09-12 14:58:08.583363+02	2025-09-12 14:58:08.583363+02	\N	\N
406	1	restaurant	1757682233086_uXhRKfnFZUGFbYARyyP03lBqTJD4F0mZ	2025-09-13 15:03:53.086+02	2025-09-12 15:03:55.576755+02	2025-09-12 15:03:55.576755+02	\N	\N
407	1	restaurant	1757682772874_7bPOSgyh7I4n6DT5gKAMnw45LphVx6K8	2025-09-13 15:12:52.874+02	2025-09-12 15:12:55.385+02	2025-09-12 15:12:55.385+02	\N	\N
408	1	restaurant	1757682900612_PlKYUNdz0BBqwRxqwnGaH3SppRA23Ojq	2025-09-13 15:15:00.612+02	2025-09-12 15:15:03.135253+02	2025-09-12 15:15:03.135253+02	\N	\N
409	1	restaurant	1757683069748_0g9VSKh4IhbZ7ANs0S0330uvKmbNM0ee	2025-09-13 15:17:49.748+02	2025-09-12 15:17:52.256415+02	2025-09-12 15:17:52.256415+02	\N	\N
410	1	restaurant	1757688987795_eKruco3wfER7M1WeYPLHc4R2qIaNvGJR	2025-09-13 16:56:27.795+02	2025-09-12 16:56:27.866127+02	2025-09-12 16:56:27.866127+02	\N	\N
411	1	restaurant	1757689068036_A9PSQfOfJuERzO9uDVkidIgcdBnF6JTt	2025-09-13 16:57:48.036+02	2025-09-12 16:57:48.082121+02	2025-09-12 16:57:48.082121+02	\N	\N
412	1	restaurant	1757689197605_8NqvuuzJSf0l4JoUGNvzU1XVrCgOY0ct	2025-09-13 16:59:57.605+02	2025-09-12 16:59:57.655622+02	2025-09-12 16:59:57.655622+02	\N	\N
413	1	restaurant	1757689902539_KbY2LQqWbekFGzUaBaMpfSTcSJwYs7GQ	2025-09-13 17:11:42.539+02	2025-09-12 17:11:42.591997+02	2025-09-12 17:11:42.591997+02	\N	\N
414	1	restaurant	1757689990617_ecqMRRojjXg2uIt1MFgZudPdYopvcUZn	2025-09-13 17:13:10.617+02	2025-09-12 17:13:10.679038+02	2025-09-12 17:13:10.679038+02	\N	\N
415	1	restaurant	1757690027331_sE9uvnJH7BLHQFh43y8EKGO3cJKQOGxy	2025-09-13 17:13:47.331+02	2025-09-12 17:13:47.400319+02	2025-09-12 17:13:47.400319+02	\N	\N
416	1	restaurant	1757690130922_yGbwlGBMFDcCA8p052pJ2z6GkR6D3VOv	2025-09-13 17:15:30.922+02	2025-09-12 17:15:30.993732+02	2025-09-12 17:15:30.993732+02	\N	\N
417	1	restaurant	1757690256561_Aqki2NnwgKLds4hDbhPlUUqNDG4ELefT	2025-09-13 17:17:36.561+02	2025-09-12 17:17:36.611809+02	2025-09-12 17:17:36.611809+02	\N	\N
418	1	restaurant	1757690483617_8WEI0e8vQle6CyzxUfokQtOlgBrxjyev	2025-09-13 17:21:23.617+02	2025-09-12 17:21:23.701055+02	2025-09-12 17:21:23.701055+02	\N	\N
419	1	restaurant	1757690696519_Yk8NdqbfpfZGLGiP8qxDdD7Pee3DFu98	2025-09-13 17:24:56.52+02	2025-09-12 17:24:56.600985+02	2025-09-12 17:24:56.600985+02	\N	\N
420	1	restaurant	1757690949339_IVKRNG3cXBByhOCJbhmASK4PvY0FAUhu	2025-09-13 17:29:09.339+02	2025-09-12 17:29:09.433425+02	2025-09-12 17:29:09.433425+02	\N	\N
421	1	restaurant	1757691002013_o0lyTEeEBoBxZyNEkn3SMCiqY3vMxrdE	2025-09-13 17:30:02.013+02	2025-09-12 17:30:02.102689+02	2025-09-12 17:30:02.102689+02	\N	\N
422	1	restaurant	1757691173962_axMtuF75XukTAUikonWOCSE8lr7VSCTT	2025-09-13 17:32:53.963+02	2025-09-12 17:32:54.05269+02	2025-09-12 17:32:54.05269+02	\N	\N
423	1	restaurant	1757692912481_9ZfK3b2vcpXSPALpyQQghUnxb5NemA96	2025-09-13 18:01:52.481+02	2025-09-12 18:01:52.662726+02	2025-09-12 18:01:52.662726+02	\N	\N
424	1	restaurant	1757693054766_tzsAXW0RqQ1t4fTIXsVqv0KDTAlbzl09	2025-09-13 18:04:14.766+02	2025-09-12 18:04:14.878292+02	2025-09-12 18:04:14.878292+02	\N	\N
425	1	restaurant	1757693073745_Ci4971J3uVmS7gfKhvDXUAWu527E7Egh	2025-09-13 18:04:33.745+02	2025-09-12 18:04:33.869558+02	2025-09-12 18:04:33.869558+02	\N	\N
426	1	restaurant	1757693116024_G4HW3U78LJPnTN5So6hbLkLiqK1PQxlu	2025-09-13 18:05:16.024+02	2025-09-12 18:05:16.141024+02	2025-09-12 18:05:16.141024+02	\N	\N
427	1	restaurant	1757693203414_P4rMMBSXMG4WhUt866KMwp2vUtu7UhVm	2025-09-13 18:06:43.414+02	2025-09-12 18:06:43.525872+02	2025-09-12 18:06:43.525872+02	\N	\N
428	1	restaurant	1757693263367_1aMEnGet5pd7W9okgh5yrK71kGbFKuQk	2025-09-13 18:07:43.367+02	2025-09-12 18:07:43.492201+02	2025-09-12 18:07:43.492201+02	\N	\N
429	1	restaurant	1757693346570_b4jH1LhWOyGithQXTGdhhuhrBO0sSrqp	2025-09-13 18:09:06.57+02	2025-09-12 18:09:06.683289+02	2025-09-12 18:09:06.683289+02	\N	\N
430	1	restaurant	1757693483881_jkqOcnJ0z38RVfyyMXSPpchRk1UnZeqA	2025-09-13 18:11:23.881+02	2025-09-12 18:11:24.005335+02	2025-09-12 18:11:24.005335+02	\N	\N
431	1	restaurant	1757693611799_3biKL9pdEeZ45PeRUDAoh9hk7yQ1879U	2025-09-13 18:13:31.799+02	2025-09-12 18:13:31.921136+02	2025-09-12 18:13:31.921136+02	\N	\N
432	1	restaurant	1757693734589_T6gnmWYJ7iidCvmEbFn2KF6fOU5Az0aw	2025-09-13 18:15:34.589+02	2025-09-12 18:15:34.7071+02	2025-09-12 18:15:34.7071+02	\N	\N
433	1	restaurant	1757693753771_Lr8Hp6m46vWHQOCnzTYOZH9pDiRSpqfF	2025-09-13 18:15:53.772+02	2025-09-12 18:15:53.891992+02	2025-09-12 18:15:53.891992+02	\N	\N
434	1	restaurant	1757693992734_tzQq28zk5MBdx6fo5tJ5mdizI3k43y22	2025-09-13 18:19:52.734+02	2025-09-12 18:19:52.877974+02	2025-09-12 18:19:52.877974+02	\N	\N
435	1	restaurant	1757694290475_fC9yYwGTYP1kQmkaM2bsmVeQPWGb1mPM	2025-09-13 18:24:50.476+02	2025-09-12 18:24:50.697494+02	2025-09-12 18:24:50.697494+02	\N	\N
436	1	restaurant	1757694480037_gZDFlIkA5AIgnHu1d5imskoaiwKl8HYa	2025-09-13 18:28:00.037+02	2025-09-12 18:28:00.216441+02	2025-09-12 18:28:00.216441+02	\N	\N
437	1	restaurant	1757695180116_bjag2An2XKXkpvJLVnFvBqoHsf8Zhm9a	2025-09-13 18:39:40.116+02	2025-09-12 18:39:40.281146+02	2025-09-12 18:39:40.281146+02	\N	\N
438	1	restaurant	1757695287301_UPZAmkvhwJXZelRS6sLBmyf3Zjjj5vfF	2025-09-13 18:41:27.301+02	2025-09-12 18:41:27.485516+02	2025-09-12 18:41:27.485516+02	\N	\N
439	1	restaurant	1757695319432_7GhFN8rz1BkFcmtMTZIe0vA5ikYdkgoT	2025-09-13 18:41:59.432+02	2025-09-12 18:41:59.595184+02	2025-09-12 18:41:59.595184+02	\N	\N
440	1	restaurant	1757695788487_NuEDxuGtSJbnLSGegvdP7v6HnZnpDBvI	2025-09-13 18:49:48.487+02	2025-09-12 18:49:48.669659+02	2025-09-12 18:49:48.669659+02	\N	\N
441	1	restaurant	1757696016296_RvwBtCBwKVk9KzIWMZrKygBr4klv50tC	2025-09-13 18:53:36.296+02	2025-09-12 18:53:36.465307+02	2025-09-12 18:53:36.465307+02	\N	\N
442	1	restaurant	1757696195230_Dv9SOXzJBjs8zlCM6JbdZMH2znqA90HR	2025-09-13 18:56:35.23+02	2025-09-12 18:56:35.414421+02	2025-09-12 18:56:35.414421+02	\N	\N
443	1	restaurant	1757696278014_5B3yqz5X7TTs5Z8cVeqZ5fAuKqtGfdXH	2025-09-13 18:57:58.015+02	2025-09-12 18:57:58.201589+02	2025-09-12 18:57:58.201589+02	\N	\N
444	1	restaurant	1757696390296_RZMFrtdgdGtbsvzbUHxu31Y25GTblCS1	2025-09-13 18:59:50.296+02	2025-09-12 18:59:50.474774+02	2025-09-12 18:59:50.474774+02	\N	\N
445	1	restaurant	1757696400762_TUa2wQQ3euw8d8G0Ycq3jIiR2ZmoVKe2	2025-09-13 19:00:00.762+02	2025-09-12 19:00:00.939012+02	2025-09-12 19:00:00.939012+02	\N	\N
446	1	restaurant	1757696536997_TC5QQPoANV6oUlMSNaRpuZWW6Fxb415b	2025-09-13 19:02:16.997+02	2025-09-12 19:02:17.224525+02	2025-09-12 19:02:17.224525+02	\N	\N
447	1	restaurant	1757696580257_hENp1vwVEJmUh3M81mANsL7h6HsPDaP4	2025-09-13 19:03:00.257+02	2025-09-12 19:03:00.449651+02	2025-09-12 19:03:00.449651+02	\N	\N
448	1	restaurant	1757696900003_6kCO8sNEKKOJshb7Jt5KxrA7Ujq2s5Th	2025-09-13 19:08:20.003+02	2025-09-12 19:08:20.248282+02	2025-09-12 19:08:20.248282+02	\N	\N
449	1	restaurant	1757696920985_MNJ9aWnlXAtHMwK4Y8EF1mzcHJpewDcD	2025-09-13 19:08:40.985+02	2025-09-12 19:08:41.196809+02	2025-09-12 19:08:41.196809+02	\N	\N
450	1	restaurant	1757697054382_MNDjgMP1yx86GPf6M5JprU9KkJr3OzRr	2025-09-13 19:10:54.382+02	2025-09-12 19:10:54.606177+02	2025-09-12 19:10:54.606177+02	\N	\N
451	1	restaurant	1757697293102_zUV7lYOwtgPvgHPqQ9snYb11UUBpTelY	2025-09-13 19:14:53.102+02	2025-09-12 19:14:53.336437+02	2025-09-12 19:14:53.336437+02	\N	\N
452	1	restaurant	1757697417435_jYUjY7wXQTGEKs7qvS1BEJiBIAxie2pG	2025-09-13 19:16:57.435+02	2025-09-12 19:16:57.670991+02	2025-09-12 19:16:57.670991+02	\N	\N
453	1	restaurant	1757697658759_Eq5ixp6Ds5WMKtLgPIXlLBj4Asuh4U79	2025-09-13 19:20:58.759+02	2025-09-12 19:20:59.009699+02	2025-09-12 19:20:59.009699+02	\N	\N
454	1	restaurant	1757699269765_0145ldcBYiyyfwRi6tWbGtpZ1GWFVAs0	2025-09-13 19:47:49.765+02	2025-09-12 19:47:50.028153+02	2025-09-12 19:47:50.028153+02	\N	\N
455	1	restaurant	1757700582988_a9IGrhH4uascoAnOL8Uyw0s1GIRD9moV	2025-09-13 20:09:42.988+02	2025-09-12 20:09:43.386548+02	2025-09-12 20:09:43.386548+02	\N	\N
456	1	restaurant	1757700600314_sAVOZFGPjnkr6Zsk6KXTSjat9RSKWIou	2025-09-13 20:10:00.314+02	2025-09-12 20:10:00.606738+02	2025-09-12 20:10:00.606738+02	\N	\N
457	1	restaurant	1757700758944_eM3xSsgAQJGieh7sjYqoZUGfnVawxTh3	2025-09-13 20:12:38.944+02	2025-09-12 20:12:39.256344+02	2025-09-12 20:12:39.256344+02	\N	\N
458	1	restaurant	1757700772065_K5rpsyo2MDlXqRZIr4PWQFbfePAwRKnL	2025-09-13 20:12:52.065+02	2025-09-12 20:12:52.384029+02	2025-09-12 20:12:52.384029+02	\N	\N
459	1	restaurant	1757700821658_qklO5A8zqmjlSvvDxc5Y4ZERQRioDnG7	2025-09-13 20:13:41.658+02	2025-09-12 20:13:41.963037+02	2025-09-12 20:13:41.963037+02	\N	\N
460	1	restaurant	1757701052892_WUku3r5wCznGaQWq9X5e6RDNRYmJfCoL	2025-09-13 20:17:32.892+02	2025-09-12 20:17:33.191391+02	2025-09-12 20:17:33.191391+02	\N	\N
461	1	restaurant	1757701146611_PHri76QsylL285wgEiTauifcBn5ASKtR	2025-09-13 20:19:06.611+02	2025-09-12 20:19:06.929886+02	2025-09-12 20:19:06.929886+02	\N	\N
462	1	restaurant	1757701192238_ogHlwDahw5XIfzXo8tf7VJDKNI6txasd	2025-09-13 20:19:52.238+02	2025-09-12 20:19:52.5614+02	2025-09-12 20:19:52.5614+02	\N	\N
463	1	restaurant	1757701309180_XfapV6o35StucDYs7fWa7t2L5JLUseGE	2025-09-13 20:21:49.18+02	2025-09-12 20:21:49.482487+02	2025-09-12 20:21:49.482487+02	\N	\N
464	1	restaurant	1757701435967_UUq7DzBHaVW14g8yCROs9VtPtjYqKeap	2025-09-13 20:23:55.967+02	2025-09-12 20:23:56.4881+02	2025-09-12 20:23:56.4881+02	\N	\N
465	1	restaurant	1757703911370_kBoQgVXzCl0AWs6KYnVAsNkZqQfzOyxA	2025-09-13 21:05:11.37+02	2025-09-12 21:05:11.709986+02	2025-09-12 21:05:11.709986+02	\N	\N
466	1	restaurant	1757704071792_38IbJ8CfANh2nfogWaZ1eYvDNfaU8xYG	2025-09-13 21:07:51.792+02	2025-09-12 21:07:52.134617+02	2025-09-12 21:07:52.134617+02	\N	\N
467	1	restaurant	1757704505812_jgdoMwW9NrrLYkpgCYZKrm176JaTyCsi	2025-09-13 21:15:05.813+02	2025-09-12 21:15:06.191017+02	2025-09-12 21:15:06.191017+02	\N	\N
468	1	restaurant	1757707470824_DNYmHgpzQBE8YFCyAoDzUvcFzYcRqgLX	2025-09-13 22:04:30.824+02	2025-09-12 22:04:31.253648+02	2025-09-12 22:04:31.253648+02	\N	\N
469	1	restaurant	1757710671866_gkSSTUMwMIdw0kwZKc6eeFy1LdUYiG0s	2025-09-13 22:57:51.866+02	2025-09-12 22:57:52.37592+02	2025-09-12 22:57:52.37592+02	\N	\N
470	1	restaurant	1757711377537_eyARR8gLLhXC70Uom7gifEtKo0oJay0v	2025-09-13 23:09:37.538+02	2025-09-12 23:09:38.037713+02	2025-09-12 23:09:38.037713+02	\N	\N
471	1	restaurant	1757748888789_lI2L6dUAMz59ZTGSm9o4n297h6HJ3prh	2025-09-14 09:34:48.789+02	2025-09-13 09:34:48.513262+02	2025-09-13 09:34:48.513262+02	\N	\N
472	1	restaurant	1757750308431_JA7lE8gikqS6P2bxGtUDhmvIADvsA3wb	2025-09-14 09:58:28.431+02	2025-09-13 09:58:28.201153+02	2025-09-13 09:58:28.201153+02	\N	\N
473	1	restaurant	1757750879233_7OghFDAfdqp05cMWMAmyyPpxaigi3zeQ	2025-09-14 10:07:59.233+02	2025-09-13 10:07:58.974047+02	2025-09-13 10:07:58.974047+02	\N	\N
474	1	restaurant	1757751090714_XsY77ugf4aDSMbgyS7QKemHwSfj1M5Bd	2025-09-14 10:11:30.714+02	2025-09-13 10:11:30.450824+02	2025-09-13 10:11:30.450824+02	\N	\N
475	1	restaurant	1757751678362_sNtU0julwCcME2qApRDTNYQyetrl50kr	2025-09-14 10:21:18.362+02	2025-09-13 10:21:18.125239+02	2025-09-13 10:21:18.125239+02	\N	\N
476	1	restaurant	1757751885403_cE4zFL4znHxs3Mv0MSjJvJ6pdXqEjOn0	2025-09-14 10:24:45.403+02	2025-09-13 10:24:45.133984+02	2025-09-13 10:24:45.133984+02	\N	\N
477	1	restaurant	1757754598030_h0lwGtDshRPeyYH85nZrXAfX1gIyuqq5	2025-09-14 11:09:58.03+02	2025-09-13 11:09:57.849755+02	2025-09-13 11:09:57.849755+02	\N	\N
478	1	restaurant	1757754738871_Ze8ebrwcaGcrMr9QFFaXksJPvzYk7Q5e	2025-09-14 11:12:18.871+02	2025-09-13 11:12:18.664816+02	2025-09-13 11:12:18.664816+02	\N	\N
479	1	restaurant	1757755393056_sfMsVSxW5YqJpTfUCQtDGO9h5afpPliG	2025-09-14 11:23:13.056+02	2025-09-13 11:23:12.883625+02	2025-09-13 11:23:12.883625+02	\N	\N
480	1	restaurant	1757770741521_HZRHYEKZbYLrnJU6wp2iqwxjUnHUXr1f	2025-09-14 15:39:01.521+02	2025-09-13 15:39:01.68881+02	2025-09-13 15:39:01.68881+02	\N	\N
481	1	restaurant	1757770987638_xcF3CWrb0GHJdse0517wzW6CUeuP7tQm	2025-09-14 15:43:07.638+02	2025-09-13 15:43:07.804613+02	2025-09-13 15:43:07.804613+02	\N	\N
482	1	restaurant	1757771253816_EqTqtGw8si7DnVMVok0HcdsVJXoPfTCu	2025-09-14 15:47:33.816+02	2025-09-13 15:47:33.964372+02	2025-09-13 15:47:33.964372+02	\N	\N
483	1	restaurant	1757777072815_cwn3h1BQqQeY0MPpdAZaTIIYvWD546L2	2025-09-14 17:24:32.815+02	2025-09-13 17:24:33.13755+02	2025-09-13 17:24:33.13755+02	\N	\N
484	1	restaurant	1757777118651_zt0kc4hyrSI5CbxbyECcm3fz0JQ9MBmb	2025-09-14 17:25:18.651+02	2025-09-13 17:25:18.942745+02	2025-09-13 17:25:18.942745+02	\N	\N
485	1	restaurant	1757777527944_GriU2JoL2tQDvooy4zGyT8HvQH6Z5w6E	2025-09-14 17:32:07.944+02	2025-09-13 17:32:08.237418+02	2025-09-13 17:32:08.237418+02	\N	\N
486	1	restaurant	1757777593955_kDWf3AhY4masamfOFQtCjoVFBSxqUboo	2025-09-14 17:33:13.955+02	2025-09-13 17:33:14.262371+02	2025-09-13 17:33:14.262371+02	\N	\N
487	1	restaurant	1757777990219_ybP90YoHG5DQZzFuDZx5xFv9TDwEVbqW	2025-09-14 17:39:50.219+02	2025-09-13 17:39:50.519241+02	2025-09-13 17:39:50.519241+02	\N	\N
488	1	restaurant	1757778938084_iOX0IfsdvFg9xpAlmn1kJwyZ5VsTDtMr	2025-09-14 17:55:38.084+02	2025-09-13 17:55:38.422095+02	2025-09-13 17:55:38.422095+02	\N	\N
489	1	restaurant	1757779351239_WXX5CV15g38GdRkEnHVQhe828fiPFHyY	2025-09-14 18:02:31.239+02	2025-09-13 18:02:31.577492+02	2025-09-13 18:02:31.577492+02	\N	\N
490	1	restaurant	1757779421092_eZHw40SWrMyscRfMuLNiwTHTci5qGVWT	2025-09-14 18:03:41.092+02	2025-09-13 18:03:41.454035+02	2025-09-13 18:03:41.454035+02	\N	\N
491	1	restaurant	1757779692358_Lpo2eA5siq14P9wpTOQhwZ2kFoZOLZ2H	2025-09-14 18:08:12.358+02	2025-09-13 18:08:12.700762+02	2025-09-13 18:08:12.700762+02	\N	\N
492	1	restaurant	1757779902162_OR2EwUV3AolcwF99MrU3JKoIMHBQ5aWx	2025-09-14 18:11:42.162+02	2025-09-13 18:11:42.509516+02	2025-09-13 18:11:42.509516+02	\N	\N
493	1	restaurant	1757780088141_OlWzDKAocITYCpfChoipvO9PnDAqmXt9	2025-09-14 18:14:48.141+02	2025-09-13 18:14:48.493554+02	2025-09-13 18:14:48.493554+02	\N	\N
494	1	restaurant	1757780698159_y67YTgd6ienay6DwOaD1Ip0DOqHNwm2Y	2025-09-14 18:24:58.159+02	2025-09-13 18:24:58.575555+02	2025-09-13 18:24:58.575555+02	\N	\N
495	1	restaurant	1757781372576_lbnfRZgabhMPuc9Fiba23BsPuDgBdCWC	2025-09-14 18:36:12.576+02	2025-09-13 18:36:12.961675+02	2025-09-13 18:36:12.961675+02	\N	\N
496	1	restaurant	1757781594235_IYBJoeySREb6OqBUBjLgnD0tvbYZo3FR	2025-09-14 18:39:54.235+02	2025-09-13 18:39:54.616624+02	2025-09-13 18:39:54.616624+02	\N	\N
498	1	restaurant	1757781736321_oUU10GeDg5F1o9mq5tmEeGm8EG861VRv	2025-09-14 18:42:16.321+02	2025-09-13 18:42:16.733966+02	2025-09-13 18:42:16.733966+02	\N	\N
499	1	restaurant	1757781762467_3yJ3E6ozQ7Gm02WUvsqab9YEYusBTWKt	2025-09-14 18:42:42.467+02	2025-09-13 18:42:42.854175+02	2025-09-13 18:42:42.854175+02	\N	\N
500	1	restaurant	1757781879279_mtetRemPokV8Ll7GWNvaDJ6LjHMp11hJ	2025-09-14 18:44:39.28+02	2025-09-13 18:44:39.706646+02	2025-09-13 18:44:39.706646+02	\N	\N
501	1	restaurant	1757781913410_zfv9r7SSWc9cJqCTh8TcwbYCgf8Berxx	2025-09-14 18:45:13.41+02	2025-09-13 18:45:13.798715+02	2025-09-13 18:45:13.798715+02	\N	\N
502	1	restaurant	1757782500641_OoUjp8lsj0IAYoT49N4DiWHP32L4uUJx	2025-09-14 18:55:00.641+02	2025-09-13 18:55:01.0744+02	2025-09-13 18:55:01.0744+02	\N	\N
503	1	restaurant	1757782969215_ESt5OGVpNqev10p2kpHVu0nZm6Q0ZWuU	2025-09-14 19:02:49.215+02	2025-09-13 19:02:49.643648+02	2025-09-13 19:02:49.643648+02	\N	\N
504	1	restaurant	1757783214736_pt7d5HKfa1I7Ff95nue2E7b1hjFp1QR0	2025-09-14 19:06:54.736+02	2025-09-13 19:06:55.152246+02	2025-09-13 19:06:55.152246+02	\N	\N
505	1	restaurant	1757783241061_mLvGFzwLtjIprGdJQE5ZM8Ztv6e1zRjS	2025-09-14 19:07:21.061+02	2025-09-13 19:07:21.780321+02	2025-09-13 19:07:21.780321+02	\N	\N
506	1	restaurant	1757783638732_QOhWMskXvgiw4HqAXwDpk7in8prYUgGQ	2025-09-14 19:13:58.732+02	2025-09-13 19:13:59.181122+02	2025-09-13 19:13:59.181122+02	\N	\N
507	1	restaurant	1757783916773_xVV9PAc04RIjzHs8MSY1HjRsZiFMshIq	2025-09-14 19:18:36.774+02	2025-09-13 19:18:37.215304+02	2025-09-13 19:18:37.215304+02	\N	\N
508	1	restaurant	1757784058632_lneExBveddq9lq9G7ocY8xv92IdnCSOD	2025-09-14 19:20:58.633+02	2025-09-13 19:20:59.063125+02	2025-09-13 19:20:59.063125+02	\N	\N
509	1	restaurant	1757784445451_JWumEf29SiPfXMsJdtYIAwoYLKVVifjI	2025-09-14 19:27:25.451+02	2025-09-13 19:27:25.937655+02	2025-09-13 19:27:25.937655+02	\N	\N
510	1	restaurant	1757790800872_V6Z5VVKXKRapKTn6IL9y8a5DAKyImFrM	2025-09-14 21:13:20.872+02	2025-09-13 21:13:21.495342+02	2025-09-13 21:13:21.495342+02	\N	\N
511	1	restaurant	1757790975333_KzC9WEQFum7m8pmXhfSex2e1jmjAfktc	2025-09-14 21:16:15.333+02	2025-09-13 21:16:15.957726+02	2025-09-13 21:16:15.957726+02	\N	\N
512	1	restaurant	1757791209918_8WnkxHsf4V8nCQfBLMkNbzgPF8gfBYAW	2025-09-14 21:20:09.918+02	2025-09-13 21:20:10.52419+02	2025-09-13 21:20:10.52419+02	\N	\N
513	1	restaurant	1757791375560_C5TIKy9tln3Bi1ym7KtV3gCpPC95JbFT	2025-09-14 21:22:55.56+02	2025-09-13 21:22:56.153256+02	2025-09-13 21:22:56.153256+02	\N	\N
514	1	restaurant	1757791497413_qADS84HJ3SN1uTp03WFQz5gNfZA5hUUZ	2025-09-14 21:24:57.413+02	2025-09-13 21:24:58.006988+02	2025-09-13 21:24:58.006988+02	\N	\N
515	1	restaurant	1757792151546_7GaxAQbbatOAaNZPPRska1asOZJzhtrO	2025-09-14 21:35:51.546+02	2025-09-13 21:35:52.161729+02	2025-09-13 21:35:52.161729+02	\N	\N
516	1	restaurant	1757792332884_lHR5NGtvFXOtRuUYGvJa5GD4qrjwO5Ss	2025-09-14 21:38:52.884+02	2025-09-13 21:38:53.510444+02	2025-09-13 21:38:53.510444+02	\N	\N
517	1	restaurant	1757792412597_7bnwFpNxoULmDkVRAIk1VHmKWxQRQed7	2025-09-14 21:40:12.597+02	2025-09-13 21:40:13.220838+02	2025-09-13 21:40:13.220838+02	\N	\N
518	1	restaurant	1757792626964_kUh73phDm0SG4fZtD7CJzZWwTRzK3Qy1	2025-09-14 21:43:46.965+02	2025-09-13 21:43:47.58508+02	2025-09-13 21:43:47.58508+02	\N	\N
519	1	restaurant	1757792672366_uo2Ovabhd7bFND8O9NF8G7AIbECkq6uU	2025-09-14 21:44:32.366+02	2025-09-13 21:44:32.994968+02	2025-09-13 21:44:32.994968+02	\N	\N
520	1	restaurant	1757792707746_Vc1yPm9pMp6gq4TiSLy3GqOcI57GagKd	2025-09-14 21:45:07.746+02	2025-09-13 21:45:08.361784+02	2025-09-13 21:45:08.361784+02	\N	\N
521	1	restaurant	1757792747758_2V111eOd54jvXm9fp2Vvh6schxgcCH3K	2025-09-14 21:45:47.758+02	2025-09-13 21:45:48.378685+02	2025-09-13 21:45:48.378685+02	\N	\N
522	1	restaurant	1757792780308_eoNj4lS7dTTdYYApy1nQGJtz6TTWoCTL	2025-09-14 21:46:20.308+02	2025-09-13 21:46:20.93432+02	2025-09-13 21:46:20.93432+02	\N	\N
523	1	restaurant	1757792924567_q1lGpgwQjkCmJAbiLjPosmbY7uYml02i	2025-09-14 21:48:44.567+02	2025-09-13 21:48:45.216659+02	2025-09-13 21:48:45.216659+02	\N	\N
524	1	restaurant	1757793041462_QotwnBEMydt2KgieAKb9z9sD2WN4InDG	2025-09-14 21:50:41.463+02	2025-09-13 21:50:42.099299+02	2025-09-13 21:50:42.099299+02	\N	\N
525	1	restaurant	1757793125138_J87PghxRj2Ezgtyhp3MCbskm7yk5M7QX	2025-09-14 21:52:05.138+02	2025-09-13 21:52:05.775764+02	2025-09-13 21:52:05.775764+02	\N	\N
526	1	restaurant	1757793706214_gsXtcDqSNq14kIOSN3VuRGO9L3PLRCqa	2025-09-14 22:01:46.214+02	2025-09-13 22:01:46.893286+02	2025-09-13 22:01:46.893286+02	\N	\N
527	1	restaurant	1757793864131_xh8bfHwL16c2DJ7Hwt4YVeUaXE1hjLca	2025-09-14 22:04:24.131+02	2025-09-13 22:04:24.777361+02	2025-09-13 22:04:24.777361+02	\N	\N
528	1	restaurant	1757793945613_CApXrKrUqjeCfevYPnUw89Wj3kvIAbMw	2025-09-14 22:05:45.613+02	2025-09-13 22:05:46.257713+02	2025-09-13 22:05:46.257713+02	\N	\N
529	1	restaurant	1757794038273_uppOKXxKPHzL3xAclhmiCipKCgUuHsaC	2025-09-14 22:07:18.273+02	2025-09-13 22:07:18.924289+02	2025-09-13 22:07:18.924289+02	\N	\N
530	1	restaurant	1757794158670_4mSrpdtrjLomCjf1Yds7OXPptzFtkv7t	2025-09-14 22:09:18.67+02	2025-09-13 22:09:19.314009+02	2025-09-13 22:09:19.314009+02	\N	\N
531	1	restaurant	1757794237679_issFqWGuMP57IgmTTfPfn3BzMVSQdBKV	2025-09-14 22:10:37.679+02	2025-09-13 22:10:38.340438+02	2025-09-13 22:10:38.340438+02	\N	\N
532	1	restaurant	1757794350229_BscTeOBFdbi4cWEPdbdcWsADrvVM9YjP	2025-09-14 22:12:30.229+02	2025-09-13 22:12:30.941339+02	2025-09-13 22:12:30.941339+02	\N	\N
533	1	restaurant	1757794398018_CpHDzNzHrciHxSbFChSSysG2zq9Pg5FD	2025-09-14 22:13:18.018+02	2025-09-13 22:13:18.683468+02	2025-09-13 22:13:18.683468+02	\N	\N
534	1	restaurant	1757835253584_pCL78It2ko9Z9E0mL6UJDdZLxRiv4DIg	2025-09-15 09:34:13.584+02	2025-09-14 09:34:14.690948+02	2025-09-14 09:34:14.690948+02	\N	\N
535	1	restaurant	1757840825757_FdznYxM0fr3WodRJpqVh3gu0cvgO9eR1	2025-09-15 11:07:05.757+02	2025-09-14 11:07:06.931945+02	2025-09-14 11:07:06.931945+02	\N	\N
536	1	restaurant	1757841819514_37R2h0oQS2Zr8NCsY0hdnB6L3f9KcCHL	2025-09-15 11:23:39.514+02	2025-09-14 11:23:40.690504+02	2025-09-14 11:23:40.690504+02	\N	\N
537	1	restaurant	1757841931195_BI4IjnoUElqRmj41ZGuRy9G10tqiJBCf	2025-09-15 11:25:31.196+02	2025-09-14 11:25:32.360431+02	2025-09-14 11:25:32.360431+02	\N	\N
538	1	restaurant	1757842374504_6V85RQaeUhyj0RwM1Cwbygp8Ta3IPjMZ	2025-09-15 11:32:54.504+02	2025-09-14 11:32:55.697869+02	2025-09-14 11:32:55.697869+02	\N	\N
539	1	restaurant	1757842885350_pRi0taaVS25jXtQVu3Vt9T0X5CIa7yaY	2025-09-15 11:41:25.351+02	2025-09-14 11:41:26.583531+02	2025-09-14 11:41:26.583531+02	\N	\N
540	1	restaurant	1757843127619_7zuWpko2ertWHdEglSsFgl3yLzIzliNX	2025-09-15 11:45:27.62+02	2025-09-14 11:45:28.836217+02	2025-09-14 11:45:28.836217+02	\N	\N
541	1	restaurant	1757843634220_3vrMgSNEyBX6hm6s5aS9ZiNvqQP9eaFd	2025-09-15 11:53:54.22+02	2025-09-14 11:53:55.45331+02	2025-09-14 11:53:55.45331+02	\N	\N
542	1	restaurant	1757844531924_He65gONsj9ksNGfII3MwUDeiYl3pmvgM	2025-09-15 12:08:51.924+02	2025-09-14 12:08:53.178158+02	2025-09-14 12:08:53.178158+02	\N	\N
543	1	restaurant	1757845732372_uN6SGoPOy9K4okCCu4lIP1ygztAUwknx	2025-09-15 12:28:52.372+02	2025-09-14 12:28:52.861802+02	2025-09-14 12:28:52.861802+02	\N	\N
544	1	restaurant	1757845788791_bvIbceXmEuZdjsnkyawVJ2LjtFXmzzMI	2025-09-15 12:29:48.791+02	2025-09-14 12:29:49.269633+02	2025-09-14 12:29:49.269633+02	\N	\N
545	1	restaurant	1757848221097_3i5PzCKvipDyzLBYzl8UwA6gWuzcR2yA	2025-09-15 13:10:21.097+02	2025-09-14 13:10:21.659573+02	2025-09-14 13:10:21.659573+02	\N	\N
546	1	restaurant	1757874275256_DqRjSDj5js9Bhq9I1TQBkkvyxRZkZzpp	2025-09-15 20:24:35.256+02	2025-09-14 20:24:36.38722+02	2025-09-14 20:24:36.38722+02	\N	\N
547	1	restaurant	1758014731224_POZKsnAxj9r1NTYuSe5QMrLsxajqwl2R	2025-09-17 11:25:31.224+02	2025-09-16 11:25:31.909598+02	2025-09-16 11:25:31.909598+02	\N	\N
548	1	restaurant	1758015607298_KbK4adQAHwParArjyePKfcjHLuJMBbuQ	2025-09-17 11:40:07.298+02	2025-09-16 11:40:07.941037+02	2025-09-16 11:40:07.941037+02	\N	\N
549	1	restaurant	1758018896609_ApBCGOSkP8Igz3BVci8rtXre0ln9LYnI	2025-09-17 12:34:56.609+02	2025-09-16 12:34:57.621288+02	2025-09-16 12:34:57.621288+02	\N	\N
550	1	restaurant	1758028439568_MrM2BgGIzyUGDATD1nG56gVp7HHNNS17	2025-09-17 15:13:59.569+02	2025-09-16 15:14:00.782434+02	2025-09-16 15:14:00.782434+02	\N	\N
551	1	restaurant	1758028666296_4IpFO3KvBLxFFmAXq1SsJqECNBgPeCgp	2025-09-17 15:17:46.296+02	2025-09-16 15:17:47.483072+02	2025-09-16 15:17:47.483072+02	\N	\N
552	1	restaurant	1758037444698_HQA7RBf6qGll5qjpKy6YkJMMN7eDWj48	2025-09-17 17:44:04.698+02	2025-09-16 17:44:05.358612+02	2025-09-16 17:44:05.358612+02	\N	\N
553	1	restaurant	1758111797087_xRoAvLq2Z5RkwN0DLScnyszhRXwb6PNO	2025-09-18 14:23:17.087+02	2025-09-17 14:23:17.063182+02	2025-09-17 14:23:17.063182+02	\N	\N
554	1	restaurant	1758126027566_q0grJGe7UDDPWqMzaIIjlnP2gSCaNKQS	2025-09-18 18:20:27.566+02	2025-09-17 18:20:27.881479+02	2025-09-17 18:20:27.881479+02	\N	\N
555	1	restaurant	1758128869448_pWUiZiPslDEBw6Imwq4hi7ZSgAy9aTxr	2025-09-18 19:07:49.448+02	2025-09-17 19:07:49.834237+02	2025-09-17 19:07:49.834237+02	\N	\N
556	1	restaurant	1758129616465_GuBb4T6Z7t6YlNeIqqsJfY84exnejjhp	2025-09-18 19:20:16.465+02	2025-09-17 19:20:16.858651+02	2025-09-17 19:20:16.858651+02	\N	\N
557	1	restaurant	1758129807419_cB7ipRE0ReA3AjaTcasM5aZoBFRTGqHk	2025-09-18 19:23:27.419+02	2025-09-17 19:23:27.810513+02	2025-09-17 19:23:27.810513+02	\N	\N
558	1	restaurant	1758130044456_CFERKU3atwC5KQoUdZ34c45dlYtMezkT	2025-09-18 19:27:24.456+02	2025-09-17 19:27:24.856001+02	2025-09-17 19:27:24.856001+02	\N	\N
559	1	restaurant	1758130236164_wKQtEKgMFsdszluFIro8D4AkgFc6dB1Z	2025-09-18 19:30:36.165+02	2025-09-17 19:30:36.56549+02	2025-09-17 19:30:36.56549+02	\N	\N
560	1	restaurant	1758130606253_upjerbeqdCvZVWu0cBizDPkUXKC3eknQ	2025-09-18 19:36:46.253+02	2025-09-17 19:36:46.660673+02	2025-09-17 19:36:46.660673+02	\N	\N
561	1	restaurant	1758130670321_RzZcDg2LSnvGHQRMs9yq3KM6BpbVVlIh	2025-09-18 19:37:50.321+02	2025-09-17 19:37:50.715354+02	2025-09-17 19:37:50.715354+02	\N	\N
562	1	restaurant	1758130746265_q2ILX2AD8zCgniDhLgLY7tAmXjkt4ORc	2025-09-18 19:39:06.265+02	2025-09-17 19:39:06.670655+02	2025-09-17 19:39:06.670655+02	\N	\N
563	1	restaurant	1758131259607_tBZBHezcUCmemP92sv30whNFyCxfD27S	2025-09-18 19:47:39.607+02	2025-09-17 19:47:40.022409+02	2025-09-17 19:47:40.022409+02	\N	\N
564	1	restaurant	1758143534539_psSQCD9KeqgpJHcp8beb8qtxRv5JiZeU	2025-09-18 23:12:14.54+02	2025-09-17 23:12:15.244425+02	2025-09-17 23:12:15.244425+02	\N	\N
565	1	restaurant	1758180616482_wI06DEGDZR8erCAVwGP8KP0huEMtNwSZ	2025-09-19 09:30:16.482+02	2025-09-18 09:30:16.182901+02	2025-09-18 09:30:16.182901+02	\N	\N
566	1	restaurant	1758180807558_zyE65mxeedI2eSLrP0ugTK9ZDA9gCP1D	2025-09-19 09:33:27.558+02	2025-09-18 09:33:27.24064+02	2025-09-18 09:33:27.24064+02	\N	\N
567	1	restaurant	1758180942072_KcBURS0gPj9ce7qYblWNaGBboouMMsbK	2025-09-19 09:35:42.072+02	2025-09-18 09:35:41.774418+02	2025-09-18 09:35:41.774418+02	\N	\N
568	1	restaurant	1758181634595_IjqIoZ1OCvkJlbT2bcqKrIhWZ880agxj	2025-09-19 09:47:14.595+02	2025-09-18 09:47:14.292478+02	2025-09-18 09:47:14.292478+02	\N	\N
569	1	restaurant	1758182122514_OKGdgKeP2G0eju4OdM35X1RBPJRfKyXc	2025-09-19 09:55:22.514+02	2025-09-18 09:55:22.222914+02	2025-09-18 09:55:22.222914+02	\N	\N
570	1	restaurant	1758182157162_rlPtSBicU1Pasiwo6YFqiRbzOp8WZFML	2025-09-19 09:55:57.162+02	2025-09-18 09:55:56.860205+02	2025-09-18 09:55:56.860205+02	\N	\N
571	1	restaurant	1758182166710_qPdqcOEsKqR6Nk9t8oVh4rDb1OnQPY7p	2025-09-19 09:56:06.71+02	2025-09-18 09:56:06.409134+02	2025-09-18 09:56:06.409134+02	\N	\N
572	1	restaurant	1758188069939_gJEKXZ9X6xchF8DYMz2LNWXWDs5aMo8R	2025-09-19 11:34:29.94+02	2025-09-18 11:34:29.821802+02	2025-09-18 11:34:29.821802+02	\N	\N
573	1	restaurant	1758188131694_KidNyLRijf7TsOU1hCWPYFE8kho7qX7g	2025-09-19 11:35:31.694+02	2025-09-18 11:35:31.533099+02	2025-09-18 11:35:31.533099+02	\N	\N
574	5	driver	1758188264530_kcQw92PHv53kaBJZQlFYzyL0bNPMUmmh	2025-10-18 11:37:44.53+02	2025-09-18 11:37:44.599712+02	2025-09-18 11:37:44.599712+02	\N	\N
575	1	restaurant	1758211255013_F5MUAFi51lIOf5lhfYVgY2dyhcoRUQhP	2025-09-19 18:00:55.014+02	2025-09-18 18:00:55.375013+02	2025-09-18 18:00:55.375013+02	\N	\N
576	1	restaurant	1758211285061_BN0gaSP986YUZaE7Ww9dqFm6h8vdtTcV	2025-09-19 18:01:25.062+02	2025-09-18 18:01:25.372981+02	2025-09-18 18:01:25.372981+02	\N	\N
578	1	restaurant	1758214757724_qQFbq2InjfWMeZJq4HWEhqErhKmL75eX	2025-09-19 18:59:17.724+02	2025-09-18 18:59:18.123121+02	2025-09-18 18:59:18.123121+02	\N	\N
579	1	restaurant	1758214958968_azFkA8RwEF1sx590UpgT7zhRNMbAEXwr	2025-09-19 19:02:38.968+02	2025-09-18 19:02:39.388198+02	2025-09-18 19:02:39.388198+02	\N	\N
580	1	restaurant	1758217772509_NRUZVVSgRIQFHcLhU5PpMbVYwEhdCbXZ	2025-09-19 19:49:32.509+02	2025-09-18 19:49:32.972056+02	2025-09-18 19:49:32.972056+02	\N	\N
581	1	restaurant	1758218840862_lpGM2aHuChEOi5eXpgDFH5pGrVk4aBN4	2025-09-19 20:07:20.862+02	2025-09-18 20:07:21.383583+02	2025-09-18 20:07:21.383583+02	\N	\N
583	1	restaurant	1758220183993_jSeRiH367Ss3yWkHjVNDGHEPG9uwnQy1	2025-09-19 20:29:43.993+02	2025-09-18 20:29:44.544219+02	2025-09-18 20:29:44.544219+02	\N	\N
584	1	restaurant	1758220320217_dk7l70pub5lp22cjpgwDaDePjfSenVkS	2025-09-19 20:32:00.217+02	2025-09-18 20:32:00.743387+02	2025-09-18 20:32:00.743387+02	\N	\N
585	1	restaurant	1758226773779_MMa6Rozh2VTYMcFkEHLchIZwtoL07hde	2025-09-19 22:19:33.779+02	2025-09-18 22:19:34.465235+02	2025-09-18 22:19:34.465235+02	\N	\N
\.


--
-- TOC entry 4521 (class 0 OID 17389)
-- Dependencies: 398
-- Data for Name: france_composite_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_composite_items (id, composite_product_id, component_name, quantity, unit) FROM stdin;
74	383	Wings	6	pièces
75	383	Tenders	6	pièces
76	383	Nuggets	6	pièces
77	383	Frites	2	portions
78	383	Mozza Stick	2	pièces
79	383	Donuts	2	pièces
80	383	Onion Rings	4	pièces
26	235	Frites	1	portion
27	235	Kinder Surprise	1	pièce
28	235	Plat Principal	1	choix
29	235	Boisson Enfant	1	choix
46	240	Wings	25	pièces
47	240	Frites	2	portions
48	240	Boisson 1L5	1	choix
49	241	Tenders	8	pièces
50	241	Wings	15	pièces
51	241	Frites	2	portions
52	241	Boisson 1L5	1	choix
53	242	Tenders	20	pièces
54	242	Frites	2	portions
55	242	Boisson 1L5	1	choix
65	310	3 PIZZAS JUNIORS AU CHOIX	3	pièces
66	311	2 PIZZAS SÉNIOR AU CHOIX	2	pièces
67	311	1 BOISSON 1.5 L	1	pièce
68	312	1 PIZZAS MEGA AU CHOIX	1	pièce
69	312	14 NUGGETS OU 12 WINGS	1	portion
70	312	1 BOISSON 1.5 L	1	pièce
71	313	1 PIZZAS SÉNIOR AU CHOIX	1	pièce
72	313	2 BOISSONS 33 CL	2	pièces
73	313	6 WINGS OU 8 NUGGETS	1	portion
38	238	Viande	1	choix
39	238	Cheddar	1	portion
40	238	Sauce fromagère	1	portion
41	238	Frites	1	portion
\.


--
-- TOC entry 4530 (class 0 OID 20455)
-- Dependencies: 408
-- Data for Name: france_customer_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_customer_addresses (id, phone_number, address_label, full_address, google_place_id, latitude, longitude, is_default, created_at, updated_at, is_active, whatsapp_name) FROM stdin;
2	33620951645@c.us	Adresse 280 Av. Philippe Bur	280 Av. Philippe Bur, 77550 Moissy-Cramayel	ChIJt1Npd2vj5UcRXvZH7Cwyudc	48.62765940	2.58919260	f	2025-09-02 19:20:35.551638+02	2025-09-06 15:38:43.362565+02	f	\N
3	33620951645@c.us	Adresse 1 Pl. de la Fontaine	1 Pl. de la Fontaine, 77550 Moissy-Cramayel	ChIJ-whz0Gnj5UcRnIVQIXN4IQA	48.62290900	2.59300100	f	2025-09-02 19:51:02.735862+02	2025-09-06 15:38:43.362565+02	f	\N
1	33620951645@c.us	Domicile	206 Rue de Séville, 77550 Moissy-Cramayel	ChIJ-8SL8nLj5UcRYtGdHUkluXc	48.62815290	2.58131470	t	2025-09-02 18:41:17.494026+02	2025-09-06 15:51:16.830376+02	f	\N
4	33620951645@c.us	Adresse 2 Rue de Paris	2 Rue de Paris, 77127 Lieusaint	ChIJs5Yk8MDj5UcRGd-xQDGMJps	48.63382140	2.54747760	f	2025-09-05 10:06:58.488059+02	2025-09-08 12:55:07.575034+02	f	\N
5	33620951645@c.us	Adresse 23 Pl. du Colombier	23 Pl. du Colombier, 77127 Lieusaint	ChIJ910BCb_j5UcR_wXQG_RSXFY	48.63343450	2.55162870	f	2025-09-05 18:36:00.946192+02	2025-09-08 13:06:54.64009+02	f	\N
9	33620951645@c.us	Maison	2 Av. Général Leclerc, 77010 Melun	ChIJF5HUEoDw5UcR19BiKekM5KI	48.52702110	2.65281790	f	2025-09-06 16:10:55.070907+02	2025-09-08 13:41:03.248005+02	f	Labico
10	33620951645@c.us	Bureau	76 All. de Bercy, 75012 Paris	ChIJjUC79xpy5kcRPadxCw4WmMw	48.84312920	2.37510180	f	2025-09-08 12:55:08.337729+02	2025-09-08 13:52:12.532815+02	f	Labico
11	33620951645@c.us	Autre	76 All. de Bercy, 75012 Paris	ChIJjUC79xpy5kcRPadxCw4WmMw	48.84312920	2.37510180	f	2025-09-08 13:06:55.421102+02	2025-09-12 12:48:58.443376+02	f	Labico
12	33620951645@c.us	Adresse 1	11 Pl. Beauvau, 75008 Paris	ChIJ8cYBqc5v5kcR0xzhauKMFIc	48.87121120	2.31689540	f	2025-09-08 13:41:03.941397+02	2025-09-12 12:48:59.097303+02	t	Labico
13	33620951645@c.us	Maison	23 Pl. du Colombier, 77127 Lieusaint	ChIJ910BCb_j5UcR_wXQG_RSXFY	48.63343450	2.55162870	f	2025-09-08 13:52:13.223936+02	2025-09-12 12:48:59.097303+02	t	Labico
14	33620951645@c.us	Bureau	206 Rue de Séville, 77550 Moissy-Cramayel	ChIJ-8SL8nLj5UcRYtGdHUkluXc	48.62815290	2.58131470	t	2025-09-12 12:48:59.138528+02	2025-09-12 12:48:59.138528+02	t	Labico
\.


--
-- TOC entry 4536 (class 0 OID 21577)
-- Dependencies: 414
-- Data for Name: france_delivery_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_delivery_assignments (id, order_id, driver_id, assignment_status, created_at, responded_at, expires_at, response_time_seconds) FROM stdin;
38	147	6	pending	2025-09-18 19:03:39.230097+02	\N	\N	\N
\.


--
-- TOC entry 4532 (class 0 OID 20781)
-- Dependencies: 410
-- Data for Name: france_delivery_drivers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_delivery_drivers (id, restaurant_id, first_name, last_name, phone_number, email, is_active, created_at, updated_at, is_online, current_latitude, current_longitude, last_location_update, password) FROM stdin;
6	1	hadja balde	hadja balde	0620951645	\N	t	2025-09-18 18:57:05.853631+02	2025-09-18 18:57:05.853631+02	t	\N	\N	2025-09-18 18:57:05.853631+02	116367
\.


--
-- TOC entry 4538 (class 0 OID 21603)
-- Dependencies: 416
-- Data for Name: france_delivery_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_delivery_notifications (id, assignment_id, notification_type, recipient_type, recipient_id, notification_data, sent_at, delivery_status, error_message) FROM stdin;
\.


--
-- TOC entry 4540 (class 0 OID 21626)
-- Dependencies: 418
-- Data for Name: france_driver_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_driver_locations (id, driver_id, latitude, longitude, accuracy_meters, recorded_at) FROM stdin;
\.


--
-- TOC entry 4511 (class 0 OID 17290)
-- Dependencies: 388
-- Data for Name: france_menu_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at) FROM stdin;
10	1	Pizzas	pizzas	🍕	2	t	2025-09-04 22:40:00.468197
2	1	BURGERS	burgers	🍔	3	t	2025-09-01 13:16:46.405758
11	1	Menu Pizza	menus	📋	4	t	2025-09-04 22:40:00.468197
3	1	SANDWICHS	sandwichs	🥪	5	t	2025-09-01 13:16:46.405758
4	1	GOURMETS	gourmets	🥘	6	t	2025-09-01 13:16:46.405758
5	1	SMASHS	smashs	🥩	7	t	2025-09-01 13:16:46.405758
6	1	ASSIETTES	assiettes	🍽️	8	t	2025-09-01 13:16:46.405758
7	1	NAANS	naans	🫓	9	t	2025-09-01 13:16:46.405758
8	1	POULET & SNACKS	poulet-snacks	🍗	10	t	2025-09-01 13:16:46.405758
12	1	ICE CREAM	ice-cream	🍨	11	t	2025-09-05 12:12:39.5767
13	1	DESSERTS	desserts	🧁	12	t	2025-09-05 12:14:57.514246
15	1	SALADES	salades	🥗	14	t	2025-09-05 12:26:58.822744
16	1	TEX-MEX	tex-mex	🌮	15	t	2025-09-05 12:29:18.502862
17	1	PANINI	panini	🥪	16	t	2025-09-05 12:36:29.294786
18	1	PÂTES	pates	🍝	17	t	2025-09-05 12:46:39.933629
19	1	MENU ENFANT	menu-enfant	🍽️	18	t	2025-09-05 14:13:42.925981
21	1	BOWLS	bowls	🍽️	19	t	2025-09-05 14:54:15.772908
22	1	CHICKEN BOX	chicken-box	🍽️	20	t	2025-09-05 15:10:36.445283
1	1	TACOS	tacos	🌮	1	t	2025-09-01 13:16:46.405758
14	1	BOISSONS	drinks	🥤	13	t	2025-09-05 12:15:00.359784
26	1	MENU FAMILY	menu-family	👨‍👩‍👧‍👦	22	t	2025-09-15 22:56:33.77911
23	1	SNACKS	snacks	🍽️	21	f	2025-09-05 15:16:01.38879
38	1	MENU MIDI : PLAT + DESSERT + BOISSON	menu-midi	🍽️	5	t	2025-09-17 15:26:20.115959
\.


--
-- TOC entry 4525 (class 0 OID 17424)
-- Dependencies: 402
-- Data for Name: france_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_orders (id, restaurant_id, phone_number, customer_name, items, total_amount, delivery_mode, delivery_address, payment_mode, payment_method, status, notes, order_number, created_at, updated_at, delivery_address_id, delivery_validation_code, date_validation_code, driver_id, estimated_delivery_time, driver_assignment_status, delivery_started_at, assignment_timeout_at, assignment_started_at, audio_played, additional_notes) FROM stdin;
103	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L", "categoryName": "TACOS", "configuration": {"size": [{"id": 153, "is_active": true, "size_name": "MENU L", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU L", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 348, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Blanche", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 321, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Filet de Poulet", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 612, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *TROPICO* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L ( - Samurai, Blanche - Filet de Poulet - 🥤 *TROPICO* 33CL - Pas de suppléments)"}]	8.50	sur_place	\N	\N	\N	annulee	\N	1409-0005	2025-09-14 14:27:30.061493	2025-09-14 14:37:22.801447	\N	\N	\N	\N	\N	none	\N	\N	\N	f	\N
110	1	33620951645	\N	[{"quantity": 1, "productId": 186, "unitPrice": 9, "totalPrice": 9, "productName": "TENDERS", "categoryName": "TEX-MEX", "configuration": null, "productDescription": "TENDERS"}]	9.00	sur_place	\N	\N	\N	annulee	\N	1709-0005	2025-09-17 10:58:24.413467	2025-09-17 11:04:08.860891	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
82	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L", "categoryName": "Produit", "configuration": {"size": [{"id": 153, "size_name": "MENU L", "product_id": 201, "variant_name": "MENU L", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 2, "max_selections": 2, "price_modifier": 0}, {"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 3, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 324, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Viande Hachée", "option_group": "viande", "display_order": 6, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 620, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🫧 *PERRIER* 33CL", "option_group": "boisson", "display_order": 12, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L ( - Ketchup, Mayo - Viande Hachée - 🫧 *PERRIER* 33CL - Pas de suppléments)"}]	8.50	livraison	206 Rue de Séville, 77550 Moissy-Cramayel	\N	\N	livree	\N	1309-0008	2025-09-13 15:06:13.100114	2025-09-13 13:35:10.776	14	1735	2025-09-13 15:35:10.776+02	\N	2025-09-13 15:39:18.61+02	assigned	2025-09-13 15:09:18.61+02	2025-09-13 15:11:07.374+02	2025-09-13 15:07:43.805713+02	f	\N
118	1	33620951645	\N	[{"id": 310, "name": "📋 MENU 1", "type": "menu_pizza", "price": 25, "details": {"pizzas": [{"id": 307, "name": "🔥 HOT SPICY", "size": "JUNIOR", "price": 0}, {"id": 308, "name": "🍛 TANDOORI", "size": "JUNIOR", "price": 0}, {"id": 309, "name": "🍔 BIG BURGER", "size": "JUNIOR", "price": 0}]}, "quantity": 1, "deliveryMode": "sur_place"}]	0.00	sur_place	\N	\N	\N	annulee	\N	1709-0013	2025-09-17 13:40:59.415642	2025-09-17 13:48:06.384543	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
124	1	33620951645	\N	[{"quantity": 1, "productId": 403, "unitPrice": 11, "totalPrice": 11, "productName": "🍽 🍽 MENU MIDI COMPLET", "categoryName": "MENU MIDI : PLAT + DESSERT + BOISSON", "configuration": {"choix_plat": [{"id": 2714, "is_active": true, "product_id": 403, "group_order": 1, "is_required": true, "option_name": "🥪 2. PANINI AVEC FRITE OU POTATOES", "option_group": "choix_plat", "display_order": 2, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": {"1": 2, "2": 3, "3": 4, "4": 5, "5": 6, "6": 6}}], "paninis_choix": [{"id": 2737, "is_active": true, "product_id": 403, "group_order": 3, "is_required": false, "option_name": "🍯 5. CHÈVRE MIEL", "option_group": "paninis_choix", "display_order": 5, "max_selections": 1, "price_modifier": 0, "next_group_order": 7, "conditional_next_group": null}], "boissons_choix": [{"id": 2747, "is_active": true, "product_id": 403, "group_order": 7, "is_required": true, "option_name": "🥤 5. ICE TEA", "option_group": "boissons_choix", "display_order": 5, "max_selections": 1, "price_modifier": 0, "next_group_order": 8, "conditional_next_group": null}], "desserts_choix": [{"id": 2755, "is_active": true, "product_id": 403, "group_order": 8, "is_required": true, "option_name": "🍰 1. SALADE DE FRUITS", "option_group": "desserts_choix", "display_order": 1, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "🍽 🍽 MENU MIDI COMPLET (🥪 2. PANINI AVEC FRITE OU POTATOES - 🍯 5. CHÈVRE MIEL - 🥤 5. ICE TEA - 🍰 1. SALADE DE FRUITS)"}]	11.00	sur_place	\N	\N	\N	annulee	\N	1709-0019	2025-09-17 18:20:16.926418	2025-09-17 18:21:03.534592	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
132	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 348, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Blanche", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 319, "is_active": false, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Nuggets", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 611, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🧡 *OASIS TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Samurai, Blanche - Nuggets - 🧡 *OASIS TROPICAL* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	pending	\N	1809-0004	2025-09-18 09:08:48.256855	2025-09-18 09:08:48.256855	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
127	1	33620951645	\N	[{"sizeId": 199, "addedAt": "2025-09-17T22:27:20.000Z", "quantity": 1, "sizeName": "JUNIOR", "productId": 280, "unitPrice": 9, "totalPrice": 9, "productName": "🍕 NAPOLITAINE", "categoryName": "Pizzas", "productDescription": "🍕 NAPOLITAINE - Taille: JUNIOR"}, {"sizeId": 187, "addedAt": "2025-09-17T22:27:25.000Z", "quantity": 1, "sizeName": "JUNIOR", "productId": 276, "unitPrice": 9, "totalPrice": 9, "productName": "🍕 CLASSICA", "categoryName": "Pizzas", "productDescription": "🍕 CLASSICA - Taille: JUNIOR"}]	18.00	sur_place	\N	\N	\N	annulee	\N	1709-0022	2025-09-17 22:27:29.384947	2025-09-17 22:37:04.698487	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
60	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L", "configuration": {"size": [{"id": 153, "size_name": "MENU L", "product_id": 201, "variant_name": "MENU L", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 2, "max_selections": 2, "price_modifier": 0}, {"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 3, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 319, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Nuggets", "option_group": "viande", "display_order": 1, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 617, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *COCA COLA* 33CL", "option_group": "boisson", "display_order": 9, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L ( - Ketchup, Mayo - Nuggets - 🥤 *COCA COLA* 33CL - Pas de suppléments)"}]	8.50	livraison	23 Pl. du Colombier, 77127 Lieusaint	\N	\N	annulee	\N	1209-0006	2025-09-12 09:45:29.867847	2025-09-12 07:45:56.428	13	4317	\N	\N	\N	none	\N	\N	\N	f	\N
142	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 341, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Andalouse", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 611, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🧡 *OASIS TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Ketchup, Andalouse - Cordon Bleu - 🧡 *OASIS TROPICAL* 33CL - Pas de suppléments)"}, {"quantity": 1, "productId": 183, "unitPrice": 7.5, "totalPrice": 7.5, "productName": "CESAR", "categoryName": "SALADES", "configuration": null, "productDescription": "CESAR"}]	14.50	livraison	206 Rue de Séville, 77550 Moissy-Cramayel	\N	\N	pending	\N	1809-0014	2025-09-18 11:42:50.310507	2025-09-18 11:42:50.310507	14	5427	\N	\N	\N	none	\N	\N	\N	t	\N
119	1	33620951645	\N	[{"id": 310, "name": "📋 MENU 1", "type": "menu_pizza", "price": 25, "details": {"pizzas": [{"id": 307, "name": "🔥 HOT SPICY", "size": "JUNIOR", "price": 0}, {"id": 308, "name": "🍛 TANDOORI", "size": "JUNIOR", "price": 0}, {"id": 309, "name": "🍔 BIG BURGER", "size": "JUNIOR", "price": 0}]}, "quantity": 1, "deliveryMode": "sur_place"}]	25.00	sur_place	\N	\N	\N	annulee	\N	1709-0014	2025-09-17 13:48:43.760738	2025-09-17 13:50:42.849296	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
55	1	33620951645	\N	[{"quantity": 1, "productId": 222, "unitPrice": 12.9, "totalPrice": 12.9, "productName": "LE SMASH MIELLEUX", "configuration": {"Boisson 33CL incluse": [{"id": 1139, "is_active": true, "product_id": 222, "group_order": 0, "is_required": true, "option_name": "3️⃣ 🌺 OASIS TROPICAL", "option_group": "Boisson 33CL incluse", "display_order": 3, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "LE SMASH MIELLEUX (3️⃣ 🌺 OASIS TROPICAL)"}, {"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M", "configuration": {"size": [{"id": 152, "size_name": "MENU M", "product_id": 201, "variant_name": "MENU M", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 2, "max_selections": 2, "price_modifier": 0}, {"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 3, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 324, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Viande Hachée", "option_group": "viande", "display_order": 6, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 620, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🫧 *PERRIER* 33CL", "option_group": "boisson", "display_order": 12, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU M ( - Ketchup, Mayo - Viande Hachée - 🫧 *PERRIER* 33CL - Pas de suppléments)"}]	19.90	livraison	76 All. de Bercy, 75012 Paris	\N	\N	annulee	\N	1209-0001	2025-09-12 08:33:48.501051	2025-09-12 06:35:41.568	11	5327	\N	\N	\N	none	\N	\N	\N	f	\N
61	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M", "configuration": {"size": [{"id": 152, "size_name": "MENU M", "product_id": 201, "variant_name": "MENU M", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 2, "max_selections": 2, "price_modifier": 0}, {"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 3, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 5, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 620, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🫧 *PERRIER* 33CL", "option_group": "boisson", "display_order": 12, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU M ( - Ketchup, Mayo - Cordon Bleu - 🫧 *PERRIER* 33CL - Pas de suppléments)"}, {"quantity": 1, "productId": 195, "unitPrice": 7, "totalPrice": 7, "productName": "BEN & JERRY'S 500ML", "configuration": null, "productDescription": "BEN & JERRY'S 500ML"}]	14.00	livraison	23 Pl. du Colombier, 77127 Lieusaint	\N	\N	annulee	\N	1209-0007	2025-09-12 10:41:12.153495	2025-09-12 08:41:28.442	13	1131	\N	\N	\N	none	\N	\N	\N	f	\N
147	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8, "totalPrice": 8, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 348, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Blanche", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 611, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🧡 *OASIS TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Samurai, Blanche - Cordon Bleu - 🧡 *OASIS TROPICAL* 33CL - Pas de suppléments)"}]	8.00	livraison	206 Rue de Séville, 77550 Moissy-Cramayel	\N	\N	livree	\N	1809-0019	2025-09-18 19:02:22.745897	2025-09-18 20:30:26	14	6215	2025-09-18 20:30:25.846+02	6	2025-09-18 19:35:38.697+02	assigned	2025-09-18 19:05:38.697+02	2025-09-18 19:07:38.539+02	2025-09-18 19:05:24.939843+02	f	\N
97	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 10, "totalPrice": 10, "productName": "TACOS MENU XL", "categoryName": "TACOS", "configuration": {"size": [{"id": 154, "is_active": true, "size_name": "MENU XL", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU XL", "variant_type": "size", "display_order": 3, "price_on_site": 10, "includes_drink": true, "price_delivery": 11, "has_drink_included": true}], "sauce": [{"id": 347, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Algérienne", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 344, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Harissa", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 321, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Filet de Poulet", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 618, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "⚫ *COCA ZERO* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU XL ( - Algérienne, Harissa - Filet de Poulet - ⚫ *COCA ZERO* 33CL - Pas de suppléments)"}]	10.00	livraison	206 Rue de Séville, 77550 Moissy-Cramayel	\N	\N	annulee	\N	1309-0023	2025-09-13 20:40:33.222323	2025-09-13 20:13:57.147	14	2539	\N	\N	\N	none	\N	\N	\N	f	\N
111	1	33620951645	\N	[{"quantity": 1, "productId": 351, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "LE BOURSIN", "categoryName": "SANDWICHS", "configuration": {"Boisson 33CL incluse": [{"id": 2250, "is_active": true, "product_id": 351, "group_order": 0, "is_required": false, "option_name": "7️⃣ 🧊 ICE TEA", "option_group": "Boisson 33CL incluse", "display_order": 7, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "LE BOURSIN (7️⃣ 🧊 ICE TEA)"}]	8.50	sur_place	\N	\N	\N	annulee	\N	1709-0006	2025-09-17 11:11:03.673846	2025-09-17 11:18:53.066729	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
128	1	33620951645	\N	[{"sizeId": 187, "addedAt": "2025-09-17T23:50:46.000Z", "quantity": 1, "sizeName": "JUNIOR", "productId": 276, "unitPrice": 9, "totalPrice": 9, "productName": "🍕 CLASSICA", "categoryName": "Pizzas", "productDescription": "🍕 CLASSICA - Taille: JUNIOR"}]	9.00	sur_place	\N	\N	\N	annulee	\N	1709-0023	2025-09-17 23:52:34.713275	2025-09-18 08:06:44.114563	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
104	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8, "totalPrice": 8, "productName": "TACOS MENU M", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M", "variant_type": "size", "display_order": 1, "price_on_site": 8, "includes_drink": true, "price_delivery": 9, "has_drink_included": true}], "sauce": [{"id": 341, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Andalouse", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 324, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Viande Hachée", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 615, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *7UP TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU M ( - Andalouse, Samurai - Viande Hachée - 🥤 *7UP TROPICAL* 33CL - Pas de suppléments)"}]	8.00	sur_place	\N	\N	\N	annulee	\N	1409-0006	2025-09-14 14:43:36.001796	2025-09-14 14:51:00.96448	\N	\N	\N	\N	\N	none	\N	\N	\N	f	\N
120	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L - 2 VIANDES", "categoryName": "TACOS", "configuration": {"size": [{"id": 290, "is_active": true, "size_name": "MENU L - 2 VIANDES", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU L - 2 VIANDES", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 347, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Algérienne", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 344, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Harissa", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 617, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *COCA COLA* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L - 2 VIANDES ( - Algérienne, Harissa - Cordon Bleu - 🥤 *COCA COLA* 33CL - Pas de suppléments)"}]	8.50	sur_place	\N	\N	\N	servie	\N	1709-0015	2025-09-17 13:52:57.916807	2025-09-17 14:11:14	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
62	1	33620951645	\N	[{"quantity": 1, "productId": 238, "unitPrice": 8, "totalPrice": 8, "productName": "BOWL", "configuration": {"viande": [{"id": 2, "name": "Merguez", "option_name": "Merguez", "is_available": true, "price_modifier": 0}]}, "productDescription": "BOWL (Merguez)"}, {"quantity": 1, "productId": 227, "unitPrice": 9.9, "totalPrice": 9.9, "productName": "GREC", "configuration": {"Boisson 33CL incluse": [{"id": 1247, "is_active": true, "product_id": 227, "group_order": 0, "is_required": true, "option_name": "3️⃣ 🌺 OASIS TROPICAL", "option_group": "Boisson 33CL incluse", "display_order": 3, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "GREC (3️⃣ 🌺 OASIS TROPICAL)"}]	17.90	sur_place	\N	\N	\N	annulee	\N	1209-0008	2025-09-12 12:41:29.697162	2025-09-12 10:43:49.384	\N	\N	\N	\N	\N	none	\N	\N	\N	f	\N
98	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L", "categoryName": "TACOS", "configuration": {"size": [{"id": 153, "is_active": true, "size_name": "MENU L", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU L", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 348, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Blanche", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "extras": [{"id": 327, "is_active": true, "product_id": 201, "group_order": 4, "is_required": false, "option_name": "Boursin", "option_group": "extras", "display_order": 0, "max_selections": 5, "price_modifier": 3}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 612, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *TROPICO* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 595, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Ajouter des suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L ( - Blanche, Ketchup - Boursin - Cordon Bleu - 🥤 *TROPICO* 33CL - Ajouter des suppléments)"}]	8.50	sur_place	\N	\N	\N	annulee	\N	1309-0024	2025-09-13 22:15:48.572698	2025-09-13 20:37:46.833	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
56	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M", "configuration": {"size": [{"id": 152, "size_name": "MENU M", "product_id": 201, "variant_name": "MENU M", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 341, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Andalouse", "option_group": "sauce", "display_order": 1, "max_selections": 2, "price_modifier": 0}, {"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 2, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 324, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Viande Hachée", "option_group": "viande", "display_order": 6, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 620, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🫧 *PERRIER* 33CL", "option_group": "boisson", "display_order": 12, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU M ( - Andalouse, Ketchup - Viande Hachée - 🫧 *PERRIER* 33CL - Pas de suppléments)"}]	7.00	livraison	23 Pl. du Colombier, 77127 Lieusaint	\N	\N	annulee	\N	1209-0002	2025-09-12 09:11:50.083034	2025-09-12 07:13:03.093	13	6690	\N	\N	\N	none	\N	\N	\N	f	\N
112	1	33620951645	\N	[{"quantity": 1, "productId": 240, "unitPrice": 22, "totalPrice": 22, "productName": "CHICKEN BOX", "categoryName": "CHICKEN BOX", "configuration": {"Boisson 1.5L incluse": [{"id": 2569, "is_active": true, "product_id": 240, "group_order": 0, "is_required": false, "option_name": "1️⃣ 🥤 COCA COLA 1L5 (1.5L)", "option_group": "Boisson 1.5L incluse", "display_order": 1, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "CHICKEN BOX (1️⃣ 🥤 COCA COLA 1L5 (1.5L))"}]	22.00	livraison	11 Pl. Beauvau, 75008 Paris	\N	\N	annulee	\N	1709-0007	2025-09-17 11:23:19.023301	2025-09-17 11:23:28.600001	12	1831	\N	\N	\N	none	\N	\N	\N	t	\N
129	1	33620951645	\N	[{"sizeId": 283, "addedAt": "2025-09-18T08:33:15.000Z", "quantity": 1, "sizeName": "JUNIOR", "productId": 308, "unitPrice": 10, "totalPrice": 10, "productName": "🍛 TANDOORI", "categoryName": "Pizzas", "productDescription": "🍛 TANDOORI - Taille: JUNIOR"}]	10.00	sur_place	\N	\N	\N	pending	\N	1809-0001	2025-09-18 08:33:26.637237	2025-09-18 08:33:26.637237	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
137	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 612, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *TROPICO* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Samurai - Cordon Bleu - 🥤 *TROPICO* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	pending	\N	1809-0009	2025-09-18 10:46:02.907789	2025-09-18 10:46:37	\N	\N	\N	\N	\N	none	\N	\N	\N	f	[10:46] Je veux du pain avec svp
141	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 346, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Biggy", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 324, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Viande Hachée", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 615, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *7UP TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Samurai, Biggy - Viande Hachée - 🥤 *7UP TROPICAL* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	annulee	\N	1809-0013	2025-09-18 11:40:43.763781	2025-09-18 11:41:14	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
57	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M", "configuration": {"size": [{"id": 152, "size_name": "MENU M", "product_id": 201, "variant_name": "MENU M", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 2, "max_selections": 2, "price_modifier": 0}, {"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 3, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 324, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Viande Hachée", "option_group": "viande", "display_order": 6, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 620, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🫧 *PERRIER* 33CL", "option_group": "boisson", "display_order": 12, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU M ( - Ketchup, Mayo - Viande Hachée - 🫧 *PERRIER* 33CL - Pas de suppléments)"}]	7.00	livraison	23 Pl. du Colombier, 77127 Lieusaint	\N	\N	annulee	\N	1209-0003	2025-09-12 09:20:56.407645	2025-09-12 07:21:10.335	13	3653	\N	\N	\N	none	\N	\N	\N	f	\N
63	1	33620951645	\N	[{"quantity": 1, "productId": 227, "unitPrice": 10.9, "totalPrice": 10.9, "productName": "GREC", "configuration": {"Boisson 33CL incluse": [{"id": 1247, "is_active": true, "product_id": 227, "group_order": 0, "is_required": true, "option_name": "3️⃣ 🌺 OASIS TROPICAL", "option_group": "Boisson 33CL incluse", "display_order": 3, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "GREC (3️⃣ 🌺 OASIS TROPICAL)"}]	10.90	livraison	206 Rue de Séville, 77550 Moissy-Cramayel	\N	\N	annulee	\N	1209-0009	2025-09-12 12:48:59.223029	2025-09-12 11:07:08.753	14	8266	\N	\N	\N	none	\N	\N	\N	f	\N
105	1	33667326357	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L", "categoryName": "TACOS", "configuration": {"size": [{"id": 153, "is_active": true, "size_name": "MENU L", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU L", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 347, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Algérienne", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 344, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Harissa", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 324, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Viande Hachée", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 611, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🧡 *OASIS TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L ( - Algérienne, Harissa - Viande Hachée - 🧡 *OASIS TROPICAL* 33CL - Pas de suppléments)"}, {"quantity": 1, "productId": 193, "unitPrice": 7, "totalPrice": 7, "productName": "HÄAGEN-DAZS 500ML", "categoryName": "ICE CREAM", "configuration": null, "productDescription": "HÄAGEN-DAZS 500ML"}]	15.50	a_emporter	\N	\N	\N	recuperee	\N	1509-0001	2025-09-15 10:55:34.574019	2025-09-15 10:56:52	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
93	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L", "categoryName": "TACOS", "configuration": {"size": [{"id": 153, "size_name": "MENU L", "product_id": 201, "variant_name": "MENU L", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 3, "max_selections": 2, "price_modifier": 0}, {"id": 344, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Harissa", "option_group": "sauce", "display_order": 4, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 319, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Nuggets", "option_group": "viande", "display_order": 1, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 614, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *7 UP* 33CL", "option_group": "boisson", "display_order": 6, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L ( - Mayo, Harissa - Nuggets - 🥤 *7 UP* 33CL - Pas de suppléments)"}]	8.50	sur_place	\N	\N	\N	annulee	\N	1309-0019	2025-09-13 17:39:32.687859	2025-09-13 15:41:47.842	\N	\N	\N	\N	\N	none	\N	\N	\N	f	\N
123	1	33620951645	\N	[{"quantity": 1, "productId": 403, "unitPrice": 11, "totalPrice": 11, "productName": "🍽 🍽 MENU MIDI COMPLET", "categoryName": "MENU MIDI : PLAT + DESSERT + BOISSON", "configuration": {"choix_plat": [{"id": 2713, "is_active": true, "product_id": 403, "group_order": 1, "is_required": true, "option_name": "🥗 1. SALADE AU CHOIX", "option_group": "choix_plat", "display_order": 1, "max_selections": 1, "price_modifier": 0, "next_group_order": null}], "salades_choix": [{"id": 2728, "is_active": true, "product_id": 403, "group_order": 2, "is_required": false, "option_name": "🥬 2. ROMAINE", "option_group": "salades_choix", "display_order": 2, "max_selections": 1, "price_modifier": 0, "next_group_order": 7}], "boissons_choix": [{"id": 2750, "is_active": true, "product_id": 403, "group_order": 7, "is_required": true, "option_name": "🥤 8. 7UP CHERRY", "option_group": "boissons_choix", "display_order": 8, "max_selections": 1, "price_modifier": 0, "next_group_order": 8}], "desserts_choix": [{"id": 2760, "is_active": true, "product_id": 403, "group_order": 8, "is_required": true, "option_name": "🍰 6. TARTE AUX DAIMS", "option_group": "desserts_choix", "display_order": 6, "max_selections": 1, "price_modifier": 0, "next_group_order": null}]}, "productDescription": "🍽 🍽 MENU MIDI COMPLET (🥗 1. SALADE AU CHOIX - 🥬 2. ROMAINE - 🥤 8. 7UP CHERRY - 🍰 6. TARTE AUX DAIMS)"}]	11.00	sur_place	\N	\N	\N	annulee	\N	1709-0018	2025-09-17 18:04:23.793672	2025-09-17 18:04:40.49332	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
113	1	33620951645	\N	{"menu_310_1758103625274": {"id": 310, "name": "📋 MENU 1", "type": "menu_pizza", "price": 25, "details": {"pizzas": [{"id": 307, "name": "🔥 HOT SPICY", "size": "JUNIOR", "price": 0}, {"id": 308, "name": "🍛 TANDOORI", "size": "JUNIOR", "price": 0}, {"id": 309, "name": "🍔 BIG BURGER", "size": "JUNIOR", "price": 0}]}, "quantity": 1, "deliveryMode": "livraison"}}	0.00	livraison	206 Rue de Séville, 77550 Moissy-Cramayel	\N	\N	annulee	\N	1709-0008	2025-09-17 12:07:32.066287	2025-09-17 12:25:10.948281	14	1207	\N	\N	\N	none	\N	\N	\N	t	\N
121	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 348, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Blanche", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 346, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Biggy", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 319, "is_active": false, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Nuggets", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 612, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *TROPICO* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Blanche, Biggy - Nuggets - 🥤 *TROPICO* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	servie	\N	1709-0016	2025-09-17 14:27:38.052133	2025-09-17 14:34:08	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
58	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M", "configuration": {"size": [{"id": 152, "size_name": "MENU M", "product_id": 201, "variant_name": "MENU M", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 2, "max_selections": 2, "price_modifier": 0}, {"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 3, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 324, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Viande Hachée", "option_group": "viande", "display_order": 6, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 620, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🫧 *PERRIER* 33CL", "option_group": "boisson", "display_order": 12, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU M ( - Ketchup, Mayo - Viande Hachée - 🫧 *PERRIER* 33CL - Pas de suppléments)"}]	7.00	livraison	23 Pl. du Colombier, 77127 Lieusaint	\N	\N	annulee	\N	1209-0004	2025-09-12 09:30:23.909624	2025-09-12 07:31:06.964	13	9392	\N	\N	\N	none	\N	\N	\N	f	\N
99	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8, "totalPrice": 8, "productName": "TACOS MENU M", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M", "variant_type": "size", "display_order": 1, "price_on_site": 8, "includes_drink": true, "price_delivery": 9, "has_drink_included": true}], "sauce": [{"id": 341, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Andalouse", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 320, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Merguez", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 617, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *COCA COLA* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU M ( - Andalouse, Samurai - Merguez - 🥤 *COCA COLA* 33CL - Pas de suppléments)"}]	8.00	a_emporter	\N	\N	\N	annulee	\N	1409-0001	2025-09-14 12:34:00.743975	2025-09-14 10:35:27.109	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
131	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L - 2 VIANDES", "categoryName": "TACOS", "configuration": {"size": [{"id": 290, "is_active": true, "size_name": "MENU L - 2 VIANDES", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU L - 2 VIANDES", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 344, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Harissa", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 612, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *TROPICO* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU L - 2 VIANDES ( - Mayo, Harissa - Cordon Bleu - 🥤 *TROPICO* 33CL - Pas de suppléments)"}]	8.50	sur_place	\N	\N	\N	annulee	\N	1809-0003	2025-09-18 08:58:17.136686	2025-09-18 09:07:49.651671	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
114	1	33620951645	\N	{"menu_310_1758106353306": {"id": 310, "name": "📋 MENU 1", "type": "menu_pizza", "price": 25, "details": {"pizzas": [{"id": 307, "name": "🔥 HOT SPICY", "size": "JUNIOR", "price": 0}, {"id": 308, "name": "🍛 TANDOORI", "size": "JUNIOR", "price": 0}, {"id": 309, "name": "🍔 BIG BURGER", "size": "JUNIOR", "price": 0}]}, "quantity": 1, "deliveryMode": "sur_place"}}	0.00	sur_place	\N	\N	\N	annulee	\N	1709-0009	2025-09-17 12:54:00.535562	2025-09-17 13:07:35.738428	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
106	1	33620951645	\N	[{"quantity": 1, "productId": 186, "unitPrice": 9, "totalPrice": 9, "productName": "TENDERS", "categoryName": "TEX-MEX", "configuration": null, "productDescription": "TENDERS"}]	9.00	sur_place	\N	\N	\N	annulee	\N	1709-0001	2025-09-17 09:26:50.225469	2025-09-17 09:27:26.647488	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
94	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L", "categoryName": "TACOS", "configuration": {"size": [{"id": 153, "size_name": "MENU L", "product_id": 201, "variant_name": "MENU L", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 347, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Algérienne", "option_group": "sauce", "display_order": 7, "max_selections": 2, "price_modifier": 0}, {"id": 348, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Blanche", "option_group": "sauce", "display_order": 8, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 321, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Filet de Poulet", "option_group": "viande", "display_order": 3, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 620, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🫧 *PERRIER* 33CL", "option_group": "boisson", "display_order": 12, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L ( - Algérienne, Blanche - Filet de Poulet - 🫧 *PERRIER* 33CL - Pas de suppléments)"}]	8.50	a_emporter	\N	\N	\N	recuperee	\N	1309-0020	2025-09-13 17:55:27.773274	2025-09-13 17:57:00	\N	\N	\N	\N	\N	none	\N	\N	\N	f	\N
135	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 347, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Algérienne", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 319, "is_active": false, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Nuggets", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 610, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *MIRANDA FRAISE* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Mayo, Algérienne - Nuggets - 🥤 *MIRANDA FRAISE* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	pending	\N	1809-0007	2025-09-18 10:11:13.863945	2025-09-18 10:15:06	\N	\N	\N	\N	\N	none	\N	\N	\N	t	[10:15] Avec deux sachets de piment et du sel svp
130	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L - 2 VIANDES", "categoryName": "TACOS", "configuration": {"size": [{"id": 290, "is_active": true, "size_name": "MENU L - 2 VIANDES", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU L - 2 VIANDES", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 348, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Blanche", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 617, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *COCA COLA* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU L - 2 VIANDES ( - Samurai, Blanche - Cordon Bleu - 🥤 *COCA COLA* 33CL - Pas de suppléments)"}]	8.50	sur_place	\N	\N	\N	annulee	\N	1809-0002	2025-09-18 08:56:19.569827	2025-09-18 08:57:09.718292	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
138	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 319, "is_active": false, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Nuggets", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 615, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *7UP TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Mayo - Nuggets - 🥤 *7UP TROPICAL* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	pending	\N	1809-0010	2025-09-18 10:58:42.00298	2025-09-18 10:59:07	\N	\N	\N	\N	\N	none	\N	\N	\N	f	[10:59] Je veux du pain en plus svp
122	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 341, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Andalouse", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 609, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *MIRANDA TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Mayo, Andalouse - Cordon Bleu - 🥤 *MIRANDA TROPICAL* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	annulee	\N	1709-0017	2025-09-17 14:42:12.114527	2025-09-17 14:59:04	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
125	1	33620951645	\N	[{"quantity": 1, "productId": 403, "unitPrice": 11, "totalPrice": 11, "productName": "🍽 🍽 MENU MIDI COMPLET", "categoryName": "MENU MIDI : PLAT + DESSERT + BOISSON", "configuration": {"choix_plat": [{"id": 2715, "is_active": true, "product_id": 403, "group_order": 1, "is_required": true, "option_name": "🍕 3. PIZZA", "option_group": "choix_plat", "display_order": 3, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": {"1": 2, "2": 3, "3": 4, "4": 5, "5": 6, "6": 6}}], "pizzas_choix": [{"id": 2824, "is_active": true, "product_id": 403, "group_order": 4, "is_required": false, "option_name": "🏔 29. MONTAGNARDE", "option_group": "pizzas_choix", "display_order": 29, "max_selections": 1, "price_modifier": 0, "next_group_order": 7, "conditional_next_group": null}], "boissons_choix": [{"id": 2753, "is_active": true, "product_id": 403, "group_order": 7, "is_required": true, "option_name": "🥤 11. EAU MINÉRALE", "option_group": "boissons_choix", "display_order": 11, "max_selections": 1, "price_modifier": 0, "next_group_order": 8, "conditional_next_group": null}], "desserts_choix": [{"id": 2762, "is_active": true, "product_id": 403, "group_order": 8, "is_required": true, "option_name": "🍰 8. FINGER", "option_group": "desserts_choix", "display_order": 8, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "🍽 🍽 MENU MIDI COMPLET (🍕 3. PIZZA - 🏔 29. MONTAGNARDE - 🥤 11. EAU MINÉRALE - 🍰 8. FINGER)"}]	11.00	sur_place	\N	\N	\N	annulee	\N	1709-0020	2025-09-17 18:27:31.457119	2025-09-17 18:33:37.498876	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
101	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L", "categoryName": "TACOS", "configuration": {"size": [{"id": 153, "is_active": true, "size_name": "MENU L", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU L", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 347, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Algérienne", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 344, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Harissa", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 322, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Tenders", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 610, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *MIRANDA FRAISE* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L ( - Algérienne, Harissa - Tenders - 🥤 *MIRANDA FRAISE* 33CL - Pas de suppléments)"}]	8.50	a_emporter	\N	\N	\N	annulee	\N	1409-0003	2025-09-14 13:11:31.258244	2025-09-14 11:47:48.195	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
95	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 10, "totalPrice": 10, "productName": "TACOS MENU XL", "categoryName": "TACOS", "configuration": {"size": [{"id": 154, "size_name": "MENU XL", "product_id": 201, "variant_name": "MENU XL", "variant_type": "size", "display_order": 3, "price_on_site": 10, "includes_drink": true, "price_delivery": 11, "has_drink_included": true}], "sauce": [{"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 2, "max_selections": 2, "price_modifier": 0}, {"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 3, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 321, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Filet de Poulet", "option_group": "viande", "display_order": 3, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 615, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *7UP TROPICAL* 33CL", "option_group": "boisson", "display_order": 7, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU XL ( - Ketchup, Mayo - Filet de Poulet - 🥤 *7UP TROPICAL* 33CL - Pas de suppléments)"}]	10.00	a_emporter	\N	\N	\N	annulee	\N	1309-0021	2025-09-13 18:16:23.38785	2025-09-14 08:30:48.858	\N	\N	\N	\N	\N	none	\N	\N	\N	f	\N
115	1	33620951645	\N	{"menu_310_1758107298746": {"id": 310, "name": "📋 MENU 1", "type": "menu_pizza", "price": 25, "details": {"pizzas": [{"id": 307, "name": "🔥 HOT SPICY", "size": "JUNIOR", "price": 0}, {"id": 308, "name": "🍛 TANDOORI", "size": "JUNIOR", "price": 0}, {"id": 309, "name": "🍔 BIG BURGER", "size": "JUNIOR", "price": 0}]}, "quantity": 1, "deliveryMode": "sur_place"}}	0.00	sur_place	\N	\N	\N	annulee	\N	1709-0010	2025-09-17 13:08:36.938455	2025-09-17 13:16:53.283885	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
107	1	33620951645	\N	[{"quantity": 1, "productId": 190, "unitPrice": 5.5, "totalPrice": 5.5, "productName": "SAUMON", "categoryName": "PANINI", "configuration": {"Boisson 33CL incluse": [{"id": 2664, "is_active": true, "product_id": 190, "group_order": 1, "is_required": true, "option_name": "1️⃣ 🥤 Coca Cola 33CL", "option_group": "Boisson 33CL incluse", "display_order": 1, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "SAUMON (1️⃣ 🥤 Coca Cola 33CL)"}]	5.50	sur_place	\N	\N	\N	annulee	\N	1709-0002	2025-09-17 10:24:32.842895	2025-09-17 10:26:35.430168	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
139	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 615, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *7UP TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Samurai - Cordon Bleu - 🥤 *7UP TROPICAL* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	pending	\N	1809-0011	2025-09-18 11:11:09.420178	2025-09-18 11:11:24	\N	\N	\N	\N	\N	none	\N	\N	\N	f	[11:11] Je veux du pain avec svp
144	1	33620951645	\N	[{"quantity": 1, "productId": 403, "unitPrice": 11, "totalPrice": 11, "productName": "🍽 🍽 MENU MIDI COMPLET", "categoryName": "MENU MIDI : PLAT + DESSERT + BOISSON", "configuration": {"choix_plat": [{"id": 2715, "is_active": true, "product_id": 403, "group_order": 0, "is_required": true, "option_name": "🍕 PIZZA", "option_group": "choix_plat", "display_order": 3, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": {"1": 1, "2": 2, "3": 5, "4": 4, "5": 6, "6": 6}}], "pizzas_choix": [{"id": 2820, "is_active": true, "product_id": 403, "group_order": 5, "is_required": false, "option_name": "🇮🇹 * ANDIAMO* → Crème fraîche, fromage, viande hachée, poulet, merguez, pommes de terre", "option_group": "pizzas_choix", "display_order": 25, "max_selections": 1, "price_modifier": 0, "next_group_order": 6, "conditional_next_group": null}], "boissons_choix": [{"id": 2752, "is_active": true, "product_id": 403, "group_order": 6, "is_required": true, "option_name": "🥤 COCA ZERO", "option_group": "boissons_choix", "display_order": 10, "max_selections": 1, "price_modifier": 0, "next_group_order": 8, "conditional_next_group": null}], "desserts_choix": [{"id": 2757, "is_active": true, "product_id": 403, "group_order": 7, "is_required": true, "option_name": "🍰 TARTE AUX POMMES", "option_group": "desserts_choix", "display_order": 3, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "🍽 🍽 MENU MIDI COMPLET (🍕 PIZZA - 🇮🇹 * ANDIAMO* → Crème fraîche, fromage, viande hachée, poulet, merguez, pommes de terre - 🥤 COCA ZERO - 🍰 TARTE AUX POMMES)"}]	11.00	sur_place	\N	\N	\N	servie	\N	1809-0016	2025-09-18 15:41:51.821248	2025-09-18 16:05:00	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
81	1	33620951645	\N	[{"quantity": 1, "productId": 227, "unitPrice": 10.9, "totalPrice": 10.9, "productName": "GREC", "categoryName": "ASSIETTES", "configuration": {"Boisson 33CL incluse": [{"id": 1249, "is_active": true, "product_id": 227, "group_order": 0, "is_required": true, "option_name": "5️⃣ 🧊 ICE TEA", "option_group": "Boisson 33CL incluse", "display_order": 5, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "GREC (5️⃣ 🧊 ICE TEA)"}]	10.90	livraison	206 Rue de Séville, 77550 Moissy-Cramayel	\N	\N	livree	\N	1309-0007	2025-09-13 12:24:48.222287	2025-09-13 13:05:10.845	14	2190	2025-09-13 15:05:10.845+02	\N	2025-09-13 15:25:05.591+02	assigned	\N	2025-09-13 12:29:17.701+02	2025-09-13 12:28:56.607341+02	f	\N
59	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M", "configuration": {"size": [{"id": 152, "size_name": "MENU M", "product_id": 201, "variant_name": "MENU M", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 342, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Ketchup", "option_group": "sauce", "display_order": 2, "max_selections": 2, "price_modifier": 0}, {"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 3, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 324, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Viande Hachée", "option_group": "viande", "display_order": 6, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 618, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "⚫ *COCA ZERO* 33CL", "option_group": "boisson", "display_order": 10, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 2, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU M ( - Ketchup, Mayo - Viande Hachée - ⚫ *COCA ZERO* 33CL - Pas de suppléments)"}]	7.00	livraison	23 Pl. du Colombier, 77127 Lieusaint	\N	\N	annulee	\N	1209-0005	2025-09-12 09:36:03.449938	2025-09-12 07:36:42.602	13	7522	\N	\N	\N	none	\N	\N	\N	f	\N
66	1	33620951645	\N	[{"quantity": 1, "productId": 227, "unitPrice": 10.9, "totalPrice": 10.9, "productName": "GREC", "configuration": {"Boisson 33CL incluse": [{"id": 1248, "is_active": true, "product_id": 227, "group_order": 0, "is_required": true, "option_name": "4️⃣ 🍊 TROPICO", "option_group": "Boisson 33CL incluse", "display_order": 4, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "GREC (4️⃣ 🍊 TROPICO)"}]	10.90	livraison	23 Pl. du Colombier, 77127 Lieusaint	\N	\N	annulee	\N	1209-0012	2025-09-12 14:03:42.922826	2025-09-12 12:08:32.023	13	4497	\N	\N	\N	none	\N	\N	\N	f	\N
96	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L", "categoryName": "TACOS", "configuration": {"size": [{"id": 153, "is_active": true, "size_name": "MENU L", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU L", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 346, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Biggy", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "extras": [{"id": 325, "is_active": true, "product_id": 201, "group_order": 4, "is_required": false, "option_name": "Cheddar", "option_group": "extras", "display_order": 0, "max_selections": 5, "price_modifier": 3}], "viande": [{"id": 320, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Merguez", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 617, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *COCA COLA* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 595, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Ajouter des suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L ( - Biggy - Cheddar - Merguez - 🥤 *COCA COLA* 33CL - Ajouter des suppléments)"}]	8.50	livraison	206 Rue de Séville, 77550 Moissy-Cramayel	\N	\N	annulee	\N	1309-0022	2025-09-13 19:58:51.151905	2025-09-13 18:03:44.004	14	9967	\N	\N	\N	none	\N	\N	\N	f	\N
100	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 10, "totalPrice": 10, "productName": "TACOS MENU XL", "categoryName": "TACOS", "configuration": {"size": [{"id": 154, "is_active": true, "size_name": "MENU XL", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU XL", "variant_type": "size", "display_order": 3, "price_on_site": 10, "includes_drink": true, "price_delivery": 11, "has_drink_included": true}], "sauce": [{"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}, {"id": 347, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Algérienne", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 324, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Viande Hachée", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 611, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🧡 *OASIS TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU XL ( - Mayo, Algérienne - Viande Hachée - 🧡 *OASIS TROPICAL* 33CL - Pas de suppléments)"}]	10.00	livraison	206 Rue de Séville, 77550 Moissy-Cramayel	\N	\N	livree	\N	1409-0002	2025-09-14 12:36:25.529762	2025-09-14 10:45:33.339	14	7014	2025-09-14 12:45:33.339+02	\N	2025-09-14 13:13:58.137+02	assigned	2025-09-14 12:43:58.137+02	2025-09-14 12:47:05.263+02	2025-09-14 12:43:41.800889+02	t	\N
133	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 347, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Algérienne", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 319, "is_active": false, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Nuggets", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 614, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *7 UP* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Mayo, Algérienne - Nuggets - 🥤 *7 UP* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	annulee	\N	1809-0005	2025-09-18 09:16:52.626511	2025-09-18 09:23:22.096703	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
108	1	33620951645	\N	[{"quantity": 1, "productId": 196, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "BOLOGNAISE", "categoryName": "PÂTES", "configuration": null, "productDescription": "BOLOGNAISE"}]	8.50	livraison	206 Rue de Séville, 77550 Moissy-Cramayel	\N	\N	annulee	\N	1709-0003	2025-09-17 10:29:47.916049	2025-09-17 10:30:10.499462	14	4032	\N	\N	\N	none	\N	\N	\N	t	\N
116	1	33620951645	\N	{"menu_310_1758107865163": {"id": 310, "name": "📋 MENU 1", "type": "menu_pizza", "price": 25, "details": {"pizzas": [{"id": 307, "name": "🔥 HOT SPICY", "size": "JUNIOR", "price": 0}, {"id": 308, "name": "🍛 TANDOORI", "size": "JUNIOR", "price": 0}, {"id": 309, "name": "🍔 BIG BURGER", "size": "JUNIOR", "price": 0}]}, "quantity": 1, "deliveryMode": "sur_place"}}	0.00	sur_place	\N	\N	\N	annulee	\N	1709-0011	2025-09-17 13:17:53.30032	2025-09-17 13:21:15.033246	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
102	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L", "categoryName": "TACOS", "configuration": {"size": [{"id": 153, "is_active": true, "size_name": "MENU L", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU L", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0}], "viande": [{"id": 320, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Merguez", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "boisson": [{"id": 612, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *TROPICO* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0}]}, "productDescription": "TACOS MENU L ( - Samurai - Merguez - 🥤 *TROPICO* 33CL - Pas de suppléments)"}]	8.50	sur_place	\N	\N	\N	servie	\N	1409-0004	2025-09-14 13:51:25.221821	2025-09-14 13:53:52	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
117	1	33620951645	\N	{"menu_310_1758108656932": {"id": 310, "name": "📋 MENU 1", "type": "menu_pizza", "price": 25, "details": {"pizzas": [{"id": 307, "name": "🔥 HOT SPICY", "size": "JUNIOR", "price": 0}, {"id": 308, "name": "🍛 TANDOORI", "size": "JUNIOR", "price": 0}, {"id": 309, "name": "🍔 BIG BURGER", "size": "JUNIOR", "price": 0}]}, "quantity": 1, "deliveryMode": "sur_place"}}	0.00	sur_place	\N	\N	\N	annulee	\N	1709-0012	2025-09-17 13:31:08.303508	2025-09-17 13:39:55.310279	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
109	1	33620951645	\N	[{"quantity": 1, "productId": 183, "unitPrice": 7.5, "totalPrice": 7.5, "productName": "CESAR", "categoryName": "SALADES", "configuration": null, "productDescription": "CESAR"}]	7.50	sur_place	\N	\N	\N	annulee	\N	1709-0004	2025-09-17 10:51:40.985487	2025-09-17 10:54:16.279505	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
134	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 347, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Algérienne", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 319, "is_active": false, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Nuggets", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 615, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *7UP TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Mayo, Algérienne - Nuggets - 🥤 *7UP TROPICAL* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	pending	\N	1809-0006	2025-09-18 09:24:26.399354	2025-09-18 09:24:47	\N	\N	\N	\N	\N	none	\N	\N	\N	t	[09:24] Avec sauce piment svp
136	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 343, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Mayo", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 347, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Algérienne", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 319, "is_active": false, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Nuggets", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 611, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🧡 *OASIS TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Mayo, Algérienne - Nuggets - 🧡 *OASIS TROPICAL* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	pending	\N	1809-0008	2025-09-18 10:18:02.769752	2025-09-18 10:18:52	\N	\N	\N	\N	\N	none	\N	\N	\N	t	[10:18] Sans soboulet svp
140	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "TACOS MENU L - 2 VIANDES", "categoryName": "TACOS", "configuration": {"size": [{"id": 290, "is_active": true, "size_name": "MENU L - 2 VIANDES", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU L - 2 VIANDES", "variant_type": "size", "display_order": 2, "price_on_site": 8.5, "includes_drink": true, "price_delivery": 9.5, "has_drink_included": true}], "sauce": [{"id": 345, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Samurai", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}, {"id": 348, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Blanche", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 615, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *7UP TROPICAL* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU L - 2 VIANDES ( - Samurai, Blanche - Cordon Bleu - 🥤 *7UP TROPICAL* 33CL - Pas de suppléments)"}]	8.50	sur_place	\N	\N	\N	servie	\N	1809-0012	2025-09-18 11:13:41.305646	2025-09-18 11:29:14	\N	\N	\N	\N	\N	none	\N	\N	\N	f	[11:15] Je veux 500g de riz en supplément svp
143	1	33620951645	\N	[{"quantity": 1, "productId": 354, "unitPrice": 8.5, "totalPrice": 8.5, "productName": "DU CHEF", "categoryName": "SANDWICHS", "configuration": {"Boisson 33CL incluse": [{"id": 2301, "is_active": true, "product_id": 354, "group_order": 0, "is_required": false, "option_name": "1️⃣1️⃣ 🍊 FANTA", "option_group": "Boisson 33CL incluse", "display_order": 11, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "DU CHEF (1️⃣1️⃣ 🍊 FANTA)"}]	8.50	sur_place	\N	\N	\N	annulee	\N	1809-0015	2025-09-18 13:08:28.350637	2025-09-18 13:09:00.375315	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
126	1	33620951645	\N	[{"quantity": 1, "productId": 403, "unitPrice": 11, "totalPrice": 11, "productName": "🍽 🍽 MENU MIDI COMPLET", "categoryName": "MENU MIDI : PLAT + DESSERT + BOISSON", "configuration": {"choix_plat": [{"id": 2715, "is_active": true, "product_id": 403, "group_order": 1, "is_required": true, "option_name": "🍕 PIZZA", "option_group": "choix_plat", "display_order": 3, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": {"1": 2, "2": 3, "3": 4, "4": 5, "5": 6, "6": 6}}], "pizzas_choix": [{"id": 2826, "is_active": true, "product_id": 403, "group_order": 4, "is_required": false, "option_name": "🔥 HOT SPICY", "option_group": "pizzas_choix", "display_order": 31, "max_selections": 1, "price_modifier": 0, "next_group_order": 7, "conditional_next_group": null}], "boissons_choix": [{"id": 2747, "is_active": true, "product_id": 403, "group_order": 7, "is_required": true, "option_name": "🥤 ICE TEA", "option_group": "boissons_choix", "display_order": 5, "max_selections": 1, "price_modifier": 0, "next_group_order": 8, "conditional_next_group": null}], "desserts_choix": [{"id": 2758, "is_active": true, "product_id": 403, "group_order": 8, "is_required": true, "option_name": "🍰 TARTE AUX POIRES", "option_group": "desserts_choix", "display_order": 4, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "🍽 🍽 MENU MIDI COMPLET (🍕 PIZZA - 🔥 HOT SPICY - 🥤 ICE TEA - 🍰 TARTE AUX POIRES)"}]	11.00	sur_place	\N	\N	\N	servie	\N	1709-0021	2025-09-17 18:49:00.567747	2025-09-17 18:51:04	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
145	1	33620951645	\N	[{"quantity": 1, "productId": 235, "unitPrice": 7, "totalPrice": 7, "productName": "MENU ENFANT", "categoryName": "MENU ENFANT", "configuration": {"Boisson enfant": [{"id": 2590, "is_active": true, "product_id": 235, "group_order": 2, "is_required": true, "option_name": "1️⃣ 🍎 Compote", "option_group": "Boisson enfant", "display_order": 1, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "Plat principal": [{"id": 2588, "is_active": true, "product_id": 235, "group_order": 1, "is_required": true, "option_name": "1️⃣ 🍔 Cheeseburger", "option_group": "Plat principal", "display_order": 1, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "MENU ENFANT (1️⃣ 🍎 Compote - 1️⃣ 🍔 Cheeseburger)"}]	7.00	sur_place	\N	\N	\N	servie	\N	1809-0017	2025-09-18 18:06:49.920709	2025-09-18 18:07:35	\N	\N	\N	\N	\N	none	\N	\N	\N	t	\N
146	1	33620951645	\N	[{"quantity": 1, "productId": 201, "unitPrice": 7, "totalPrice": 7, "productName": "TACOS MENU M - 1 VIANDE", "categoryName": "TACOS", "configuration": {"size": [{"id": 289, "is_active": true, "size_name": "MENU M - 1 VIANDE", "product_id": 201, "updated_at": "2025-09-13T19:04:58.499729+02:00", "variant_name": "MENU M - 1 VIANDE", "variant_type": "size", "display_order": 1, "price_on_site": 7, "includes_drink": true, "price_delivery": 8, "has_drink_included": true}], "sauce": [{"id": 346, "is_active": true, "product_id": 201, "group_order": 2, "is_required": true, "option_name": "Biggy", "option_group": "sauce", "display_order": 0, "max_selections": 2, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "viande": [{"id": 323, "is_active": true, "product_id": 201, "group_order": 1, "is_required": true, "option_name": "Cordon Bleu", "option_group": "viande", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "boisson": [{"id": 612, "is_active": true, "product_id": 201, "group_order": 5, "is_required": true, "option_name": "🥤 *TROPICO* 33CL", "option_group": "boisson", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}], "extras_choice": [{"id": 596, "is_active": true, "product_id": 201, "group_order": 3, "is_required": false, "option_name": "Pas de suppléments", "option_group": "extras_choice", "display_order": 0, "max_selections": 1, "price_modifier": 0, "next_group_order": null, "conditional_next_group": null}]}, "productDescription": "TACOS MENU M - 1 VIANDE ( - Biggy - Cordon Bleu - 🥤 *TROPICO* 33CL - Pas de suppléments)"}]	7.00	sur_place	\N	\N	\N	servie	\N	1809-0018	2025-09-18 18:33:51.198343	2025-09-18 22:21:05	\N	\N	\N	\N	\N	none	\N	\N	\N	f	\N
\.


--
-- TOC entry 4570 (class 0 OID 39346)
-- Dependencies: 453
-- Data for Name: france_pizza_display_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_pizza_display_settings (id, restaurant_id, use_unified_display, custom_settings, created_at, updated_at) FROM stdin;
1	1	t	{"price_format": "{price} EUR", "show_size_names": true, "enable_ingredients": true, "enable_global_numbering": true}	2025-09-08 14:46:55.967054	2025-09-08 14:46:55.967054
\.


--
-- TOC entry 4564 (class 0 OID 31592)
-- Dependencies: 444
-- Data for Name: france_product_display_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_product_display_configs (id, restaurant_id, product_id, display_type, template_name, show_variants_first, custom_header_text, custom_footer_text, emoji_icon, created_at, updated_at) FROM stdin;
1	1	201	size_selection	tacos_size_template	t	Choisissez votre taille:	\N	🌮	2025-09-06 11:02:56.426246	2025-09-06 11:02:56.426246
\.


--
-- TOC entry 4517 (class 0 OID 17358)
-- Dependencies: 394
-- Data for Name: france_product_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_product_options (id, product_id, option_group, option_name, price_modifier, is_required, max_selections, display_order, is_active, group_order, next_group_order, conditional_next_group) FROM stdin;
2569	240	Boisson 1.5L incluse	1️⃣ 🥤 COCA COLA 1L5 (1.5L)	0.00	f	1	1	t	0	\N	\N
2570	240	Boisson 1.5L incluse	2️⃣ ⚫ COCA ZERO 1L5 (1.5L)	0.00	f	1	2	t	0	\N	\N
2571	240	Boisson 1.5L incluse	3️⃣ 🍊 FANTA 1L5 (1.5L)	0.00	f	1	3	t	0	\N	\N
2572	240	Boisson 1.5L incluse	4️⃣ 🌺 OASIS 1L5 (1.5L)	0.00	f	1	4	t	0	\N	\N
2573	240	Boisson 1.5L incluse	5️⃣ 🥤 SPRITE (1.5L)	0.00	f	1	5	t	0	\N	\N
2574	241	Boisson 1.5L incluse	1️⃣ 🥤 COCA COLA 1L5 (1.5L)	0.00	f	1	1	t	0	\N	\N
2575	241	Boisson 1.5L incluse	2️⃣ ⚫ COCA ZERO 1L5 (1.5L)	0.00	f	1	2	t	0	\N	\N
2576	241	Boisson 1.5L incluse	3️⃣ 🍊 FANTA 1L5 (1.5L)	0.00	f	1	3	t	0	\N	\N
2577	241	Boisson 1.5L incluse	4️⃣ 🌺 OASIS 1L5 (1.5L)	0.00	f	1	4	t	0	\N	\N
2578	241	Boisson 1.5L incluse	5️⃣ 🥤 SPRITE (1.5L)	0.00	f	1	5	t	0	\N	\N
2579	242	Boisson 1.5L incluse	1️⃣ 🥤 COCA COLA 1L5 (1.5L)	0.00	f	1	1	t	0	\N	\N
2604	238	Choix viande	1️⃣ 🍗 Nuggets	0.00	f	1	1	t	1	\N	\N
2605	238	Choix viande	2️⃣ 🍗 Cordon Bleu	0.00	f	1	2	t	1	\N	\N
327	201	extras	Boursin	3.00	f	5	0	t	4	\N	\N
323	201	viande	Cordon Bleu	0.00	t	1	0	t	1	\N	\N
2606	238	Choix viande	3️⃣ 🍗 Tenders	0.00	f	1	3	t	1	\N	\N
321	201	viande	Filet de Poulet	0.00	t	1	0	t	1	\N	\N
349	284	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
350	284	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
351	284	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
352	284	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
353	284	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
354	284	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
355	284	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
356	285	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
357	285	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
358	285	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
359	285	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
360	285	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
361	285	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
362	285	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
363	286	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
364	286	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
365	286	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
366	286	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
367	286	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
368	286	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
369	286	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
370	287	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
371	287	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
372	287	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
373	287	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
374	287	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
375	287	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
376	287	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
377	288	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
378	288	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
379	288	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
380	288	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
381	288	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
382	288	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
383	288	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
384	289	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
385	289	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
386	289	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
387	289	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
388	289	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
389	289	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
390	289	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
391	290	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
392	290	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
393	290	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
394	290	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
395	290	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
396	290	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
397	290	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
398	291	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
325	201	extras	Cheddar	3.00	f	5	0	t	4	\N	\N
328	201	extras	Chèvre	3.00	f	5	0	t	4	\N	\N
2607	238	Choix viande	4️⃣ 🥩 Viande Hachée	0.00	f	1	4	t	1	\N	\N
329	201	extras	Vache qui rit	3.00	f	5	0	t	4	\N	\N
330	201	extras	Mozzarella	3.00	f	5	0	t	4	\N	\N
341	201	sauce	Andalouse	0.00	t	2	0	t	2	\N	\N
322	201	viande	Tenders	0.00	t	1	0	t	1	\N	\N
324	201	viande	Viande Hachée	0.00	t	1	0	t	1	\N	\N
399	291	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
400	291	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
401	291	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
402	291	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
403	291	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
404	291	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
405	292	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
406	292	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
407	292	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
408	292	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
409	292	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
410	292	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
411	292	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
412	293	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
413	293	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
414	293	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
415	293	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
416	293	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
417	293	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
418	293	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
419	294	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
420	294	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
421	294	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
422	294	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
423	294	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
424	294	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
425	294	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
426	276	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
427	276	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
428	276	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
429	276	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
430	276	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
431	276	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
432	276	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
433	277	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
434	277	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
435	277	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
436	277	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
437	277	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
438	277	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
439	277	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
440	278	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
441	278	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
442	278	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
443	278	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
444	278	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
445	278	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
446	278	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
447	279	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
448	279	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
449	279	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
450	279	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
451	279	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
452	279	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
453	279	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
454	280	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
455	280	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
456	280	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
457	280	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
458	280	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
459	280	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
460	280	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
461	281	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
462	281	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
463	281	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
464	281	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
465	281	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
466	281	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
467	281	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
468	282	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
469	282	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
470	282	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
471	282	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
472	282	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
473	282	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
474	282	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
475	283	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
476	283	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
477	283	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
478	283	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
479	283	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
480	283	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
481	283	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
482	295	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
483	295	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
484	295	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
485	295	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
486	295	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
487	295	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
488	295	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
489	296	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
490	296	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
491	296	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
492	296	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
493	296	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
494	296	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
495	296	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
496	297	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
497	297	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
498	297	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
499	297	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
500	297	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
501	297	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
502	297	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
2580	242	Boisson 1.5L incluse	2️⃣ ⚫ COCA ZERO 1L5 (1.5L)	0.00	f	1	2	t	0	\N	\N
2581	242	Boisson 1.5L incluse	3️⃣ 🍊 FANTA 1L5 (1.5L)	0.00	f	1	3	t	0	\N	\N
2582	242	Boisson 1.5L incluse	4️⃣ 🌺 OASIS 1L5 (1.5L)	0.00	f	1	4	t	0	\N	\N
2583	242	Boisson 1.5L incluse	5️⃣ 🥤 SPRITE (1.5L)	0.00	f	1	5	t	0	\N	\N
510	299	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
511	299	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
512	299	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
513	299	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
514	299	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
515	299	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
516	299	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
517	300	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
518	300	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
519	300	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
520	300	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
521	300	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
522	300	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
523	300	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
524	301	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
525	301	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
526	301	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
527	301	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
528	301	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
529	301	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
530	301	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
531	302	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
532	302	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
533	302	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
534	302	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
535	302	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
536	302	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
537	302	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
538	303	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
539	303	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
540	303	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
541	303	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
2608	238	Choix viande	5️⃣ 🌭 Merguez	0.00	f	1	5	t	1	\N	\N
2609	238	Choix viande	6️⃣ 🍗 Filet de Poulet	0.00	f	1	6	t	1	\N	\N
2610	238	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	2	\N	\N
2611	238	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	2	\N	\N
542	303	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
543	303	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
544	303	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
545	304	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
546	304	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
547	304	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
548	304	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
549	304	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
550	304	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
551	304	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
552	305	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
553	305	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
554	305	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
555	305	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
556	305	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
557	305	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
558	305	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
559	306	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
560	306	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
561	306	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
562	306	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
563	306	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
564	306	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
565	306	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
566	307	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
567	307	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
568	307	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
569	307	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
570	307	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
571	307	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
572	307	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
573	308	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
574	308	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
575	308	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
576	308	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
577	308	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
578	308	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
579	308	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
580	309	CHEESY CRUST	CHEESY CRUST Junior (+2€)	2.00	f	1	1	t	1	\N	\N
581	309	CHEESY CRUST	CHEESY CRUST Sénior (+2,50€)	2.50	f	1	2	t	1	\N	\N
582	309	CHEESY CRUST	CHEESY CRUST Méga (+4€)	4.00	f	1	3	t	1	\N	\N
583	309	FROMAGES & LÉGUMES	Fromages & Légumes Junior/Sénior (+1€)	1.00	f	1	1	t	2	\N	\N
584	309	FROMAGES & LÉGUMES	Fromages & Légumes Méga (+2€)	2.00	f	1	2	t	2	\N	\N
585	309	VIANDES & CHARCUTERIE	Viandes & Charcuterie Junior/Sénior (+2€)	2.00	f	1	1	t	3	\N	\N
586	309	VIANDES & CHARCUTERIE	Viandes & Charcuterie Méga (+3€)	3.00	f	1	2	t	3	\N	\N
2825	403	pizzas_choix	🌶️ *30. POIVRE*\r\n       → Sauce poivre, fromage, poulet, viande hachée, poivrons, tomates fraîches	0.00	f	1	30	t	5	6	\N
2826	403	pizzas_choix	🔥 *31. HOT SPICY*\r\n       → Sauce salsa, fromage, viande hachée, poivrons, tomates fraîches, piments frais	0.00	f	1	31	t	5	6	\N
2827	403	pizzas_choix	🍛 *32. TANDOORI*\r\n       → Sauce curry, fromage, poulet tandoori à l'indienne, oignons, poivrons, miel	0.00	f	1	32	t	5	6	\N
2612	238	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	2	\N	\N
2613	238	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	2	\N	\N
2614	238	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	2	\N	\N
2615	238	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	2	\N	\N
2616	238	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	2	\N	\N
596	201	extras_choice	Pas de suppléments	0.00	f	1	0	t	3	\N	\N
342	201	sauce	Ketchup	0.00	t	2	0	t	2	\N	\N
346	201	sauce	Biggy	0.00	t	2	0	t	2	\N	\N
345	201	sauce	Samurai	0.00	t	2	0	t	2	\N	\N
334	201	extras	Viande	3.00	f	5	0	t	4	\N	\N
343	201	sauce	Mayo	0.00	t	2	0	t	2	\N	\N
2617	238	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	2	\N	\N
2618	238	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	2	\N	\N
348	201	sauce	Blanche	0.00	t	2	0	t	2	\N	\N
2619	238	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	2	\N	\N
2620	238	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	2	\N	\N
2713	403	choix_plat	🥗 1. SALADE AU CHOIX	0.00	t	1	1	t	0	\N	{"1": 1, "2": 2, "3": 5, "4": 4, "5": 6, "6": 6}
2664	190	Boisson 33CL incluse	1️⃣ 🥤 Coca Cola 33CL	0.00	t	1	1	t	1	\N	\N
2665	190	Boisson 33CL incluse	2️⃣ ⚫ Coca Cola Zéro 33CL	0.00	t	1	2	t	1	\N	\N
2666	190	Boisson 33CL incluse	3️⃣ 🍊 Fanta Orange 33CL	0.00	t	1	3	t	1	\N	\N
2588	235	Plat principal	1️⃣ 🍔 Cheeseburger	0.00	t	1	1	t	1	\N	\N
2589	235	Plat principal	2️⃣ 🍗 Nuggets	0.00	t	1	2	t	1	\N	\N
2590	235	Boisson enfant	1️⃣ 🍎 Compote	0.00	t	1	1	t	2	\N	\N
2591	235	Boisson enfant	2️⃣ 🧃 Caprisun	0.00	t	1	2	t	2	\N	\N
2621	238	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	2	\N	\N
1953	383	Boisson 1.5L incluse	1️⃣ 🥤 COCA COLA 1L5 (1.5L)	0.00	f	1	1	t	0	\N	\N
1954	383	Boisson 1.5L incluse	2️⃣ ⚫ COCA ZERO 1L5 (1.5L)	0.00	f	1	2	t	0	\N	\N
1955	383	Boisson 1.5L incluse	3️⃣ 🍊 FANTA 1L5 (1.5L)	0.00	f	1	3	t	0	\N	\N
1956	383	Boisson 1.5L incluse	4️⃣ 🌺 OASIS 1L5 (1.5L)	0.00	f	1	4	t	0	\N	\N
339	201	extras	Vache qui rit gratiné	3.00	f	5	0	t	4	\N	\N
613	201	boisson	🧊 *ICE TEA* 33CL	0.00	t	1	0	t	5	\N	\N
616	201	boisson	🥤 *7UP CHERRY* 33CL	0.00	t	1	0	t	5	\N	\N
620	201	boisson	🫧 *PERRIER* 33CL	0.00	t	1	0	t	5	\N	\N
615	201	boisson	🥤 *7UP TROPICAL* 33CL	0.00	t	1	0	t	5	\N	\N
614	201	boisson	🥤 *7 UP* 33CL	0.00	t	1	0	t	5	\N	\N
319	201	viande	Nuggets	0.00	t	1	0	f	1	\N	\N
2667	190	Boisson 33CL incluse	4️⃣ 🍋 Fanta Citron 33CL	0.00	t	1	4	t	1	\N	\N
2668	190	Boisson 33CL incluse	5️⃣ 🥤 Sprite 33CL	0.00	t	1	5	t	1	\N	\N
2669	190	Boisson 33CL incluse	6️⃣ 🍊 Orangina 33CL	0.00	t	1	6	t	1	\N	\N
335	201	extras	Poivrons	3.00	f	5	0	t	4	\N	\N
619	201	boisson	🥤 *EAU MINÉRALE* 33CL	0.00	t	1	0	t	5	\N	\N
618	201	boisson	⚫ *COCA ZERO* 33CL	0.00	t	1	0	t	5	\N	\N
337	201	extras	Cheddar gratiné	3.00	f	5	0	t	4	\N	\N
340	201	extras	Raclette gratiné	3.00	f	5	0	t	4	\N	\N
344	201	sauce	Harissa	0.00	t	2	0	t	2	\N	\N
610	201	boisson	🥤 *MIRANDA FRAISE* 33CL	0.00	t	1	0	t	5	\N	\N
612	201	boisson	🥤 *TROPICO* 33CL	0.00	t	1	0	t	5	\N	\N
320	201	viande	Merguez	0.00	t	1	0	t	1	\N	\N
611	201	boisson	🧡 *OASIS TROPICAL* 33CL	0.00	t	1	0	t	5	\N	\N
336	201	extras	Champignons	3.00	f	5	0	t	4	\N	\N
617	201	boisson	🥤 *COCA COLA* 33CL	0.00	t	1	0	t	5	\N	\N
326	201	extras	Raclette	3.00	f	5	0	t	4	\N	\N
609	201	boisson	🥤 *MIRANDA TROPICAL* 33CL	0.00	t	1	0	t	5	\N	\N
338	201	extras	Emmental gratiné	3.00	f	5	0	t	4	\N	\N
2670	190	Boisson 33CL incluse	7️⃣ 🧊 Ice Tea Pêche 33CL	0.00	t	1	7	t	1	\N	\N
2671	190	Boisson 33CL incluse	8️⃣ 🧊 Ice Tea Citron 33CL	0.00	t	1	8	t	1	\N	\N
2672	190	Boisson 33CL incluse	9️⃣ 🌴 Tropico 33CL	0.00	t	1	9	t	1	\N	\N
2673	190	Boisson 33CL incluse	🔟 🥤 Pepsi 33CL	0.00	t	1	10	t	1	\N	\N
2674	190	Boisson 33CL incluse	1️⃣1️⃣ ⚫ Pepsi Max 33CL	0.00	t	1	11	t	1	\N	\N
2675	190	Boisson 33CL incluse	1️⃣2️⃣ 💧 Eau minérale 50CL	0.00	t	1	12	t	1	\N	\N
2676	189	Boisson 33CL incluse	1️⃣ 🥤 Coca Cola 33CL	0.00	t	1	1	t	1	\N	\N
2660	188	Boisson 33CL incluse	9️⃣ 🌴 Tropico 33CL	0.00	t	1	9	t	1	\N	\N
2661	188	Boisson 33CL incluse	🔟 🥤 Pepsi 33CL	0.00	t	1	10	t	1	\N	\N
2662	188	Boisson 33CL incluse	1️⃣1️⃣ ⚫ Pepsi Max 33CL	0.00	t	1	11	t	1	\N	\N
2663	188	Boisson 33CL incluse	1️⃣2️⃣ 💧 Eau minérale 50CL	0.00	t	1	12	t	1	\N	\N
2677	189	Boisson 33CL incluse	2️⃣ ⚫ Coca Cola Zéro 33CL	0.00	t	1	2	t	1	\N	\N
2678	189	Boisson 33CL incluse	3️⃣ 🍊 Fanta Orange 33CL	0.00	t	1	3	t	1	\N	\N
2679	189	Boisson 33CL incluse	4️⃣ 🍋 Fanta Citron 33CL	0.00	t	1	4	t	1	\N	\N
2680	189	Boisson 33CL incluse	5️⃣ 🥤 Sprite 33CL	0.00	t	1	5	t	1	\N	\N
2681	189	Boisson 33CL incluse	6️⃣ 🍊 Orangina 33CL	0.00	t	1	6	t	1	\N	\N
2682	189	Boisson 33CL incluse	7️⃣ 🧊 Ice Tea Pêche 33CL	0.00	t	1	7	t	1	\N	\N
2683	189	Boisson 33CL incluse	8️⃣ 🧊 Ice Tea Citron 33CL	0.00	t	1	8	t	1	\N	\N
2684	189	Boisson 33CL incluse	9️⃣ 🌴 Tropico 33CL	0.00	t	1	9	t	1	\N	\N
2685	189	Boisson 33CL incluse	🔟 🥤 Pepsi 33CL	0.00	t	1	10	t	1	\N	\N
2686	189	Boisson 33CL incluse	1️⃣1️⃣ ⚫ Pepsi Max 33CL	0.00	t	1	11	t	1	\N	\N
2687	189	Boisson 33CL incluse	1️⃣2️⃣ 💧 Eau minérale 50CL	0.00	t	1	12	t	1	\N	\N
2688	187	Boisson 33CL incluse	1️⃣ 🥤 Coca Cola 33CL	0.00	t	1	1	t	1	\N	\N
2689	187	Boisson 33CL incluse	2️⃣ ⚫ Coca Cola Zéro 33CL	0.00	t	1	2	t	1	\N	\N
2690	187	Boisson 33CL incluse	3️⃣ 🍊 Fanta Orange 33CL	0.00	t	1	3	t	1	\N	\N
2691	187	Boisson 33CL incluse	4️⃣ 🍋 Fanta Citron 33CL	0.00	t	1	4	t	1	\N	\N
2692	187	Boisson 33CL incluse	5️⃣ 🥤 Sprite 33CL	0.00	t	1	5	t	1	\N	\N
2693	187	Boisson 33CL incluse	6️⃣ 🍊 Orangina 33CL	0.00	t	1	6	t	1	\N	\N
2694	187	Boisson 33CL incluse	7️⃣ 🧊 Ice Tea Pêche 33CL	0.00	t	1	7	t	1	\N	\N
2695	187	Boisson 33CL incluse	8️⃣ 🧊 Ice Tea Citron 33CL	0.00	t	1	8	t	1	\N	\N
2696	187	Boisson 33CL incluse	9️⃣ 🌴 Tropico 33CL	0.00	t	1	9	t	1	\N	\N
2697	187	Boisson 33CL incluse	🔟 🥤 Pepsi 33CL	0.00	t	1	10	t	1	\N	\N
2698	187	Boisson 33CL incluse	1️⃣1️⃣ ⚫ Pepsi Max 33CL	0.00	t	1	11	t	1	\N	\N
2699	187	Boisson 33CL incluse	1️⃣2️⃣ 💧 Eau minérale 50CL	0.00	t	1	12	t	1	\N	\N
2053	357	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2054	357	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2055	357	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2056	357	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2057	357	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2058	357	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2059	357	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2060	357	Boisson 33CL incluse	🔟 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2061	357	Boisson 33CL incluse	8️⃣ 🍊 FANTA	0.00	f	1	8	t	0	\N	\N
2062	357	Boisson 33CL incluse	9️⃣ 🥤 SPRITE	0.00	f	1	9	t	0	\N	\N
2063	357	Boisson 33CL incluse	1️⃣1️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2064	357	Boisson 33CL incluse	1️⃣2️⃣ 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2065	358	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2066	358	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2067	358	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2068	358	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2069	358	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2070	358	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2071	358	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2072	358	Boisson 33CL incluse	8️⃣ 🍊 FANTA	0.00	f	1	8	t	0	\N	\N
2073	358	Boisson 33CL incluse	🔟 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2074	358	Boisson 33CL incluse	1️⃣1️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2075	358	Boisson 33CL incluse	9️⃣ 🥤 SPRITE	0.00	f	1	9	t	0	\N	\N
2076	358	Boisson 33CL incluse	1️⃣2️⃣ 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2077	359	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2078	359	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2079	359	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2080	359	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2081	359	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2082	359	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2083	359	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2084	359	Boisson 33CL incluse	🔟 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2085	359	Boisson 33CL incluse	8️⃣ 🍊 FANTA	0.00	f	1	8	t	0	\N	\N
2086	359	Boisson 33CL incluse	9️⃣ 🥤 SPRITE	0.00	f	1	9	t	0	\N	\N
2087	359	Boisson 33CL incluse	1️⃣1️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2088	359	Boisson 33CL incluse	1️⃣2️⃣ 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2089	360	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2090	360	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2091	360	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2092	360	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2093	360	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2094	360	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2095	360	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2096	360	Boisson 33CL incluse	🔟 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2097	360	Boisson 33CL incluse	8️⃣ 🍊 FANTA	0.00	f	1	8	t	0	\N	\N
2098	360	Boisson 33CL incluse	1️⃣1️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2099	360	Boisson 33CL incluse	9️⃣ 🥤 SPRITE	0.00	f	1	9	t	0	\N	\N
2100	360	Boisson 33CL incluse	1️⃣2️⃣ 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2101	361	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2102	361	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2103	361	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2104	361	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2105	361	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2106	361	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2107	361	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2108	361	Boisson 33CL incluse	8️⃣ 🍊 FANTA	0.00	f	1	8	t	0	\N	\N
2109	361	Boisson 33CL incluse	🔟 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2110	361	Boisson 33CL incluse	1️⃣1️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2111	361	Boisson 33CL incluse	9️⃣ 🥤 SPRITE	0.00	f	1	9	t	0	\N	\N
2112	361	Boisson 33CL incluse	1️⃣2️⃣ 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2113	362	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2114	362	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2115	362	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2116	362	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2117	362	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2118	362	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2119	362	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2120	362	Boisson 33CL incluse	🔟 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2121	362	Boisson 33CL incluse	8️⃣ 🍊 FANTA	0.00	f	1	8	t	0	\N	\N
2122	362	Boisson 33CL incluse	9️⃣ 🥤 SPRITE	0.00	f	1	9	t	0	\N	\N
2123	362	Boisson 33CL incluse	1️⃣1️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2124	362	Boisson 33CL incluse	1️⃣2️⃣ 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2125	363	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2126	363	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2127	363	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2128	363	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2129	363	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
595	201	extras_choice	Ajouter des suppléments	0.00	f	1	0	t	3	\N	\N
2130	363	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2131	363	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2132	363	Boisson 33CL incluse	🔟 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2133	363	Boisson 33CL incluse	8️⃣ 🍊 FANTA	0.00	f	1	8	t	0	\N	\N
2134	363	Boisson 33CL incluse	1️⃣1️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2135	363	Boisson 33CL incluse	9️⃣ 🥤 SPRITE	0.00	f	1	9	t	0	\N	\N
2136	363	Boisson 33CL incluse	1️⃣2️⃣ 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2137	364	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2138	364	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2139	364	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2140	364	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2141	364	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2142	364	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2143	364	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2144	364	Boisson 33CL incluse	8️⃣ 🍊 FANTA	0.00	f	1	8	t	0	\N	\N
2145	364	Boisson 33CL incluse	🔟 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2146	364	Boisson 33CL incluse	1️⃣1️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2147	364	Boisson 33CL incluse	9️⃣ 🥤 SPRITE	0.00	f	1	9	t	0	\N	\N
2148	364	Boisson 33CL incluse	1️⃣2️⃣ 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2149	365	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2150	365	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2151	365	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2152	365	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2153	365	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2154	365	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2155	365	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2156	365	Boisson 33CL incluse	8️⃣ 🍊 FANTA	0.00	f	1	8	t	0	\N	\N
2157	365	Boisson 33CL incluse	🔟 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2158	365	Boisson 33CL incluse	1️⃣1️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2822	403	pizzas_choix	🥓 *27. 4 JAMBONS*\r\n       → Crème fraîche ou sauce tomate, fromages, jambon, lardons, pepperoni, bacon	0.00	f	1	27	t	5	6	\N
2823	403	pizzas_choix	🧀 *28. TARTIFLETTE*\r\n       → Crème fraîche, fromage, lardons, pomme de terre, oignons, fromage à tartiflette	0.00	f	1	28	t	5	6	\N
2824	403	pizzas_choix	🏔️ *29. MONTAGNARDE*\r\n       → Crème fraîche ou sauce tomate, fromage, bacon, œuf, fromage à raclette, oignons	0.00	f	1	29	t	5	6	\N
2159	365	Boisson 33CL incluse	9️⃣ 🥤 SPRITE	0.00	f	1	9	t	0	\N	\N
2160	365	Boisson 33CL incluse	1️⃣2️⃣ 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2161	366	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2162	366	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2163	366	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2164	366	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2165	366	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2166	366	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2167	366	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2168	366	Boisson 33CL incluse	🔟 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2169	366	Boisson 33CL incluse	8️⃣ 🍊 FANTA	0.00	f	1	8	t	0	\N	\N
2170	366	Boisson 33CL incluse	1️⃣1️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2171	366	Boisson 33CL incluse	9️⃣ 🥤 SPRITE	0.00	f	1	9	t	0	\N	\N
2172	366	Boisson 33CL incluse	1️⃣2️⃣ 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2813	403	pizzas_choix	🌺 *18. FLORIDA*\r\n       → Crème fraîche, fromage, jambon, lardons, pomme de terre, oignons	0.00	f	1	18	t	5	6	\N
2814	403	pizzas_choix	🍍 *19. HAWAIENNE*\r\n       → Crème fraîche, fromage, ananas, jambon	0.00	f	1	19	t	5	6	\N
2638	238	Suppléments	1️⃣ Pas de suppléments	0.00	f	10	1	t	3	\N	\N
2639	238	Suppléments	2️⃣ Ajouter des suppléments	0.00	f	10	2	t	3	\N	\N
331	201	extras	Bacon de Bœuf	3.00	f	5	0	t	4	\N	\N
2173	345	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2174	346	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2175	348	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2176	349	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2177	350	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2178	351	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2179	352	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2180	353	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2181	354	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2182	355	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2183	356	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2184	347	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2185	345	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2186	346	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2187	348	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2188	349	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2189	350	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2190	351	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2191	352	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2192	353	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2193	354	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2194	355	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2195	356	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2196	347	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2197	345	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2198	346	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2199	348	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2200	349	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2201	350	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2202	351	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2203	352	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2204	353	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2205	354	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2206	355	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2207	356	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2208	347	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2209	345	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2210	346	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2211	348	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2212	349	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2213	350	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2214	351	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2215	352	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2216	353	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2217	354	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2218	355	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2219	356	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2220	347	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2221	345	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2222	346	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2223	348	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2224	349	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2225	350	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2226	351	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2227	352	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2228	353	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2229	354	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2230	355	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2231	356	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2232	347	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2233	345	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2234	346	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2235	348	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2236	349	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2237	350	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2238	351	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2239	352	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2240	353	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2241	354	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2242	355	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2243	356	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2244	347	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2245	345	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2246	346	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
333	201	extras	Galette	3.00	f	5	0	t	4	\N	\N
2247	348	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2248	349	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2249	350	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2250	351	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2251	352	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2252	353	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2253	354	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2254	355	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2255	356	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2256	347	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2257	345	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2258	346	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2259	348	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2260	349	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2261	350	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2262	351	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2263	352	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2264	353	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2265	354	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2266	355	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2267	356	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2268	347	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2269	345	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2270	346	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2271	348	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2272	349	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2273	350	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2274	351	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2275	352	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2276	353	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2277	354	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2278	355	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2279	356	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2280	347	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2281	345	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2282	346	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2283	348	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2284	349	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2285	350	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2286	351	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2287	352	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2288	353	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2289	354	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2290	355	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2291	356	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2292	347	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2293	345	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2294	346	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2295	348	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2296	349	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2297	350	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2298	351	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2299	352	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2300	353	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2301	354	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2302	355	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2303	356	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2304	347	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2305	345	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2306	346	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2307	348	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2308	349	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2309	350	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2310	351	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2311	352	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2312	353	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2313	354	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2314	355	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2315	356	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2316	347	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2317	222	Boisson 33CL incluse	1️⃣ 🌺 OASIS TROPICAL	0.00	f	1	1	t	0	\N	\N
2318	223	Boisson 33CL incluse	1️⃣ 🌺 OASIS TROPICAL	0.00	f	1	1	t	0	\N	\N
2319	218	Boisson 33CL incluse	1️⃣ 🌺 OASIS TROPICAL	0.00	f	1	1	t	0	\N	\N
2320	219	Boisson 33CL incluse	1️⃣ 🌺 OASIS TROPICAL	0.00	f	1	1	t	0	\N	\N
2321	220	Boisson 33CL incluse	1️⃣ 🌺 OASIS TROPICAL	0.00	f	1	1	t	0	\N	\N
2322	221	Boisson 33CL incluse	1️⃣ 🌺 OASIS TROPICAL	0.00	f	1	1	t	0	\N	\N
2323	222	Boisson 33CL incluse	2️⃣ 🍊 TROPICO	0.00	f	1	2	t	0	\N	\N
2324	223	Boisson 33CL incluse	2️⃣ 🍊 TROPICO	0.00	f	1	2	t	0	\N	\N
2325	218	Boisson 33CL incluse	2️⃣ 🍊 TROPICO	0.00	f	1	2	t	0	\N	\N
2326	219	Boisson 33CL incluse	2️⃣ 🍊 TROPICO	0.00	f	1	2	t	0	\N	\N
2327	220	Boisson 33CL incluse	2️⃣ 🍊 TROPICO	0.00	f	1	2	t	0	\N	\N
2328	221	Boisson 33CL incluse	2️⃣ 🍊 TROPICO	0.00	f	1	2	t	0	\N	\N
2329	222	Boisson 33CL incluse	3️⃣ 🧊 ICE TEA	0.00	f	1	3	t	0	\N	\N
2330	223	Boisson 33CL incluse	3️⃣ 🧊 ICE TEA	0.00	f	1	3	t	0	\N	\N
2331	218	Boisson 33CL incluse	3️⃣ 🧊 ICE TEA	0.00	f	1	3	t	0	\N	\N
2332	219	Boisson 33CL incluse	3️⃣ 🧊 ICE TEA	0.00	f	1	3	t	0	\N	\N
2333	220	Boisson 33CL incluse	3️⃣ 🧊 ICE TEA	0.00	f	1	3	t	0	\N	\N
2334	221	Boisson 33CL incluse	3️⃣ 🧊 ICE TEA	0.00	f	1	3	t	0	\N	\N
2335	222	Boisson 33CL incluse	4️⃣ 🥤 7 UP	0.00	f	1	4	t	0	\N	\N
2336	223	Boisson 33CL incluse	4️⃣ 🥤 7 UP	0.00	f	1	4	t	0	\N	\N
2337	218	Boisson 33CL incluse	4️⃣ 🥤 7 UP	0.00	f	1	4	t	0	\N	\N
2338	219	Boisson 33CL incluse	4️⃣ 🥤 7 UP	0.00	f	1	4	t	0	\N	\N
2339	220	Boisson 33CL incluse	4️⃣ 🥤 7 UP	0.00	f	1	4	t	0	\N	\N
2340	221	Boisson 33CL incluse	4️⃣ 🥤 7 UP	0.00	f	1	4	t	0	\N	\N
347	201	sauce	Algérienne	0.00	t	2	0	t	2	\N	\N
2341	222	Boisson 33CL incluse	5️⃣ 🌴 7UP TROPICAL	0.00	f	1	5	t	0	\N	\N
2342	223	Boisson 33CL incluse	5️⃣ 🌴 7UP TROPICAL	0.00	f	1	5	t	0	\N	\N
2343	218	Boisson 33CL incluse	5️⃣ 🌴 7UP TROPICAL	0.00	f	1	5	t	0	\N	\N
2344	219	Boisson 33CL incluse	5️⃣ 🌴 7UP TROPICAL	0.00	f	1	5	t	0	\N	\N
2345	220	Boisson 33CL incluse	5️⃣ 🌴 7UP TROPICAL	0.00	f	1	5	t	0	\N	\N
2346	221	Boisson 33CL incluse	5️⃣ 🌴 7UP TROPICAL	0.00	f	1	5	t	0	\N	\N
2347	222	Boisson 33CL incluse	6️⃣ 🍒 7UP CHERRY	0.00	f	1	6	t	0	\N	\N
2348	223	Boisson 33CL incluse	6️⃣ 🍒 7UP CHERRY	0.00	f	1	6	t	0	\N	\N
2349	218	Boisson 33CL incluse	6️⃣ 🍒 7UP CHERRY	0.00	f	1	6	t	0	\N	\N
2350	219	Boisson 33CL incluse	6️⃣ 🍒 7UP CHERRY	0.00	f	1	6	t	0	\N	\N
2351	220	Boisson 33CL incluse	6️⃣ 🍒 7UP CHERRY	0.00	f	1	6	t	0	\N	\N
2352	221	Boisson 33CL incluse	6️⃣ 🍒 7UP CHERRY	0.00	f	1	6	t	0	\N	\N
2353	222	Boisson 33CL incluse	7️⃣ 🥤 COCA COLA	0.00	f	1	7	t	0	\N	\N
2354	223	Boisson 33CL incluse	7️⃣ 🥤 COCA COLA	0.00	f	1	7	t	0	\N	\N
2355	218	Boisson 33CL incluse	7️⃣ 🥤 COCA COLA	0.00	f	1	7	t	0	\N	\N
2356	219	Boisson 33CL incluse	7️⃣ 🥤 COCA COLA	0.00	f	1	7	t	0	\N	\N
2357	220	Boisson 33CL incluse	7️⃣ 🥤 COCA COLA	0.00	f	1	7	t	0	\N	\N
2358	221	Boisson 33CL incluse	7️⃣ 🥤 COCA COLA	0.00	f	1	7	t	0	\N	\N
2359	222	Boisson 33CL incluse	8️⃣ ⚫ COCA ZERO	0.00	f	1	8	t	0	\N	\N
2360	223	Boisson 33CL incluse	8️⃣ ⚫ COCA ZERO	0.00	f	1	8	t	0	\N	\N
2361	218	Boisson 33CL incluse	8️⃣ ⚫ COCA ZERO	0.00	f	1	8	t	0	\N	\N
2362	219	Boisson 33CL incluse	8️⃣ ⚫ COCA ZERO	0.00	f	1	8	t	0	\N	\N
2363	220	Boisson 33CL incluse	8️⃣ ⚫ COCA ZERO	0.00	f	1	8	t	0	\N	\N
2364	221	Boisson 33CL incluse	8️⃣ ⚫ COCA ZERO	0.00	f	1	8	t	0	\N	\N
2365	222	Boisson 33CL incluse	9️⃣ 💧 EAU MINÉRALE	0.00	f	1	9	t	0	\N	\N
2366	223	Boisson 33CL incluse	9️⃣ 💧 EAU MINÉRALE	0.00	f	1	9	t	0	\N	\N
2367	218	Boisson 33CL incluse	9️⃣ 💧 EAU MINÉRALE	0.00	f	1	9	t	0	\N	\N
2368	219	Boisson 33CL incluse	9️⃣ 💧 EAU MINÉRALE	0.00	f	1	9	t	0	\N	\N
2369	220	Boisson 33CL incluse	9️⃣ 💧 EAU MINÉRALE	0.00	f	1	9	t	0	\N	\N
2370	221	Boisson 33CL incluse	9️⃣ 💧 EAU MINÉRALE	0.00	f	1	9	t	0	\N	\N
2371	222	Boisson 33CL incluse	🔟 💎 PERRIER	0.00	f	1	10	t	0	\N	\N
2372	223	Boisson 33CL incluse	🔟 💎 PERRIER	0.00	f	1	10	t	0	\N	\N
2373	218	Boisson 33CL incluse	🔟 💎 PERRIER	0.00	f	1	10	t	0	\N	\N
2374	219	Boisson 33CL incluse	🔟 💎 PERRIER	0.00	f	1	10	t	0	\N	\N
2375	220	Boisson 33CL incluse	🔟 💎 PERRIER	0.00	f	1	10	t	0	\N	\N
2376	221	Boisson 33CL incluse	🔟 💎 PERRIER	0.00	f	1	10	t	0	\N	\N
2377	222	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2378	223	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2379	218	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2380	219	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2381	220	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2382	221	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2383	222	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2384	223	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2385	218	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2386	219	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2387	220	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2388	221	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2744	403	boissons_choix	🥤 2. MIRANDA FRAISE	0.00	t	1	2	t	6	8	\N
2745	403	boissons_choix	🥤 3. OASIS TROPICAL	0.00	t	1	3	t	6	8	\N
2746	403	boissons_choix	🥤 4. TROPICO	0.00	t	1	4	t	6	8	\N
2747	403	boissons_choix	🥤 5. ICE TEA	0.00	t	1	5	t	6	8	\N
2819	403	pizzas_choix	🧄 *24. BOURSIN*\r\n       → Crème fraîche, fromage, viande hachée ou poulet, boursin, oignons	0.00	f	1	24	t	5	6	\N
2820	403	pizzas_choix	🇮🇹 *25. ANDIAMO*\r\n       → Crème fraîche, fromage, viande hachée, poulet, merguez, pommes de terre	0.00	f	1	25	t	5	6	\N
2389	225	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2390	226	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2391	227	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2392	225	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2393	226	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2394	227	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2395	225	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2396	226	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2397	227	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2398	225	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2399	226	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2400	227	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2401	225	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2402	226	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2403	227	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2404	225	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2405	226	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2406	227	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2407	225	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2408	226	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2409	227	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2410	225	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2411	226	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2412	227	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2413	225	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2414	226	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
332	201	extras	Poulet	3.00	f	5	0	t	4	\N	\N
2415	227	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2416	225	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2417	226	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2418	227	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2419	225	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2420	226	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2421	227	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2422	225	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2423	226	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2424	227	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2425	367	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2426	368	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2427	369	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2428	370	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2429	371	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2430	367	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2431	368	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2432	369	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2433	370	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2434	371	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2435	367	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2436	368	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2437	369	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2438	370	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2439	371	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2440	367	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2441	368	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2442	369	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2443	370	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2444	371	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2445	367	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2446	368	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2447	369	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2448	370	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2449	371	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2450	367	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2451	368	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2452	369	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2453	370	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2454	371	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2455	367	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2456	368	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2457	369	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2458	370	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2459	371	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2460	367	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2461	368	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2462	369	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2463	370	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2464	371	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2465	367	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2466	368	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2467	369	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2468	370	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2469	371	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2470	367	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2471	368	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2472	369	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2473	370	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2474	371	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2475	367	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2476	368	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2477	369	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2478	370	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2479	371	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2480	367	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2481	368	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2482	369	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2483	370	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2484	371	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2485	230	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2486	231	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2487	228	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2488	229	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2489	230	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2490	231	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2491	228	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2492	229	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2493	230	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2494	231	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2495	228	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2496	229	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2497	230	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2498	231	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2499	228	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2500	229	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2501	230	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2502	231	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2503	228	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2504	229	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2505	230	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2506	231	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2507	228	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2508	229	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2509	230	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2510	231	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2511	228	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2512	229	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2513	230	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2514	231	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2515	228	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2516	229	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2517	230	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2518	231	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2519	228	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2520	229	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2521	230	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2522	231	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2523	228	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2524	229	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2525	230	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2526	231	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2527	228	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2528	229	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2529	230	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2530	231	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2531	228	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2532	229	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2748	403	boissons_choix	🥤 6. 7 UP	0.00	t	1	6	t	6	8	\N
2749	403	boissons_choix	🥤 7. 7UP TROPICAL	0.00	t	1	7	t	6	8	\N
2750	403	boissons_choix	🥤 8. 7UP CHERRY	0.00	t	1	8	t	6	8	\N
2751	403	boissons_choix	🥤 9. COCA COLA	0.00	t	1	9	t	6	8	\N
2752	403	boissons_choix	🥤 10. COCA ZERO	0.00	t	1	10	t	6	8	\N
2753	403	boissons_choix	🥤 11. EAU MINÉRALE	0.00	t	1	11	t	6	8	\N
2755	403	desserts_choix	🍰 1. SALADE DE FRUITS	0.00	t	1	1	t	7	\N	\N
2829	403	pizzas_choix	🧀 *17. 4 FROMAGES*\r\n       → Crème fraîche ou sauce tomate, mozzarella, brie, bleu, parmesan	0.00	f	1	17	t	5	6	\N
2533	380	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2534	381	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2535	382	Boisson 33CL incluse	1️⃣ 🥤 7 UP	0.00	f	1	1	t	0	\N	\N
2536	380	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2537	381	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2538	382	Boisson 33CL incluse	2️⃣ 🍒 7UP CHERRY	0.00	f	1	2	t	0	\N	\N
2539	380	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2540	381	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2541	382	Boisson 33CL incluse	3️⃣ 🌴 7UP TROPICAL	0.00	f	1	3	t	0	\N	\N
2542	380	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2543	381	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2544	382	Boisson 33CL incluse	4️⃣ 🥤 COCA COLA	0.00	f	1	4	t	0	\N	\N
2545	380	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2546	381	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2547	382	Boisson 33CL incluse	5️⃣ ⚫ COCA ZERO	0.00	f	1	5	t	0	\N	\N
2548	380	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2549	381	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2550	382	Boisson 33CL incluse	6️⃣ 💧 EAU MINÉRALE	0.00	f	1	6	t	0	\N	\N
2551	380	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2552	381	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2553	382	Boisson 33CL incluse	7️⃣ 🧊 ICE TEA	0.00	f	1	7	t	0	\N	\N
2554	380	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2555	381	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2556	382	Boisson 33CL incluse	8️⃣ 🌺 OASIS TROPICAL	0.00	f	1	8	t	0	\N	\N
2557	380	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2558	381	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2559	382	Boisson 33CL incluse	9️⃣ 💎 PERRIER	0.00	f	1	9	t	0	\N	\N
2560	380	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2561	381	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2562	382	Boisson 33CL incluse	🔟 🍊 TROPICO	0.00	f	1	10	t	0	\N	\N
2563	380	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2564	381	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2565	382	Boisson 33CL incluse	1️⃣1️⃣ 🍊 FANTA	0.00	f	1	11	t	0	\N	\N
2566	380	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2567	381	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2568	382	Boisson 33CL incluse	1️⃣2️⃣ 🥤 SPRITE	0.00	f	1	12	t	0	\N	\N
2756	403	desserts_choix	🍰 2. YAOURT AUX FRUITS	0.00	t	1	2	t	7	\N	\N
2757	403	desserts_choix	🍰 3. TARTE AUX POMMES	0.00	t	1	3	t	7	\N	\N
2758	403	desserts_choix	🍰 4. TARTE AUX POIRES	0.00	t	1	4	t	7	\N	\N
2759	403	desserts_choix	🍰 5. BROWNIES	0.00	t	1	5	t	7	\N	\N
2760	403	desserts_choix	🍰 6. TARTE AUX DAIMS	0.00	t	1	6	t	7	\N	\N
2761	403	desserts_choix	🍰 7. TIRAMISU	0.00	t	1	7	t	7	\N	\N
2762	403	desserts_choix	🍰 8. FINGER	0.00	t	1	8	t	7	\N	\N
2815	403	pizzas_choix	🎰 *20. NEVADA*\r\n       → Sauce tomate, fromage, poitrine fumée, champignons frais, œuf	0.00	f	1	20	t	5	6	\N
2816	403	pizzas_choix	🌮 *21. MEXICO*\r\n       → Sauce curry, fromage, poulet, poivrons, tomates fraîches	0.00	f	1	21	t	5	6	\N
2817	403	pizzas_choix	🤠 *22. TEXAS*\r\n       → Sauce tomate, fromage, viande hachée, champignons frais, chorizo, oignons	0.00	f	1	22	t	5	6	\N
2802	403	pizzas_choix	🌶️ *7. ORIENTALE*\r\n       → Sauce tomate, fromage, merguez, champignons frais, oignons, œuf	0.00	f	1	7	t	5	6	\N
2803	403	pizzas_choix	🥬 *8. VÉGÉTARIENNE*\r\n       → Sauce tomate, fromage, artichauts, champignons frais, poivrons, olives	0.00	f	1	8	t	5	6	\N
2830	403	pizzas_choix	🍯 *34. CHÈVRE MIEL*\r\n       → Crème fraîche, mozzarella, fromage de chèvre, miel, doux	0.00	f	1	34	t	5	6	\N
2640	191	Boisson 33CL incluse	1️⃣ 🥤 Coca Cola 33CL	0.00	t	1	1	t	1	\N	\N
1957	383	Boisson 1.5L incluse	5️⃣ 🥤 SPRITE (1.5L)	0.00	f	1	5	t	0	\N	\N
2641	191	Boisson 33CL incluse	2️⃣ ⚫ Coca Cola Zéro 33CL	0.00	t	1	2	t	1	\N	\N
2642	191	Boisson 33CL incluse	3️⃣ 🍊 Fanta Orange 33CL	0.00	t	1	3	t	1	\N	\N
2643	191	Boisson 33CL incluse	4️⃣ 🍋 Fanta Citron 33CL	0.00	t	1	4	t	1	\N	\N
2644	191	Boisson 33CL incluse	5️⃣ 🥤 Sprite 33CL	0.00	t	1	5	t	1	\N	\N
2645	191	Boisson 33CL incluse	6️⃣ 🍊 Orangina 33CL	0.00	t	1	6	t	1	\N	\N
2646	191	Boisson 33CL incluse	7️⃣ 🧊 Ice Tea Pêche 33CL	0.00	t	1	7	t	1	\N	\N
2647	191	Boisson 33CL incluse	8️⃣ 🧊 Ice Tea Citron 33CL	0.00	t	1	8	t	1	\N	\N
2648	191	Boisson 33CL incluse	9️⃣ 🌴 Tropico 33CL	0.00	t	1	9	t	1	\N	\N
2649	191	Boisson 33CL incluse	🔟 🥤 Pepsi 33CL	0.00	t	1	10	t	1	\N	\N
2650	191	Boisson 33CL incluse	1️⃣1️⃣ ⚫ Pepsi Max 33CL	0.00	t	1	11	t	1	\N	\N
2651	191	Boisson 33CL incluse	1️⃣2️⃣ 💧 Eau minérale 50CL	0.00	t	1	12	t	1	\N	\N
2652	188	Boisson 33CL incluse	1️⃣ 🥤 Coca Cola 33CL	0.00	t	1	1	t	1	\N	\N
2653	188	Boisson 33CL incluse	2️⃣ ⚫ Coca Cola Zéro 33CL	0.00	t	1	2	t	1	\N	\N
2654	188	Boisson 33CL incluse	3️⃣ 🍊 Fanta Orange 33CL	0.00	t	1	3	t	1	\N	\N
2655	188	Boisson 33CL incluse	4️⃣ 🍋 Fanta Citron 33CL	0.00	t	1	4	t	1	\N	\N
2656	188	Boisson 33CL incluse	5️⃣ 🥤 Sprite 33CL	0.00	t	1	5	t	1	\N	\N
2657	188	Boisson 33CL incluse	6️⃣ 🍊 Orangina 33CL	0.00	t	1	6	t	1	\N	\N
2658	188	Boisson 33CL incluse	7️⃣ 🧊 Ice Tea Pêche 33CL	0.00	t	1	7	t	1	\N	\N
2659	188	Boisson 33CL incluse	8️⃣ 🧊 Ice Tea Citron 33CL	0.00	t	1	8	t	1	\N	\N
2727	403	salades_choix	🌿 *1. VERTE*\r\n       → Salade	0.00	f	1	1	t	1	7	\N
2728	403	salades_choix	🥬 *2. ROMAINE*\r\n       → Salade, tomates, fromage, jambon, noix	0.00	f	1	2	t	1	7	\N
2729	403	salades_choix	🦐 *3. CREVETTE AVOCAT*\r\n       → Salade, tomates, avocat, crevette, olives	0.00	f	1	3	t	1	7	\N
2714	403	choix_plat	🥪 2. PANINI AVEC FRITE OU POTATOES	0.00	t	1	2	t	0	\N	{"1": 1, "2": 2, "3": 5, "4": 4, "5": 6, "6": 6}
2715	403	choix_plat	🍕 3. PIZZA	0.00	t	1	3	t	0	\N	{"1": 1, "2": 2, "3": 5, "4": 4, "5": 6, "6": 6}
2716	403	choix_plat	🍝 4. PÂTES	0.00	t	1	4	t	0	\N	{"1": 1, "2": 2, "3": 5, "4": 4, "5": 6, "6": 6}
2717	403	choix_plat	🍗 5. 8 WINGS + POTATOES	0.00	t	1	5	t	0	\N	{"1": 1, "2": 2, "3": 5, "4": 4, "5": 6, "6": 6}
2718	403	choix_plat	🍤 6. 8 NUGGETS + POTATOES	0.00	t	1	6	t	0	\N	{"1": 1, "2": 2, "3": 5, "4": 4, "5": 6, "6": 6}
2828	403	pizzas_choix	🍔 *33. BIG BURGER*\r\n       → Sauce burger, fromage, viande hachée, poivrons, tomates fraîches, oignons rouges	0.00	f	1	33	t	5	6	\N
2796	403	pizzas_choix	🍕 *1. CLASSICA*\r\n       → Sauce tomate, fromage, origan	0.00	f	1	1	t	5	6	\N
2797	403	pizzas_choix	🍕 *2. REINE*\r\n       → Sauce tomate, fromage, jambon, champignons frais	0.00	f	1	2	t	5	6	\N
2798	403	pizzas_choix	🍕 *3. DIVA*\r\n       → Sauce tomate, fromage, poulet, pomme de terre, chèvre	0.00	f	1	3	t	5	6	\N
2799	403	pizzas_choix	🥟 *4. CALZONE SOUFFLÉE*\r\n       → Sauce tomate, fromage, jambon ou thon ou poulet ou viande	0.00	f	1	4	t	5	6	\N
2800	403	pizzas_choix	🍕 *5. NAPOLITAINE*\r\n       → Sauce tomate, fromage, anchois, câpres, olives	0.00	f	1	5	t	5	6	\N
2801	403	pizzas_choix	🍕 *6. TONINO*\r\n       → Sauce tomate, fromage, thon, poivrons, olives	0.00	f	1	6	t	5	6	\N
2806	403	pizzas_choix	🍕 *11. 4 SAISONS*\r\n       → Sauce tomate, fromage, jambon, artichauts, champignons frais, poivrons, olives	0.00	f	1	11	t	5	6	\N
2807	403	pizzas_choix	👑 *12. ROYALE*\r\n       → Sauce tomate, fromage, viande hachée, merguez, poivrons, œuf	0.00	f	1	12	t	5	6	\N
2808	403	pizzas_choix	🗽 *13. NEW YORK*\r\n       → Sauce tomate, fromage, poulet, poivrons, oignons, jambon	0.00	f	1	13	t	5	6	\N
2809	403	pizzas_choix	🌴 *14. MIAMI*\r\n       → Sauce tomate, fromage, viande hachée, pepperoni, œuf	0.00	f	1	14	t	5	6	\N
2810	403	pizzas_choix	🍖 *15. BARBECUE*\r\n       → Sauce BBQ, fromage, viande hachée, poulet, oignons	0.00	f	1	15	t	5	6	\N
2811	403	pizzas_choix	🐔 *16. CHICKEN*\r\n       → Crème fraîche, fromage, poulet, pomme de terre, champignons frais	0.00	f	1	16	t	5	6	\N
2743	403	boissons_choix	🥤 1. MIRANDA TROPICAL	0.00	t	1	1	t	6	8	\N
2730	403	salades_choix	🍅 *4. NIÇOISE*\r\n       → Salade, tomates, thon, maïs doux, pomme de terre, olives	0.00	f	1	4	t	1	7	\N
2731	403	salades_choix	🧀 *5. CHÈVRE CHAUD*\r\n       → Salade, tomates, champignons frais, croûtons, chèvre chaud	0.00	f	1	5	t	1	7	\N
2732	403	salades_choix	🥓 *6. CESAR*\r\n       → Tenders, croûton parmesan, sauce César, salade, tomate	0.00	f	1	6	t	1	7	\N
2733	403	paninis_choix	🥖 *1. 4 FROMAGES*\r\n       → Pain panini, crème fraîche, emmental, brie, bleu, rapé italien	0.00	f	1	1	t	2	7	\N
2734	403	paninis_choix	🥖 *2. VIANDE HACHÉE*\r\n       → Pain panini, crème fraîche, viande hachée	0.00	f	1	2	t	2	7	\N
2735	403	paninis_choix	🥖 *3. POULET*\r\n       → Pain panini, sauce tomate, fromage, poulet	0.00	f	1	3	t	2	7	\N
2736	403	paninis_choix	🥖 *4. SAUMON*\r\n       → Pain panini, crème fraîche, fromage, saumon	0.00	f	1	4	t	2	7	\N
2737	403	paninis_choix	🥖 *5. CHÈVRE MIEL*\r\n       → Pain panini, fromage de chèvre, miel	0.00	f	1	5	t	2	7	\N
2723	403	accompagnement_panini	🍟 1. FRITES	0.00	f	1	1	t	3	7	\N
2724	403	accompagnement_panini	🥔 2. POTATOES	0.00	f	1	2	t	3	7	\N
2738	403	pates_choix	🍝 *1. BOLOGNAISE*\r\n       → Tagliatelles, sauce tomate, viande de bœuf hachée	0.00	f	1	1	t	4	7	\N
2739	403	pates_choix	🍝 *2. CARBONARA*\r\n       → Tagliatelles, crème fraîche, lardon fumé, jaune d'œuf	0.00	f	1	2	t	4	7	\N
2740	403	pates_choix	🍝 *3. 3 FROMAGES*\r\n       → Tagliatelles, crème fraîche, brie, bleu, rapé italien	0.00	f	1	3	t	4	7	\N
2741	403	pates_choix	🍝 *4. SAUMON*\r\n       → Tagliatelles, crème fraîche, saumon fumé, basilics	0.00	f	1	4	t	4	7	\N
2742	403	pates_choix	🍝 *5. POULET*\r\n       → Tagliatelles, sauce tomate, poulet	0.00	f	1	5	t	4	7	\N
2754	403	boissons_choix	🥤 12. PERRIER	0.00	t	1	12	t	6	8	\N
2804	403	pizzas_choix	🦐 *9. FRUITS DE MER*\r\n       → Sauce tomate, fromage, cocktail de fruits de mer mariné à l'ail et persil, citron	0.00	f	1	9	t	5	6	\N
2818	403	pizzas_choix	🐟 *23. RIMINI*\r\n       → Crème fraîche, fromage, saumon fumé, œuf de lumps, citron	0.00	f	1	23	t	5	6	\N
2821	403	pizzas_choix	⚔️ *26. SAMOURAÏ*\r\n       → Sauce samouraï, fromage, viande hachée, oignons, poivrons	0.00	f	1	26	t	5	6	\N
2805	403	pizzas_choix	🍕 *10. CAMPIONE*\r\n       → Sauce tomate, fromage, viande hachée, champignons frais, poivrons, tomates fraîches	0.00	f	1	10	t	5	6	\N
\.


--
-- TOC entry 4519 (class 0 OID 17375)
-- Dependencies: 396
-- Data for Name: france_product_sizes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_product_sizes (id, product_id, size_name, price_on_site, includes_drink, display_order, price_delivery, is_active, updated_at) FROM stdin;
187	276	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
188	276	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
189	276	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
190	277	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
191	277	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
192	277	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
193	278	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
194	278	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
195	278	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
196	279	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
197	279	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
198	279	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
199	280	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
200	280	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
201	280	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
202	281	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
203	281	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
204	281	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
205	282	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
206	282	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
207	282	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
208	283	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
209	283	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
210	283	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
211	284	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
212	284	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
213	284	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
214	285	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
215	285	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
216	285	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
217	286	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
218	286	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
219	286	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
220	287	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
221	287	SENIOR	15.00	f	2	15.00	t	2025-09-13 19:04:58.499729+02
222	287	MEGA	20.00	f	3	20.00	t	2025-09-13 19:04:58.499729+02
223	288	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
224	288	SENIOR	16.00	f	2	16.00	t	2025-09-13 19:04:58.499729+02
225	288	MEGA	21.00	f	3	21.00	t	2025-09-13 19:04:58.499729+02
226	289	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
227	289	SENIOR	16.00	f	2	16.00	t	2025-09-13 19:04:58.499729+02
228	289	MEGA	21.00	f	3	21.00	t	2025-09-13 19:04:58.499729+02
229	290	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
230	290	SENIOR	16.00	f	2	16.00	t	2025-09-13 19:04:58.499729+02
231	290	MEGA	21.00	f	3	21.00	t	2025-09-13 19:04:58.499729+02
232	291	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
233	291	SENIOR	16.00	f	2	16.00	t	2025-09-13 19:04:58.499729+02
234	291	MEGA	21.00	f	3	21.00	t	2025-09-13 19:04:58.499729+02
235	292	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
236	292	SENIOR	16.00	f	2	16.00	t	2025-09-13 19:04:58.499729+02
237	292	MEGA	21.00	f	3	21.00	t	2025-09-13 19:04:58.499729+02
238	293	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
239	293	SENIOR	16.00	f	2	16.00	t	2025-09-13 19:04:58.499729+02
240	293	MEGA	21.00	f	3	21.00	t	2025-09-13 19:04:58.499729+02
241	294	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
242	294	SENIOR	16.00	f	2	16.00	t	2025-09-13 19:04:58.499729+02
243	294	MEGA	21.00	f	3	21.00	t	2025-09-13 19:04:58.499729+02
244	295	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
245	295	SENIOR	16.00	f	2	16.00	t	2025-09-13 19:04:58.499729+02
246	295	MEGA	21.00	f	3	21.00	t	2025-09-13 19:04:58.499729+02
247	296	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
248	296	SENIOR	16.00	f	2	16.00	t	2025-09-13 19:04:58.499729+02
249	296	MEGA	21.00	f	3	21.00	t	2025-09-13 19:04:58.499729+02
250	297	JUNIOR	9.00	f	1	9.00	t	2025-09-13 19:04:58.499729+02
251	297	SENIOR	16.00	f	2	16.00	t	2025-09-13 19:04:58.499729+02
252	297	MEGA	21.00	f	3	21.00	t	2025-09-13 19:04:58.499729+02
256	299	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
257	299	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
258	299	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
259	300	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
260	300	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
261	300	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
262	301	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
263	301	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
264	301	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
265	302	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
266	302	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
267	302	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
268	303	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
269	303	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
270	303	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
271	304	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
272	304	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
273	304	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
274	305	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
275	305	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
276	305	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
277	306	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
278	306	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
279	306	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
280	307	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
281	307	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
282	307	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
283	308	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
284	308	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
285	308	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
286	309	JUNIOR	10.00	f	1	10.00	t	2025-09-13 19:04:58.499729+02
287	309	SENIOR	17.00	f	2	17.00	t	2025-09-13 19:04:58.499729+02
288	309	MEGA	22.00	f	3	22.00	t	2025-09-13 19:04:58.499729+02
289	201	MENU M - 1 VIANDE	7.00	t	1	8.00	t	2025-09-13 19:04:58.499729+02
290	201	MENU L - 2 VIANDES	8.50	t	2	9.50	t	2025-09-13 19:04:58.499729+02
291	201	MENU XL - 3 VIANDES	10.00	t	3	11.00	t	2025-09-13 19:04:58.499729+02
\.


--
-- TOC entry 4515 (class 0 OID 17341)
-- Dependencies: 392
-- Data for Name: france_product_variants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_product_variants (id, product_id, variant_name, price_on_site, quantity, unit, is_menu, includes_description, display_order, is_active, price_delivery) FROM stdin;
63	270	33CL	1.50	33	cl	f	\N	1	t	1.50
49	272	1L5	3.00	150	cl	f	\N	1	t	3.00
50	273	1L5	3.00	150	cl	f	\N	1	t	3.00
51	274	1L5	3.00	150	cl	f	\N	1	t	3.00
52	275	1L5	3.50	150	cl	f	\N	1	t	3.50
53	260	33CL	1.50	33	cl	f	\N	1	t	1.50
54	261	33CL	1.50	33	cl	f	\N	1	t	1.50
55	262	33CL	1.50	33	cl	f	\N	1	t	1.50
56	263	33CL	1.50	33	cl	f	\N	1	t	1.50
57	264	33CL	1.50	33	cl	f	\N	1	t	1.50
58	265	33CL	1.50	33	cl	f	\N	1	t	1.50
59	266	33CL	1.50	33	cl	f	\N	1	t	1.50
60	267	33CL	1.50	33	cl	f	\N	1	t	1.50
61	268	33CL	1.50	33	cl	f	\N	1	t	1.50
62	269	33CL	1.50	33	cl	f	\N	1	t	1.50
64	271	33CL	1.50	33	cl	f	\N	1	t	1.50
\.


--
-- TOC entry 4513 (class 0 OID 17318)
-- Dependencies: 390
-- Data for Name: france_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_products (id, restaurant_id, category_id, name, description, product_type, base_price, composition, display_order, is_active, created_at, updated_at, price_on_site_base, price_delivery_base, workflow_type, requires_steps, steps_config) FROM stdin;
242	1	22	TENDERS BOX	\N	composite	\N	20 pièces Tenders + 2 frites + 1 bouteille 1L5	3	t	2025-09-05 15:10:36.445283	2025-09-05 15:10:36.445283	27.90	28.90	composite_selection	t	{\r\n      "steps": [\r\n        {\r\n          "type": "options_selection",\r\n          "prompt": "Choisissez votre boisson (1.5L) incluse",\r\n          "required": true,\r\n          "option_groups": ["Boisson 1.5L incluse"],\r\n          "max_selections": 1\r\n        }\r\n      ]\r\n    }
188	1	17	VIANDE HACHÉE	\N	composite	\N	PAIN PANINI, CRÈME FRAÎCHE, VIANDE HACHÉE (SERVI AVEC 1 BOISSON 33CL OFFERTE)	2	t	2025-09-05 12:36:29.294786	2025-09-05 12:36:29.294786	5.50	5.50	composite_workflow	t	{\r\n    "steps": [\r\n        {\r\n            "step": 1,\r\n            "type": "options_selection",\r\n            "prompt": "Choisissez votre boisson (incluse) :",\r\n            "required": true,\r\n            "option_groups": ["Boisson 33CL incluse"],\r\n            "max_selections": 1\r\n        }\r\n    ]\r\n}
191	1	17	CHÈVRE MIEL	\N	composite	\N	PAIN PANINI, CRÈME FRAÎCHE, CHÈVRE, MIEL (SERVI AVEC 1 BOISSON 33CL OFFERTE)	5	t	2025-09-05 12:36:45.273825	2025-09-05 12:36:45.273825	5.50	5.50	composite_workflow	t	{\r\n    "steps": [\r\n        {\r\n            "step": 1,\r\n            "type": "options_selection",\r\n            "prompt": "Choisissez votre boisson (incluse) :",\r\n            "required": true,\r\n            "option_groups": ["Boisson 33CL incluse"],\r\n            "max_selections": 1\r\n        }\r\n    ]\r\n}
367	1	4	L'AMERICAIN	Burger gourmet américain	composite	\N	Pain brioché, 2 steaks façon bouchère 150g, bacon, œuf, cornichon, cheddar, sauce au choix	1	t	2025-09-15 21:27:26.703281	2025-09-15 21:34:59.528889	13.50	14.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
201	1	1	TACOS	\N	modular	\N	\N	1	t	2025-09-05 13:16:57.338006	2025-09-13 17:15:36.569	7	8	\N	f	\N
368	1	4	LE SAVOYARD	Burger gourmet savoyard	composite	\N	Pain brioché, steak façon bouchère 150g, galette de PDT, fromage raclette, cornichons, salade, tomate, oignons, sauce au choix	2	t	2025-09-15 21:27:26.703281	2025-09-15 21:34:59.528889	10.50	11.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
170	1	13	SALADE DE FRUITS	\N	simple	\N	\N	1	t	2025-09-05 12:23:10.506873	2025-09-16 19:59:07.288182	2.00	2.00	\N	f	\N
171	1	13	YAOURT AUX FRUITS	\N	simple	\N	\N	2	t	2025-09-05 12:23:10.506873	2025-09-16 19:59:07.288182	2.00	2.00	\N	f	\N
172	1	13	TARTE AUX POMMES	\N	simple	\N	\N	3	t	2025-09-05 12:23:10.506873	2025-09-16 19:59:07.288182	2.50	2.50	\N	f	\N
178	1	15	VERTE	\N	simple	\N	Salade verte nature	1	t	2025-09-05 12:26:58.822744	2025-09-05 12:26:58.822744	4.00	4.00	\N	f	\N
179	1	15	ROMAINE	\N	simple	\N	SALADE, TOMATES, FROMAGE, JAMBON, NOIX	2	t	2025-09-05 12:26:58.822744	2025-09-05 12:26:58.822744	7.50	7.50	\N	f	\N
180	1	15	CREVETTE AVOCAT	\N	simple	\N	SALADE, TOMATES, AVOCAT, CREVETTE, OLIVES	3	t	2025-09-05 12:26:58.822744	2025-09-05 12:26:58.822744	7.50	7.50	\N	f	\N
181	1	15	NIÇOISE	\N	simple	\N	SALADE, TOMATES, THON, MAÏS DOUX, POMME DE TERRE, OLIVES	4	t	2025-09-05 12:26:58.822744	2025-09-05 12:26:58.822744	7.50	7.50	\N	f	\N
182	1	15	CHÈVRE CHAUD	\N	simple	\N	SALADE, TOMATES, CHAMPIGNONS FRAIS, CROÛTONS, CHÈVRE CHAUD	5	t	2025-09-05 12:26:58.822744	2025-09-05 12:26:58.822744	7.50	7.50	\N	f	\N
183	1	15	CESAR	\N	simple	\N	TENDERS, CROÛTON PARMESAN, SAUCE CÉSAR, SALADE, TOMATE	6	t	2025-09-05 12:26:58.822744	2025-09-05 12:26:58.822744	7.50	7.50	\N	f	\N
184	1	16	CHICKEN WINGS	\N	simple	\N	8 AILES DE POULET MARINÉES, ACCOMPAGNÉ DE POTATOES	1	t	2025-09-05 12:29:18.502862	2025-09-05 12:29:18.502862	9.00	9.00	\N	f	\N
185	1	16	NUGGETS	\N	simple	\N	NUGGETS DE POULET, ACCOMPAGNÉ DE POTATOES + SAUCE BBQ	2	t	2025-09-05 12:29:18.502862	2025-09-05 12:29:18.502862	9.00	9.00	\N	f	\N
186	1	16	TENDERS	\N	simple	\N	TENDERS DE POULET, ACCOMPAGNÉ DE POTATOES + SAUCE BBQ	3	t	2025-09-05 12:29:18.502862	2025-09-05 12:29:18.502862	9.00	9.00	\N	f	\N
345	1	3	LE GREC	\N	composite	\N	Émincés de kebab, fromage	1	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	8.00	9.00	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
346	1	3	L'ESCALOPE	\N	composite	\N	Escalope de poulet, fromage	2	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	8.00	9.00	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
173	1	13	TARTE AUX POIRES	\N	simple	\N	\N	4	t	2025-09-05 12:23:10.506873	2025-09-16 19:59:07.288182	2.50	2.50	\N	f	\N
174	1	13	BROWNIES	\N	simple	\N	\N	5	t	2025-09-05 12:23:10.506873	2025-09-16 19:59:07.288182	2.50	2.50	\N	f	\N
196	1	18	BOLOGNAISE		simple	\N	TAGLIATELLES, SAUCE TOMATE, VIANDE DE BŒUF HACHÉE	1	t	2025-09-05 12:46:39.933629	2025-09-10 11:34:26.869	8.5	8.5		f	""
192	1	12	HÄAGEN-DAZS 100ML	\N	simple	\N	Glace Häagen-Dazs format 100ML	1	t	2025-09-05 12:43:20.676089	2025-09-05 12:43:20.676089	3.00	3.00	\N	f	\N
193	1	12	HÄAGEN-DAZS 500ML	\N	simple	\N	Glace Häagen-Dazs format 500ML	2	t	2025-09-05 12:43:20.676089	2025-09-05 12:43:20.676089	7.00	7.00	\N	f	\N
194	1	12	BEN & JERRY'S 100ML	\N	simple	\N	Glace Ben & Jerry's format 100ML	3	t	2025-09-05 12:43:20.676089	2025-09-05 12:43:20.676089	3.00	3.00	\N	f	\N
195	1	12	BEN & JERRY'S 500ML	\N	simple	\N	Glace Ben & Jerry's format 500ML	4	t	2025-09-05 12:43:20.676089	2025-09-05 12:43:20.676089	7.00	7.00	\N	f	\N
197	1	18	CARBONARA	\N	simple	\N	TAGLIATELLES, CRÈME FRAÎCHE, LARDON FUMÉ, JAUNE D'ŒUF	2	t	2025-09-05 12:46:39.933629	2025-09-05 12:46:39.933629	8.50	8.50	\N	f	\N
198	1	18	3 FROMAGES	\N	simple	\N	TAGLIATELLES, CRÈME FRAÎCHE, BRIE, BLEU, RÂPÉ ITALIEN	3	t	2025-09-05 12:46:39.933629	2025-09-05 12:46:39.933629	8.50	8.50	\N	f	\N
200	1	18	PÂTES AU POULET	\N	simple	\N	TAGLIATELLES, SAUCE TOMATE, POULET	5	t	2025-09-05 12:46:39.933629	2025-09-05 12:46:39.933629	8.50	8.50	\N	f	\N
199	1	18	PÂTES AU SAUMON	\N	simple	\N	TAGLIATELLES, CRÈME FRAÎCHE, SAUMON FUMÉ, BASILICS	4	t	2025-09-05 12:46:39.933629	2025-09-05 12:46:39.933629	8.50	8.50	\N	f	\N
369	1	4	LE BBQ	Burger gourmet BBQ	composite	\N	Pain brioché, steak façon bouchère 150g, bacon, cheddar, oignons, cornichons, salade, sauce au choix	3	t	2025-09-15 21:27:26.703281	2025-09-15 21:34:59.528889	9	10.40	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
370	1	4	LE BIG CHEF	Burger gourmet du chef	composite	\N	Pain brioché, steak façon bouchère 150g, salade, tomates, oignons, cheddar, bacon, œuf	4	t	2025-09-15 21:27:26.703281	2025-09-15 21:34:59.528889	11.50	12.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
371	1	4	L'AVOCADO	Burger gourmet avocat	composite	\N	Pain brioché, 1 steak façon bouchère 150g, cheddar, avocat, salade, tomate, sauce au choix	5	t	2025-09-15 21:27:26.703281	2025-09-15 21:34:59.528889	10.50	11.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
230	1	7	MIXTE	\N	composite	\N	Pain cèse naan, crudités, steak + poulet	3	t	2025-09-05 13:25:59.798689	2025-09-16 19:05:30.711489	8.50	9.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
231	1	7	KÉBAB	\N	composite	\N	Pain cèse naan, crudités, kébab	4	t	2025-09-05 13:25:59.798689	2025-09-16 19:05:30.711489	9.50	10.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
235	1	19	MENU ENFANT	\N	composite	\N	Cheeseburger OU Nuggets + Frites + Kinder Surprise + Compote OU Caprisun	1	t	2025-09-05 14:13:42.925981	2025-09-05 14:13:42.925981	7.00	8.00	composite_workflow	t	{\r\n      "steps": [\r\n        {\r\n          "step": 1,\r\n          "type": "options_selection",\r\n          "prompt": "Choisissez votre plat principal",\r\n          "option_groups": ["Plat principal"],\r\n          "required": true,\r\n          "max_selections": 1\r\n        },\r\n        {\r\n          "step": 2,\r\n          "type": "options_selection",\r\n          "prompt": "Choisissez votre boisson",\r\n          "option_groups": ["Boisson enfant"],\r\n          "required": true,\r\n          "max_selections": 1\r\n        }\r\n      ]\r\n    }
175	1	13	TARTE AUX DAIMS	\N	simple	\N	\N	6	t	2025-09-05 12:23:10.506873	2025-09-16 19:59:07.288182	3.00	3.00	\N	f	\N
176	1	13	TIRAMISU	\N	simple	\N	\N	7	t	2025-09-05 12:23:10.506873	2025-09-16 19:59:07.288182	3.00	3.00	\N	f	\N
177	1	13	FINGER	\N	simple	\N	\N	8	t	2025-09-05 12:23:10.506873	2025-09-16 19:59:07.288182	3.50	3.50	\N	f	\N
402	\N	13	FRAISIER	\N	simple	\N	\N	9	t	2025-09-16 19:49:00.651715	2025-09-16 19:59:07.288182	3.50	3.50	\N	f	\N
189	1	17	POULET	\N	composite	\N	PAIN PANINI, SAUCE TOMATE, FROMAGE, POULET (SERVI AVEC 1 BOISSON 33CL OFFERTE)	3	t	2025-09-05 12:36:29.294786	2025-09-05 12:36:29.294786	5.50	5.50	composite_workflow	t	{\r\n    "steps": [\r\n        {\r\n            "step": 1,\r\n            "type": "options_selection",\r\n            "prompt": "Choisissez votre boisson (incluse) :",\r\n            "required": true,\r\n            "option_groups": ["Boisson 33CL incluse"],\r\n            "max_selections": 1\r\n        }\r\n    ]\r\n}
190	1	17	SAUMON	\N	composite	\N	PAIN PANINI, CRÈME FRAÎCHE, FROMAGE, SAUMON (SERVI AVEC 1 BOISSON 33CL OFFERTE)	4	t	2025-09-05 12:36:29.294786	2025-09-05 12:36:29.294786	5.50	5.50	composite_workflow	t	{\r\n    "steps": [\r\n        {\r\n            "step": 1,\r\n            "type": "options_selection",\r\n            "prompt": "Choisissez votre boisson (incluse) :",\r\n            "required": true,\r\n            "option_groups": ["Boisson 33CL incluse"],\r\n            "max_selections": 1\r\n        }\r\n    ]\r\n}
284	1	10	🦐 FRUITS DE MER	SAUCE TOMATE, FROMAGE, COCKTAIL DE FRUITS DE MER MARINÉ À L'AIL ET PERSIL, CITRON	modular	\N	SAUCE TOMATE, FROMAGE, COCKTAIL DE FRUITS DE MER MARINÉ À L'AIL ET PERSIL, CITRON	9	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
285	1	10	🍕 CAMPIONE	SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, CHAMPIGNONS FRAIS, POIVRONS, TOMATES FRAÎCHES	modular	\N	SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, CHAMPIGNONS FRAIS, POIVRONS, TOMATES FRAÎCHES	10	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
286	1	10	🍕 4 SAISONS	SAUCE TOMATE, FROMAGE, JAMBON*, ARTICHAUTS, CHAMPIGNONS FRAIS, POIVRONS, OLIVES	modular	\N	SAUCE TOMATE, FROMAGE, JAMBON*, ARTICHAUTS, CHAMPIGNONS FRAIS, POIVRONS, OLIVES	11	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
287	1	10	👑 ROYALE	SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, MERGUEZ, POIVRONS, ŒUF	modular	\N	SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, MERGUEZ, POIVRONS, ŒUF	12	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
288	1	10	🗽 NEW YORK	SAUCE TOMATE, FROMAGE, POULET, POIVRONS, OIGNONS, JAMBON*	modular	\N	SAUCE TOMATE, FROMAGE, POULET, POIVRONS, OIGNONS, JAMBON*	13	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
289	1	10	🌴 MIAMI	SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, PEPPERONIE, ŒUF	modular	\N	SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, PEPPERONIE, ŒUF	14	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
290	1	10	🍖 BARBECUE	SAUCE BBQ, FROMAGE, VIANDE HACHÉE, POULET, OIGNONS	modular	\N	SAUCE BBQ, FROMAGE, VIANDE HACHÉE, POULET, OIGNONS	15	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
291	1	10	🐔 CHICKEN	CRÈME FRAÎCHE, FROMAGE, POULET, POMME DE TERRE, CHAMPIGNONS FRAIS	modular	\N	CRÈME FRAÎCHE, FROMAGE, POULET, POMME DE TERRE, CHAMPIGNONS FRAIS	16	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
292	1	10	🧀 4 FROMAGES	CRÈME FRAÎCHE OU SAUCE TOMATE, MOZZARELLA, BRIE, BLEU, PARMESAN	modular	\N	CRÈME FRAÎCHE OU SAUCE TOMATE, MOZZARELLA, BRIE, BLEU, PARMESAN	17	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
293	1	10	🌺 FLORIDA	CRÈME FRAÎCHE, FROMAGE, JAMBON*, LARDONS, POMME DE TERRE, OIGNONS	modular	\N	CRÈME FRAÎCHE, FROMAGE, JAMBON*, LARDONS, POMME DE TERRE, OIGNONS	18	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
294	1	10	🍍 HAWAIENNE	CRÈME FRAÎCHE, FROMAGE, ANANAS, JAMBON*	modular	\N	CRÈME FRAÎCHE, FROMAGE, ANANAS, JAMBON*	19	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
270	1	14	EAU MINÉRALE	\N	simple	\N	33cl	11	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
222	1	5	LE SMASH MIELLEUX	\N	composite	\N	Pain buns, steak smash beef 70g, chèvre, miel, cheddar, crudités, noix	5	t	2025-09-05 13:25:59.798689	2025-09-05 13:25:59.798689	11.90	12.90	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
223	1	5	CHICKEN CRAZY	\N	composite	\N	Pain buns, filet de poulet pané, cheddar, oignons confits, alloco, coleslaw, sauce samouraï	6	t	2025-09-05 13:25:59.798689	2025-09-05 13:25:59.798689	11.90	12.90	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
260	1	14	MIRANDA TROPICAL	\N	simple	\N	33cl	1	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
261	1	14	MIRANDA FRAISE	\N	simple	\N	33cl	2	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
262	1	14	OASIS TROPICAL	\N	simple	\N	33cl	3	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
263	1	14	TROPICO	\N	simple	\N	33cl	4	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
264	1	14	ICE TEA	\N	simple	\N	33cl	5	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
265	1	14	7 UP	\N	simple	\N	33cl	6	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
266	1	14	7UP TROPICAL	\N	simple	\N	33cl	7	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
267	1	14	7UP CHERRY	\N	simple	\N	33cl	8	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
268	1	14	COCA COLA	\N	simple	\N	33cl	9	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
269	1	14	COCA ZERO	\N	simple	\N	33cl	10	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
271	1	14	PERRIER	\N	simple	\N	33cl	12	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	1.50	1.50	\N	f	\N
272	1	14	COCA COLA 1L5	\N	variant	\N	\N	20	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	\N	\N	\N	f	\N
273	1	14	COCA ZERO 1L5	\N	variant	\N	\N	21	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	\N	\N	\N	f	\N
274	1	14	FANTA 1L5	\N	variant	\N	\N	22	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	\N	\N	\N	f	\N
275	1	14	OASIS 1L5	\N	variant	\N	\N	23	t	2025-09-05 15:54:31.185002	2025-09-05 15:54:31.185002	\N	\N	\N	f	\N
276	1	10	🍕 CLASSICA	SAUCE TOMATE, FROMAGE, ORIGAN	modular	\N	SAUCE TOMATE, FROMAGE, ORIGAN	1	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
277	1	10	🍕 REINE	SAUCE TOMATE, FROMAGE, JAMBON*, CHAMPIGNONS FRAIS	modular	\N	SAUCE TOMATE, FROMAGE, JAMBON*, CHAMPIGNONS FRAIS	2	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
278	1	10	🍕 DIVA	SAUCE TOMATE, FROMAGE, POULET, POMME DE TERRE, CHÈVRE	modular	\N	SAUCE TOMATE, FROMAGE, POULET, POMME DE TERRE, CHÈVRE	3	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
279	1	10	🥟 CALZONE SOUFFLÉE	SAUCE TOMATE, FROMAGE, JAMBON* OU THON OU POULET OU VIANDE	modular	\N	SAUCE TOMATE, FROMAGE, JAMBON* OU THON OU POULET OU VIANDE	4	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
280	1	10	🍕 NAPOLITAINE	SAUCE TOMATE, FROMAGE, ANCHOIS, CÂPRES, OLIVES	modular	\N	SAUCE TOMATE, FROMAGE, ANCHOIS, CÂPRES, OLIVES	5	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
281	1	10	🍕 TONINO	SAUCE TOMATE, FROMAGE, THON, POIVRONS, OLIVES	modular	\N	SAUCE TOMATE, FROMAGE, THON, POIVRONS, OLIVES	6	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
282	1	10	🌶️ ORIENTALE	SAUCE TOMATE, FROMAGE, MERGUEZ, CHAMPIGNONS FRAIS, OIGNONS, ŒUF	modular	\N	SAUCE TOMATE, FROMAGE, MERGUEZ, CHAMPIGNONS FRAIS, OIGNONS, ŒUF	7	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
283	1	10	🥬 VÉGÉTARIENNE	SAUCE TOMATE, FROMAGE, ARTICHAUTS, CHAMPIGNONS FRAIS, POIVRONS, OLIVES	modular	\N	SAUCE TOMATE, FROMAGE, ARTICHAUTS, CHAMPIGNONS FRAIS, POIVRONS, OLIVES	8	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
372	1	8	TENDERS 1 PIECE	Tender de poulet	simple	\N	1 pièce tender de poulet	1	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	1.50	1.50	\N	f	\N
373	1	8	NUGGETS 4 PIECES	Nuggets de poulet	simple	\N	4 pièces nuggets de poulet	2	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	3.50	3.50	\N	f	\N
374	1	8	WINGS 4 PIECES	Ailes de poulet	simple	\N	4 pièces wings de poulet	3	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	3.50	3.50	\N	f	\N
375	1	8	DONUTS POULET 1 PIECE	Donut de poulet	simple	\N	1 pièce donut de poulet	4	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	2.00	2.00	\N	f	\N
295	1	10	🎰 NEVADA	SAUCE TOMATE, FROMAGE, POITRINE FUMÉE, CHAMPIGNONS FRAIS, ŒUF	modular	\N	SAUCE TOMATE, FROMAGE, POITRINE FUMÉE, CHAMPIGNONS FRAIS, ŒUF	20	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
296	1	10	🌮 MEXICO	SAUCE CURRY, FROMAGE, POULET, POIVRONS, TOMATES FRAÎCHES	modular	\N	SAUCE CURRY, FROMAGE, POULET, POIVRONS, TOMATES FRAÎCHES	21	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
297	1	10	🤠 TEXAS	SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, CHAMPIGNONS FRAIS, CHORIZO, OIGNONS	modular	\N	SAUCE TOMATE, FROMAGE, VIANDE HACHÉE, CHAMPIGNONS FRAIS, CHORIZO, OIGNONS	22	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
299	1	10	🐟 RIMINI	CRÈME FRAÎCHE, FROMAGE, SAUMON FUMÉ, ŒUF DE LYMPS, CITRON	modular	\N	CRÈME FRAÎCHE, FROMAGE, SAUMON FUMÉ, ŒUF DE LYMPS, CITRON	24	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
300	1	10	🧄 BOURSIN	CRÈME FRAÎCHE, FROMAGE, VIANDE HACHÉE OU POULET, BOURSIN, OIGNONS	modular	\N	CRÈME FRAÎCHE, FROMAGE, VIANDE HACHÉE OU POULET, BOURSIN, OIGNONS	25	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
301	1	10	🇮🇹 ANDIAMO	CRÈME FRAÎCHE, FROMAGE, VIANDE HACHÉE, POULET, MERGUEZ, POMMES DE TERRE	modular	\N	CRÈME FRAÎCHE, FROMAGE, VIANDE HACHÉE, POULET, MERGUEZ, POMMES DE TERRE	26	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
302	1	10	⚔️ SAMOURAÏ	SAUCE SAMOURAÏ, FROMAGE, VIANDE HACHÉE, OIGNONS, POIVRONS	modular	\N	SAUCE SAMOURAÏ, FROMAGE, VIANDE HACHÉE, OIGNONS, POIVRONS	27	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
303	1	10	🥓 4 JAMBONS	CRÈME FRAÎCHE OU SAUCE TOMATE, FROMAGES, JAMBON, LARDONS, PEPPERONI, BACON	modular	\N	CRÈME FRAÎCHE OU SAUCE TOMATE, FROMAGES, JAMBON, LARDONS, PEPPERONI, BACON	28	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
304	1	10	🧀 TARTIFLETTE	CRÈME FRAÎCHE, FROMAGE, LARDONS, POMME DE TERRE, OIGNONS, FROMAGE À TARTIFLETTE	modular	\N	CRÈME FRAÎCHE, FROMAGE, LARDONS, POMME DE TERRE, OIGNONS, FROMAGE À TARTIFLETTE	29	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
305	1	10	🏔️ MONTAGNARDE	CRÈME FRAÎCHE OU SAUCE TOMATE, FROMAGE, BACON, ŒUF, FROMAGE À RACLETTE, OIGNONS	modular	\N	CRÈME FRAÎCHE OU SAUCE TOMATE, FROMAGE, BACON, ŒUF, FROMAGE À RACLETTE, OIGNONS	30	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
306	1	10	🌶️ POIVRE	SAUCE POIVRE, FROMAGE, POULET, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES	modular	\N	SAUCE POIVRE, FROMAGE, POULET, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES	31	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
307	1	10	🔥 HOT SPICY	SAUCE SALSA, FROMAGE, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES, PIMENTS FRAIS	modular	\N	SAUCE SALSA, FROMAGE, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES, PIMENTS FRAIS	32	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
308	1	10	🍛 TANDOORI	SAUCE CURRY, FROMAGE, POULET TANDOORI À L'INDIENNE, OIGNONS, POIVRONS, MIEL	modular	\N	SAUCE CURRY, FROMAGE, POULET TANDOORI À L'INDIENNE, OIGNONS, POIVRONS, MIEL	33	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
309	1	10	🍔 BIG BURGER	SAUCE BURGER, FROMAGE, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES, OIGNONS ROUGES	modular	\N	SAUCE BURGER, FROMAGE, VIANDE HACHÉE, POIVRONS, TOMATES FRAÎCHES, OIGNONS ROUGES	34	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	\N	\N	\N	f	\N
238	1	21	BOWL		composite	\N	1 viande au choix + cheddar + sauce fromagère + frites	1	t	2025-09-05 14:54:15.772908	2025-09-05 14:54:15.772908	8.00	9.00	composite_workflow	t	{\r\n    "steps": [\r\n        {\r\n            "step": 1,\r\n            "type": "options_selection",\r\n            "prompt": "Choisissez votre viande :",\r\n            "required": true,\r\n            "option_groups": ["Choix viande"],\r\n            "max_selections": 1\r\n        },\r\n        {\r\n            "step": 2,\r\n            "type": "options_selection", \r\n            "prompt": "Choisissez votre boisson (incluse) :",\r\n            "required": true,\r\n            "option_groups": ["Boisson 33CL incluse"],\r\n            "max_selections": 1\r\n        },\r\n        {\r\n            "step": 3,\r\n            "type": "options_selection",\r\n            "prompt": "SUPPLÉMENTS :",\r\n            "required": true,\r\n            "option_groups": ["Suppléments"],\r\n            "max_selections": 1\r\n        }\r\n    ]\r\n}
380	1	8	TENDERS 5 PIECES	Menu tenders	composite	\N	5 pièces tenders + frites + boisson 33CL	9	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	9.00	9.00	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
381	1	8	NUGGETS 10 PIECES	Menu nuggets	composite	\N	10 pièces nuggets + frites + boisson 33CL	10	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	9.00	9.00	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
382	1	8	WINGS 8 PIECES	Menu wings	composite	\N	8 pièces wings + frites + boisson 33CL	11	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	9.00	9.00	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
348	1	3	FOREST	\N	composite	\N	Escalope, galette de P.D.T, cheddar, fromage raclette	4	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	10.00	11.00	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
349	1	3	LE TANDOORI	\N	composite	\N	Poulet mariné au tandoori, fromage	5	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	8.00	9.00	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
376	1	8	MOZZA STICK 4 PIECES	Bâtonnets mozzarella	simple	\N	4 pièces mozza stick	5	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	3.50	3.50	\N	f	\N
377	1	8	JALAPENOS 4 PIECES	Jalapeños panés	simple	\N	4 pièces jalapeños	6	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	3.50	3.50	\N	f	\N
378	1	8	ONION RINGS 4 PIECES	Rondelles d'oignon	simple	\N	4 pièces onion rings	7	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	3.50	3.50	\N	f	\N
379	1	8	POTATOES	Pommes de terre épicées	simple	\N	Pommes de terre épicées	8	t	2025-09-15 22:00:10.445484	2025-09-15 22:01:41.130634	1.00	1.00	\N	f	\N
228	1	7	TENDERS	\N	composite	\N	Pain cèse naan, crudités, tenders de poulet	1	t	2025-09-05 13:25:59.798689	2025-09-16 19:05:30.711489	8.50	9.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
383	1	26	MENU FAMILY	Menu familial pour 4-5 personnes	composite	\N	6 Wings + 6 Tenders + 6 Nuggets + 2 Frites + 2 Mozza Stick + 2 Donuts + 4 Onion Rings + 1 Maxi Boisson	1	t	2025-09-15 22:56:33.77911	2025-09-15 22:56:33.77911	29.90	29.90	composite_workflow	t	{\r\n    "steps": [\r\n      {\r\n        "type": "options_selection",\r\n        "prompt": "Choisissez votre boisson (1.5L) incluse",\r\n        "required": true,\r\n        "option_groups": ["Boisson 1.5L incluse"],\r\n        "max_selections": 1\r\n      }\r\n    ]\r\n  }
229	1	7	STEAK	\N	composite	\N	Pain cèse naan, crudités, steak	2	t	2025-09-05 13:25:59.798689	2025-09-16 19:05:30.711489	8.50	9.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
240	1	22	CHICKEN BOX	\N	composite	\N	25 pièces Wings + 2 frites + 1 bouteille 1L5	1	t	2025-09-05 15:10:36.445283	2025-09-05 15:10:36.445283	21.00	22.00	composite_selection	t	{\r\n      "steps": [\r\n        {\r\n          "type": "options_selection",\r\n          "prompt": "Choisissez votre boisson (1.5L) incluse",\r\n          "required": true,\r\n          "option_groups": ["Boisson 1.5L incluse"],\r\n          "max_selections": 1\r\n        }\r\n      ]\r\n    }
241	1	22	MIXTE BOX	\N	composite	\N	8 pièces Tenders + 15 pièces Wings + 2 frites + 1 bouteille 1L5	2	t	2025-09-05 15:10:36.445283	2025-09-05 15:10:36.445283	27.90	28.90	composite_selection	t	{\r\n      "steps": [\r\n        {\r\n          "type": "options_selection",\r\n          "prompt": "Choisissez votre boisson (1.5L) incluse",\r\n          "required": true,\r\n          "option_groups": ["Boisson 1.5L incluse"],\r\n          "max_selections": 1\r\n        }\r\n      ]\r\n    }
187	1	17	4 FROMAGES	\N	composite	\N	PAIN PANINI, CRÈME FRAÎCHE, EMMENTAL, BRIE, BLEU, RÂPÉ ITALIEN (SERVI AVEC 1 BOISSON 33CL OFFERTE)	1	t	2025-09-05 12:36:29.294786	2025-09-05 12:36:29.294786	5.50	5.50	composite_workflow	t	{\r\n    "steps": [\r\n        {\r\n            "step": 1,\r\n            "type": "options_selection",\r\n            "prompt": "Choisissez votre boisson (incluse) :",\r\n            "required": true,\r\n            "option_groups": ["Boisson 33CL incluse"],\r\n            "max_selections": 1\r\n        }\r\n    ]\r\n}
218	1	5	SMASH CLASSIC	\N	composite	\N	Pain buns, steak smash beef 70g, cheddar, crudités, sauce au choix	1	t	2025-09-05 13:25:59.798689	2025-09-05 13:25:59.798689	8.90	9.90	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
219	1	5	L'ORIGINAL	\N	composite	\N	Pain, 2 steaks smash beef 70g, double cheddar, crudités, sauce au choix	2	t	2025-09-05 13:25:59.798689	2025-09-05 13:25:59.798689	11.90	12.90	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
220	1	5	SMASH SIGNATURE	\N	composite	\N	Pain, 2 steaks smash beef 70g, double cheddar, oignons confits, sauce au choix	3	t	2025-09-05 13:25:59.798689	2025-09-05 13:25:59.798689	12.90	13.90	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
221	1	5	SMASH BACON	\N	composite	\N	Pain buns, steak smash beef 70g, cheddar, bacon, œuf, crudités, oignons caramélisés	4	t	2025-09-05 13:25:59.798689	2025-09-05 13:25:59.798689	11.90	12.90	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
225	1	6	L'ESCALOPE	\N	composite	\N	salade, tomates, oignons blé, escalope de poulet	2	t	2025-09-05 13:25:59.798689	2025-09-05 13:25:59.798689	9.90	10.90	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
226	1	6	CHICKEN CHIKKA	\N	composite	\N	salade, tomates, oignons blé, chicken chikka	3	t	2025-09-05 13:25:59.798689	2025-09-05 13:25:59.798689	9.90	10.90	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
227	1	6	GREC	\N	composite	\N	salade, tomates, oignons blé, viande de grec	4	t	2025-09-05 13:25:59.798689	2025-09-05 13:25:59.798689	9.90	10.90	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
310	1	11	📋 MENU 1	3 PIZZAS JUNIORS AU CHOIX	composite	\N	3 PIZZAS JUNIORS AU CHOIX	1	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	25.00	26.00	menu_pizza_selection	t	{\r\n      "menu_config": {\r\n        "name": "MENU 1",\r\n        "price": 25.00,\r\n        "components": [\r\n          {\r\n            "type": "pizza_selection",\r\n            "title": "Choisissez 3 pizzas JUNIOR",\r\n            "size": "junior",\r\n            "quantity": 3,\r\n            "selection_mode": "multiple",\r\n            "display_prices": true,\r\n            "instruction": "Tapez les 3 numéros séparés par des virgules\\\\nEx: 1,2,5 pour CLASSICA, REINE et TONINO"\r\n          }\r\n        ]\r\n      }\r\n    }
311	1	11	📋 MENU 2	2 PIZZAS SÉNIOR AU CHOIX + 1 BOISSON 1.5 L	composite	\N	2 PIZZAS SÉNIOR AU CHOIX + 1 BOISSON 1.5 L	2	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	25.00	26.00	menu_pizza_selection	t	{\r\n      "menu_config": {\r\n        "name": "MENU 2",\r\n        "price": 25.00,\r\n        "components": [\r\n          {\r\n            "type": "pizza_selection",\r\n            "title": "Choisissez 2 pizzas SÉNIOR",\r\n            "size": "senior",\r\n            "quantity": 2,\r\n            "selection_mode": "multiple",\r\n            "display_prices": true,\r\n            "instruction": "Tapez les 2 numéros séparés par des virgules\\\\nEx: 1,8 pour CLASSICA et VÉGÉTARIENNE"\r\n          },\r\n          {\r\n            "type": "beverage_selection",\r\n            "title": "Choisissez votre boisson 1.5L",\r\n            "quantity": 1,\r\n            "selection_mode": "single",\r\n            "options": [\r\n              {"id": 1, "name": "🥤 COCA COLA 1.5L"},\r\n              {"id": 2, "name": "⚫ COCA ZERO 1.5L"},\r\n              {"id": 3, "name": "🧡 FANTA 1.5L"},\r\n              {"id": 4, "name": "🍊 OASIS 1.5L"}\r\n            ]\r\n          }\r\n        ]\r\n      }\r\n    }
312	1	11	📋 MENU 3	1 PIZZAS MEGA AU CHOIX + 14 NUGGETS OU 12 WINGS + 1 BOISSON 1.5 L	composite	\N	1 PIZZAS MEGA AU CHOIX + 14 NUGGETS OU 12 WINGS + 1 BOISSON 1.5 L	3	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	32.00	33.00	menu_pizza_selection	t	{\r\n      "menu_config": {\r\n        "name": "MENU 3",\r\n        "price": 32.00,\r\n        "components": [\r\n          {\r\n            "type": "pizza_selection",\r\n            "title": "Choisissez votre pizza MEGA",\r\n            "size": "mega",\r\n            "quantity": 1,\r\n            "selection_mode": "single",\r\n            "display_prices": true,\r\n            "instruction": "Tapez le numéro de votre choix"\r\n          },\r\n          {\r\n            "type": "side_selection",\r\n            "title": "Choisissez votre accompagnement",\r\n            "quantity": 1,\r\n            "selection_mode": "single",\r\n            "options": [\r\n              {"id": 1, "name": "🍗 14 NUGGETS"},\r\n              {"id": 2, "name": "🍗 12 WINGS"}\r\n            ]\r\n          },\r\n          {\r\n            "type": "beverage_selection",\r\n            "title": "Choisissez votre boisson 1.5L",\r\n            "quantity": 1,\r\n            "selection_mode": "single",\r\n            "options": [\r\n              {"id": 1, "name": "🥤 COCA COLA 1.5L"},\r\n              {"id": 2, "name": "⚫ COCA ZERO 1.5L"},\r\n              {"id": 3, "name": "🧡 FANTA 1.5L"},\r\n              {"id": 4, "name": "🍊 OASIS 1.5L"}\r\n            ]\r\n          }\r\n        ]\r\n      }\r\n    }
313	1	11	📋 MENU 4	1 PIZZAS SÉNIOR AU CHOIX + 2 BOISSONS 33 CL + 6 WINGS OU 8 NUGGETS	composite	\N	1 PIZZAS SÉNIOR AU CHOIX + 2 BOISSONS 33 CL + 6 WINGS OU 8 NUGGETS	4	t	2025-09-05 18:12:26.754078	2025-09-05 18:12:26.754078	22.00	23.00	menu_pizza_selection	t	{\r\n      "menu_config": {\r\n        "name": "MENU 4",\r\n        "price": 22.00,\r\n        "components": [\r\n          {\r\n            "type": "pizza_selection",\r\n            "title": "Choisissez votre pizza SÉNIOR",\r\n            "size": "senior",\r\n            "quantity": 1,\r\n            "selection_mode": "single",\r\n            "display_prices": true,\r\n            "instruction": "Tapez le numéro de votre choix"\r\n          },\r\n          {\r\n            "type": "beverage_selection",\r\n            "title": "Choisissez votre 1ère boisson 33CL",\r\n            "quantity": 1,\r\n            "selection_mode": "single",\r\n            "options": [\r\n              {"id": 1, "name": "🥤 COCA COLA"},\r\n              {"id": 2, "name": "⚫ COCA ZERO"},\r\n              {"id": 3, "name": "🍋 7UP"},\r\n              {"id": 4, "name": "🍒 7UP CHERRY"},\r\n              {"id": 5, "name": "🌴 7UP TROPICAL"},\r\n              {"id": 6, "name": "🍑 ICE TEA"},\r\n              {"id": 7, "name": "🍓 MIRANDA FRAISE"},\r\n              {"id": 8, "name": "🥭 MIRANDA TROPICAL"},\r\n              {"id": 9, "name": "🍊 OASIS TROPICAL"},\r\n              {"id": 10, "name": "💧 EAU MINÉRALE"},\r\n              {"id": 11, "name": "💎 PERRIER"},\r\n              {"id": 12, "name": "🌺 TROPICO"}\r\n            ]\r\n          },\r\n          {\r\n            "type": "beverage_selection",\r\n            "title": "Choisissez votre 2ème boisson 33CL",\r\n            "quantity": 1,\r\n            "selection_mode": "single",\r\n            "options": [\r\n              {"id": 1, "name": "🥤 COCA COLA"},\r\n              {"id": 2, "name": "⚫ COCA ZERO"},\r\n              {"id": 3, "name": "🍋 7UP"},\r\n              {"id": 4, "name": "🍒 7UP CHERRY"},\r\n              {"id": 5, "name": "🌴 7UP TROPICAL"},\r\n              {"id": 6, "name": "🍑 ICE TEA"},\r\n              {"id": 7, "name": "🍓 MIRANDA FRAISE"},\r\n              {"id": 8, "name": "🥭 MIRANDA TROPICAL"},\r\n              {"id": 9, "name": "🍊 OASIS TROPICAL"},\r\n              {"id": 10, "name": "💧 EAU MINÉRALE"},\r\n              {"id": 11, "name": "💎 PERRIER"},\r\n              {"id": 12, "name": "🌺 TROPICO"}\r\n            ]\r\n          },\r\n          {\r\n            "type": "side_selection",\r\n            "title": "Choisissez votre accompagnement",\r\n            "quantity": 1,\r\n            "selection_mode": "single",\r\n            "options": [\r\n              {"id": 1, "name": "🍗 6 WINGS"},\r\n              {"id": 2, "name": "🍗 8 NUGGETS"}\r\n            ]\r\n          }\r\n        ]\r\n      }\r\n    }
403	1	38	🍽 🍽 MENU MIDI COMPLET	Formule complète : Plat au choix + Dessert + Boisson 33CL	composite	11.00	\N	1	t	2025-09-17 15:29:06.405465	2025-09-17 15:29:06.405465	11.00	11.00	composite	t	\N
350	1	3	LE CHICKEN	\N	composite	\N	Poulet mariné au curry, fromage	6	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	8.00	9.00	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
351	1	3	LE BOURSIN	\N	composite	\N	Escalope de poulet, fromage, boursin	7	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	8.50	9.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
357	1	2	CHEESEBURGER	Burger classique	composite	\N	Steak 45g, fromage, cornichons	1	t	2025-09-15 21:16:37.935906	2025-09-15 21:17:37.456692	5	6	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
358	1	2	DOUBLE CHEESEBURGER	Double burger	composite	\N	2 Steaks 45g, fromage, cornichons	2	t	2025-09-15 21:16:37.935906	2025-09-15 21:17:37.456692	6.50	7.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
359	1	2	BIG CHEESE	Gros burger au fromage	composite	\N	2 Steaks 45g, cheddar, salade, oignons	3	t	2025-09-15 21:16:37.935906	2025-09-15 21:17:37.456692	7.50	8.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
360	1	2	LE FISH	Burger au poisson	composite	\N	Filet de poisson pané, fromage, cornichons	4	t	2025-09-15 21:16:37.935906	2025-09-15 21:17:37.456692	6.50	7	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
355	1	3	LE RADICAL	\N	composite	\N	Steak de 45g, cordon bleu, fromage	11	t	2025-09-15 14:03:47.694721	2025-09-18 13:04:49.199383	8.50	9.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
361	1	2	LE CHICKEN	Burger au poulet	composite	\N	Galette de poulet pané, fromage, cornichons	5	t	2025-09-15 21:16:37.935906	2025-09-15 21:17:37.456692	6.50	7	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
362	1	2	LE TOWER	Burger tour	composite	\N	Galette de poulet pané, crusty, fromage, cornichons	6	t	2025-09-15 21:16:37.935906	2025-09-15 21:17:37.456692	7.50	8.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
363	1	2	GÉANT	Burger géant	composite	\N	Steak 90g, salade	7	t	2025-09-15 21:16:37.935906	2025-09-15 21:17:37.456692	6.50	7.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
364	1	2	180	Burger 180	composite	\N	2 Steaks 90g, cheddar, tomates, oignons	8	t	2025-09-15 21:16:37.935906	2025-09-15 21:17:37.456692	8.50	9.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
365	1	2	LE BACON	Burger au bacon	composite	\N	2 Steaks 90g, fromage, œuf, bacon, cornichons	9	t	2025-09-15 21:16:37.935906	2025-09-15 21:17:37.456692	9.50	10.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
366	1	2	270	Burger 270	composite	\N	3 Steaks 90g, salade, tomates, cornichons	10	t	2025-09-15 21:16:37.935906	2025-09-15 21:17:37.456692	10	11	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
352	1	3	ROYAL	\N	composite	\N	Escalope, cordon bleu, cheddar, crudités	8	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	9.50	10.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
353	1	3	AMÉRICAIN	\N	composite	\N	3 Steaks de 45g, œuf, fromage	9	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	8.50	9.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
354	1	3	DU CHEF	\N	composite	\N	Escalope de poulet, sauce gruyère, fromage râpé	10	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	8.50	9.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
356	1	3	RACLETTE	\N	composite	\N	2 steaks, œufs, galette de P.D.T, cheddar, raclette	12	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	9.50	10.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
347	1	3	LE BUFFALO	\N	composite	\N	Émincés de kebab & de poulet	3	t	2025-09-15 14:03:47.694721	2025-09-15 20:35:54.040428	8.50	9.50	composite_workflow	t	{"steps" : [{"type" : "options_selection", "required" : true, "prompt" : "Choisissez votre boisson 33CL incluse", "option_groups" : ["Boisson 33CL incluse"], "max_selections" : 1}]}
\.


--
-- TOC entry 4550 (class 0 OID 29429)
-- Dependencies: 430
-- Data for Name: france_restaurant_features; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_restaurant_features (id, restaurant_id, feature_type, is_enabled, config) FROM stdin;
1	1	pizzas	t	{"has_supplements": true, "offer_1_for_2": true, "sizes": ["JUNIOR", "SENIOR", "MEGA"]}
2	1	composite_menus	t	{"interactive_selection": true, "max_steps": 5}
3	1	interactive_workflows	t	{"supported_types": ["pizza_config", "composite_selection", "drink_choice"]}
\.


--
-- TOC entry 4568 (class 0 OID 37979)
-- Dependencies: 450
-- Data for Name: france_restaurant_service_modes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_restaurant_service_modes (id, restaurant_id, service_mode, is_enabled, display_name, description, display_order, config, created_at, updated_at) FROM stdin;
2	1	a_emporter	t	À emporter	\N	2	{}	2025-09-07 20:54:33.964689	2025-09-07 20:54:33.964689
1	1	sur_place	t	Sur place	\N	1	{}	2025-09-07 20:54:33.964689	2025-09-07 20:54:33.964689
3	1	livraison	t	Livraison	\N	3	{}	2025-09-07 20:54:33.964689	2025-09-07 20:54:33.964689
\.


--
-- TOC entry 4509 (class 0 OID 17272)
-- Dependencies: 386
-- Data for Name: france_restaurants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_restaurants (id, name, slug, address, city, postal_code, phone, whatsapp_number, delivery_zone_km, min_order_amount, delivery_fee, is_active, business_hours, created_at, updated_at, password_hash, timezone, country_code, hide_delivery_info, is_exceptionally_closed, latitude, longitude, audio_notifications_enabled, audio_volume, audio_enabled_since) FROM stdin;
1	Pizza Yolo 77	pizza-yolo-77	251 Av. Philippe Bur, 77550 Moissy-Cramayel	Paris	77000	0164880605	0164880605	5	0.00	2.50	t	{"jeudi": {"isOpen": true, "closing": "23:00", "opening": "08:00"}, "lundi": {"isOpen": true, "closing": "23:00", "opening": "09:00"}, "mardi": {"isOpen": true, "closing": "04:00", "opening": "08:00"}, "samedi": {"isOpen": true, "closing": "23:00", "opening": "10:00"}, "dimanche": {"isOpen": true, "closing": "22:00", "opening": "08:00"}, "mercredi": {"isOpen": true, "closing": "04:00", "opening": "08:00"}, "vendredi": {"isOpen": true, "closing": "23:00", "opening": "07:00"}}	2025-09-01 13:16:46.405758	2025-09-07 18:57:59.6647	Passer@123	Europe/Paris	FR	t	f	48.62753600	2.59375800	f	35	\N
\.


--
-- TOC entry 4528 (class 0 OID 17646)
-- Dependencies: 405
-- Data for Name: france_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_sessions (id, phone_whatsapp, state, context, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4523 (class 0 OID 17402)
-- Dependencies: 400
-- Data for Name: france_user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_user_sessions (id, phone_number, chat_id, restaurant_id, current_step, session_data, cart_items, total_amount, expires_at, created_at, updated_at, workflow_state, current_step_id, step_data, workflow_context, bot_state, current_workflow_id, workflow_data, workflow_step_id) FROM stdin;
11224	33620951645@c.us	33620951645@c.us	1	CHOOSING_DELIVERY_MODE	"{\\"cart\\":[{\\"productId\\":238,\\"productName\\":\\"BOWL\\",\\"categoryName\\":\\"BOWLS\\",\\"productDescription\\":\\"BOWL (3️⃣ 🍗 Tenders - 1️⃣ Pas de suppléments - 3️⃣ 🌴 7UP TROPICAL)\\",\\"quantity\\":1,\\"unitPrice\\":8,\\"totalPrice\\":8,\\"configuration\\":{\\"Choix viande\\":[{\\"id\\":2606,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":1,\\"is_required\\":false,\\"option_name\\":\\"3️⃣ 🍗 Tenders\\",\\"option_group\\":\\"Choix viande\\",\\"display_order\\":3,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null}],\\"Suppléments\\":[{\\"id\\":2638,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":3,\\"is_required\\":false,\\"option_name\\":\\"1️⃣ Pas de suppléments\\",\\"option_group\\":\\"Suppléments\\",\\"display_order\\":1,\\"max_selections\\":10,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null}],\\"Boisson 33CL incluse\\":[{\\"id\\":2612,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"3️⃣ 🌴 7UP TROPICAL\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":3,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null}]}}],\\"products\\":[{\\"id\\":238,\\"name\\":\\"BOWL\\",\\"type\\":\\"composite\\",\\"price\\":8,\\"sizes\\":[],\\"variants\\":[],\\"is_active\\":true,\\"base_price\\":null,\\"created_at\\":\\"2025-09-05T14:54:15.772908\\",\\"updated_at\\":\\"2025-09-05T14:54:15.772908\\",\\"category_id\\":21,\\"composition\\":\\"1 viande au choix + cheddar + sauce fromagère + frites\\",\\"description\\":\\"\\",\\"priceOnSite\\":8,\\"product_type\\":\\"composite\\",\\"steps_config\\":{\\"steps\\":[{\\"step\\":1,\\"type\\":\\"options_selection\\",\\"prompt\\":\\"Choisissez votre viande :\\",\\"required\\":true,\\"option_groups\\":[\\"Choix viande\\"],\\"max_selections\\":1},{\\"step\\":2,\\"type\\":\\"options_selection\\",\\"prompt\\":\\"Choisissez votre boisson (incluse) :\\",\\"required\\":true,\\"option_groups\\":[\\"Boisson 33CL incluse\\"],\\"max_selections\\":1},{\\"step\\":3,\\"type\\":\\"options_selection\\",\\"prompt\\":\\"SUPPLÉMENTS :\\",\\"required\\":true,\\"option_groups\\":[\\"Suppléments\\"],\\"max_selections\\":1}]},\\"display_order\\":1,\\"priceDelivery\\":9,\\"restaurant_id\\":1,\\"workflow_type\\":\\"composite_workflow\\",\\"requires_steps\\":true,\\"price_on_site_base\\":8,\\"price_delivery_base\\":9}],\\"categories\\":[{\\"id\\":1,\\"icon\\":\\"🌮\\",\\"name\\":\\"TACOS\\",\\"slug\\":\\"tacos\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-01T13:16:46.405758\\",\\"display_order\\":1,\\"restaurant_id\\":1},{\\"id\\":10,\\"icon\\":\\"🍕\\",\\"name\\":\\"Pizzas\\",\\"slug\\":\\"pizzas\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-04T22:40:00.468197\\",\\"display_order\\":2,\\"restaurant_id\\":1},{\\"id\\":2,\\"icon\\":\\"🍔\\",\\"name\\":\\"BURGERS\\",\\"slug\\":\\"burgers\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-01T13:16:46.405758\\",\\"display_order\\":3,\\"restaurant_id\\":1},{\\"id\\":11,\\"icon\\":\\"📋\\",\\"name\\":\\"Menu Pizza\\",\\"slug\\":\\"menus\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-04T22:40:00.468197\\",\\"display_order\\":4,\\"restaurant_id\\":1},{\\"id\\":38,\\"icon\\":\\"🍽️\\",\\"name\\":\\"MENU MIDI : PLAT + DESSERT + BOISSON\\",\\"slug\\":\\"menu-midi\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-17T15:26:20.115959\\",\\"display_order\\":5,\\"restaurant_id\\":1},{\\"id\\":3,\\"icon\\":\\"🥪\\",\\"name\\":\\"SANDWICHS\\",\\"slug\\":\\"sandwichs\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-01T13:16:46.405758\\",\\"display_order\\":5,\\"restaurant_id\\":1},{\\"id\\":4,\\"icon\\":\\"🥘\\",\\"name\\":\\"GOURMETS\\",\\"slug\\":\\"gourmets\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-01T13:16:46.405758\\",\\"display_order\\":6,\\"restaurant_id\\":1},{\\"id\\":5,\\"icon\\":\\"🥩\\",\\"name\\":\\"SMASHS\\",\\"slug\\":\\"smashs\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-01T13:16:46.405758\\",\\"display_order\\":7,\\"restaurant_id\\":1},{\\"id\\":6,\\"icon\\":\\"🍽️\\",\\"name\\":\\"ASSIETTES\\",\\"slug\\":\\"assiettes\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-01T13:16:46.405758\\",\\"display_order\\":8,\\"restaurant_id\\":1},{\\"id\\":7,\\"icon\\":\\"🫓\\",\\"name\\":\\"NAANS\\",\\"slug\\":\\"naans\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-01T13:16:46.405758\\",\\"display_order\\":9,\\"restaurant_id\\":1},{\\"id\\":8,\\"icon\\":\\"🍗\\",\\"name\\":\\"POULET & SNACKS\\",\\"slug\\":\\"poulet-snacks\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-01T13:16:46.405758\\",\\"display_order\\":10,\\"restaurant_id\\":1},{\\"id\\":12,\\"icon\\":\\"🍨\\",\\"name\\":\\"ICE CREAM\\",\\"slug\\":\\"ice-cream\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-05T12:12:39.5767\\",\\"display_order\\":11,\\"restaurant_id\\":1},{\\"id\\":13,\\"icon\\":\\"🧁\\",\\"name\\":\\"DESSERTS\\",\\"slug\\":\\"desserts\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-05T12:14:57.514246\\",\\"display_order\\":12,\\"restaurant_id\\":1},{\\"id\\":14,\\"icon\\":\\"🥤\\",\\"name\\":\\"BOISSONS\\",\\"slug\\":\\"drinks\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-05T12:15:00.359784\\",\\"display_order\\":13,\\"restaurant_id\\":1},{\\"id\\":15,\\"icon\\":\\"🥗\\",\\"name\\":\\"SALADES\\",\\"slug\\":\\"salades\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-05T12:26:58.822744\\",\\"display_order\\":14,\\"restaurant_id\\":1},{\\"id\\":16,\\"icon\\":\\"🌮\\",\\"name\\":\\"TEX-MEX\\",\\"slug\\":\\"tex-mex\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-05T12:29:18.502862\\",\\"display_order\\":15,\\"restaurant_id\\":1},{\\"id\\":17,\\"icon\\":\\"🥪\\",\\"name\\":\\"PANINI\\",\\"slug\\":\\"panini\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-05T12:36:29.294786\\",\\"display_order\\":16,\\"restaurant_id\\":1},{\\"id\\":18,\\"icon\\":\\"🍝\\",\\"name\\":\\"PÂTES\\",\\"slug\\":\\"pates\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-05T12:46:39.933629\\",\\"display_order\\":17,\\"restaurant_id\\":1},{\\"id\\":19,\\"icon\\":\\"🍽️\\",\\"name\\":\\"MENU ENFANT\\",\\"slug\\":\\"menu-enfant\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-05T14:13:42.925981\\",\\"display_order\\":18,\\"restaurant_id\\":1},{\\"id\\":21,\\"icon\\":\\"🍽️\\",\\"name\\":\\"BOWLS\\",\\"slug\\":\\"bowls\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-05T14:54:15.772908\\",\\"display_order\\":19,\\"restaurant_id\\":1},{\\"id\\":22,\\"icon\\":\\"🍽️\\",\\"name\\":\\"CHICKEN BOX\\",\\"slug\\":\\"chicken-box\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-05T15:10:36.445283\\",\\"display_order\\":20,\\"restaurant_id\\":1},{\\"id\\":26,\\"icon\\":\\"👨‍👩‍👧‍👦\\",\\"name\\":\\"MENU FAMILY\\",\\"slug\\":\\"menu-family\\",\\"is_active\\":true,\\"created_at\\":\\"2025-09-15T22:56:33.77911\\",\\"display_order\\":22,\\"restaurant_id\\":1}],\\"totalPrice\\":0,\\"deliveryMode\\":\\"sur_place\\",\\"availableModes\\":[\\"sur_place\\",\\"a_emporter\\",\\"livraison\\"],\\"selectedProduct\\":null,\\"compositeWorkflow\\":{\\"completed\\":false,\\"productId\\":238,\\"selections\\":{\\"Choix viande\\":[{\\"id\\":2606,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":1,\\"is_required\\":false,\\"option_name\\":\\"3️⃣ 🍗 Tenders\\",\\"option_group\\":\\"Choix viande\\",\\"display_order\\":3,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null}],\\"Suppléments\\":[{\\"id\\":2638,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":3,\\"is_required\\":false,\\"option_name\\":\\"1️⃣ Pas de suppléments\\",\\"option_group\\":\\"Suppléments\\",\\"display_order\\":1,\\"max_selections\\":10,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null}],\\"Boisson 33CL incluse\\":[{\\"id\\":2612,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"3️⃣ 🌴 7UP TROPICAL\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":3,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null}]},\\"totalSteps\\":3,\\"currentStep\\":3,\\"productName\\":\\"BOWL\\",\\"optionGroups\\":[{\\"options\\":[{\\"id\\":2604,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":1,\\"is_required\\":false,\\"option_name\\":\\"1️⃣ 🍗 Nuggets\\",\\"option_group\\":\\"Choix viande\\",\\"display_order\\":1,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2605,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":1,\\"is_required\\":false,\\"option_name\\":\\"2️⃣ 🍗 Cordon Bleu\\",\\"option_group\\":\\"Choix viande\\",\\"display_order\\":2,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2606,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":1,\\"is_required\\":false,\\"option_name\\":\\"3️⃣ 🍗 Tenders\\",\\"option_group\\":\\"Choix viande\\",\\"display_order\\":3,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2607,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":1,\\"is_required\\":false,\\"option_name\\":\\"4️⃣ 🥩 Viande Hachée\\",\\"option_group\\":\\"Choix viande\\",\\"display_order\\":4,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2608,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":1,\\"is_required\\":false,\\"option_name\\":\\"5️⃣ 🌭 Merguez\\",\\"option_group\\":\\"Choix viande\\",\\"display_order\\":5,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2609,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":1,\\"is_required\\":false,\\"option_name\\":\\"6️⃣ 🍗 Filet de Poulet\\",\\"option_group\\":\\"Choix viande\\",\\"display_order\\":6,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null}],\\"groupName\\":\\"Choix viande\\",\\"groupOrder\\":1,\\"isRequired\\":false,\\"displayName\\":\\"Choix viande\\",\\"maxSelections\\":1},{\\"options\\":[{\\"id\\":2610,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"1️⃣ 🥤 7 UP\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":1,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2611,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"2️⃣ 🍒 7UP CHERRY\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":2,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2612,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"3️⃣ 🌴 7UP TROPICAL\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":3,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2613,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"4️⃣ 🥤 COCA COLA\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":4,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2614,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"5️⃣ ⚫ COCA ZERO\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":5,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2615,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"6️⃣ 💧 EAU MINÉRALE\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":6,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2616,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"7️⃣ 🧊 ICE TEA\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":7,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2617,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"8️⃣ 🌺 OASIS TROPICAL\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":8,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2618,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"9️⃣ 💎 PERRIER\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":9,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2619,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"🔟 🍊 TROPICO\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":10,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2620,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"1️⃣1️⃣ 🍊 FANTA\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":11,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2621,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":2,\\"is_required\\":false,\\"option_name\\":\\"1️⃣2️⃣ 🥤 SPRITE\\",\\"option_group\\":\\"Boisson 33CL incluse\\",\\"display_order\\":12,\\"max_selections\\":1,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null}],\\"groupName\\":\\"Boisson 33CL incluse\\",\\"groupOrder\\":2,\\"isRequired\\":false,\\"displayName\\":\\"Boisson 33CL incluse\\",\\"maxSelections\\":1},{\\"options\\":[{\\"id\\":2638,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":3,\\"is_required\\":false,\\"option_name\\":\\"1️⃣ Pas de suppléments\\",\\"option_group\\":\\"Suppléments\\",\\"display_order\\":1,\\"max_selections\\":10,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null},{\\"id\\":2639,\\"is_active\\":true,\\"product_id\\":238,\\"group_order\\":3,\\"is_required\\":false,\\"option_name\\":\\"2️⃣ Ajouter des suppléments\\",\\"option_group\\":\\"Suppléments\\",\\"display_order\\":2,\\"max_selections\\":10,\\"price_modifier\\":0,\\"next_group_order\\":null,\\"conditional_next_group\\":null}],\\"groupName\\":\\"Suppléments\\",\\"groupOrder\\":3,\\"isRequired\\":false,\\"displayName\\":\\"Suppléments\\",\\"maxSelections\\":10}],\\"productPrice\\":8},\\"currentCategoryId\\":21,\\"universalWorkflow\\":null,\\"currentCategoryName\\":\\"BOWLS\\",\\"selectedServiceMode\\":\\"sur_place\\",\\"selectedRestaurantId\\":1,\\"awaitingWorkflowInput\\":true,\\"selectedRestaurantName\\":\\"Pizza Yolo 77\\",\\"awaitingWorkflowActions\\":true,\\"cartTotal\\":8,\\"awaitingQuantity\\":false,\\"awaitingCartActions\\":true}"	[]	0.00	2025-09-19 01:12:01	2025-09-18 21:12:01	2025-09-18 21:12:54	{}	\N	{}	{}	"AWAITING_CART_ACTIONS"	\N	{"workflowId": "restaurant_onboarding", "stepHistory": [], "currentStepId": "CHOOSING_DELIVERY_MODE", "selectedItems": {}, "validationErrors": []}	\N
\.


--
-- TOC entry 4527 (class 0 OID 17441)
-- Dependencies: 404
-- Data for Name: france_whatsapp_numbers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_whatsapp_numbers (id, restaurant_id, whatsapp_number, description, is_active, created_at) FROM stdin;
\.


--
-- TOC entry 4566 (class 0 OID 31606)
-- Dependencies: 446
-- Data for Name: france_workflow_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.france_workflow_templates (id, restaurant_id, template_name, description, steps_config, created_at, updated_at) FROM stdin;
1	1	tacos_size_template	Template pour sélection taille TACOS avec workflow ingrédients	{"footer_options": ["🔙 Tapez \\"0\\" pour les catégories", "🛒 Tapez \\"00\\" pour voir votre commande", "❌ Tapez \\"annuler\\" pour arrêter"], "show_separator": true, "workflow_steps": [{"step": "ingredient_selection", "template": "classic_ingredient_selection", "use_database_options": true}], "variant_selection": {"title": "💰 Choisissez votre taille:", "format": "🔸 {variant_name} ({price} EUR) - Tapez {index}", "show_drink_note": true}, "show_product_emoji": true, "show_restaurant_name": true}	2025-09-06 11:02:56.426246	2025-09-06 11:02:56.426246
6	\N	pizza_unified_display_default	Template par défaut universel pour affichage des pizzas	{"enabled": true, "size_format": "   🔸 {size_name} ({price} EUR) - Tapez {index}", "separator_line": "━━━━━━━━━━━━━━━━━━━━━", "show_separator": true, "footer_messages": {"back": "↩️ Tapez 0 pour revenir au menu principal", "navigation": "💡 Tapez le numéro de votre choix"}, "format_patterns": {"menu_list": "🎯 *📋 {name}*\\\\n🧾 {description}\\\\n\\\\n💰 {price} EUR - Tapez {index}", "individual": "🎯 *🍕 {name}*\\\\n🧾 {description}\\\\n\\\\n💰 Choisissez votre taille:\\\\n{sizes}", "workflow_step": "🎯 *🍕 {name} {size}*\\\\n🧾 {description}\\\\n💰 Inclus dans le menu - Tapez {index}"}, "global_numbering": true, "ingredient_display": true, "apply_to_categories": ["pizzas", "pizza", "pizzas-artisanales", "nos-pizzas"], "show_category_header": true, "show_restaurant_name": true, "apply_to_menu_categories": ["menu-pizza", "menus-pizza", "menu pizza", "menus pizzas"]}	2025-09-08 14:46:55.967054	2025-09-08 14:46:55.967054
2	1	pizza_unified_display	Template unifié pour affichage des pizzas avec descriptions d'ingrédients	{"enabled": true, "size_format": "   🔸 {size_name} ({price} EUR) - Tapez {index}", "separator_line": "━━━━━━━━━━━━━━━━━━━━━", "show_separator": true, "format_patterns": {"menu_list": "🎯 *📋 {name}*\\n🧾 {description}\\n\\n💰 {price} EUR - Tapez {index}", "individual": "🎯 *🍕 {name}*\\n🧾 {description}\\n\\n💰 Choisissez votre taille:\\n{sizes}", "workflow_step": "🎯 *🍕 {name} {size}*\\n🧾 {description}\\n💰 Inclus dans le menu - Tapez {index}"}, "global_numbering": true, "ingredient_display": true, "apply_to_categories": ["pizzas"], "show_category_header": true, "show_restaurant_name": true, "apply_to_menu_categories": ["menu-pizza"]}	2025-09-08 14:27:21.238042	2025-09-08 14:46:55.967054
\.


--
-- TOC entry 4558 (class 0 OID 31169)
-- Dependencies: 438
-- Data for Name: message_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_templates (id, restaurant_id, template_key, language, template_content, variables, is_active, created_at, updated_at) FROM stdin;
2	1	order_summary	fr	📋 RÉCAPITULATIF {{menuName}}\r\n\r\n{{itemsList}}\r\n\r\n💰 TOTAL: {{totalPrice}}€\r\n\r\n✅ Confirmez votre commande :\r\n1️⃣ OUI, je confirme\r\n2️⃣ NON, je modifie	["menuName", "itemsList", "totalPrice"]	t	2025-09-05 22:25:26.904607+02	2025-09-05 22:25:26.904607+02
3	1	invalid_choice	fr	❌ Choix invalide. {{errorMessage}}\r\n\r\n{{retryInstructions}}	["errorMessage", "retryInstructions"]	t	2025-09-05 22:25:26.904607+02	2025-09-05 22:25:26.904607+02
4	1	workflow_complete	fr	🎉 {{menuName}} ajouté à votre commande !\r\n\r\n{{nextSteps}}	["menuName", "nextSteps"]	t	2025-09-05 22:25:26.904607+02	2025-09-05 22:25:26.904607+02
1	1	welcome	fr	👋 Bienvenue chez {{brandName}} !\r\n\r\nPour accéder au menu, envoyez le numéro de téléphone du restaurant ou scannez le QR code.\r\n\r\n📱 Numéro: {{restaurantPhone}}	["brandName", "welcomeMessage"]	t	2025-09-05 22:25:26.904607+02	2025-09-05 22:25:26.904607+02
5	1	full_menu	fr	📱 *{{brandName}}* - Menu Complet\r\n\r\n{{categories}}\r\n\r\n📝 *Comment commander:*\r\n• Tapez les numéros des articles (ex: 1,1,3)\r\n• *00* pour voir le panier\r\n• *99* pour finaliser\r\n• *0* pour retour	["brandName", "categories"]	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
6	1	cart_summary	fr	🛒 *VOTRE PANIER*\r\n\r\n{{cartItems}}\r\n\r\n💰 *TOTAL: {{totalPrice}}€*\r\n\r\n• *99* pour finaliser la commande\r\n• *000* pour continuer vos achats\r\n• *0000* pour vider le panier	["cartItems", "totalPrice"]	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
7	1	pizza_supplements	fr	🍕 *SUPPLÉMENTS PIZZA {{size}}*\r\n\r\n{{supplementsList}}\r\n\r\nChoisissez vos suppléments (ex: 1,3,5) ou *0* pour sans supplément	["size", "supplementsList"]	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
8	1	pizza_1plus1_offer	fr	🎉 *OFFRE SPÉCIALE 1+1 GRATUITE!*\r\n\r\nVous avez choisi une pizza {{size}}.\r\nLa 2ème pizza {{size}} est *OFFERTE* !\r\n\r\nChoisissez votre 2ème pizza:	["size"]	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
9	1	delivery_mode_selection	fr	📍 *MODE DE SERVICE*\r\n\r\n1️⃣ Sur place 📍\r\n2️⃣ À emporter 📦\r\n3️⃣ Livraison 🚚\r\n\r\nTapez votre choix (1, 2 ou 3):	[]	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
10	1	order_confirmation	fr	✅ *COMMANDE CONFIRMÉE*\r\n\r\n📋 N° Commande: *{{orderNumber}}*\r\n{{validationCode}}\r\n💰 Total: *{{totalPrice}}€*\r\n📍 Mode: *{{deliveryMode}}*\r\n\r\n{{modeInstructions}}\r\n\r\nMerci pour votre commande ! 🙏	["orderNumber", "validationCode", "totalPrice", "deliveryMode", "modeInstructions"]	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
11	1	address_request	fr	📍 *ADRESSE DE LIVRAISON*\r\n\r\n{{savedAddresses}}\r\n\r\nEnvoyez le numéro d'une adresse existante ou tapez *N* pour une nouvelle adresse	["savedAddresses"]	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
12	1	product_configuration	fr	⚙️ *CONFIGURATION {{productName}}*\r\n\r\n{{currentStep}}\r\n\r\n{{options}}\r\n\r\nFaites votre choix:	["productName", "currentStep", "options"]	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
\.


--
-- TOC entry 4552 (class 0 OID 31101)
-- Dependencies: 432
-- Data for Name: restaurant_bot_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.restaurant_bot_configs (id, restaurant_id, config_name, brand_name, welcome_message, available_workflows, features, is_active, created_at, updated_at) FROM stdin;
1	1	main	Pizza Yolo 77	👋 Bienvenue chez Pizza Yolo 77 !\r\n\r\nPour accéder au menu, envoyez le numéro de téléphone du restaurant ou scannez le QR code.\r\n\r\n📱 Numéro: 33753058254	["RESTAURANT_SELECTION", "MENU_DISPLAY", "CART_MANAGEMENT", "PIZZA_SUPPLEMENTS", "PIZZA_1PLUS1_OFFER", "PRODUCT_CONFIGURATION", "DELIVERY_MODE", "ADDRESS_MANAGEMENT", "ORDER_FINALIZATION", "MENU_1_WORKFLOW", "MENU_2_WORKFLOW", "MENU_3_WORKFLOW", "MENU_4_WORKFLOW", "MENU_ENFANT_WORKFLOW"]	{"cart_enabled": true, "address_history": true, "delivery_enabled": true, "modular_products": true, "payment_deferred": true, "validation_codes": true, "pizza_supplements": true, "composite_products": true, "location_detection": true, "pizza_1plus1_offer": true, "daily_order_numbering": true, "google_places_enabled": true}	t	2025-09-05 22:25:26.904607+02	2025-09-05 22:54:48.387417+02
\.


--
-- TOC entry 4562 (class 0 OID 31259)
-- Dependencies: 442
-- Data for Name: state_transitions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.state_transitions (id, from_state, to_state, trigger_condition, priority, is_active) FROM stdin;
1	\N	WAITING_RESTAURANT	{"type": "INIT"}	100	t
2	WAITING_RESTAURANT	VIEWING_MENU	{"type": "PHONE_NUMBER"}	100	t
3	VIEWING_MENU	SELECTING_PIZZA_SUPPLEMENTS	{"type": "PIZZA_SELECTED"}	100	t
4	VIEWING_MENU	CONFIGURING_PRODUCT	{"type": "COMPOSITE_SELECTED"}	100	t
5	VIEWING_MENU	DRINK_SELECTION	{"type": "INCLUDES_DRINK"}	100	t
6	VIEWING_MENU	CHOOSING_DELIVERY_MODE	{"type": "COMMAND", "value": "99"}	100	t
7	SELECTING_PIZZA_SUPPLEMENTS	SELECTING_SECOND_FREE_PIZZA	{"type": "SIZE", "value": ["SENIOR", "MEGA"]}	100	t
8	SELECTING_PIZZA_SUPPLEMENTS	VIEWING_MENU	{"type": "COMPLETE"}	100	t
9	CHOOSING_DELIVERY_MODE	CHOOSING_DELIVERY_ADDRESS	{"type": "MODE", "value": "livraison"}	100	t
10	CHOOSING_DELIVERY_MODE	FINALIZING_ORDER	{"type": "MODE", "value": ["sur_place", "a_emporter"]}	100	t
11	CHOOSING_DELIVERY_ADDRESS	FINALIZING_ORDER	{"type": "ADDRESS_SELECTED"}	100	t
12	FINALIZING_ORDER	ORDER_COMPLETE	{"type": "SAVED"}	100	t
\.


--
-- TOC entry 4560 (class 0 OID 31245)
-- Dependencies: 440
-- Data for Name: step_executor_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.step_executor_mappings (id, step_type, executor_class, configuration, is_active, created_at) FROM stdin;
1	PHONE_VALIDATION	PhoneValidationExecutor	{"validateFormat": true, "checkRestaurant": true}	t	2025-09-05 22:54:48.387417+02
2	DATA_LOAD	DataLoadExecutor	{"ttl": 300, "cache": true}	t	2025-09-05 22:54:48.387417+02
3	PRODUCT_DISPLAY	ProductDisplayExecutor	{"pagination": true, "itemsPerPage": 50}	t	2025-09-05 22:54:48.387417+02
4	INPUT_HANDLER	InputHandlerExecutor	{"parseCartFormat": true, "validateCommands": true}	t	2025-09-05 22:54:48.387417+02
5	MULTIPLE_CHOICE	MultipleChoiceExecutor	{"allowMultiple": false}	t	2025-09-05 22:54:48.387417+02
6	CART_UPDATE	CartUpdateExecutor	{"preserveState": true}	t	2025-09-05 22:54:48.387417+02
7	CALCULATION	CalculationExecutor	{"includeTaxes": false}	t	2025-09-05 22:54:48.387417+02
8	DISPLAY	DisplayExecutor	{"useTemplates": true}	t	2025-09-05 22:54:48.387417+02
9	INPUT_PARSER	InputParserExecutor	{"formats": ["cart", "phone", "text"]}	t	2025-09-05 22:54:48.387417+02
10	PRICING_UPDATE	PricingUpdateExecutor	{"applyRules": true}	t	2025-09-05 22:54:48.387417+02
11	ORDER_GENERATION	OrderGenerationExecutor	{"sequentialNumbering": true}	t	2025-09-05 22:54:48.387417+02
12	DATABASE_SAVE	DatabaseSaveExecutor	{"transaction": true}	t	2025-09-05 22:54:48.387417+02
13	MESSAGE_SEND	MessageSendExecutor	{"queueMessages": true}	t	2025-09-05 22:54:48.387417+02
14	PRODUCT_SELECTION	ProductSelectionExecutor	{"validateStock": false}	t	2025-09-05 22:54:48.387417+02
15	ADDRESS_VALIDATION	AddressValidationExecutor	{"useGooglePlaces": true}	t	2025-09-05 22:54:48.387417+02
\.


--
-- TOC entry 4554 (class 0 OID 31123)
-- Dependencies: 434
-- Data for Name: workflow_definitions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workflow_definitions (id, restaurant_id, workflow_id, name, description, trigger_conditions, steps, max_duration_minutes, is_active, created_at, updated_at) FROM stdin;
1	1	MENU_1_WORKFLOW	MENU 1 - 3 Pizzas Junior	3 PIZZAS JUNIORS AU CHOIX	[{"type": "MESSAGE_PATTERN", "pattern": "1", "conditions": {}}]	["pizza_junior_selection_1", "pizza_junior_selection_2", "pizza_junior_selection_3", "menu1_summary"]	30	t	2025-09-05 22:25:26.904607+02	2025-09-05 22:25:26.904607+02
2	1	MENU_2_WORKFLOW	MENU 2 - 2 Pizzas Sénior + Boisson	2 PIZZAS SÉNIOR AU CHOIX + 1 BOISSON 1.5L	[{"type": "MESSAGE_PATTERN", "pattern": "2", "conditions": {}}]	["pizza_senior_selection_1", "pizza_senior_selection_2", "drink_1l5_selection", "menu2_summary"]	30	t	2025-09-05 22:25:26.904607+02	2025-09-05 22:25:26.904607+02
3	1	MENU_3_WORKFLOW	MENU 3 - Pizza Mega + Snacks + Boisson	1 PIZZA MEGA AU CHOIX + 14 NUGGETS OU 12 WINGS + 1 BOISSON 1.5L	[{"type": "MESSAGE_PATTERN", "pattern": "3", "conditions": {}}]	["pizza_mega_selection", "snack_choice_menu3", "drink_1l5_selection", "menu3_summary"]	30	t	2025-09-05 22:25:26.904607+02	2025-09-05 22:25:26.904607+02
4	1	MENU_4_WORKFLOW	MENU 4 - Pizza Sénior + Snacks + 2 Boissons	1 PIZZA SÉNIOR AU CHOIX + 6 WINGS OU 8 NUGGETS + 2 BOISSONS 33CL	[{"type": "MESSAGE_PATTERN", "pattern": "4", "conditions": {}}]	["pizza_senior_selection", "snack_choice_menu4", "drinks_33cl_selection", "menu4_summary"]	30	t	2025-09-05 22:25:26.904607+02	2025-09-05 22:25:26.904607+02
5	1	RESTAURANT_SELECTION	Sélection Restaurant	Entrée dans le bot via numéro de téléphone ou QR code	[{"type": "PHONE_NUMBER_PATTERN", "pattern": "^[0-9+]+$"}]	["validate_restaurant_phone", "load_restaurant_menu"]	5	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
6	1	MENU_DISPLAY	Affichage Menu Complet	Affichage dynamique de toutes les catégories et produits	[{"type": "STATE", "value": "VIEWING_MENU"}]	["load_categories", "display_products_by_category", "handle_product_selection"]	30	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
7	1	CART_MANAGEMENT	Gestion Panier Avancée	Gestion du panier avec format 1,1,3 et navigation 00/99/000	[{"type": "STATE", "value": "CART_ACTIVE"}]	["parse_cart_input", "update_cart_items", "calculate_totals", "display_cart_summary"]	240	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
8	1	PIZZA_SUPPLEMENTS	Sélection Suppléments Pizza	Ajout de suppléments selon la taille de pizza	[{"type": "STATE", "value": "SELECTING_PIZZA_SUPPLEMENTS"}]	["load_supplements_by_size", "display_supplement_groups", "process_supplement_selection", "add_to_cart_with_supplements"]	10	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
9	1	PIZZA_1PLUS1_OFFER	Offre Pizza 1+1 Gratuite	Deuxième pizza gratuite pour SENIOR et MEGA	[{"key": "size", "type": "PRODUCT_ATTRIBUTE", "value": ["SENIOR", "MEGA"]}]	["trigger_free_pizza_offer", "select_second_pizza", "apply_free_supplements", "bundle_pizzas_to_cart"]	15	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
10	1	PRODUCT_CONFIGURATION	Configuration Produit Multi-Étapes	Configuration de produits composites (tacos, assiettes, etc.)	[{"type": "PRODUCT_TYPE", "value": "composite"}]	["load_option_groups", "process_group_selection", "validate_configuration", "finalize_configured_product"]	20	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
11	1	DELIVERY_MODE	Sélection Mode de Service	Choix entre sur place, à emporter, livraison	[{"type": "STATE", "value": "CHOOSING_DELIVERY_MODE"}]	["display_delivery_options", "process_mode_selection", "apply_pricing_rules", "update_session_mode"]	5	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
12	1	ADDRESS_MANAGEMENT	Gestion Adresses Livraison	Sélection ou ajout d'adresse avec Google Places	[{"type": "DELIVERY_MODE", "value": "livraison"}]	["load_address_history", "request_new_address", "validate_with_google", "save_customer_address"]	15	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
13	1	ORDER_FINALIZATION	Finalisation et Confirmation	Génération numéro commande et confirmation	[{"type": "CART_ACTION", "value": "99"}]	["validate_order_data", "generate_order_number", "save_order_to_database", "send_confirmation", "notify_restaurant"]	10	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
\.


--
-- TOC entry 4556 (class 0 OID 31145)
-- Dependencies: 436
-- Data for Name: workflow_steps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workflow_steps (id, workflow_id, step_id, step_order, step_type, title, description, selection_config, validation_rules, display_config, next_step_logic, error_handling, is_active, created_at, updated_at) FROM stdin;
1	5	validate_restaurant_phone	1	PHONE_VALIDATION	Validation Numéro Restaurant	Vérifie que le numéro correspond à un restaurant	{"phonePattern": "^[0-9+]+$", "normalizationRules": {"removeSpaces": true, "removeCountryCode": true}}	[{"type": "PHONE_FORMAT", "errorMessage": "Format de numéro invalide"}]	{}	{"conditions": [{"if": "valid", "nextStep": "load_restaurant_menu"}], "defaultNextStep": "error"}	{"maxRetries": 3, "retryMessage": "Numéro non reconnu. Envoyez le numéro du restaurant ou scannez le QR code."}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
2	5	load_restaurant_menu	2	DATA_LOAD	Chargement Menu Restaurant	Charge les catégories et produits du restaurant	{"filters": {"is_active": true, "restaurant_id": "{{restaurantId}}"}, "dataSource": "france_menu_categories"}	[]	{}	{"conditions": [], "defaultNextStep": "VIEWING_MENU"}	{"fallbackMessage": "Erreur chargement menu. Réessayez plus tard."}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
3	6	load_categories	1	DATA_LOAD	Chargement Catégories	Charge toutes les catégories actives	{"filters": {"is_active": true}, "orderBy": "display_order", "dataSource": "france_menu_categories"}	[]	{"showIcons": true, "itemsPerPage": 50}	{"conditions": [], "defaultNextStep": "display_products_by_category"}	{}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
4	6	display_products_by_category	2	PRODUCT_DISPLAY	Affichage Produits	Affiche les produits par catégorie avec numérotation	{"joins": ["france_product_sizes", "france_product_variants"], "groupBy": "category", "dataSource": "france_products", "specialDisplay": {"tacos": "showConfigurableProducts", "drinks": "showDrinkProducts", "pizzas": "showPizzaProducts", "burgers": "showStandardProducts"}}	[]	{"format": "NUMBERED_LIST", "showSizes": true, "showPrices": true, "showComposition": true}	{"conditions": [], "defaultNextStep": "handle_product_selection"}	{}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
5	6	handle_product_selection	3	INPUT_HANDLER	Traitement Sélection	Gère la sélection format 1,1,3 ou navigation	{"inputType": "CART_FORMAT", "specialCommands": {"0": "RETURN_CATEGORIES", "00": "VIEW_CART", "99": "FINALIZE_ORDER", "000": "CONTINUE_SHOPPING", "0000": "CLEAR_CART"}}	[{"type": "CART_FORMAT", "pattern": "^[0-9,]+$", "errorMessage": "Format invalide. Utilisez: 1,1,3"}]	{}	{"conditions": [{"if": "hasSupplements", "nextStep": "PIZZA_SUPPLEMENTS"}, {"if": "isComposite", "nextStep": "PRODUCT_CONFIGURATION"}, {"if": "includesDrink", "nextStep": "DRINK_SELECTION"}], "defaultNextStep": "add_to_cart"}	{"retryMessage": "Choix invalide. Exemple: 1,2,3 pour commander"}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
6	7	parse_cart_input	1	INPUT_PARSER	Analyse Format Panier	Parse le format 1,1,3 en quantités	{"parser": "CART_FORMAT", "allowMultipleItems": true}	[{"type": "REQUIRED"}]	{}	{"conditions": [], "defaultNextStep": "update_cart_items"}	{}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
7	7	update_cart_items	2	CART_UPDATE	Mise à Jour Panier	Ajoute ou met à jour les items du panier	{"operation": "ADD_OR_UPDATE", "keyGeneration": "UNIQUE_BY_CONFIG"}	[]	{}	{"conditions": [], "defaultNextStep": "calculate_totals"}	{}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
8	7	calculate_totals	3	CALCULATION	Calcul Totaux	Calcule les totaux avec mode de livraison	{"priceField": "{{deliveryMode}}_price", "includeTaxes": false}	[]	{}	{"conditions": [], "defaultNextStep": "display_cart_summary"}	{}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
9	7	display_cart_summary	4	DISPLAY	Affichage Récapitulatif	Affiche le panier avec totaux	{"template": "cart_summary", "includeActions": true}	[]	{"showPrices": true, "showQuantities": true, "showItemNumbers": true}	{"conditions": [], "defaultNextStep": "VIEWING_MENU"}	{}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
10	11	display_delivery_options	1	MULTIPLE_CHOICE	Options de Service	Affiche les modes de service disponibles	{"options": [{"id": "sur_place", "label": "📍 Sur place", "value": "sur_place"}, {"id": "a_emporter", "label": "📦 À emporter", "value": "a_emporter"}, {"id": "livraison", "label": "🚚 Livraison", "value": "livraison"}]}	[{"type": "REQUIRED"}]	{"format": "NUMBERED_LIST"}	{"conditions": [], "defaultNextStep": "process_mode_selection"}	{"retryMessage": "Choisissez 1, 2 ou 3"}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
11	11	apply_pricing_rules	3	PRICING_UPDATE	Application Tarifs	Applique les tarifs selon le mode	{"rules": {"livraison": "price_delivery", "sur_place": "price_on_site", "a_emporter": "price_on_site"}}	[]	{}	{"conditions": [{"if": "mode=livraison", "nextStep": "ADDRESS_MANAGEMENT"}], "defaultNextStep": "ORDER_FINALIZATION"}	{}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
12	13	generate_order_number	2	ORDER_GENERATION	Génération Numéro	Génère le numéro de commande du jour	{"format": "DDMM-XXXX", "sequenceTable": "france_order_sequences"}	[]	{}	{"conditions": [], "defaultNextStep": "save_order_to_database"}	{}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
13	13	save_order_to_database	3	DATABASE_SAVE	Sauvegarde Commande	Enregistre la commande complète	{"tables": {"items": "france_order_items", "order": "france_orders", "customer": "france_customers"}}	[]	{}	{"conditions": [], "defaultNextStep": "send_confirmation"}	{"rollbackOnError": true}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
14	13	send_confirmation	4	MESSAGE_SEND	Envoi Confirmation	Envoie le message de confirmation	{"template": "order_confirmation", "includeValidationCode": true}	[]	{}	{"conditions": [], "defaultNextStep": "notify_restaurant"}	{}	t	2025-09-05 22:54:48.387417+02	2025-09-05 22:54:48.387417+02
\.


--
-- TOC entry 4571 (class 0 OID 52021)
-- Dependencies: 455
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
\.


--
-- TOC entry 4572 (class 0 OID 52028)
-- Dependencies: 456
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- TOC entry 4678 (class 0 OID 0)
-- Dependencies: 457
-- Name: automation_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.automation_logs_id_seq', 1, true);


--
-- TOC entry 4679 (class 0 OID 0)
-- Dependencies: 423
-- Name: delivery_driver_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.delivery_driver_actions_id_seq', 42, true);


--
-- TOC entry 4680 (class 0 OID 0)
-- Dependencies: 427
-- Name: delivery_order_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.delivery_order_logs_id_seq', 1, false);


--
-- TOC entry 4681 (class 0 OID 0)
-- Dependencies: 425
-- Name: delivery_refusals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.delivery_refusals_id_seq', 1, false);


--
-- TOC entry 4682 (class 0 OID 0)
-- Dependencies: 421
-- Name: delivery_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.delivery_tokens_id_seq', 30, true);


--
-- TOC entry 4683 (class 0 OID 0)
-- Dependencies: 411
-- Name: france_auth_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_auth_sessions_id_seq', 586, true);


--
-- TOC entry 4684 (class 0 OID 0)
-- Dependencies: 397
-- Name: france_composite_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_composite_items_id_seq', 80, true);


--
-- TOC entry 4685 (class 0 OID 0)
-- Dependencies: 407
-- Name: france_customer_addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_customer_addresses_id_seq', 14, true);


--
-- TOC entry 4686 (class 0 OID 0)
-- Dependencies: 413
-- Name: france_delivery_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_delivery_assignments_id_seq', 38, true);


--
-- TOC entry 4687 (class 0 OID 0)
-- Dependencies: 409
-- Name: france_delivery_drivers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_delivery_drivers_id_seq', 6, true);


--
-- TOC entry 4688 (class 0 OID 0)
-- Dependencies: 415
-- Name: france_delivery_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_delivery_notifications_id_seq', 1, false);


--
-- TOC entry 4689 (class 0 OID 0)
-- Dependencies: 417
-- Name: france_driver_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_driver_locations_id_seq', 32, true);


--
-- TOC entry 4690 (class 0 OID 0)
-- Dependencies: 387
-- Name: france_menu_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_menu_categories_id_seq', 38, true);


--
-- TOC entry 4691 (class 0 OID 0)
-- Dependencies: 401
-- Name: france_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_orders_id_seq', 147, true);


--
-- TOC entry 4692 (class 0 OID 0)
-- Dependencies: 452
-- Name: france_pizza_display_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_pizza_display_settings_id_seq', 1, true);


--
-- TOC entry 4693 (class 0 OID 0)
-- Dependencies: 443
-- Name: france_product_display_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_product_display_configs_id_seq', 1, true);


--
-- TOC entry 4694 (class 0 OID 0)
-- Dependencies: 393
-- Name: france_product_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_product_options_id_seq', 2830, true);


--
-- TOC entry 4695 (class 0 OID 0)
-- Dependencies: 395
-- Name: france_product_sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_product_sizes_id_seq', 304, true);


--
-- TOC entry 4696 (class 0 OID 0)
-- Dependencies: 391
-- Name: france_product_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_product_variants_id_seq', 67, true);


--
-- TOC entry 4697 (class 0 OID 0)
-- Dependencies: 389
-- Name: france_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_products_id_seq', 403, true);


--
-- TOC entry 4698 (class 0 OID 0)
-- Dependencies: 429
-- Name: france_restaurant_features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_restaurant_features_id_seq', 3, true);


--
-- TOC entry 4699 (class 0 OID 0)
-- Dependencies: 449
-- Name: france_restaurant_service_modes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_restaurant_service_modes_id_seq', 3, true);


--
-- TOC entry 4700 (class 0 OID 0)
-- Dependencies: 385
-- Name: france_restaurants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_restaurants_id_seq', 1, true);


--
-- TOC entry 4701 (class 0 OID 0)
-- Dependencies: 399
-- Name: france_user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_user_sessions_id_seq', 11224, true);


--
-- TOC entry 4702 (class 0 OID 0)
-- Dependencies: 403
-- Name: france_whatsapp_numbers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_whatsapp_numbers_id_seq', 1, false);


--
-- TOC entry 4703 (class 0 OID 0)
-- Dependencies: 445
-- Name: france_workflow_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.france_workflow_templates_id_seq', 6, true);


--
-- TOC entry 4704 (class 0 OID 0)
-- Dependencies: 437
-- Name: message_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_templates_id_seq', 12, true);


--
-- TOC entry 4705 (class 0 OID 0)
-- Dependencies: 431
-- Name: restaurant_bot_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.restaurant_bot_configs_id_seq', 2, true);


--
-- TOC entry 4706 (class 0 OID 0)
-- Dependencies: 441
-- Name: state_transitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.state_transitions_id_seq', 12, true);


--
-- TOC entry 4707 (class 0 OID 0)
-- Dependencies: 439
-- Name: step_executor_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.step_executor_mappings_id_seq', 15, true);


--
-- TOC entry 4708 (class 0 OID 0)
-- Dependencies: 433
-- Name: workflow_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workflow_definitions_id_seq', 14, true);


--
-- TOC entry 4709 (class 0 OID 0)
-- Dependencies: 435
-- Name: workflow_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workflow_steps_id_seq', 21, true);


--
-- TOC entry 4094 (class 2606 OID 16827)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 4067 (class 2606 OID 16531)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4117 (class 2606 OID 16933)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 4073 (class 2606 OID 16951)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 4075 (class 2606 OID 16961)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 4065 (class 2606 OID 16524)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 4096 (class 2606 OID 16820)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 4092 (class 2606 OID 16808)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 4084 (class 2606 OID 17001)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 4086 (class 2606 OID 16795)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 4175 (class 2606 OID 19256)
-- Name: oauth_clients oauth_clients_client_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id);


--
-- TOC entry 4178 (class 2606 OID 19254)
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4121 (class 2606 OID 16986)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4059 (class 2606 OID 16514)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4062 (class 2606 OID 16738)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4106 (class 2606 OID 16867)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 4108 (class 2606 OID 16865)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4113 (class 2606 OID 16881)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 4070 (class 2606 OID 16537)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4079 (class 2606 OID 16759)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4103 (class 2606 OID 16848)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 4098 (class 2606 OID 16839)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4052 (class 2606 OID 16921)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4054 (class 2606 OID 16501)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4291 (class 2606 OID 70792)
-- Name: automation_logs automation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_logs
    ADD CONSTRAINT automation_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4224 (class 2606 OID 25734)
-- Name: delivery_driver_actions delivery_driver_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_driver_actions
    ADD CONSTRAINT delivery_driver_actions_pkey PRIMARY KEY (id);


--
-- TOC entry 4233 (class 2606 OID 25784)
-- Name: delivery_order_logs delivery_order_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_order_logs
    ADD CONSTRAINT delivery_order_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4229 (class 2606 OID 25759)
-- Name: delivery_refusals delivery_refusals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_refusals
    ADD CONSTRAINT delivery_refusals_pkey PRIMARY KEY (id);


--
-- TOC entry 4216 (class 2606 OID 25712)
-- Name: delivery_tokens delivery_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_tokens
    ADD CONSTRAINT delivery_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4218 (class 2606 OID 25714)
-- Name: delivery_tokens delivery_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_tokens
    ADD CONSTRAINT delivery_tokens_token_key UNIQUE (token);


--
-- TOC entry 4194 (class 2606 OID 20814)
-- Name: france_auth_sessions france_auth_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_auth_sessions
    ADD CONSTRAINT france_auth_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4196 (class 2606 OID 20816)
-- Name: france_auth_sessions france_auth_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_auth_sessions
    ADD CONSTRAINT france_auth_sessions_session_token_key UNIQUE (session_token);


--
-- TOC entry 4151 (class 2606 OID 17395)
-- Name: france_composite_items france_composite_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_composite_items
    ADD CONSTRAINT france_composite_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4180 (class 2606 OID 20465)
-- Name: france_customer_addresses france_customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_customer_addresses
    ADD CONSTRAINT france_customer_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 4200 (class 2606 OID 21588)
-- Name: france_delivery_assignments france_delivery_assignments_order_id_driver_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_assignments
    ADD CONSTRAINT france_delivery_assignments_order_id_driver_id_key UNIQUE (order_id, driver_id);


--
-- TOC entry 4202 (class 2606 OID 21586)
-- Name: france_delivery_assignments france_delivery_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_assignments
    ADD CONSTRAINT france_delivery_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 4185 (class 2606 OID 20794)
-- Name: france_delivery_drivers france_delivery_drivers_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_drivers
    ADD CONSTRAINT france_delivery_drivers_phone_number_key UNIQUE (phone_number);


--
-- TOC entry 4187 (class 2606 OID 20792)
-- Name: france_delivery_drivers france_delivery_drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_drivers
    ADD CONSTRAINT france_delivery_drivers_pkey PRIMARY KEY (id);


--
-- TOC entry 4207 (class 2606 OID 21616)
-- Name: france_delivery_notifications france_delivery_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_notifications
    ADD CONSTRAINT france_delivery_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4212 (class 2606 OID 21633)
-- Name: france_driver_locations france_driver_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_driver_locations
    ADD CONSTRAINT france_driver_locations_pkey PRIMARY KEY (id);


--
-- TOC entry 4133 (class 2606 OID 17299)
-- Name: france_menu_categories france_menu_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_menu_categories
    ADD CONSTRAINT france_menu_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4135 (class 2606 OID 17301)
-- Name: france_menu_categories france_menu_categories_restaurant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_menu_categories
    ADD CONSTRAINT france_menu_categories_restaurant_id_slug_key UNIQUE (restaurant_id, slug);


--
-- TOC entry 4158 (class 2606 OID 17434)
-- Name: france_orders france_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_orders
    ADD CONSTRAINT france_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4283 (class 2606 OID 39357)
-- Name: france_pizza_display_settings france_pizza_display_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_pizza_display_settings
    ADD CONSTRAINT france_pizza_display_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4285 (class 2606 OID 39359)
-- Name: france_pizza_display_settings france_pizza_display_settings_restaurant_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_pizza_display_settings
    ADD CONSTRAINT france_pizza_display_settings_restaurant_id_key UNIQUE (restaurant_id);


--
-- TOC entry 4268 (class 2606 OID 31602)
-- Name: france_product_display_configs france_product_display_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_display_configs
    ADD CONSTRAINT france_product_display_configs_pkey PRIMARY KEY (id);


--
-- TOC entry 4270 (class 2606 OID 31604)
-- Name: france_product_display_configs france_product_display_configs_restaurant_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_display_configs
    ADD CONSTRAINT france_product_display_configs_restaurant_id_product_id_key UNIQUE (restaurant_id, product_id);


--
-- TOC entry 4147 (class 2606 OID 17368)
-- Name: france_product_options france_product_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_options
    ADD CONSTRAINT france_product_options_pkey PRIMARY KEY (id);


--
-- TOC entry 4149 (class 2606 OID 17382)
-- Name: france_product_sizes france_product_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_sizes
    ADD CONSTRAINT france_product_sizes_pkey PRIMARY KEY (id);


--
-- TOC entry 4144 (class 2606 OID 17351)
-- Name: france_product_variants france_product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_variants
    ADD CONSTRAINT france_product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 4138 (class 2606 OID 17329)
-- Name: france_products france_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_products
    ADD CONSTRAINT france_products_pkey PRIMARY KEY (id);


--
-- TOC entry 4237 (class 2606 OID 29437)
-- Name: france_restaurant_features france_restaurant_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_restaurant_features
    ADD CONSTRAINT france_restaurant_features_pkey PRIMARY KEY (id);


--
-- TOC entry 4277 (class 2606 OID 37992)
-- Name: france_restaurant_service_modes france_restaurant_service_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_restaurant_service_modes
    ADD CONSTRAINT france_restaurant_service_modes_pkey PRIMARY KEY (id);


--
-- TOC entry 4279 (class 2606 OID 37994)
-- Name: france_restaurant_service_modes france_restaurant_service_modes_restaurant_id_service_mode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_restaurant_service_modes
    ADD CONSTRAINT france_restaurant_service_modes_restaurant_id_service_mode_key UNIQUE (restaurant_id, service_mode);


--
-- TOC entry 4126 (class 2606 OID 17286)
-- Name: france_restaurants france_restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_restaurants
    ADD CONSTRAINT france_restaurants_pkey PRIMARY KEY (id);


--
-- TOC entry 4128 (class 2606 OID 17288)
-- Name: france_restaurants france_restaurants_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_restaurants
    ADD CONSTRAINT france_restaurants_slug_key UNIQUE (slug);


--
-- TOC entry 4171 (class 2606 OID 17657)
-- Name: france_sessions france_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_sessions
    ADD CONSTRAINT france_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4153 (class 2606 OID 17415)
-- Name: france_user_sessions france_user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_user_sessions
    ADD CONSTRAINT france_user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4167 (class 2606 OID 17448)
-- Name: france_whatsapp_numbers france_whatsapp_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_whatsapp_numbers
    ADD CONSTRAINT france_whatsapp_numbers_pkey PRIMARY KEY (id);


--
-- TOC entry 4169 (class 2606 OID 17450)
-- Name: france_whatsapp_numbers france_whatsapp_numbers_restaurant_id_whatsapp_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_whatsapp_numbers
    ADD CONSTRAINT france_whatsapp_numbers_restaurant_id_whatsapp_number_key UNIQUE (restaurant_id, whatsapp_number);


--
-- TOC entry 4272 (class 2606 OID 31615)
-- Name: france_workflow_templates france_workflow_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_workflow_templates
    ADD CONSTRAINT france_workflow_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 4274 (class 2606 OID 31617)
-- Name: france_workflow_templates france_workflow_templates_restaurant_id_template_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_workflow_templates
    ADD CONSTRAINT france_workflow_templates_restaurant_id_template_name_key UNIQUE (restaurant_id, template_name);


--
-- TOC entry 4256 (class 2606 OID 31181)
-- Name: message_templates message_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 4258 (class 2606 OID 31183)
-- Name: message_templates message_templates_restaurant_id_template_key_language_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_restaurant_id_template_key_language_key UNIQUE (restaurant_id, template_key, language);


--
-- TOC entry 4241 (class 2606 OID 31114)
-- Name: restaurant_bot_configs restaurant_bot_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_bot_configs
    ADD CONSTRAINT restaurant_bot_configs_pkey PRIMARY KEY (id);


--
-- TOC entry 4243 (class 2606 OID 31116)
-- Name: restaurant_bot_configs restaurant_bot_configs_restaurant_id_config_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_bot_configs
    ADD CONSTRAINT restaurant_bot_configs_restaurant_id_config_name_key UNIQUE (restaurant_id, config_name);


--
-- TOC entry 4264 (class 2606 OID 31270)
-- Name: state_transitions state_transitions_from_state_to_state_trigger_condition_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.state_transitions
    ADD CONSTRAINT state_transitions_from_state_to_state_trigger_condition_key UNIQUE (from_state, to_state, trigger_condition);


--
-- TOC entry 4266 (class 2606 OID 31268)
-- Name: state_transitions state_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.state_transitions
    ADD CONSTRAINT state_transitions_pkey PRIMARY KEY (id);


--
-- TOC entry 4260 (class 2606 OID 31255)
-- Name: step_executor_mappings step_executor_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_executor_mappings
    ADD CONSTRAINT step_executor_mappings_pkey PRIMARY KEY (id);


--
-- TOC entry 4262 (class 2606 OID 31257)
-- Name: step_executor_mappings step_executor_mappings_step_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_executor_mappings
    ADD CONSTRAINT step_executor_mappings_step_type_key UNIQUE (step_type);


--
-- TOC entry 4246 (class 2606 OID 31136)
-- Name: workflow_definitions workflow_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT workflow_definitions_pkey PRIMARY KEY (id);


--
-- TOC entry 4248 (class 2606 OID 31138)
-- Name: workflow_definitions workflow_definitions_restaurant_id_workflow_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT workflow_definitions_restaurant_id_workflow_id_key UNIQUE (restaurant_id, workflow_id);


--
-- TOC entry 4251 (class 2606 OID 31160)
-- Name: workflow_steps workflow_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_pkey PRIMARY KEY (id);


--
-- TOC entry 4253 (class 2606 OID 31162)
-- Name: workflow_steps workflow_steps_workflow_id_step_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_workflow_id_step_id_key UNIQUE (workflow_id, step_id);


--
-- TOC entry 4287 (class 2606 OID 52027)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4289 (class 2606 OID 52034)
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- TOC entry 4068 (class 1259 OID 16532)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 4042 (class 1259 OID 16748)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4043 (class 1259 OID 16750)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4044 (class 1259 OID 16751)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4082 (class 1259 OID 16829)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 4115 (class 1259 OID 16937)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 4071 (class 1259 OID 16917)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 4710 (class 0 OID 0)
-- Dependencies: 4071
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 4076 (class 1259 OID 16745)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 4118 (class 1259 OID 16934)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 4119 (class 1259 OID 16935)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 4090 (class 1259 OID 16940)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 4087 (class 1259 OID 16801)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 4088 (class 1259 OID 16946)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 4173 (class 1259 OID 19257)
-- Name: oauth_clients_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id);


--
-- TOC entry 4176 (class 1259 OID 19258)
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- TOC entry 4122 (class 1259 OID 16993)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 4123 (class 1259 OID 16992)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 4124 (class 1259 OID 16994)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 4045 (class 1259 OID 16752)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4046 (class 1259 OID 16749)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4055 (class 1259 OID 16515)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 4056 (class 1259 OID 16516)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 4057 (class 1259 OID 16744)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 4060 (class 1259 OID 16831)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 4063 (class 1259 OID 16936)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 4109 (class 1259 OID 16873)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 4110 (class 1259 OID 16938)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 4111 (class 1259 OID 16888)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 4114 (class 1259 OID 16887)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 4077 (class 1259 OID 16939)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 4080 (class 1259 OID 16830)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 4101 (class 1259 OID 16855)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 4104 (class 1259 OID 16854)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 4099 (class 1259 OID 16840)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 4100 (class 1259 OID 17002)
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- TOC entry 4089 (class 1259 OID 16999)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 4081 (class 1259 OID 16828)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 4047 (class 1259 OID 16908)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 4711 (class 0 OID 0)
-- Dependencies: 4047
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 4048 (class 1259 OID 16746)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 4049 (class 1259 OID 16505)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 4050 (class 1259 OID 16963)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 4225 (class 1259 OID 25795)
-- Name: idx_delivery_actions_driver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_actions_driver ON public.delivery_driver_actions USING btree (driver_id);


--
-- TOC entry 4226 (class 1259 OID 25794)
-- Name: idx_delivery_actions_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_actions_order ON public.delivery_driver_actions USING btree (order_id);


--
-- TOC entry 4227 (class 1259 OID 25796)
-- Name: idx_delivery_actions_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_actions_timestamp ON public.delivery_driver_actions USING btree (action_timestamp);


--
-- TOC entry 4234 (class 1259 OID 25799)
-- Name: idx_delivery_order_logs_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_order_logs_order ON public.delivery_order_logs USING btree (order_id);


--
-- TOC entry 4235 (class 1259 OID 25800)
-- Name: idx_delivery_order_logs_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_order_logs_type ON public.delivery_order_logs USING btree (action_type);


--
-- TOC entry 4230 (class 1259 OID 25798)
-- Name: idx_delivery_refusals_driver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_refusals_driver ON public.delivery_refusals USING btree (driver_id);


--
-- TOC entry 4231 (class 1259 OID 25797)
-- Name: idx_delivery_refusals_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_refusals_order ON public.delivery_refusals USING btree (order_id);


--
-- TOC entry 4219 (class 1259 OID 25791)
-- Name: idx_delivery_tokens_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_tokens_active ON public.delivery_tokens USING btree (token) WHERE ((used = false) AND (suspended = false));


--
-- TOC entry 4220 (class 1259 OID 25792)
-- Name: idx_delivery_tokens_cleanup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_tokens_cleanup ON public.delivery_tokens USING btree (absolute_expires_at);


--
-- TOC entry 4221 (class 1259 OID 25793)
-- Name: idx_delivery_tokens_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_tokens_order ON public.delivery_tokens USING btree (order_id);


--
-- TOC entry 4222 (class 1259 OID 25790)
-- Name: idx_delivery_tokens_order_driver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_tokens_order_driver ON public.delivery_tokens USING btree (order_id, driver_id);


--
-- TOC entry 4203 (class 1259 OID 21600)
-- Name: idx_france_assignments_driver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_assignments_driver ON public.france_delivery_assignments USING btree (driver_id, assignment_status);


--
-- TOC entry 4204 (class 1259 OID 21599)
-- Name: idx_france_assignments_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_assignments_order ON public.france_delivery_assignments USING btree (order_id, assignment_status);


--
-- TOC entry 4205 (class 1259 OID 21601)
-- Name: idx_france_assignments_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_assignments_pending ON public.france_delivery_assignments USING btree (expires_at) WHERE ((assignment_status)::text = 'pending'::text);


--
-- TOC entry 4136 (class 1259 OID 17458)
-- Name: idx_france_categories_restaurant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_categories_restaurant ON public.france_menu_categories USING btree (restaurant_id);


--
-- TOC entry 4181 (class 1259 OID 33307)
-- Name: idx_france_customer_addresses_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_customer_addresses_active ON public.france_customer_addresses USING btree (phone_number, is_active) WHERE (is_active = true);


--
-- TOC entry 4182 (class 1259 OID 20467)
-- Name: idx_france_customer_addresses_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_customer_addresses_default ON public.france_customer_addresses USING btree (phone_number, is_default) WHERE (is_default = true);


--
-- TOC entry 4183 (class 1259 OID 20466)
-- Name: idx_france_customer_addresses_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_customer_addresses_phone ON public.france_customer_addresses USING btree (phone_number);


--
-- TOC entry 4213 (class 1259 OID 21639)
-- Name: idx_france_driver_locations_driver_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_driver_locations_driver_time ON public.france_driver_locations USING btree (driver_id, recorded_at DESC);


--
-- TOC entry 4214 (class 1259 OID 21640)
-- Name: idx_france_driver_locations_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_driver_locations_time ON public.france_driver_locations USING btree (recorded_at);


--
-- TOC entry 4188 (class 1259 OID 20801)
-- Name: idx_france_drivers_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_drivers_active ON public.france_delivery_drivers USING btree (is_active);


--
-- TOC entry 4189 (class 1259 OID 21571)
-- Name: idx_france_drivers_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_drivers_location ON public.france_delivery_drivers USING btree (current_latitude, current_longitude) WHERE (is_online = true);


--
-- TOC entry 4190 (class 1259 OID 21570)
-- Name: idx_france_drivers_online; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_drivers_online ON public.france_delivery_drivers USING btree (is_online);


--
-- TOC entry 4191 (class 1259 OID 20802)
-- Name: idx_france_drivers_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_drivers_phone ON public.france_delivery_drivers USING btree (phone_number);


--
-- TOC entry 4192 (class 1259 OID 20800)
-- Name: idx_france_drivers_restaurant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_drivers_restaurant ON public.france_delivery_drivers USING btree (restaurant_id);


--
-- TOC entry 4208 (class 1259 OID 21622)
-- Name: idx_france_notifications_assignment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_notifications_assignment ON public.france_delivery_notifications USING btree (assignment_id);


--
-- TOC entry 4209 (class 1259 OID 21623)
-- Name: idx_france_notifications_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_notifications_recipient ON public.france_delivery_notifications USING btree (recipient_type, recipient_id);


--
-- TOC entry 4210 (class 1259 OID 21624)
-- Name: idx_france_notifications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_notifications_status ON public.france_delivery_notifications USING btree (delivery_status, sent_at);


--
-- TOC entry 4159 (class 1259 OID 21574)
-- Name: idx_france_orders_assignment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_orders_assignment ON public.france_orders USING btree (driver_assignment_status, driver_id);


--
-- TOC entry 4160 (class 1259 OID 17467)
-- Name: idx_france_orders_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_orders_created ON public.france_orders USING btree (created_at);


--
-- TOC entry 4161 (class 1259 OID 20824)
-- Name: idx_france_orders_driver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_orders_driver ON public.france_orders USING btree (driver_id);


--
-- TOC entry 4162 (class 1259 OID 17466)
-- Name: idx_france_orders_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_orders_phone ON public.france_orders USING btree (phone_number);


--
-- TOC entry 4163 (class 1259 OID 17465)
-- Name: idx_france_orders_restaurant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_orders_restaurant ON public.france_orders USING btree (restaurant_id);


--
-- TOC entry 4164 (class 1259 OID 21575)
-- Name: idx_france_orders_timeout; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_orders_timeout ON public.france_orders USING btree (assignment_timeout_at) WHERE ((driver_assignment_status)::text = 'searching'::text);


--
-- TOC entry 4165 (class 1259 OID 20655)
-- Name: idx_france_orders_validation_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_orders_validation_code ON public.france_orders USING btree (delivery_validation_code);


--
-- TOC entry 4139 (class 1259 OID 17461)
-- Name: idx_france_products_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_products_active ON public.france_products USING btree (is_active);


--
-- TOC entry 4140 (class 1259 OID 17460)
-- Name: idx_france_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_products_category ON public.france_products USING btree (category_id);


--
-- TOC entry 4141 (class 1259 OID 17459)
-- Name: idx_france_products_restaurant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_products_restaurant ON public.france_products USING btree (restaurant_id);


--
-- TOC entry 4129 (class 1259 OID 17457)
-- Name: idx_france_restaurants_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_restaurants_active ON public.france_restaurants USING btree (is_active);


--
-- TOC entry 4130 (class 1259 OID 17456)
-- Name: idx_france_restaurants_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_restaurants_slug ON public.france_restaurants USING btree (slug);


--
-- TOC entry 4131 (class 1259 OID 37366)
-- Name: idx_france_restaurants_timezone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_restaurants_timezone ON public.france_restaurants USING btree (timezone);


--
-- TOC entry 4154 (class 1259 OID 17464)
-- Name: idx_france_sessions_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_sessions_expires ON public.france_user_sessions USING btree (expires_at);


--
-- TOC entry 4155 (class 1259 OID 17463)
-- Name: idx_france_sessions_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_sessions_phone ON public.france_user_sessions USING btree (phone_number);


--
-- TOC entry 4172 (class 1259 OID 17658)
-- Name: idx_france_sessions_phone_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_sessions_phone_expires ON public.france_sessions USING btree (phone_whatsapp, expires_at);


--
-- TOC entry 4197 (class 1259 OID 20817)
-- Name: idx_france_sessions_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_sessions_token ON public.france_auth_sessions USING btree (session_token);


--
-- TOC entry 4198 (class 1259 OID 20818)
-- Name: idx_france_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_sessions_user ON public.france_auth_sessions USING btree (user_id, user_type);


--
-- TOC entry 4145 (class 1259 OID 17462)
-- Name: idx_france_variants_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_france_variants_product ON public.france_product_variants USING btree (product_id);


--
-- TOC entry 4275 (class 1259 OID 39344)
-- Name: idx_france_workflow_templates_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_france_workflow_templates_unique ON public.france_workflow_templates USING btree (COALESCE(restaurant_id, 0), template_name);


--
-- TOC entry 4254 (class 1259 OID 31195)
-- Name: idx_message_templates_restaurant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_templates_restaurant_id ON public.message_templates USING btree (restaurant_id);


--
-- TOC entry 4142 (class 1259 OID 29511)
-- Name: idx_products_workflow; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_workflow ON public.france_products USING btree (workflow_type, requires_steps) WHERE (workflow_type IS NOT NULL);


--
-- TOC entry 4239 (class 1259 OID 31192)
-- Name: idx_restaurant_bot_configs_restaurant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_restaurant_bot_configs_restaurant_id ON public.restaurant_bot_configs USING btree (restaurant_id);


--
-- TOC entry 4238 (class 1259 OID 29510)
-- Name: idx_restaurant_features_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_restaurant_features_lookup ON public.france_restaurant_features USING btree (restaurant_id, feature_type, is_enabled);


--
-- TOC entry 4280 (class 1259 OID 38001)
-- Name: idx_restaurant_service_modes_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_restaurant_service_modes_enabled ON public.france_restaurant_service_modes USING btree (restaurant_id, is_enabled);


--
-- TOC entry 4281 (class 1259 OID 38000)
-- Name: idx_restaurant_service_modes_restaurant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_restaurant_service_modes_restaurant_id ON public.france_restaurant_service_modes USING btree (restaurant_id);


--
-- TOC entry 4156 (class 1259 OID 31196)
-- Name: idx_user_sessions_workflow_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_workflow_state ON public.france_user_sessions USING btree (current_step_id) WHERE (current_step_id IS NOT NULL);


--
-- TOC entry 4244 (class 1259 OID 31193)
-- Name: idx_workflow_definitions_restaurant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workflow_definitions_restaurant_id ON public.workflow_definitions USING btree (restaurant_id);


--
-- TOC entry 4249 (class 1259 OID 31194)
-- Name: idx_workflow_steps_workflow_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workflow_steps_workflow_id ON public.workflow_steps USING btree (workflow_id);


--
-- TOC entry 4336 (class 2620 OID 21644)
-- Name: france_delivery_drivers trigger_update_driver_location; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_driver_location BEFORE UPDATE OF current_latitude, current_longitude ON public.france_delivery_drivers FOR EACH ROW EXECUTE FUNCTION public.update_driver_location_timestamp();


--
-- TOC entry 4335 (class 2620 OID 20470)
-- Name: france_customer_addresses trigger_update_france_customer_addresses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_france_customer_addresses_updated_at BEFORE UPDATE ON public.france_customer_addresses FOR EACH ROW EXECUTE FUNCTION public.update_france_customer_addresses_updated_at();


--
-- TOC entry 4338 (class 2620 OID 25806)
-- Name: delivery_tokens update_delivery_tokens_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_delivery_tokens_updated_at BEFORE UPDATE ON public.delivery_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4337 (class 2620 OID 20826)
-- Name: france_delivery_drivers update_france_drivers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_france_drivers_updated_at BEFORE UPDATE ON public.france_delivery_drivers FOR EACH ROW EXECUTE FUNCTION public.update_france_updated_at_column();


--
-- TOC entry 4293 (class 2606 OID 16732)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4297 (class 2606 OID 16821)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4296 (class 2606 OID 16809)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 4295 (class 2606 OID 16796)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4302 (class 2606 OID 16987)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4292 (class 2606 OID 16765)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4299 (class 2606 OID 16868)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4300 (class 2606 OID 16941)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 4301 (class 2606 OID 16882)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4294 (class 2606 OID 16760)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4298 (class 2606 OID 16849)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4321 (class 2606 OID 25740)
-- Name: delivery_driver_actions delivery_driver_actions_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_driver_actions
    ADD CONSTRAINT delivery_driver_actions_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE CASCADE;


--
-- TOC entry 4322 (class 2606 OID 25735)
-- Name: delivery_driver_actions delivery_driver_actions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_driver_actions
    ADD CONSTRAINT delivery_driver_actions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id) ON DELETE CASCADE;


--
-- TOC entry 4323 (class 2606 OID 25745)
-- Name: delivery_driver_actions delivery_driver_actions_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_driver_actions
    ADD CONSTRAINT delivery_driver_actions_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.delivery_tokens(id) ON DELETE SET NULL;


--
-- TOC entry 4327 (class 2606 OID 25785)
-- Name: delivery_order_logs delivery_order_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_order_logs
    ADD CONSTRAINT delivery_order_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id) ON DELETE CASCADE;


--
-- TOC entry 4324 (class 2606 OID 25765)
-- Name: delivery_refusals delivery_refusals_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_refusals
    ADD CONSTRAINT delivery_refusals_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE CASCADE;


--
-- TOC entry 4325 (class 2606 OID 25760)
-- Name: delivery_refusals delivery_refusals_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_refusals
    ADD CONSTRAINT delivery_refusals_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id) ON DELETE CASCADE;


--
-- TOC entry 4326 (class 2606 OID 25770)
-- Name: delivery_refusals delivery_refusals_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_refusals
    ADD CONSTRAINT delivery_refusals_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.delivery_tokens(id) ON DELETE SET NULL;


--
-- TOC entry 4319 (class 2606 OID 25720)
-- Name: delivery_tokens delivery_tokens_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_tokens
    ADD CONSTRAINT delivery_tokens_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE CASCADE;


--
-- TOC entry 4320 (class 2606 OID 25715)
-- Name: delivery_tokens delivery_tokens_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_tokens
    ADD CONSTRAINT delivery_tokens_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id) ON DELETE CASCADE;


--
-- TOC entry 4309 (class 2606 OID 17396)
-- Name: france_composite_items france_composite_items_composite_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_composite_items
    ADD CONSTRAINT france_composite_items_composite_product_id_fkey FOREIGN KEY (composite_product_id) REFERENCES public.france_products(id) ON DELETE CASCADE;


--
-- TOC entry 4315 (class 2606 OID 21594)
-- Name: france_delivery_assignments france_delivery_assignments_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_assignments
    ADD CONSTRAINT france_delivery_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE CASCADE;


--
-- TOC entry 4316 (class 2606 OID 21589)
-- Name: france_delivery_assignments france_delivery_assignments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_assignments
    ADD CONSTRAINT france_delivery_assignments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id) ON DELETE CASCADE;


--
-- TOC entry 4314 (class 2606 OID 20795)
-- Name: france_delivery_drivers france_delivery_drivers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_drivers
    ADD CONSTRAINT france_delivery_drivers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id) ON DELETE CASCADE;


--
-- TOC entry 4317 (class 2606 OID 21617)
-- Name: france_delivery_notifications france_delivery_notifications_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_delivery_notifications
    ADD CONSTRAINT france_delivery_notifications_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.france_delivery_assignments(id) ON DELETE CASCADE;


--
-- TOC entry 4318 (class 2606 OID 21634)
-- Name: france_driver_locations france_driver_locations_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_driver_locations
    ADD CONSTRAINT france_driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE CASCADE;


--
-- TOC entry 4303 (class 2606 OID 17302)
-- Name: france_menu_categories france_menu_categories_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_menu_categories
    ADD CONSTRAINT france_menu_categories_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id) ON DELETE CASCADE;


--
-- TOC entry 4310 (class 2606 OID 20471)
-- Name: france_orders france_orders_delivery_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_orders
    ADD CONSTRAINT france_orders_delivery_address_id_fkey FOREIGN KEY (delivery_address_id) REFERENCES public.france_customer_addresses(id);


--
-- TOC entry 4311 (class 2606 OID 20819)
-- Name: france_orders france_orders_driver_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_orders
    ADD CONSTRAINT france_orders_driver_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE SET NULL;


--
-- TOC entry 4312 (class 2606 OID 17435)
-- Name: france_orders france_orders_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_orders
    ADD CONSTRAINT france_orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- TOC entry 4334 (class 2606 OID 39360)
-- Name: france_pizza_display_settings france_pizza_display_settings_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_pizza_display_settings
    ADD CONSTRAINT france_pizza_display_settings_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- TOC entry 4307 (class 2606 OID 17369)
-- Name: france_product_options france_product_options_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_options
    ADD CONSTRAINT france_product_options_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id) ON DELETE CASCADE;


--
-- TOC entry 4308 (class 2606 OID 17383)
-- Name: france_product_sizes france_product_sizes_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_sizes
    ADD CONSTRAINT france_product_sizes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id) ON DELETE CASCADE;


--
-- TOC entry 4306 (class 2606 OID 17352)
-- Name: france_product_variants france_product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_product_variants
    ADD CONSTRAINT france_product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id) ON DELETE CASCADE;


--
-- TOC entry 4304 (class 2606 OID 17335)
-- Name: france_products france_products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_products
    ADD CONSTRAINT france_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.france_menu_categories(id) ON DELETE CASCADE;


--
-- TOC entry 4305 (class 2606 OID 17330)
-- Name: france_products france_products_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_products
    ADD CONSTRAINT france_products_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id) ON DELETE CASCADE;


--
-- TOC entry 4328 (class 2606 OID 29438)
-- Name: france_restaurant_features france_restaurant_features_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_restaurant_features
    ADD CONSTRAINT france_restaurant_features_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- TOC entry 4333 (class 2606 OID 37995)
-- Name: france_restaurant_service_modes france_restaurant_service_modes_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_restaurant_service_modes
    ADD CONSTRAINT france_restaurant_service_modes_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- TOC entry 4313 (class 2606 OID 17451)
-- Name: france_whatsapp_numbers france_whatsapp_numbers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.france_whatsapp_numbers
    ADD CONSTRAINT france_whatsapp_numbers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id) ON DELETE CASCADE;


--
-- TOC entry 4332 (class 2606 OID 31184)
-- Name: message_templates message_templates_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- TOC entry 4329 (class 2606 OID 31117)
-- Name: restaurant_bot_configs restaurant_bot_configs_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_bot_configs
    ADD CONSTRAINT restaurant_bot_configs_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- TOC entry 4330 (class 2606 OID 31139)
-- Name: workflow_definitions workflow_definitions_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT workflow_definitions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- TOC entry 4331 (class 2606 OID 31163)
-- Name: workflow_steps workflow_steps_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflow_definitions(id) ON DELETE CASCADE;


--
-- TOC entry 4494 (class 0 OID 16525)
-- Dependencies: 357
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4505 (class 0 OID 16927)
-- Dependencies: 374
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4496 (class 0 OID 16725)
-- Dependencies: 365
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4493 (class 0 OID 16518)
-- Dependencies: 356
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4500 (class 0 OID 16814)
-- Dependencies: 369
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4499 (class 0 OID 16802)
-- Dependencies: 368
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4498 (class 0 OID 16789)
-- Dependencies: 367
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4506 (class 0 OID 16977)
-- Dependencies: 375
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4492 (class 0 OID 16507)
-- Dependencies: 355
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4503 (class 0 OID 16856)
-- Dependencies: 372
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4504 (class 0 OID 16874)
-- Dependencies: 373
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4495 (class 0 OID 16533)
-- Dependencies: 358
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4497 (class 0 OID 16755)
-- Dependencies: 366
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4502 (class 0 OID 16841)
-- Dependencies: 371
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4501 (class 0 OID 16832)
-- Dependencies: 370
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4491 (class 0 OID 16495)
-- Dependencies: 353
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4507 (class 6104 OID 16426)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- TOC entry 3830 (class 3466 OID 16621)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- TOC entry 3835 (class 3466 OID 16700)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- TOC entry 3829 (class 3466 OID 16619)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- TOC entry 3836 (class 3466 OID 16703)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- TOC entry 3831 (class 3466 OID 16622)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- TOC entry 3832 (class 3466 OID 16623)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


-- Completed on 2025-09-18 23:38:11

--
-- PostgreSQL database dump complete
--

