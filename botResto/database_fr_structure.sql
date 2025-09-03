-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.france_auth_sessions (
  user_id integer NOT NULL,
  user_type character varying NOT NULL CHECK (user_type::text = ANY (ARRAY['restaurant'::character varying, 'driver'::character varying]::text[])),
  session_token character varying NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  ip_address inet,
  user_agent text,
  id bigint NOT NULL DEFAULT nextval('france_auth_sessions_id_seq'::regclass),
  created_at timestamp with time zone DEFAULT now(),
  last_accessed timestamp with time zone DEFAULT now(),
  CONSTRAINT france_auth_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.france_composite_items (
  composite_product_id integer,
  component_name character varying NOT NULL,
  quantity integer NOT NULL,
  id integer NOT NULL DEFAULT nextval('france_composite_items_id_seq'::regclass),
  unit character varying DEFAULT 'pièces'::character varying,
  CONSTRAINT france_composite_items_pkey PRIMARY KEY (id),
  CONSTRAINT france_composite_items_composite_product_id_fkey FOREIGN KEY (composite_product_id) REFERENCES public.france_products(id)
);
CREATE TABLE public.france_customer_addresses (
  phone_number character varying NOT NULL,
  address_label character varying NOT NULL,
  full_address text NOT NULL,
  google_place_id character varying,
  latitude numeric,
  longitude numeric,
  id bigint NOT NULL DEFAULT nextval('france_customer_addresses_id_seq'::regclass),
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT france_customer_addresses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.france_delivery_assignments (
  order_id integer NOT NULL,
  driver_id integer NOT NULL,
  responded_at timestamp with time zone,
  response_time_seconds integer,
  id integer NOT NULL DEFAULT nextval('france_delivery_assignments_id_seq'::regclass),
  assignment_status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (assignment_status::text = ANY (ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'expired'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT france_delivery_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT france_delivery_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id),
  CONSTRAINT france_delivery_assignments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id)
);
CREATE TABLE public.france_delivery_drivers (
  is_online boolean DEFAULT false,
  current_latitude numeric,
  current_longitude numeric,
  last_location_update timestamp with time zone DEFAULT now(),
  password character varying NOT NULL DEFAULT '000000'::character varying,
  restaurant_id integer NOT NULL,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  phone_number character varying NOT NULL UNIQUE CHECK (phone_number::text ~ '^0[67][0-9]{8}$'::text),
  email character varying,
  id bigint NOT NULL DEFAULT nextval('france_delivery_drivers_id_seq'::regclass),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT france_delivery_drivers_pkey PRIMARY KEY (id),
  CONSTRAINT france_delivery_drivers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.france_delivery_notifications (
  assignment_id integer NOT NULL,
  notification_type character varying NOT NULL CHECK (notification_type::text = ANY (ARRAY['assignment_offer'::character varying, 'assignment_accepted'::character varying, 'assignment_rejected'::character varying, 'delivery_started'::character varying, 'delivery_completed'::character varying]::text[])),
  recipient_type character varying NOT NULL CHECK (recipient_type::text = ANY (ARRAY['driver'::character varying, 'restaurant'::character varying, 'customer'::character varying]::text[])),
  recipient_id character varying NOT NULL,
  error_message text,
  id integer NOT NULL DEFAULT nextval('france_delivery_notifications_id_seq'::regclass),
  notification_data jsonb DEFAULT '{}'::jsonb,
  sent_at timestamp with time zone DEFAULT now(),
  delivery_status character varying DEFAULT 'pending'::character varying CHECK (delivery_status::text = ANY (ARRAY['pending'::character varying, 'sent'::character varying, 'delivered'::character varying, 'failed'::character varying]::text[])),
  CONSTRAINT france_delivery_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT france_delivery_notifications_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.france_delivery_assignments(id)
);
CREATE TABLE public.france_driver_locations (
  driver_id integer NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  accuracy_meters integer,
  id integer NOT NULL DEFAULT nextval('france_driver_locations_id_seq'::regclass),
  recorded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT france_driver_locations_pkey PRIMARY KEY (id),
  CONSTRAINT france_driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id)
);
CREATE TABLE public.france_menu_categories (
  restaurant_id integer,
  name character varying NOT NULL,
  slug character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('france_menu_categories_id_seq'::regclass),
  icon character varying DEFAULT '🍽️'::character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT france_menu_categories_pkey PRIMARY KEY (id),
  CONSTRAINT france_menu_categories_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.france_orders (
  driver_assignment_status character varying DEFAULT 'none'::character varying CHECK (driver_assignment_status::text = ANY (ARRAY['none'::character varying, 'searching'::character varying, 'assigned'::character varying, 'delivered'::character varying]::text[])),
  delivery_started_at timestamp with time zone,
  assignment_timeout_at timestamp with time zone,
  restaurant_id integer,
  phone_number character varying NOT NULL,
  customer_name character varying,
  items jsonb NOT NULL,
  total_amount numeric NOT NULL,
  delivery_mode character varying,
  delivery_address text,
  payment_mode character varying,
  payment_method character varying,
  notes text,
  order_number character varying,
  id integer NOT NULL DEFAULT nextval('france_orders_id_seq'::regclass),
  status character varying DEFAULT 'en_attente'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  delivery_address_id bigint,
  delivery_validation_code character varying DEFAULT NULL::character varying,
  date_validation_code timestamp with time zone,
  driver_id integer,
  estimated_delivery_time timestamp with time zone,
  CONSTRAINT france_orders_pkey PRIMARY KEY (id),
  CONSTRAINT france_orders_driver_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id),
  CONSTRAINT france_orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id),
  CONSTRAINT france_orders_delivery_address_id_fkey FOREIGN KEY (delivery_address_id) REFERENCES public.france_customer_addresses(id)
);
CREATE TABLE public.france_product_options (
  product_id integer,
  option_group character varying NOT NULL,
  option_name character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('france_product_options_id_seq'::regclass),
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
  product_id integer,
  size_name character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('france_product_sizes_id_seq'::regclass),
  includes_drink boolean DEFAULT false,
  display_order integer DEFAULT 0,
  price_on_site numeric NOT NULL,
  price_delivery numeric,
  CONSTRAINT france_product_sizes_pkey PRIMARY KEY (id),
  CONSTRAINT france_product_sizes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id)
);
CREATE TABLE public.france_product_variants (
  product_id integer,
  variant_name character varying NOT NULL,
  quantity integer,
  unit character varying,
  includes_description text,
  price_on_site numeric NOT NULL,
  id integer NOT NULL DEFAULT nextval('france_product_variants_id_seq'::regclass),
  is_menu boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  price_delivery numeric,
  CONSTRAINT france_product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT france_product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.france_products(id)
);
CREATE TABLE public.france_products (
  restaurant_id integer,
  category_id integer,
  name character varying NOT NULL,
  description text,
  product_type USER-DEFINED NOT NULL,
  base_price numeric,
  composition text,
  id integer NOT NULL DEFAULT nextval('france_products_id_seq'::regclass),
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
  delivery_zone_km integer DEFAULT 5,
  min_order_amount numeric DEFAULT 0,
  delivery_fee numeric DEFAULT 2.50,
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  address text,
  city character varying,
  postal_code character varying,
  phone character varying,
  whatsapp_number character varying NOT NULL,
  is_active boolean DEFAULT true,
  business_hours jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  password_hash character varying NOT NULL,
  CONSTRAINT france_restaurants_pkey PRIMARY KEY (id)
);
CREATE TABLE public.france_sessions (
  phone_whatsapp character varying NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  state character varying DEFAULT 'INITIAL'::character varying,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT france_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.france_user_sessions (
  phone_number character varying NOT NULL UNIQUE,
  chat_id character varying NOT NULL,
  restaurant_id integer,
  current_step character varying,
  id integer NOT NULL DEFAULT nextval('france_user_sessions_id_seq'::regclass),
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
  restaurant_id integer,
  whatsapp_number character varying NOT NULL,
  description character varying,
  id integer NOT NULL DEFAULT nextval('france_whatsapp_numbers_id_seq'::regclass),
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT france_whatsapp_numbers_pkey PRIMARY KEY (id),
  CONSTRAINT france_whatsapp_numbers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);