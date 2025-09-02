-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.france_auth_sessions (
  id bigint NOT NULL DEFAULT nextval('france_auth_sessions_id_seq'::regclass),
  user_id integer NOT NULL,
  user_type character varying NOT NULL CHECK (user_type::text = ANY (ARRAY['restaurant'::character varying, 'driver'::character varying]::text[])),
  session_token character varying NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_accessed timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  CONSTRAINT france_auth_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.france_composite_items (
  id integer NOT NULL DEFAULT nextval('france_composite_items_id_seq'::regclass),
  composite_product_id integer,
  component_name character varying NOT NULL,
  quantity integer NOT NULL,
  unit character varying DEFAULT 'pièces'::character varying,
  CONSTRAINT france_composite_items_pkey PRIMARY KEY (id),
  CONSTRAINT france_composite_items_composite_product_id_fkey FOREIGN KEY (composite_product_id) REFERENCES public.france_products(id)
);
CREATE TABLE public.france_customer_addresses (
  id bigint NOT NULL DEFAULT nextval('france_customer_addresses_id_seq'::regclass),
  phone_number character varying NOT NULL,
  address_label character varying NOT NULL,
  full_address text NOT NULL,
  google_place_id character varying,
  latitude numeric,
  longitude numeric,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT france_customer_addresses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.france_delivery_drivers (
  id bigint NOT NULL DEFAULT nextval('france_delivery_drivers_id_seq'::regclass),
  restaurant_id integer NOT NULL,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  phone_number character varying NOT NULL UNIQUE CHECK (phone_number::text ~ '^33[67][0-9]{8}$'::text),
  email character varying,
  password_hash character varying NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT france_delivery_drivers_pkey PRIMARY KEY (id),
  CONSTRAINT france_delivery_drivers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.france_menu_categories (
  id integer NOT NULL DEFAULT nextval('france_menu_categories_id_seq'::regclass),
  restaurant_id integer,
  name character varying NOT NULL,
  slug character varying NOT NULL,
  icon character varying DEFAULT '🍽️'::character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT france_menu_categories_pkey PRIMARY KEY (id),
  CONSTRAINT france_menu_categories_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.france_orders (
  id integer NOT NULL DEFAULT nextval('france_orders_id_seq'::regclass),
  restaurant_id integer,
  phone_number character varying NOT NULL,
  customer_name character varying,
  items jsonb NOT NULL,
  total_amount numeric NOT NULL,
  delivery_mode character varying,
  delivery_address text,
  payment_mode character varying,
  payment_method character varying,
  status character varying DEFAULT 'en_attente'::character varying,
  notes text,
  order_number character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  delivery_address_id bigint,
  delivery_validation_code character varying DEFAULT NULL::character varying,
  date_validation_code timestamp with time zone,
  driver_id integer,
  estimated_delivery_time timestamp with time zone,
  CONSTRAINT france_orders_pkey PRIMARY KEY (id),
  CONSTRAINT france_orders_driver_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id),
  CONSTRAINT france_orders_delivery_address_id_fkey FOREIGN KEY (delivery_address_id) REFERENCES public.france_customer_addresses(id),
  CONSTRAINT france_orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.france_product_options (
  id integer NOT NULL DEFAULT nextval('france_product_options_id_seq'::regclass),
  product_id integer,
  option_group character varying NOT NULL,
  option_name character varying NOT NULL,
  price_modifier numeric DEFAULT 0,
  is_required boolean DEFAULT false,
  max_selections integer DEFAULT 1,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  group_order integer DEFAULT 0,
  CONSTRAINT france_product_options_pkey PRIMARY KEY (id),
  CONSTRAINT france_product_options_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id)
);
CREATE TABLE public.france_product_sizes (
  id integer NOT NULL DEFAULT nextval('france_product_sizes_id_seq'::regclass),
  product_id integer,
  size_name character varying NOT NULL,
  price_on_site numeric NOT NULL,
  includes_drink boolean DEFAULT false,
  display_order integer DEFAULT 0,
  price_delivery numeric,
  CONSTRAINT france_product_sizes_pkey PRIMARY KEY (id),
  CONSTRAINT france_product_sizes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id)
);
CREATE TABLE public.france_product_variants (
  id integer NOT NULL DEFAULT nextval('france_product_variants_id_seq'::regclass),
  product_id integer,
  variant_name character varying NOT NULL,
  price_on_site numeric NOT NULL,
  quantity integer,
  unit character varying,
  is_menu boolean DEFAULT false,
  includes_description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  price_delivery numeric,
  CONSTRAINT france_product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT france_product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id)
);
CREATE TABLE public.france_products (
  id integer NOT NULL DEFAULT nextval('france_products_id_seq'::regclass),
  restaurant_id integer,
  category_id integer,
  name character varying NOT NULL,
  description text,
  product_type USER-DEFINED NOT NULL,
  base_price numeric,
  composition text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  price_on_site_base numeric,
  price_delivery_base numeric,
  CONSTRAINT france_products_pkey PRIMARY KEY (id),
  CONSTRAINT france_products_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id),
  CONSTRAINT france_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.france_menu_categories(id)
);
CREATE TABLE public.france_restaurants (
  id integer NOT NULL DEFAULT nextval('france_restaurants_id_seq'::regclass),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  address text,
  city character varying,
  postal_code character varying,
  phone character varying,
  whatsapp_number character varying NOT NULL,
  delivery_zone_km integer DEFAULT 5,
  min_order_amount numeric DEFAULT 0,
  delivery_fee numeric DEFAULT 2.50,
  is_active boolean DEFAULT true,
  business_hours jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  password_hash character varying NOT NULL,
  CONSTRAINT france_restaurants_pkey PRIMARY KEY (id)
);
CREATE TABLE public.france_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone_whatsapp character varying NOT NULL,
  state character varying DEFAULT 'INITIAL'::character varying,
  context jsonb DEFAULT '{}'::jsonb,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT france_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.france_user_sessions (
  id integer NOT NULL DEFAULT nextval('france_user_sessions_id_seq'::regclass),
  phone_number character varying NOT NULL UNIQUE,
  chat_id character varying NOT NULL,
  restaurant_id integer,
  current_step character varying,
  session_data jsonb DEFAULT '{}'::jsonb,
  cart_items jsonb DEFAULT '[]'::jsonb,
  total_amount numeric DEFAULT 0,
  expires_at timestamp without time zone DEFAULT (now() + '00:30:00'::interval),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT france_user_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT france_user_sessions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.france_whatsapp_numbers (
  id integer NOT NULL DEFAULT nextval('france_whatsapp_numbers_id_seq'::regclass),
  restaurant_id integer,
  whatsapp_number character varying NOT NULL,
  description character varying,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT france_whatsapp_numbers_pkey PRIMARY KEY (id),
  CONSTRAINT france_whatsapp_numbers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);