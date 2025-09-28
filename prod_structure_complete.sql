--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: product_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.product_type_enum AS ENUM (
    'simple',
    'modular',
    'variant',
    'composite'
);


ALTER TYPE public.product_type_enum OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
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


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
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


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
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


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
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


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
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


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: accept_order_atomic(character varying, integer); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.accept_order_atomic(p_token character varying, p_order_id integer) OWNER TO postgres;

--
-- Name: apply_composite_config(text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.apply_composite_config(category_name text, include_drinks boolean) OWNER TO postgres;

--
-- Name: apply_simple_config(text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.apply_simple_config(category_name text) OWNER TO postgres;

--
-- Name: auto_add_drink_to_workflows_production(integer, text, text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.auto_add_drink_to_workflows_production(drink_product_id integer, drink_name text, variant_size text) OWNER TO postgres;

--
-- Name: auto_add_drink_to_workflows_v2(integer, text, text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.auto_add_drink_to_workflows_v2(drink_product_id integer, drink_name text, variant_size text) OWNER TO postgres;

--
-- Name: calculate_distance_km(numeric, numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.calculate_distance_km(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric) OWNER TO postgres;

--
-- Name: cleanup_expired_assignments(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.cleanup_expired_assignments() OWNER TO postgres;

--
-- Name: cleanup_expired_tokens(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.cleanup_expired_tokens() OWNER TO postgres;

--
-- Name: configure_category_workflow(text, text, boolean, boolean); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.configure_category_workflow(category_name text, config_type text, include_drinks boolean, force_execution boolean) OWNER TO postgres;

--
-- Name: configure_category_workflow(text, text, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.configure_category_workflow(category_name text, config_type text, source_category text, force_execution boolean) OWNER TO postgres;

--
-- Name: copy_working_config(text, text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.copy_working_config(source_category text, target_category text) OWNER TO postgres;

--
-- Name: execute_sql(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.execute_sql(sql_query text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    result json;
    clean_sql text;
BEGIN
    -- Nettoyer le SQL en supprimant BEGIN; et COMMIT;
    clean_sql := sql_query;
    clean_sql := REPLACE(clean_sql, 'BEGIN;', '');
    clean_sql := REPLACE(clean_sql, 'COMMIT;', '');
    clean_sql := TRIM(clean_sql);

    -- Exécuter le SQL nettoyé (la fonction est déjà dans une transaction)
    EXECUTE clean_sql;

    -- Retourner un succès
    result := json_build_object(
        'success', true,
        'message', 'SQL executed successfully',
        'affected_rows', 1,
        'executed_sql', clean_sql
    );

    RETURN result;

EXCEPTION WHEN OTHERS THEN
    -- En cas d'erreur, retourner l'erreur détaillée
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'state', SQLSTATE,
        'attempted_sql', clean_sql
    );

    RETURN result;
END;
$$;


ALTER FUNCTION public.execute_sql(sql_query text) OWNER TO postgres;

--
-- Name: fix_category_configuration(text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.fix_category_configuration(category_name text) OWNER TO postgres;

--
-- Name: fn_get_product_by_categorie(integer); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.fn_get_product_by_categorie(p_category_id integer) OWNER TO postgres;

--
-- Name: fn_get_product_by_categorie_detailed(integer); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.fn_get_product_by_categorie_detailed(p_category_id integer) OWNER TO postgres;

--
-- Name: force_release_order(integer, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.force_release_order(p_order_id integer, p_restaurant_id integer, p_reason text) OWNER TO postgres;

--
-- Name: get_order_delivery_stats(integer); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.get_order_delivery_stats(p_order_id integer) OWNER TO postgres;

--
-- Name: load_orders_with_assignment_state(integer); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.load_orders_with_assignment_state(p_restaurant_id integer) OWNER TO postgres;

--
-- Name: trigger_auto_add_drink_production(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.trigger_auto_add_drink_production() OWNER TO postgres;

--
-- Name: update_composite_items(integer, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.update_composite_items(p_product_id integer, p_items jsonb) OWNER TO postgres;

--
-- Name: update_driver_location_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_driver_location_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_location_update := NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_driver_location_timestamp() OWNER TO postgres;

--
-- Name: update_france_customer_addresses_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_france_customer_addresses_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_france_customer_addresses_updated_at() OWNER TO postgres;

--
-- Name: update_france_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_france_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_france_updated_at_column() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: automation_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.automation_logs (
    id integer NOT NULL,
    action character varying(100) NOT NULL,
    details jsonb,
    created_at timestamp without time zone DEFAULT now(),
    success boolean DEFAULT true
);


ALTER TABLE public.automation_logs OWNER TO postgres;

--
-- Name: automation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.automation_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.automation_logs_id_seq OWNER TO postgres;

--
-- Name: automation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.automation_logs_id_seq OWNED BY public.automation_logs.id;


--
-- Name: delivery_driver_actions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.delivery_driver_actions OWNER TO postgres;

--
-- Name: delivery_driver_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.delivery_driver_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.delivery_driver_actions_id_seq OWNER TO postgres;

--
-- Name: delivery_driver_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.delivery_driver_actions_id_seq OWNED BY public.delivery_driver_actions.id;


--
-- Name: delivery_order_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_order_logs (
    id integer NOT NULL,
    order_id integer,
    action_type character varying(20) NOT NULL,
    details text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.delivery_order_logs OWNER TO postgres;

--
-- Name: delivery_order_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.delivery_order_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.delivery_order_logs_id_seq OWNER TO postgres;

--
-- Name: delivery_order_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.delivery_order_logs_id_seq OWNED BY public.delivery_order_logs.id;


--
-- Name: delivery_refusals; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.delivery_refusals OWNER TO postgres;

--
-- Name: delivery_refusals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.delivery_refusals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.delivery_refusals_id_seq OWNER TO postgres;

--
-- Name: delivery_refusals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.delivery_refusals_id_seq OWNED BY public.delivery_refusals.id;


--
-- Name: delivery_tokens; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.delivery_tokens OWNER TO postgres;

--
-- Name: delivery_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.delivery_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.delivery_tokens_id_seq OWNER TO postgres;

--
-- Name: delivery_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.delivery_tokens_id_seq OWNED BY public.delivery_tokens.id;


--
-- Name: france_delivery_assignments; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_delivery_assignments OWNER TO postgres;

--
-- Name: TABLE france_delivery_assignments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_delivery_assignments IS 'Toutes les tentatives d''assignation de commandes aux livreurs';


--
-- Name: COLUMN france_delivery_assignments.assignment_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_delivery_assignments.assignment_status IS 'pending: en attente, accepted: accepté, rejected: refusé, expired: expiré';


--
-- Name: COLUMN france_delivery_assignments.expires_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_delivery_assignments.expires_at IS 'Date limite pour que le livreur réponde';


--
-- Name: COLUMN france_delivery_assignments.response_time_seconds; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_delivery_assignments.response_time_seconds IS 'Temps de réponse du livreur en secondes';


--
-- Name: france_delivery_drivers; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_delivery_drivers OWNER TO postgres;

--
-- Name: COLUMN france_delivery_drivers.is_online; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_delivery_drivers.is_online IS 'Statut en ligne du livreur (disponible pour prendre des commandes)';


--
-- Name: COLUMN france_delivery_drivers.current_latitude; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_delivery_drivers.current_latitude IS 'Latitude actuelle du livreur';


--
-- Name: COLUMN france_delivery_drivers.current_longitude; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_delivery_drivers.current_longitude IS 'Longitude actuelle du livreur';


--
-- Name: france_orders; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_orders OWNER TO postgres;

--
-- Name: TABLE france_orders; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_orders IS 'Commandes des restaurants France';


--
-- Name: COLUMN france_orders.delivery_validation_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_orders.delivery_validation_code IS 'Code à 4 chiffres pour validation de la livraison par le livreur';


--
-- Name: COLUMN france_orders.date_validation_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_orders.date_validation_code IS 'Date et heure de validation du code par le livreur';


--
-- Name: COLUMN france_orders.driver_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_orders.driver_id IS 'ID du livreur assigné à cette commande (colonne existante réutilisée)';


--
-- Name: COLUMN france_orders.driver_assignment_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_orders.driver_assignment_status IS 'Statut assignation: none|searching|assigned|delivered';


--
-- Name: COLUMN france_orders.delivery_started_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_orders.delivery_started_at IS 'Timestamp début livraison (quand livreur accepte)';


--
-- Name: COLUMN france_orders.assignment_timeout_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_orders.assignment_timeout_at IS 'Timestamp limite pour trouver un livreur';


--
-- Name: COLUMN france_orders.assignment_started_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_orders.assignment_started_at IS 'Date/heure de début de recherche d''assignation livreur - utilisé dans getNotificationTime()';


--
-- Name: COLUMN france_orders.audio_played; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_orders.audio_played IS 'Indique si la notification audio a été jouée pour cette commande';


--
-- Name: france_restaurants; Type: TABLE; Schema: public; Owner: postgres
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
    deployment_status character varying(20) DEFAULT 'production'::character varying,
    CONSTRAINT france_restaurants_audio_volume_check CHECK (((audio_volume >= 0) AND (audio_volume <= 100))),
    CONSTRAINT france_restaurants_deployment_status_check CHECK (((deployment_status)::text = ANY ((ARRAY['development'::character varying, 'testing'::character varying, 'production'::character varying])::text[])))
);


ALTER TABLE public.france_restaurants OWNER TO postgres;

--
-- Name: TABLE france_restaurants; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_restaurants IS 'Restaurants en France utilisant le bot WhatsApp';


--
-- Name: COLUMN france_restaurants.audio_notifications_enabled; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_restaurants.audio_notifications_enabled IS 'Active/désactive les notifications audio pour ce restaurant';


--
-- Name: COLUMN france_restaurants.audio_volume; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_restaurants.audio_volume IS 'Volume des notifications audio (0-100)';


--
-- Name: COLUMN france_restaurants.audio_enabled_since; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_restaurants.audio_enabled_since IS 'Timestamp depuis quand l''audio est activé (NULL si désactivé)';


--
-- Name: france_active_assignments; Type: VIEW; Schema: public; Owner: postgres
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


ALTER VIEW public.france_active_assignments OWNER TO postgres;

--
-- Name: france_auth_sessions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_auth_sessions OWNER TO postgres;

--
-- Name: france_auth_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_auth_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_auth_sessions_id_seq OWNER TO postgres;

--
-- Name: france_auth_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_auth_sessions_id_seq OWNED BY public.france_auth_sessions.id;


--
-- Name: france_available_drivers; Type: VIEW; Schema: public; Owner: postgres
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


ALTER VIEW public.france_available_drivers OWNER TO postgres;

--
-- Name: france_composite_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.france_composite_items (
    id integer NOT NULL,
    composite_product_id integer,
    component_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit character varying(20) DEFAULT 'pièces'::character varying
);


ALTER TABLE public.france_composite_items OWNER TO postgres;

--
-- Name: TABLE france_composite_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_composite_items IS 'Composition des menus composites';


--
-- Name: france_composite_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_composite_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_composite_items_id_seq OWNER TO postgres;

--
-- Name: france_composite_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_composite_items_id_seq OWNED BY public.france_composite_items.id;


--
-- Name: france_customer_addresses; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_customer_addresses OWNER TO postgres;

--
-- Name: france_customer_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_customer_addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_customer_addresses_id_seq OWNER TO postgres;

--
-- Name: france_customer_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_customer_addresses_id_seq OWNED BY public.france_customer_addresses.id;


--
-- Name: france_delivery_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_delivery_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_delivery_assignments_id_seq OWNER TO postgres;

--
-- Name: france_delivery_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_delivery_assignments_id_seq OWNED BY public.france_delivery_assignments.id;


--
-- Name: france_delivery_drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_delivery_drivers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_delivery_drivers_id_seq OWNER TO postgres;

--
-- Name: france_delivery_drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_delivery_drivers_id_seq OWNED BY public.france_delivery_drivers.id;


--
-- Name: france_delivery_notifications; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_delivery_notifications OWNER TO postgres;

--
-- Name: TABLE france_delivery_notifications; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_delivery_notifications IS 'Historique de toutes les notifications envoyées pour le système de livraison';


--
-- Name: france_delivery_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_delivery_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_delivery_notifications_id_seq OWNER TO postgres;

--
-- Name: france_delivery_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_delivery_notifications_id_seq OWNED BY public.france_delivery_notifications.id;


--
-- Name: france_driver_locations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_driver_locations OWNER TO postgres;

--
-- Name: TABLE france_driver_locations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_driver_locations IS 'Historique des positions des livreurs pour analytics';


--
-- Name: france_driver_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_driver_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_driver_locations_id_seq OWNER TO postgres;

--
-- Name: france_driver_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_driver_locations_id_seq OWNED BY public.france_driver_locations.id;


--
-- Name: france_icons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.france_icons (
    id integer NOT NULL,
    emoji character varying(10) NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    tags text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.france_icons OWNER TO postgres;

--
-- Name: france_icons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_icons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_icons_id_seq OWNER TO postgres;

--
-- Name: france_icons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_icons_id_seq OWNED BY public.france_icons.id;


--
-- Name: france_menu_categories; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_menu_categories OWNER TO postgres;

--
-- Name: TABLE france_menu_categories; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_menu_categories IS 'Catégories de menu par restaurant';


--
-- Name: france_menu_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_menu_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_menu_categories_id_seq OWNER TO postgres;

--
-- Name: france_menu_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_menu_categories_id_seq OWNED BY public.france_menu_categories.id;


--
-- Name: france_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_orders_id_seq OWNER TO postgres;

--
-- Name: france_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_orders_id_seq OWNED BY public.france_orders.id;


--
-- Name: france_pizza_display_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.france_pizza_display_settings (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    use_unified_display boolean DEFAULT true,
    custom_settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.france_pizza_display_settings OWNER TO postgres;

--
-- Name: france_pizza_display_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_pizza_display_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_pizza_display_settings_id_seq OWNER TO postgres;

--
-- Name: france_pizza_display_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_pizza_display_settings_id_seq OWNED BY public.france_pizza_display_settings.id;


--
-- Name: france_product_display_configs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_product_display_configs OWNER TO postgres;

--
-- Name: france_product_display_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_product_display_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_product_display_configs_id_seq OWNER TO postgres;

--
-- Name: france_product_display_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_product_display_configs_id_seq OWNED BY public.france_product_display_configs.id;


--
-- Name: france_product_options; Type: TABLE; Schema: public; Owner: postgres
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
    conditional_next_group jsonb,
    icon character varying(10) DEFAULT NULL::character varying
);


ALTER TABLE public.france_product_options OWNER TO postgres;

--
-- Name: TABLE france_product_options; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_product_options IS 'Options pour produits modulaires';


--
-- Name: france_product_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_product_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_product_options_id_seq OWNER TO postgres;

--
-- Name: france_product_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_product_options_id_seq OWNED BY public.france_product_options.id;


--
-- Name: france_product_sizes; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_product_sizes OWNER TO postgres;

--
-- Name: TABLE france_product_sizes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_product_sizes IS 'Tailles pour produits modulaires';


--
-- Name: france_product_sizes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_product_sizes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_product_sizes_id_seq OWNER TO postgres;

--
-- Name: france_product_sizes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_product_sizes_id_seq OWNED BY public.france_product_sizes.id;


--
-- Name: france_product_variants; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_product_variants OWNER TO postgres;

--
-- Name: TABLE france_product_variants; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_product_variants IS 'Variantes pour produits à portions multiples';


--
-- Name: france_product_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_product_variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_product_variants_id_seq OWNER TO postgres;

--
-- Name: france_product_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_product_variants_id_seq OWNED BY public.france_product_variants.id;


--
-- Name: france_products; Type: TABLE; Schema: public; Owner: postgres
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
    steps_config json,
    icon character varying(10) DEFAULT NULL::character varying
);


ALTER TABLE public.france_products OWNER TO postgres;

--
-- Name: TABLE france_products; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_products IS 'Produits avec 4 types : simple, modular, variant, composite';


--
-- Name: france_products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_products_id_seq OWNER TO postgres;

--
-- Name: france_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_products_id_seq OWNED BY public.france_products.id;


--
-- Name: france_restaurant_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.france_restaurant_features (
    id integer NOT NULL,
    restaurant_id integer,
    feature_type character varying NOT NULL,
    is_enabled boolean DEFAULT true,
    config json
);


ALTER TABLE public.france_restaurant_features OWNER TO postgres;

--
-- Name: france_restaurant_features_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_restaurant_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_restaurant_features_id_seq OWNER TO postgres;

--
-- Name: france_restaurant_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_restaurant_features_id_seq OWNED BY public.france_restaurant_features.id;


--
-- Name: france_restaurant_service_modes; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_restaurant_service_modes OWNER TO postgres;

--
-- Name: france_restaurant_service_modes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_restaurant_service_modes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_restaurant_service_modes_id_seq OWNER TO postgres;

--
-- Name: france_restaurant_service_modes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_restaurant_service_modes_id_seq OWNED BY public.france_restaurant_service_modes.id;


--
-- Name: france_restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_restaurants_id_seq OWNER TO postgres;

--
-- Name: france_restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_restaurants_id_seq OWNED BY public.france_restaurants.id;


--
-- Name: france_sessions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_sessions OWNER TO postgres;

--
-- Name: TABLE france_sessions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_sessions IS 'Sessions utilisateurs pour le bot WhatsApp France';


--
-- Name: COLUMN france_sessions.phone_whatsapp; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_sessions.phone_whatsapp IS 'Numéro de téléphone WhatsApp de l''utilisateur';


--
-- Name: COLUMN france_sessions.state; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_sessions.state IS 'État actuel de la conversation (INITIAL, VIEWING_MENU, etc.)';


--
-- Name: COLUMN france_sessions.context; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_sessions.context IS 'Données de contexte de la session (restaurant sélectionné, panier, etc.)';


--
-- Name: COLUMN france_sessions.expires_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.france_sessions.expires_at IS 'Date d''expiration de la session (30 minutes par défaut)';


--
-- Name: france_user_sessions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_user_sessions OWNER TO postgres;

--
-- Name: TABLE france_user_sessions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_user_sessions IS 'Sessions utilisateur avec panier et état';


--
-- Name: france_user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_user_sessions_id_seq OWNER TO postgres;

--
-- Name: france_user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_user_sessions_id_seq OWNED BY public.france_user_sessions.id;


--
-- Name: france_whatsapp_numbers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.france_whatsapp_numbers (
    id integer NOT NULL,
    restaurant_id integer,
    whatsapp_number character varying(20) NOT NULL,
    description character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.france_whatsapp_numbers OWNER TO postgres;

--
-- Name: TABLE france_whatsapp_numbers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.france_whatsapp_numbers IS 'Numéros WhatsApp autorisés par restaurant';


--
-- Name: france_whatsapp_numbers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_whatsapp_numbers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_whatsapp_numbers_id_seq OWNER TO postgres;

--
-- Name: france_whatsapp_numbers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_whatsapp_numbers_id_seq OWNED BY public.france_whatsapp_numbers.id;


--
-- Name: france_workflow_templates; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.france_workflow_templates OWNER TO postgres;

--
-- Name: france_workflow_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.france_workflow_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.france_workflow_templates_id_seq OWNER TO postgres;

--
-- Name: france_workflow_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.france_workflow_templates_id_seq OWNED BY public.france_workflow_templates.id;


--
-- Name: menu_ai_scripts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_ai_scripts (
    id integer NOT NULL,
    script_sql text NOT NULL,
    dev_status character varying(20) DEFAULT 'pending'::character varying,
    prod_status character varying(20) DEFAULT 'not_applied'::character varying,
    command_source text,
    ai_explanation text,
    category_name character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    dev_executed_at timestamp with time zone,
    prod_executed_at timestamp with time zone,
    dev_error_message text,
    prod_error_message text,
    rollback_sql text,
    created_by character varying(100) DEFAULT 'menu-ai-admin'::character varying
);


ALTER TABLE public.menu_ai_scripts OWNER TO postgres;

--
-- Name: TABLE menu_ai_scripts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.menu_ai_scripts IS 'Table de traçabilité des scripts SQL générés par le système AI';


--
-- Name: COLUMN menu_ai_scripts.dev_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.menu_ai_scripts.dev_status IS 'Statut du script en environnement DEV';


--
-- Name: COLUMN menu_ai_scripts.prod_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.menu_ai_scripts.prod_status IS 'Statut du script en environnement PROD';


--
-- Name: COLUMN menu_ai_scripts.rollback_sql; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.menu_ai_scripts.rollback_sql IS 'Script SQL inverse pour annuler les modifications';


--
-- Name: menu_ai_scripts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_ai_scripts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_ai_scripts_id_seq OWNER TO postgres;

--
-- Name: menu_ai_scripts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_ai_scripts_id_seq OWNED BY public.menu_ai_scripts.id;


--
-- Name: message_templates; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.message_templates OWNER TO postgres;

--
-- Name: message_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.message_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.message_templates_id_seq OWNER TO postgres;

--
-- Name: message_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.message_templates_id_seq OWNED BY public.message_templates.id;


--
-- Name: restaurant_bot_configs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.restaurant_bot_configs OWNER TO postgres;

--
-- Name: restaurant_bot_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restaurant_bot_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurant_bot_configs_id_seq OWNER TO postgres;

--
-- Name: restaurant_bot_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurant_bot_configs_id_seq OWNED BY public.restaurant_bot_configs.id;


--
-- Name: restaurant_vitrine_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_vitrine_settings (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    slug character varying(100) NOT NULL,
    primary_color character varying(7) DEFAULT '#ff0000'::character varying NOT NULL,
    secondary_color character varying(7) DEFAULT '#cc0000'::character varying NOT NULL,
    accent_color character varying(7) DEFAULT '#ffc107'::character varying NOT NULL,
    logo_emoji character varying(10) DEFAULT '🍕'::character varying NOT NULL,
    subtitle character varying(200) DEFAULT 'Commandez en 30 secondes sur WhatsApp!'::character varying NOT NULL,
    promo_text character varying(200) DEFAULT '📱 100% DIGITAL SUR WHATSAPP'::character varying,
    feature_1 text DEFAULT '{"emoji": "🚀", "text": "Livraison rapide"}'::text,
    feature_2 text DEFAULT '{"emoji": "💯", "text": "Produits frais"}'::text,
    feature_3 text DEFAULT '{"emoji": "⭐", "text": "4.8 étoiles"}'::text,
    show_live_stats boolean DEFAULT true NOT NULL,
    average_rating numeric(2,1) DEFAULT 4.8 NOT NULL,
    delivery_time_min integer DEFAULT 25 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT restaurant_vitrine_settings_average_rating_check CHECK (((average_rating >= (0)::numeric) AND (average_rating <= (5)::numeric))),
    CONSTRAINT restaurant_vitrine_settings_delivery_time_min_check CHECK ((delivery_time_min > 0))
);


ALTER TABLE public.restaurant_vitrine_settings OWNER TO postgres;

--
-- Name: restaurant_vitrine_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restaurant_vitrine_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurant_vitrine_settings_id_seq OWNER TO postgres;

--
-- Name: restaurant_vitrine_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurant_vitrine_settings_id_seq OWNED BY public.restaurant_vitrine_settings.id;


--
-- Name: state_transitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.state_transitions (
    id integer NOT NULL,
    from_state character varying(100),
    to_state character varying(100) NOT NULL,
    trigger_condition jsonb NOT NULL,
    priority integer DEFAULT 100,
    is_active boolean DEFAULT true
);


ALTER TABLE public.state_transitions OWNER TO postgres;

--
-- Name: state_transitions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.state_transitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.state_transitions_id_seq OWNER TO postgres;

--
-- Name: state_transitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.state_transitions_id_seq OWNED BY public.state_transitions.id;


--
-- Name: step_executor_mappings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.step_executor_mappings (
    id integer NOT NULL,
    step_type character varying(50) NOT NULL,
    executor_class character varying(100) NOT NULL,
    configuration jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.step_executor_mappings OWNER TO postgres;

--
-- Name: step_executor_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.step_executor_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.step_executor_mappings_id_seq OWNER TO postgres;

--
-- Name: step_executor_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.step_executor_mappings_id_seq OWNED BY public.step_executor_mappings.id;


--
-- Name: tacos_backup_20250125; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tacos_backup_20250125 (
    id integer,
    restaurant_id integer,
    category_id integer,
    name character varying(255),
    description text,
    product_type public.product_type_enum,
    base_price numeric(8,2),
    composition text,
    display_order integer,
    is_active boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    price_on_site_base numeric,
    price_delivery_base numeric,
    workflow_type character varying,
    requires_steps boolean,
    steps_config json,
    icon character varying(10)
);


ALTER TABLE public.tacos_backup_20250125 OWNER TO postgres;

--
-- Name: tacos_rollback_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tacos_rollback_backup (
    id integer,
    restaurant_id integer,
    category_id integer,
    name character varying(255),
    description text,
    product_type public.product_type_enum,
    base_price numeric(8,2),
    composition text,
    display_order integer,
    is_active boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    price_on_site_base numeric,
    price_delivery_base numeric,
    workflow_type character varying,
    requires_steps boolean,
    steps_config json,
    icon character varying(10)
);


ALTER TABLE public.tacos_rollback_backup OWNER TO postgres;

--
-- Name: v_restaurant_available_modes; Type: VIEW; Schema: public; Owner: postgres
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


ALTER VIEW public.v_restaurant_available_modes OWNER TO postgres;

--
-- Name: v_restaurant_pizza_display_config; Type: VIEW; Schema: public; Owner: postgres
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


ALTER VIEW public.v_restaurant_pizza_display_config OWNER TO postgres;

--
-- Name: workflow_definitions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.workflow_definitions OWNER TO postgres;

--
-- Name: workflow_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workflow_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workflow_definitions_id_seq OWNER TO postgres;

--
-- Name: workflow_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workflow_definitions_id_seq OWNED BY public.workflow_definitions.id;


--
-- Name: workflow_steps; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.workflow_steps OWNER TO postgres;

--
-- Name: workflow_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workflow_steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workflow_steps_id_seq OWNER TO postgres;

--
-- Name: workflow_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workflow_steps_id_seq OWNED BY public.workflow_steps.id;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


ALTER TABLE supabase_migrations.seed_files OWNER TO postgres;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: automation_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automation_logs ALTER COLUMN id SET DEFAULT nextval('public.automation_logs_id_seq'::regclass);


--
-- Name: delivery_driver_actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_driver_actions ALTER COLUMN id SET DEFAULT nextval('public.delivery_driver_actions_id_seq'::regclass);


--
-- Name: delivery_order_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_order_logs ALTER COLUMN id SET DEFAULT nextval('public.delivery_order_logs_id_seq'::regclass);


--
-- Name: delivery_refusals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_refusals ALTER COLUMN id SET DEFAULT nextval('public.delivery_refusals_id_seq'::regclass);


--
-- Name: delivery_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_tokens ALTER COLUMN id SET DEFAULT nextval('public.delivery_tokens_id_seq'::regclass);


--
-- Name: france_auth_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_auth_sessions ALTER COLUMN id SET DEFAULT nextval('public.france_auth_sessions_id_seq'::regclass);


--
-- Name: france_composite_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_composite_items ALTER COLUMN id SET DEFAULT nextval('public.france_composite_items_id_seq'::regclass);


--
-- Name: france_customer_addresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_customer_addresses ALTER COLUMN id SET DEFAULT nextval('public.france_customer_addresses_id_seq'::regclass);


--
-- Name: france_delivery_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_assignments ALTER COLUMN id SET DEFAULT nextval('public.france_delivery_assignments_id_seq'::regclass);


--
-- Name: france_delivery_drivers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_drivers ALTER COLUMN id SET DEFAULT nextval('public.france_delivery_drivers_id_seq'::regclass);


--
-- Name: france_delivery_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_notifications ALTER COLUMN id SET DEFAULT nextval('public.france_delivery_notifications_id_seq'::regclass);


--
-- Name: france_driver_locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_driver_locations ALTER COLUMN id SET DEFAULT nextval('public.france_driver_locations_id_seq'::regclass);


--
-- Name: france_icons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_icons ALTER COLUMN id SET DEFAULT nextval('public.france_icons_id_seq'::regclass);


--
-- Name: france_menu_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_menu_categories ALTER COLUMN id SET DEFAULT nextval('public.france_menu_categories_id_seq'::regclass);


--
-- Name: france_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_orders ALTER COLUMN id SET DEFAULT nextval('public.france_orders_id_seq'::regclass);


--
-- Name: france_pizza_display_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_pizza_display_settings ALTER COLUMN id SET DEFAULT nextval('public.france_pizza_display_settings_id_seq'::regclass);


--
-- Name: france_product_display_configs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_display_configs ALTER COLUMN id SET DEFAULT nextval('public.france_product_display_configs_id_seq'::regclass);


--
-- Name: france_product_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_options ALTER COLUMN id SET DEFAULT nextval('public.france_product_options_id_seq'::regclass);


--
-- Name: france_product_sizes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_sizes ALTER COLUMN id SET DEFAULT nextval('public.france_product_sizes_id_seq'::regclass);


--
-- Name: france_product_variants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_variants ALTER COLUMN id SET DEFAULT nextval('public.france_product_variants_id_seq'::regclass);


--
-- Name: france_products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_products ALTER COLUMN id SET DEFAULT nextval('public.france_products_id_seq'::regclass);


--
-- Name: france_restaurant_features id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_restaurant_features ALTER COLUMN id SET DEFAULT nextval('public.france_restaurant_features_id_seq'::regclass);


--
-- Name: france_restaurant_service_modes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_restaurant_service_modes ALTER COLUMN id SET DEFAULT nextval('public.france_restaurant_service_modes_id_seq'::regclass);


--
-- Name: france_restaurants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_restaurants ALTER COLUMN id SET DEFAULT nextval('public.france_restaurants_id_seq'::regclass);


--
-- Name: france_user_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_user_sessions ALTER COLUMN id SET DEFAULT nextval('public.france_user_sessions_id_seq'::regclass);


--
-- Name: france_whatsapp_numbers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_whatsapp_numbers ALTER COLUMN id SET DEFAULT nextval('public.france_whatsapp_numbers_id_seq'::regclass);


--
-- Name: france_workflow_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_workflow_templates ALTER COLUMN id SET DEFAULT nextval('public.france_workflow_templates_id_seq'::regclass);


--
-- Name: menu_ai_scripts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_ai_scripts ALTER COLUMN id SET DEFAULT nextval('public.menu_ai_scripts_id_seq'::regclass);


--
-- Name: message_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_templates ALTER COLUMN id SET DEFAULT nextval('public.message_templates_id_seq'::regclass);


--
-- Name: restaurant_bot_configs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_bot_configs ALTER COLUMN id SET DEFAULT nextval('public.restaurant_bot_configs_id_seq'::regclass);


--
-- Name: restaurant_vitrine_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_vitrine_settings ALTER COLUMN id SET DEFAULT nextval('public.restaurant_vitrine_settings_id_seq'::regclass);


--
-- Name: state_transitions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.state_transitions ALTER COLUMN id SET DEFAULT nextval('public.state_transitions_id_seq'::regclass);


--
-- Name: step_executor_mappings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_executor_mappings ALTER COLUMN id SET DEFAULT nextval('public.step_executor_mappings_id_seq'::regclass);


--
-- Name: workflow_definitions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_definitions ALTER COLUMN id SET DEFAULT nextval('public.workflow_definitions_id_seq'::regclass);


--
-- Name: workflow_steps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_steps ALTER COLUMN id SET DEFAULT nextval('public.workflow_steps_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_client_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: automation_logs automation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automation_logs
    ADD CONSTRAINT automation_logs_pkey PRIMARY KEY (id);


--
-- Name: delivery_driver_actions delivery_driver_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_driver_actions
    ADD CONSTRAINT delivery_driver_actions_pkey PRIMARY KEY (id);


--
-- Name: delivery_order_logs delivery_order_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_order_logs
    ADD CONSTRAINT delivery_order_logs_pkey PRIMARY KEY (id);


--
-- Name: delivery_refusals delivery_refusals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_refusals
    ADD CONSTRAINT delivery_refusals_pkey PRIMARY KEY (id);


--
-- Name: delivery_tokens delivery_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_tokens
    ADD CONSTRAINT delivery_tokens_pkey PRIMARY KEY (id);


--
-- Name: delivery_tokens delivery_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_tokens
    ADD CONSTRAINT delivery_tokens_token_key UNIQUE (token);


--
-- Name: france_auth_sessions france_auth_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_auth_sessions
    ADD CONSTRAINT france_auth_sessions_pkey PRIMARY KEY (id);


--
-- Name: france_auth_sessions france_auth_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_auth_sessions
    ADD CONSTRAINT france_auth_sessions_session_token_key UNIQUE (session_token);


--
-- Name: france_composite_items france_composite_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_composite_items
    ADD CONSTRAINT france_composite_items_pkey PRIMARY KEY (id);


--
-- Name: france_customer_addresses france_customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_customer_addresses
    ADD CONSTRAINT france_customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: france_delivery_assignments france_delivery_assignments_order_id_driver_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_assignments
    ADD CONSTRAINT france_delivery_assignments_order_id_driver_id_key UNIQUE (order_id, driver_id);


--
-- Name: france_delivery_assignments france_delivery_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_assignments
    ADD CONSTRAINT france_delivery_assignments_pkey PRIMARY KEY (id);


--
-- Name: france_delivery_drivers france_delivery_drivers_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_drivers
    ADD CONSTRAINT france_delivery_drivers_phone_number_key UNIQUE (phone_number);


--
-- Name: france_delivery_drivers france_delivery_drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_drivers
    ADD CONSTRAINT france_delivery_drivers_pkey PRIMARY KEY (id);


--
-- Name: france_delivery_notifications france_delivery_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_notifications
    ADD CONSTRAINT france_delivery_notifications_pkey PRIMARY KEY (id);


--
-- Name: france_driver_locations france_driver_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_driver_locations
    ADD CONSTRAINT france_driver_locations_pkey PRIMARY KEY (id);


--
-- Name: france_icons france_icons_emoji_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_icons
    ADD CONSTRAINT france_icons_emoji_key UNIQUE (emoji);


--
-- Name: france_icons france_icons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_icons
    ADD CONSTRAINT france_icons_pkey PRIMARY KEY (id);


--
-- Name: france_menu_categories france_menu_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_menu_categories
    ADD CONSTRAINT france_menu_categories_pkey PRIMARY KEY (id);


--
-- Name: france_menu_categories france_menu_categories_restaurant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_menu_categories
    ADD CONSTRAINT france_menu_categories_restaurant_id_slug_key UNIQUE (restaurant_id, slug);


--
-- Name: france_orders france_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_orders
    ADD CONSTRAINT france_orders_pkey PRIMARY KEY (id);


--
-- Name: france_pizza_display_settings france_pizza_display_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_pizza_display_settings
    ADD CONSTRAINT france_pizza_display_settings_pkey PRIMARY KEY (id);


--
-- Name: france_pizza_display_settings france_pizza_display_settings_restaurant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_pizza_display_settings
    ADD CONSTRAINT france_pizza_display_settings_restaurant_id_key UNIQUE (restaurant_id);


--
-- Name: france_product_display_configs france_product_display_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_display_configs
    ADD CONSTRAINT france_product_display_configs_pkey PRIMARY KEY (id);


--
-- Name: france_product_display_configs france_product_display_configs_restaurant_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_display_configs
    ADD CONSTRAINT france_product_display_configs_restaurant_id_product_id_key UNIQUE (restaurant_id, product_id);


--
-- Name: france_product_options france_product_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_options
    ADD CONSTRAINT france_product_options_pkey PRIMARY KEY (id);


--
-- Name: france_product_sizes france_product_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_sizes
    ADD CONSTRAINT france_product_sizes_pkey PRIMARY KEY (id);


--
-- Name: france_product_variants france_product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_variants
    ADD CONSTRAINT france_product_variants_pkey PRIMARY KEY (id);


--
-- Name: france_products france_products_name_restaurant_category_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_products
    ADD CONSTRAINT france_products_name_restaurant_category_key UNIQUE (name, restaurant_id, category_id);


--
-- Name: france_products france_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_products
    ADD CONSTRAINT france_products_pkey PRIMARY KEY (id);


--
-- Name: france_restaurant_features france_restaurant_features_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_restaurant_features
    ADD CONSTRAINT france_restaurant_features_pkey PRIMARY KEY (id);


--
-- Name: france_restaurant_service_modes france_restaurant_service_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_restaurant_service_modes
    ADD CONSTRAINT france_restaurant_service_modes_pkey PRIMARY KEY (id);


--
-- Name: france_restaurant_service_modes france_restaurant_service_modes_restaurant_id_service_mode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_restaurant_service_modes
    ADD CONSTRAINT france_restaurant_service_modes_restaurant_id_service_mode_key UNIQUE (restaurant_id, service_mode);


--
-- Name: france_restaurants france_restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_restaurants
    ADD CONSTRAINT france_restaurants_pkey PRIMARY KEY (id);


--
-- Name: france_restaurants france_restaurants_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_restaurants
    ADD CONSTRAINT france_restaurants_slug_key UNIQUE (slug);


--
-- Name: france_sessions france_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_sessions
    ADD CONSTRAINT france_sessions_pkey PRIMARY KEY (id);


--
-- Name: france_user_sessions france_user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_user_sessions
    ADD CONSTRAINT france_user_sessions_pkey PRIMARY KEY (id);


--
-- Name: france_whatsapp_numbers france_whatsapp_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_whatsapp_numbers
    ADD CONSTRAINT france_whatsapp_numbers_pkey PRIMARY KEY (id);


--
-- Name: france_whatsapp_numbers france_whatsapp_numbers_restaurant_id_whatsapp_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_whatsapp_numbers
    ADD CONSTRAINT france_whatsapp_numbers_restaurant_id_whatsapp_number_key UNIQUE (restaurant_id, whatsapp_number);


--
-- Name: france_workflow_templates france_workflow_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_workflow_templates
    ADD CONSTRAINT france_workflow_templates_pkey PRIMARY KEY (id);


--
-- Name: france_workflow_templates france_workflow_templates_restaurant_id_template_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_workflow_templates
    ADD CONSTRAINT france_workflow_templates_restaurant_id_template_name_key UNIQUE (restaurant_id, template_name);


--
-- Name: menu_ai_scripts menu_ai_scripts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_ai_scripts
    ADD CONSTRAINT menu_ai_scripts_pkey PRIMARY KEY (id);


--
-- Name: message_templates message_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);


--
-- Name: message_templates message_templates_restaurant_id_template_key_language_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_restaurant_id_template_key_language_key UNIQUE (restaurant_id, template_key, language);


--
-- Name: restaurant_bot_configs restaurant_bot_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_bot_configs
    ADD CONSTRAINT restaurant_bot_configs_pkey PRIMARY KEY (id);


--
-- Name: restaurant_bot_configs restaurant_bot_configs_restaurant_id_config_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_bot_configs
    ADD CONSTRAINT restaurant_bot_configs_restaurant_id_config_name_key UNIQUE (restaurant_id, config_name);


--
-- Name: restaurant_vitrine_settings restaurant_vitrine_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_vitrine_settings
    ADD CONSTRAINT restaurant_vitrine_settings_pkey PRIMARY KEY (id);


--
-- Name: restaurant_vitrine_settings restaurant_vitrine_settings_restaurant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_vitrine_settings
    ADD CONSTRAINT restaurant_vitrine_settings_restaurant_id_key UNIQUE (restaurant_id);


--
-- Name: restaurant_vitrine_settings restaurant_vitrine_settings_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_vitrine_settings
    ADD CONSTRAINT restaurant_vitrine_settings_slug_key UNIQUE (slug);


--
-- Name: state_transitions state_transitions_from_state_to_state_trigger_condition_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.state_transitions
    ADD CONSTRAINT state_transitions_from_state_to_state_trigger_condition_key UNIQUE (from_state, to_state, trigger_condition);


--
-- Name: state_transitions state_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.state_transitions
    ADD CONSTRAINT state_transitions_pkey PRIMARY KEY (id);


--
-- Name: step_executor_mappings step_executor_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_executor_mappings
    ADD CONSTRAINT step_executor_mappings_pkey PRIMARY KEY (id);


--
-- Name: step_executor_mappings step_executor_mappings_step_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_executor_mappings
    ADD CONSTRAINT step_executor_mappings_step_type_key UNIQUE (step_type);


--
-- Name: workflow_definitions workflow_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT workflow_definitions_pkey PRIMARY KEY (id);


--
-- Name: workflow_definitions workflow_definitions_restaurant_id_workflow_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT workflow_definitions_restaurant_id_workflow_id_key UNIQUE (restaurant_id, workflow_id);


--
-- Name: workflow_steps workflow_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_workflow_id_step_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_workflow_id_step_id_key UNIQUE (workflow_id, step_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_clients_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_delivery_actions_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_actions_driver ON public.delivery_driver_actions USING btree (driver_id);


--
-- Name: idx_delivery_actions_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_actions_order ON public.delivery_driver_actions USING btree (order_id);


--
-- Name: idx_delivery_actions_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_actions_timestamp ON public.delivery_driver_actions USING btree (action_timestamp);


--
-- Name: idx_delivery_order_logs_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_order_logs_order ON public.delivery_order_logs USING btree (order_id);


--
-- Name: idx_delivery_order_logs_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_order_logs_type ON public.delivery_order_logs USING btree (action_type);


--
-- Name: idx_delivery_refusals_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_refusals_driver ON public.delivery_refusals USING btree (driver_id);


--
-- Name: idx_delivery_refusals_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_refusals_order ON public.delivery_refusals USING btree (order_id);


--
-- Name: idx_delivery_tokens_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_tokens_active ON public.delivery_tokens USING btree (token) WHERE ((used = false) AND (suspended = false));


--
-- Name: idx_delivery_tokens_cleanup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_tokens_cleanup ON public.delivery_tokens USING btree (absolute_expires_at);


--
-- Name: idx_delivery_tokens_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_tokens_order ON public.delivery_tokens USING btree (order_id);


--
-- Name: idx_delivery_tokens_order_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_tokens_order_driver ON public.delivery_tokens USING btree (order_id, driver_id);


--
-- Name: idx_france_assignments_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_assignments_driver ON public.france_delivery_assignments USING btree (driver_id, assignment_status);


--
-- Name: idx_france_assignments_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_assignments_order ON public.france_delivery_assignments USING btree (order_id, assignment_status);


--
-- Name: idx_france_assignments_pending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_assignments_pending ON public.france_delivery_assignments USING btree (expires_at) WHERE ((assignment_status)::text = 'pending'::text);


--
-- Name: idx_france_categories_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_categories_restaurant ON public.france_menu_categories USING btree (restaurant_id);


--
-- Name: idx_france_customer_addresses_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_customer_addresses_active ON public.france_customer_addresses USING btree (phone_number, is_active) WHERE (is_active = true);


--
-- Name: idx_france_customer_addresses_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_customer_addresses_default ON public.france_customer_addresses USING btree (phone_number, is_default) WHERE (is_default = true);


--
-- Name: idx_france_customer_addresses_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_customer_addresses_phone ON public.france_customer_addresses USING btree (phone_number);


--
-- Name: idx_france_driver_locations_driver_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_driver_locations_driver_time ON public.france_driver_locations USING btree (driver_id, recorded_at DESC);


--
-- Name: idx_france_driver_locations_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_driver_locations_time ON public.france_driver_locations USING btree (recorded_at);


--
-- Name: idx_france_drivers_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_drivers_active ON public.france_delivery_drivers USING btree (is_active);


--
-- Name: idx_france_drivers_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_drivers_location ON public.france_delivery_drivers USING btree (current_latitude, current_longitude) WHERE (is_online = true);


--
-- Name: idx_france_drivers_online; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_drivers_online ON public.france_delivery_drivers USING btree (is_online);


--
-- Name: idx_france_drivers_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_drivers_phone ON public.france_delivery_drivers USING btree (phone_number);


--
-- Name: idx_france_drivers_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_drivers_restaurant ON public.france_delivery_drivers USING btree (restaurant_id);


--
-- Name: idx_france_icons_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_icons_category ON public.france_icons USING btree (category);


--
-- Name: idx_france_notifications_assignment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_notifications_assignment ON public.france_delivery_notifications USING btree (assignment_id);


--
-- Name: idx_france_notifications_recipient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_notifications_recipient ON public.france_delivery_notifications USING btree (recipient_type, recipient_id);


--
-- Name: idx_france_notifications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_notifications_status ON public.france_delivery_notifications USING btree (delivery_status, sent_at);


--
-- Name: idx_france_orders_assignment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_orders_assignment ON public.france_orders USING btree (driver_assignment_status, driver_id);


--
-- Name: idx_france_orders_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_orders_created ON public.france_orders USING btree (created_at);


--
-- Name: idx_france_orders_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_orders_driver ON public.france_orders USING btree (driver_id);


--
-- Name: idx_france_orders_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_orders_phone ON public.france_orders USING btree (phone_number);


--
-- Name: idx_france_orders_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_orders_restaurant ON public.france_orders USING btree (restaurant_id);


--
-- Name: idx_france_orders_timeout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_orders_timeout ON public.france_orders USING btree (assignment_timeout_at) WHERE ((driver_assignment_status)::text = 'searching'::text);


--
-- Name: idx_france_orders_validation_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_orders_validation_code ON public.france_orders USING btree (delivery_validation_code);


--
-- Name: idx_france_products_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_products_active ON public.france_products USING btree (is_active);


--
-- Name: idx_france_products_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_products_category ON public.france_products USING btree (category_id);


--
-- Name: idx_france_products_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_products_restaurant ON public.france_products USING btree (restaurant_id);


--
-- Name: idx_france_restaurants_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_restaurants_active ON public.france_restaurants USING btree (is_active);


--
-- Name: idx_france_restaurants_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_restaurants_slug ON public.france_restaurants USING btree (slug);


--
-- Name: idx_france_restaurants_timezone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_restaurants_timezone ON public.france_restaurants USING btree (timezone);


--
-- Name: idx_france_sessions_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_sessions_expires ON public.france_user_sessions USING btree (expires_at);


--
-- Name: idx_france_sessions_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_sessions_phone ON public.france_user_sessions USING btree (phone_number);


--
-- Name: idx_france_sessions_phone_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_sessions_phone_expires ON public.france_sessions USING btree (phone_whatsapp, expires_at);


--
-- Name: idx_france_sessions_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_sessions_token ON public.france_auth_sessions USING btree (session_token);


--
-- Name: idx_france_sessions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_sessions_user ON public.france_auth_sessions USING btree (user_id, user_type);


--
-- Name: idx_france_variants_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_france_variants_product ON public.france_product_variants USING btree (product_id);


--
-- Name: idx_france_workflow_templates_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_france_workflow_templates_unique ON public.france_workflow_templates USING btree (COALESCE(restaurant_id, 0), template_name);


--
-- Name: idx_menu_ai_scripts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_ai_scripts_created_at ON public.menu_ai_scripts USING btree (created_at DESC);


--
-- Name: idx_menu_ai_scripts_dev_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_ai_scripts_dev_status ON public.menu_ai_scripts USING btree (dev_status);


--
-- Name: idx_menu_ai_scripts_prod_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_ai_scripts_prod_status ON public.menu_ai_scripts USING btree (prod_status);


--
-- Name: idx_message_templates_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_templates_restaurant_id ON public.message_templates USING btree (restaurant_id);


--
-- Name: idx_products_workflow; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_workflow ON public.france_products USING btree (workflow_type, requires_steps) WHERE (workflow_type IS NOT NULL);


--
-- Name: idx_restaurant_bot_configs_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_bot_configs_restaurant_id ON public.restaurant_bot_configs USING btree (restaurant_id);


--
-- Name: idx_restaurant_features_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_features_lookup ON public.france_restaurant_features USING btree (restaurant_id, feature_type, is_enabled);


--
-- Name: idx_restaurant_service_modes_enabled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_service_modes_enabled ON public.france_restaurant_service_modes USING btree (restaurant_id, is_enabled);


--
-- Name: idx_restaurant_service_modes_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_service_modes_restaurant_id ON public.france_restaurant_service_modes USING btree (restaurant_id);


--
-- Name: idx_user_sessions_workflow_state; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_workflow_state ON public.france_user_sessions USING btree (current_step_id) WHERE (current_step_id IS NOT NULL);


--
-- Name: idx_vitrine_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vitrine_active ON public.restaurant_vitrine_settings USING btree (is_active);


--
-- Name: idx_vitrine_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vitrine_restaurant ON public.restaurant_vitrine_settings USING btree (restaurant_id);


--
-- Name: idx_vitrine_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vitrine_slug ON public.restaurant_vitrine_settings USING btree (slug);


--
-- Name: idx_workflow_definitions_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_definitions_restaurant_id ON public.workflow_definitions USING btree (restaurant_id);


--
-- Name: idx_workflow_steps_workflow_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_steps_workflow_id ON public.workflow_steps USING btree (workflow_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: france_delivery_drivers trigger_update_driver_location; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_driver_location BEFORE UPDATE OF current_latitude, current_longitude ON public.france_delivery_drivers FOR EACH ROW EXECUTE FUNCTION public.update_driver_location_timestamp();


--
-- Name: france_customer_addresses trigger_update_france_customer_addresses_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_france_customer_addresses_updated_at BEFORE UPDATE ON public.france_customer_addresses FOR EACH ROW EXECUTE FUNCTION public.update_france_customer_addresses_updated_at();


--
-- Name: delivery_tokens update_delivery_tokens_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_delivery_tokens_updated_at BEFORE UPDATE ON public.delivery_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: france_delivery_drivers update_france_drivers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_france_drivers_updated_at BEFORE UPDATE ON public.france_delivery_drivers FOR EACH ROW EXECUTE FUNCTION public.update_france_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: delivery_driver_actions delivery_driver_actions_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_driver_actions
    ADD CONSTRAINT delivery_driver_actions_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE CASCADE;


--
-- Name: delivery_driver_actions delivery_driver_actions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_driver_actions
    ADD CONSTRAINT delivery_driver_actions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id) ON DELETE CASCADE;


--
-- Name: delivery_driver_actions delivery_driver_actions_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_driver_actions
    ADD CONSTRAINT delivery_driver_actions_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.delivery_tokens(id) ON DELETE SET NULL;


--
-- Name: delivery_order_logs delivery_order_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_order_logs
    ADD CONSTRAINT delivery_order_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id) ON DELETE CASCADE;


--
-- Name: delivery_refusals delivery_refusals_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_refusals
    ADD CONSTRAINT delivery_refusals_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE CASCADE;


--
-- Name: delivery_refusals delivery_refusals_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_refusals
    ADD CONSTRAINT delivery_refusals_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id) ON DELETE CASCADE;


--
-- Name: delivery_refusals delivery_refusals_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_refusals
    ADD CONSTRAINT delivery_refusals_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.delivery_tokens(id) ON DELETE SET NULL;


--
-- Name: delivery_tokens delivery_tokens_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_tokens
    ADD CONSTRAINT delivery_tokens_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE CASCADE;


--
-- Name: delivery_tokens delivery_tokens_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_tokens
    ADD CONSTRAINT delivery_tokens_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id) ON DELETE CASCADE;


--
-- Name: france_composite_items france_composite_items_composite_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_composite_items
    ADD CONSTRAINT france_composite_items_composite_product_id_fkey FOREIGN KEY (composite_product_id) REFERENCES public.france_products(id) ON DELETE CASCADE;


--
-- Name: france_delivery_assignments france_delivery_assignments_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_assignments
    ADD CONSTRAINT france_delivery_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE CASCADE;


--
-- Name: france_delivery_assignments france_delivery_assignments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_assignments
    ADD CONSTRAINT france_delivery_assignments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id) ON DELETE CASCADE;


--
-- Name: france_delivery_drivers france_delivery_drivers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_drivers
    ADD CONSTRAINT france_delivery_drivers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id) ON DELETE CASCADE;


--
-- Name: france_delivery_notifications france_delivery_notifications_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_delivery_notifications
    ADD CONSTRAINT france_delivery_notifications_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.france_delivery_assignments(id) ON DELETE CASCADE;


--
-- Name: france_driver_locations france_driver_locations_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_driver_locations
    ADD CONSTRAINT france_driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE CASCADE;


--
-- Name: france_menu_categories france_menu_categories_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_menu_categories
    ADD CONSTRAINT france_menu_categories_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id) ON DELETE CASCADE;


--
-- Name: france_orders france_orders_delivery_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_orders
    ADD CONSTRAINT france_orders_delivery_address_id_fkey FOREIGN KEY (delivery_address_id) REFERENCES public.france_customer_addresses(id);


--
-- Name: france_orders france_orders_driver_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_orders
    ADD CONSTRAINT france_orders_driver_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id) ON DELETE SET NULL;


--
-- Name: france_orders france_orders_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_orders
    ADD CONSTRAINT france_orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- Name: france_pizza_display_settings france_pizza_display_settings_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_pizza_display_settings
    ADD CONSTRAINT france_pizza_display_settings_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- Name: france_product_options france_product_options_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_options
    ADD CONSTRAINT france_product_options_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id) ON DELETE CASCADE;


--
-- Name: france_product_sizes france_product_sizes_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_sizes
    ADD CONSTRAINT france_product_sizes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id) ON DELETE CASCADE;


--
-- Name: france_product_variants france_product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_product_variants
    ADD CONSTRAINT france_product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id) ON DELETE CASCADE;


--
-- Name: france_products france_products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_products
    ADD CONSTRAINT france_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.france_menu_categories(id) ON DELETE CASCADE;


--
-- Name: france_products france_products_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_products
    ADD CONSTRAINT france_products_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id) ON DELETE CASCADE;


--
-- Name: france_restaurant_features france_restaurant_features_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_restaurant_features
    ADD CONSTRAINT france_restaurant_features_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- Name: france_restaurant_service_modes france_restaurant_service_modes_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_restaurant_service_modes
    ADD CONSTRAINT france_restaurant_service_modes_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- Name: france_whatsapp_numbers france_whatsapp_numbers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.france_whatsapp_numbers
    ADD CONSTRAINT france_whatsapp_numbers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id) ON DELETE CASCADE;


--
-- Name: message_templates message_templates_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- Name: restaurant_bot_configs restaurant_bot_configs_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_bot_configs
    ADD CONSTRAINT restaurant_bot_configs_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- Name: restaurant_vitrine_settings restaurant_vitrine_settings_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_vitrine_settings
    ADD CONSTRAINT restaurant_vitrine_settings_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- Name: workflow_definitions workflow_definitions_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT workflow_definitions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id);


--
-- Name: workflow_steps workflow_steps_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflow_definitions(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION accept_order_atomic(p_token character varying, p_order_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.accept_order_atomic(p_token character varying, p_order_id integer) TO anon;
GRANT ALL ON FUNCTION public.accept_order_atomic(p_token character varying, p_order_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.accept_order_atomic(p_token character varying, p_order_id integer) TO service_role;


--
-- Name: FUNCTION apply_composite_config(category_name text, include_drinks boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.apply_composite_config(category_name text, include_drinks boolean) TO anon;
GRANT ALL ON FUNCTION public.apply_composite_config(category_name text, include_drinks boolean) TO authenticated;
GRANT ALL ON FUNCTION public.apply_composite_config(category_name text, include_drinks boolean) TO service_role;


--
-- Name: FUNCTION apply_simple_config(category_name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.apply_simple_config(category_name text) TO anon;
GRANT ALL ON FUNCTION public.apply_simple_config(category_name text) TO authenticated;
GRANT ALL ON FUNCTION public.apply_simple_config(category_name text) TO service_role;


--
-- Name: FUNCTION auto_add_drink_to_workflows_production(drink_product_id integer, drink_name text, variant_size text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.auto_add_drink_to_workflows_production(drink_product_id integer, drink_name text, variant_size text) TO anon;
GRANT ALL ON FUNCTION public.auto_add_drink_to_workflows_production(drink_product_id integer, drink_name text, variant_size text) TO authenticated;
GRANT ALL ON FUNCTION public.auto_add_drink_to_workflows_production(drink_product_id integer, drink_name text, variant_size text) TO service_role;


--
-- Name: FUNCTION auto_add_drink_to_workflows_v2(drink_product_id integer, drink_name text, variant_size text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.auto_add_drink_to_workflows_v2(drink_product_id integer, drink_name text, variant_size text) TO anon;
GRANT ALL ON FUNCTION public.auto_add_drink_to_workflows_v2(drink_product_id integer, drink_name text, variant_size text) TO authenticated;
GRANT ALL ON FUNCTION public.auto_add_drink_to_workflows_v2(drink_product_id integer, drink_name text, variant_size text) TO service_role;


--
-- Name: FUNCTION calculate_distance_km(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_distance_km(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric) TO anon;
GRANT ALL ON FUNCTION public.calculate_distance_km(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_distance_km(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric) TO service_role;


--
-- Name: FUNCTION cleanup_expired_assignments(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cleanup_expired_assignments() TO anon;
GRANT ALL ON FUNCTION public.cleanup_expired_assignments() TO authenticated;
GRANT ALL ON FUNCTION public.cleanup_expired_assignments() TO service_role;


--
-- Name: FUNCTION cleanup_expired_tokens(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cleanup_expired_tokens() TO anon;
GRANT ALL ON FUNCTION public.cleanup_expired_tokens() TO authenticated;
GRANT ALL ON FUNCTION public.cleanup_expired_tokens() TO service_role;


--
-- Name: FUNCTION configure_category_workflow(category_name text, config_type text, include_drinks boolean, force_execution boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.configure_category_workflow(category_name text, config_type text, include_drinks boolean, force_execution boolean) TO anon;
GRANT ALL ON FUNCTION public.configure_category_workflow(category_name text, config_type text, include_drinks boolean, force_execution boolean) TO authenticated;
GRANT ALL ON FUNCTION public.configure_category_workflow(category_name text, config_type text, include_drinks boolean, force_execution boolean) TO service_role;


--
-- Name: FUNCTION configure_category_workflow(category_name text, config_type text, source_category text, force_execution boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.configure_category_workflow(category_name text, config_type text, source_category text, force_execution boolean) TO anon;
GRANT ALL ON FUNCTION public.configure_category_workflow(category_name text, config_type text, source_category text, force_execution boolean) TO authenticated;
GRANT ALL ON FUNCTION public.configure_category_workflow(category_name text, config_type text, source_category text, force_execution boolean) TO service_role;


--
-- Name: FUNCTION copy_working_config(source_category text, target_category text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.copy_working_config(source_category text, target_category text) TO anon;
GRANT ALL ON FUNCTION public.copy_working_config(source_category text, target_category text) TO authenticated;
GRANT ALL ON FUNCTION public.copy_working_config(source_category text, target_category text) TO service_role;


--
-- Name: FUNCTION execute_sql(sql_query text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.execute_sql(sql_query text) TO anon;
GRANT ALL ON FUNCTION public.execute_sql(sql_query text) TO authenticated;
GRANT ALL ON FUNCTION public.execute_sql(sql_query text) TO service_role;


--
-- Name: FUNCTION fix_category_configuration(category_name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fix_category_configuration(category_name text) TO anon;
GRANT ALL ON FUNCTION public.fix_category_configuration(category_name text) TO authenticated;
GRANT ALL ON FUNCTION public.fix_category_configuration(category_name text) TO service_role;


--
-- Name: FUNCTION fn_get_product_by_categorie(p_category_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_get_product_by_categorie(p_category_id integer) TO anon;
GRANT ALL ON FUNCTION public.fn_get_product_by_categorie(p_category_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.fn_get_product_by_categorie(p_category_id integer) TO service_role;


--
-- Name: FUNCTION fn_get_product_by_categorie_detailed(p_category_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_get_product_by_categorie_detailed(p_category_id integer) TO anon;
GRANT ALL ON FUNCTION public.fn_get_product_by_categorie_detailed(p_category_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.fn_get_product_by_categorie_detailed(p_category_id integer) TO service_role;


--
-- Name: FUNCTION force_release_order(p_order_id integer, p_restaurant_id integer, p_reason text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.force_release_order(p_order_id integer, p_restaurant_id integer, p_reason text) TO anon;
GRANT ALL ON FUNCTION public.force_release_order(p_order_id integer, p_restaurant_id integer, p_reason text) TO authenticated;
GRANT ALL ON FUNCTION public.force_release_order(p_order_id integer, p_restaurant_id integer, p_reason text) TO service_role;


--
-- Name: FUNCTION get_order_delivery_stats(p_order_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_order_delivery_stats(p_order_id integer) TO anon;
GRANT ALL ON FUNCTION public.get_order_delivery_stats(p_order_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_order_delivery_stats(p_order_id integer) TO service_role;


--
-- Name: FUNCTION load_orders_with_assignment_state(p_restaurant_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.load_orders_with_assignment_state(p_restaurant_id integer) TO anon;
GRANT ALL ON FUNCTION public.load_orders_with_assignment_state(p_restaurant_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.load_orders_with_assignment_state(p_restaurant_id integer) TO service_role;


--
-- Name: FUNCTION trigger_auto_add_drink_production(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_auto_add_drink_production() TO anon;
GRANT ALL ON FUNCTION public.trigger_auto_add_drink_production() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_auto_add_drink_production() TO service_role;


--
-- Name: FUNCTION update_composite_items(p_product_id integer, p_items jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_composite_items(p_product_id integer, p_items jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_composite_items(p_product_id integer, p_items jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_composite_items(p_product_id integer, p_items jsonb) TO service_role;


--
-- Name: FUNCTION update_driver_location_timestamp(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_driver_location_timestamp() TO anon;
GRANT ALL ON FUNCTION public.update_driver_location_timestamp() TO authenticated;
GRANT ALL ON FUNCTION public.update_driver_location_timestamp() TO service_role;


--
-- Name: FUNCTION update_france_customer_addresses_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_france_customer_addresses_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_france_customer_addresses_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_france_customer_addresses_updated_at() TO service_role;


--
-- Name: FUNCTION update_france_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_france_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_france_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_france_updated_at_column() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE automation_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.automation_logs TO anon;
GRANT ALL ON TABLE public.automation_logs TO authenticated;
GRANT ALL ON TABLE public.automation_logs TO service_role;


--
-- Name: SEQUENCE automation_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.automation_logs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.automation_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.automation_logs_id_seq TO service_role;


--
-- Name: TABLE delivery_driver_actions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.delivery_driver_actions TO anon;
GRANT ALL ON TABLE public.delivery_driver_actions TO authenticated;
GRANT ALL ON TABLE public.delivery_driver_actions TO service_role;


--
-- Name: SEQUENCE delivery_driver_actions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.delivery_driver_actions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.delivery_driver_actions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.delivery_driver_actions_id_seq TO service_role;


--
-- Name: TABLE delivery_order_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.delivery_order_logs TO anon;
GRANT ALL ON TABLE public.delivery_order_logs TO authenticated;
GRANT ALL ON TABLE public.delivery_order_logs TO service_role;


--
-- Name: SEQUENCE delivery_order_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.delivery_order_logs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.delivery_order_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.delivery_order_logs_id_seq TO service_role;


--
-- Name: TABLE delivery_refusals; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.delivery_refusals TO anon;
GRANT ALL ON TABLE public.delivery_refusals TO authenticated;
GRANT ALL ON TABLE public.delivery_refusals TO service_role;


--
-- Name: SEQUENCE delivery_refusals_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.delivery_refusals_id_seq TO anon;
GRANT ALL ON SEQUENCE public.delivery_refusals_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.delivery_refusals_id_seq TO service_role;


--
-- Name: TABLE delivery_tokens; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.delivery_tokens TO anon;
GRANT ALL ON TABLE public.delivery_tokens TO authenticated;
GRANT ALL ON TABLE public.delivery_tokens TO service_role;


--
-- Name: SEQUENCE delivery_tokens_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.delivery_tokens_id_seq TO anon;
GRANT ALL ON SEQUENCE public.delivery_tokens_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.delivery_tokens_id_seq TO service_role;


--
-- Name: TABLE france_delivery_assignments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_delivery_assignments TO anon;
GRANT ALL ON TABLE public.france_delivery_assignments TO authenticated;
GRANT ALL ON TABLE public.france_delivery_assignments TO service_role;


--
-- Name: TABLE france_delivery_drivers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_delivery_drivers TO anon;
GRANT ALL ON TABLE public.france_delivery_drivers TO authenticated;
GRANT ALL ON TABLE public.france_delivery_drivers TO service_role;


--
-- Name: TABLE france_orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_orders TO anon;
GRANT ALL ON TABLE public.france_orders TO authenticated;
GRANT ALL ON TABLE public.france_orders TO service_role;


--
-- Name: TABLE france_restaurants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_restaurants TO anon;
GRANT ALL ON TABLE public.france_restaurants TO authenticated;
GRANT ALL ON TABLE public.france_restaurants TO service_role;


--
-- Name: TABLE france_active_assignments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_active_assignments TO anon;
GRANT ALL ON TABLE public.france_active_assignments TO authenticated;
GRANT ALL ON TABLE public.france_active_assignments TO service_role;


--
-- Name: TABLE france_auth_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_auth_sessions TO anon;
GRANT ALL ON TABLE public.france_auth_sessions TO authenticated;
GRANT ALL ON TABLE public.france_auth_sessions TO service_role;


--
-- Name: SEQUENCE france_auth_sessions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_auth_sessions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_auth_sessions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_auth_sessions_id_seq TO service_role;


--
-- Name: TABLE france_available_drivers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_available_drivers TO anon;
GRANT ALL ON TABLE public.france_available_drivers TO authenticated;
GRANT ALL ON TABLE public.france_available_drivers TO service_role;


--
-- Name: TABLE france_composite_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_composite_items TO anon;
GRANT ALL ON TABLE public.france_composite_items TO authenticated;
GRANT ALL ON TABLE public.france_composite_items TO service_role;


--
-- Name: SEQUENCE france_composite_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_composite_items_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_composite_items_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_composite_items_id_seq TO service_role;


--
-- Name: TABLE france_customer_addresses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_customer_addresses TO anon;
GRANT ALL ON TABLE public.france_customer_addresses TO authenticated;
GRANT ALL ON TABLE public.france_customer_addresses TO service_role;


--
-- Name: SEQUENCE france_customer_addresses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_customer_addresses_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_customer_addresses_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_customer_addresses_id_seq TO service_role;


--
-- Name: SEQUENCE france_delivery_assignments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_delivery_assignments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_delivery_assignments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_delivery_assignments_id_seq TO service_role;


--
-- Name: SEQUENCE france_delivery_drivers_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_delivery_drivers_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_delivery_drivers_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_delivery_drivers_id_seq TO service_role;


--
-- Name: TABLE france_delivery_notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_delivery_notifications TO anon;
GRANT ALL ON TABLE public.france_delivery_notifications TO authenticated;
GRANT ALL ON TABLE public.france_delivery_notifications TO service_role;


--
-- Name: SEQUENCE france_delivery_notifications_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_delivery_notifications_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_delivery_notifications_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_delivery_notifications_id_seq TO service_role;


--
-- Name: TABLE france_driver_locations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_driver_locations TO anon;
GRANT ALL ON TABLE public.france_driver_locations TO authenticated;
GRANT ALL ON TABLE public.france_driver_locations TO service_role;


--
-- Name: SEQUENCE france_driver_locations_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_driver_locations_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_driver_locations_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_driver_locations_id_seq TO service_role;


--
-- Name: TABLE france_icons; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_icons TO anon;
GRANT ALL ON TABLE public.france_icons TO authenticated;
GRANT ALL ON TABLE public.france_icons TO service_role;


--
-- Name: SEQUENCE france_icons_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_icons_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_icons_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_icons_id_seq TO service_role;


--
-- Name: TABLE france_menu_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_menu_categories TO anon;
GRANT ALL ON TABLE public.france_menu_categories TO authenticated;
GRANT ALL ON TABLE public.france_menu_categories TO service_role;


--
-- Name: SEQUENCE france_menu_categories_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_menu_categories_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_menu_categories_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_menu_categories_id_seq TO service_role;


--
-- Name: SEQUENCE france_orders_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_orders_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_orders_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_orders_id_seq TO service_role;


--
-- Name: TABLE france_pizza_display_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_pizza_display_settings TO anon;
GRANT ALL ON TABLE public.france_pizza_display_settings TO authenticated;
GRANT ALL ON TABLE public.france_pizza_display_settings TO service_role;


--
-- Name: SEQUENCE france_pizza_display_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_pizza_display_settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_pizza_display_settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_pizza_display_settings_id_seq TO service_role;


--
-- Name: TABLE france_product_display_configs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_product_display_configs TO anon;
GRANT ALL ON TABLE public.france_product_display_configs TO authenticated;
GRANT ALL ON TABLE public.france_product_display_configs TO service_role;


--
-- Name: SEQUENCE france_product_display_configs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_product_display_configs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_product_display_configs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_product_display_configs_id_seq TO service_role;


--
-- Name: TABLE france_product_options; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_product_options TO anon;
GRANT ALL ON TABLE public.france_product_options TO authenticated;
GRANT ALL ON TABLE public.france_product_options TO service_role;


--
-- Name: SEQUENCE france_product_options_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_product_options_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_product_options_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_product_options_id_seq TO service_role;


--
-- Name: TABLE france_product_sizes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_product_sizes TO anon;
GRANT ALL ON TABLE public.france_product_sizes TO authenticated;
GRANT ALL ON TABLE public.france_product_sizes TO service_role;


--
-- Name: SEQUENCE france_product_sizes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_product_sizes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_product_sizes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_product_sizes_id_seq TO service_role;


--
-- Name: TABLE france_product_variants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_product_variants TO anon;
GRANT ALL ON TABLE public.france_product_variants TO authenticated;
GRANT ALL ON TABLE public.france_product_variants TO service_role;


--
-- Name: SEQUENCE france_product_variants_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_product_variants_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_product_variants_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_product_variants_id_seq TO service_role;


--
-- Name: TABLE france_products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_products TO anon;
GRANT ALL ON TABLE public.france_products TO authenticated;
GRANT ALL ON TABLE public.france_products TO service_role;


--
-- Name: SEQUENCE france_products_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_products_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_products_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_products_id_seq TO service_role;


--
-- Name: TABLE france_restaurant_features; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_restaurant_features TO anon;
GRANT ALL ON TABLE public.france_restaurant_features TO authenticated;
GRANT ALL ON TABLE public.france_restaurant_features TO service_role;


--
-- Name: SEQUENCE france_restaurant_features_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_restaurant_features_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_restaurant_features_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_restaurant_features_id_seq TO service_role;


--
-- Name: TABLE france_restaurant_service_modes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_restaurant_service_modes TO anon;
GRANT ALL ON TABLE public.france_restaurant_service_modes TO authenticated;
GRANT ALL ON TABLE public.france_restaurant_service_modes TO service_role;


--
-- Name: SEQUENCE france_restaurant_service_modes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_restaurant_service_modes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_restaurant_service_modes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_restaurant_service_modes_id_seq TO service_role;


--
-- Name: SEQUENCE france_restaurants_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_restaurants_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_restaurants_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_restaurants_id_seq TO service_role;


--
-- Name: TABLE france_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_sessions TO anon;
GRANT ALL ON TABLE public.france_sessions TO authenticated;
GRANT ALL ON TABLE public.france_sessions TO service_role;


--
-- Name: TABLE france_user_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_user_sessions TO anon;
GRANT ALL ON TABLE public.france_user_sessions TO authenticated;
GRANT ALL ON TABLE public.france_user_sessions TO service_role;


--
-- Name: SEQUENCE france_user_sessions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_user_sessions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_user_sessions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_user_sessions_id_seq TO service_role;


--
-- Name: TABLE france_whatsapp_numbers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_whatsapp_numbers TO anon;
GRANT ALL ON TABLE public.france_whatsapp_numbers TO authenticated;
GRANT ALL ON TABLE public.france_whatsapp_numbers TO service_role;


--
-- Name: SEQUENCE france_whatsapp_numbers_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_whatsapp_numbers_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_whatsapp_numbers_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_whatsapp_numbers_id_seq TO service_role;


--
-- Name: TABLE france_workflow_templates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.france_workflow_templates TO anon;
GRANT ALL ON TABLE public.france_workflow_templates TO authenticated;
GRANT ALL ON TABLE public.france_workflow_templates TO service_role;


--
-- Name: SEQUENCE france_workflow_templates_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.france_workflow_templates_id_seq TO anon;
GRANT ALL ON SEQUENCE public.france_workflow_templates_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.france_workflow_templates_id_seq TO service_role;


--
-- Name: TABLE menu_ai_scripts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_ai_scripts TO anon;
GRANT ALL ON TABLE public.menu_ai_scripts TO authenticated;
GRANT ALL ON TABLE public.menu_ai_scripts TO service_role;


--
-- Name: SEQUENCE menu_ai_scripts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.menu_ai_scripts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.menu_ai_scripts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.menu_ai_scripts_id_seq TO service_role;


--
-- Name: TABLE message_templates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.message_templates TO anon;
GRANT ALL ON TABLE public.message_templates TO authenticated;
GRANT ALL ON TABLE public.message_templates TO service_role;


--
-- Name: SEQUENCE message_templates_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.message_templates_id_seq TO anon;
GRANT ALL ON SEQUENCE public.message_templates_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.message_templates_id_seq TO service_role;


--
-- Name: TABLE restaurant_bot_configs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_bot_configs TO anon;
GRANT ALL ON TABLE public.restaurant_bot_configs TO authenticated;
GRANT ALL ON TABLE public.restaurant_bot_configs TO service_role;


--
-- Name: SEQUENCE restaurant_bot_configs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.restaurant_bot_configs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.restaurant_bot_configs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.restaurant_bot_configs_id_seq TO service_role;


--
-- Name: TABLE restaurant_vitrine_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_vitrine_settings TO anon;
GRANT ALL ON TABLE public.restaurant_vitrine_settings TO authenticated;
GRANT ALL ON TABLE public.restaurant_vitrine_settings TO service_role;


--
-- Name: SEQUENCE restaurant_vitrine_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.restaurant_vitrine_settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.restaurant_vitrine_settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.restaurant_vitrine_settings_id_seq TO service_role;


--
-- Name: TABLE state_transitions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.state_transitions TO anon;
GRANT ALL ON TABLE public.state_transitions TO authenticated;
GRANT ALL ON TABLE public.state_transitions TO service_role;


--
-- Name: SEQUENCE state_transitions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.state_transitions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.state_transitions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.state_transitions_id_seq TO service_role;


--
-- Name: TABLE step_executor_mappings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.step_executor_mappings TO anon;
GRANT ALL ON TABLE public.step_executor_mappings TO authenticated;
GRANT ALL ON TABLE public.step_executor_mappings TO service_role;


--
-- Name: SEQUENCE step_executor_mappings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.step_executor_mappings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.step_executor_mappings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.step_executor_mappings_id_seq TO service_role;


--
-- Name: TABLE tacos_backup_20250125; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tacos_backup_20250125 TO anon;
GRANT ALL ON TABLE public.tacos_backup_20250125 TO authenticated;
GRANT ALL ON TABLE public.tacos_backup_20250125 TO service_role;


--
-- Name: TABLE tacos_rollback_backup; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tacos_rollback_backup TO anon;
GRANT ALL ON TABLE public.tacos_rollback_backup TO authenticated;
GRANT ALL ON TABLE public.tacos_rollback_backup TO service_role;


--
-- Name: TABLE v_restaurant_available_modes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_restaurant_available_modes TO anon;
GRANT ALL ON TABLE public.v_restaurant_available_modes TO authenticated;
GRANT ALL ON TABLE public.v_restaurant_available_modes TO service_role;


--
-- Name: TABLE v_restaurant_pizza_display_config; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_restaurant_pizza_display_config TO anon;
GRANT ALL ON TABLE public.v_restaurant_pizza_display_config TO authenticated;
GRANT ALL ON TABLE public.v_restaurant_pizza_display_config TO service_role;


--
-- Name: TABLE workflow_definitions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workflow_definitions TO anon;
GRANT ALL ON TABLE public.workflow_definitions TO authenticated;
GRANT ALL ON TABLE public.workflow_definitions TO service_role;


--
-- Name: SEQUENCE workflow_definitions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.workflow_definitions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.workflow_definitions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.workflow_definitions_id_seq TO service_role;


--
-- Name: TABLE workflow_steps; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workflow_steps TO anon;
GRANT ALL ON TABLE public.workflow_steps TO authenticated;
GRANT ALL ON TABLE public.workflow_steps TO service_role;


--
-- Name: SEQUENCE workflow_steps_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.workflow_steps_id_seq TO anon;
GRANT ALL ON SEQUENCE public.workflow_steps_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.workflow_steps_id_seq TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

