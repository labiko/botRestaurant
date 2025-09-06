-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.delivery_driver_actions (
  id integer NOT NULL DEFAULT nextval('delivery_driver_actions_id_seq'::regclass),
  order_id integer,
  driver_id integer,
  token_id integer,
  action_type character varying NOT NULL,
  action_timestamp timestamp without time zone DEFAULT now(),
  details jsonb,
  CONSTRAINT delivery_driver_actions_pkey PRIMARY KEY (id),
  CONSTRAINT delivery_driver_actions_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.delivery_tokens(id),
  CONSTRAINT delivery_driver_actions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  CONSTRAINT delivery_driver_actions_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id)
);
CREATE TABLE public.delivery_order_logs (
  id integer NOT NULL DEFAULT nextval('delivery_order_logs_id_seq'::regclass),
  order_id integer,
  action_type character varying NOT NULL,
  details text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT delivery_order_logs_pkey PRIMARY KEY (id),
  CONSTRAINT delivery_order_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id)
);
CREATE TABLE public.delivery_refusals (
  id integer NOT NULL DEFAULT nextval('delivery_refusals_id_seq'::regclass),
  order_id integer,
  driver_id integer,
  token_id integer,
  reason character varying,
  custom_reason text,
  refused_at timestamp without time zone DEFAULT now(),
  CONSTRAINT delivery_refusals_pkey PRIMARY KEY (id),
  CONSTRAINT delivery_refusals_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id),
  CONSTRAINT delivery_refusals_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  CONSTRAINT delivery_refusals_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.delivery_tokens(id)
);
CREATE TABLE public.delivery_tokens (
  id integer NOT NULL DEFAULT nextval('delivery_tokens_id_seq'::regclass),
  token character varying NOT NULL UNIQUE,
  order_id integer,
  driver_id integer,
  created_at timestamp without time zone DEFAULT now(),
  expires_at timestamp without time zone NOT NULL,
  absolute_expires_at timestamp without time zone NOT NULL,
  used boolean DEFAULT false,
  suspended boolean DEFAULT false,
  reactivated boolean DEFAULT false,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT delivery_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT delivery_tokens_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id),
  CONSTRAINT delivery_tokens_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id)
);
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
CREATE TABLE public.france_delivery_assignments (
  id integer NOT NULL DEFAULT nextval('france_delivery_assignments_id_seq'::regclass),
  order_id integer NOT NULL,
  driver_id integer NOT NULL,
  assignment_status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (assignment_status::text = ANY (ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'expired'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone,
  expires_at timestamp with time zone,
  response_time_seconds integer,
  CONSTRAINT france_delivery_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT france_delivery_assignments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  CONSTRAINT france_delivery_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id)
);
CREATE TABLE public.france_delivery_drivers (
  id bigint NOT NULL DEFAULT nextval('france_delivery_drivers_id_seq'::regclass),
  restaurant_id integer NOT NULL,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  phone_number character varying NOT NULL UNIQUE CHECK (phone_number::text ~ '^0[67][0-9]{8}$'::text),
  email character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_online boolean DEFAULT false,
  current_latitude numeric,
  current_longitude numeric,
  last_location_update timestamp with time zone DEFAULT now(),
  password character varying NOT NULL DEFAULT '000000'::character varying,
  CONSTRAINT france_delivery_drivers_pkey PRIMARY KEY (id),
  CONSTRAINT france_delivery_drivers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.france_delivery_notifications (
  id integer NOT NULL DEFAULT nextval('france_delivery_notifications_id_seq'::regclass),
  assignment_id integer NOT NULL,
  notification_type character varying NOT NULL CHECK (notification_type::text = ANY (ARRAY['assignment_offer'::character varying, 'assignment_accepted'::character varying, 'assignment_rejected'::character varying, 'delivery_started'::character varying, 'delivery_completed'::character varying]::text[])),
  recipient_type character varying NOT NULL CHECK (recipient_type::text = ANY (ARRAY['driver'::character varying, 'restaurant'::character varying, 'customer'::character varying]::text[])),
  recipient_id character varying NOT NULL,
  notification_data jsonb DEFAULT '{}'::jsonb,
  sent_at timestamp with time zone DEFAULT now(),
  delivery_status character varying DEFAULT 'pending'::character varying CHECK (delivery_status::text = ANY (ARRAY['pending'::character varying, 'sent'::character varying, 'delivered'::character varying, 'failed'::character varying]::text[])),
  error_message text,
  CONSTRAINT france_delivery_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT france_delivery_notifications_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.france_delivery_assignments(id)
);
CREATE TABLE public.france_driver_locations (
  id integer NOT NULL DEFAULT nextval('france_driver_locations_id_seq'::regclass),
  driver_id integer NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  accuracy_meters integer,
  recorded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT france_driver_locations_pkey PRIMARY KEY (id),
  CONSTRAINT france_driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id)
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
  driver_assignment_status character varying DEFAULT 'none'::character varying CHECK (driver_assignment_status::text = ANY (ARRAY['none'::character varying, 'searching'::character varying, 'assigned'::character varying, 'delivered'::character varying]::text[])),
  delivery_started_at timestamp with time zone,
  assignment_timeout_at timestamp with time zone,
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
  workflow_type character varying,
  requires_steps boolean DEFAULT false,
  steps_config json,
  CONSTRAINT france_products_pkey PRIMARY KEY (id),
  CONSTRAINT france_products_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id),
  CONSTRAINT france_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.france_menu_categories(id)
);
CREATE TABLE public.france_restaurant_features (
  id integer NOT NULL DEFAULT nextval('france_restaurant_features_id_seq'::regclass),
  restaurant_id integer,
  feature_type character varying NOT NULL,
  is_enabled boolean DEFAULT true,
  config json,
  CONSTRAINT france_restaurant_features_pkey PRIMARY KEY (id),
  CONSTRAINT france_restaurant_features_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
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
  workflow_state jsonb DEFAULT '{}'::jsonb,
  current_step_id character varying,
  step_data jsonb DEFAULT '{}'::jsonb,
  workflow_context jsonb DEFAULT '{}'::jsonb,
  bot_state jsonb DEFAULT '{"mode": "menu_browsing", "context": {}, "language": "fr"}'::jsonb,
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
CREATE TABLE public.message_templates (
  id integer NOT NULL DEFAULT nextval('message_templates_id_seq'::regclass),
  restaurant_id integer NOT NULL,
  template_key character varying NOT NULL,
  language character varying NOT NULL DEFAULT 'fr'::character varying,
  template_content text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT message_templates_pkey PRIMARY KEY (id),
  CONSTRAINT message_templates_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.restaurant_bot_configs (
  id integer NOT NULL DEFAULT nextval('restaurant_bot_configs_id_seq'::regclass),
  restaurant_id integer NOT NULL,
  config_name character varying NOT NULL DEFAULT 'main'::character varying,
  brand_name character varying NOT NULL,
  welcome_message text NOT NULL,
  available_workflows jsonb NOT NULL DEFAULT '[]'::jsonb,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT restaurant_bot_configs_pkey PRIMARY KEY (id),
  CONSTRAINT restaurant_bot_configs_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.state_transitions (
  id integer NOT NULL DEFAULT nextval('state_transitions_id_seq'::regclass),
  from_state character varying,
  to_state character varying NOT NULL,
  trigger_condition jsonb NOT NULL,
  priority integer DEFAULT 100,
  is_active boolean DEFAULT true,
  CONSTRAINT state_transitions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.step_executor_mappings (
  id integer NOT NULL DEFAULT nextval('step_executor_mappings_id_seq'::regclass),
  step_type character varying NOT NULL UNIQUE,
  executor_class character varying NOT NULL,
  configuration jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT step_executor_mappings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.workflow_definitions (
  id integer NOT NULL DEFAULT nextval('workflow_definitions_id_seq'::regclass),
  restaurant_id integer NOT NULL,
  workflow_id character varying NOT NULL,
  name character varying NOT NULL,
  description text,
  trigger_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_duration_minutes integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT workflow_definitions_pkey PRIMARY KEY (id),
  CONSTRAINT workflow_definitions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.workflow_steps (
  id integer NOT NULL DEFAULT nextval('workflow_steps_id_seq'::regclass),
  workflow_id integer NOT NULL,
  step_id character varying NOT NULL,
  step_order integer NOT NULL,
  step_type character varying NOT NULL,
  title character varying NOT NULL,
  description text,
  selection_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation_rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  next_step_logic jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_handling jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT workflow_steps_pkey PRIMARY KEY (id),
  CONSTRAINT workflow_steps_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflow_definitions(id)
);