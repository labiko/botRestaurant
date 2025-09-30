-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.automation_logs (
  id integer NOT NULL DEFAULT nextval('automation_logs_id_seq'::regclass),
  action character varying NOT NULL,
  details jsonb,
  created_at timestamp without time zone DEFAULT now(),
  success boolean DEFAULT true,
  CONSTRAINT automation_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.delivery_driver_actions (
  id integer NOT NULL DEFAULT nextval('delivery_driver_actions_id_seq'::regclass),
  order_id integer,
  driver_id integer,
  token_id integer,
  action_type character varying NOT NULL,
  action_timestamp timestamp without time zone DEFAULT now(),
  details jsonb,
  CONSTRAINT delivery_driver_actions_pkey PRIMARY KEY (id),
  CONSTRAINT delivery_driver_actions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  CONSTRAINT delivery_driver_actions_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id),
  CONSTRAINT delivery_driver_actions_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.delivery_tokens(id)
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
  CONSTRAINT delivery_refusals_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  CONSTRAINT delivery_refusals_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id),
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
  CONSTRAINT delivery_tokens_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  CONSTRAINT delivery_tokens_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id)
);
CREATE TABLE public.duplication_actions (
  id integer NOT NULL DEFAULT nextval('duplication_actions_id_seq'::regclass),
  duplication_log_id integer,
  action_type character varying NOT NULL,
  entity_type character varying NOT NULL,
  source_id integer,
  target_id integer,
  entity_name character varying,
  action_data jsonb,
  timestamp timestamp without time zone DEFAULT now(),
  success boolean DEFAULT true,
  error_message text,
  CONSTRAINT duplication_actions_pkey PRIMARY KEY (id),
  CONSTRAINT duplication_actions_duplication_log_id_fkey FOREIGN KEY (duplication_log_id) REFERENCES public.duplication_logs(id)
);
CREATE TABLE public.duplication_logs (
  id integer NOT NULL DEFAULT nextval('duplication_logs_id_seq'::regclass),
  source_restaurant_id integer,
  target_restaurant_id integer,
  user_session character varying,
  status character varying CHECK (status::text = ANY (ARRAY['started'::character varying::text, 'in_progress'::character varying::text, 'completed'::character varying::text, 'failed'::character varying::text])),
  summary jsonb,
  details jsonb,
  error_message text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  duration_seconds integer,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  production_status character varying DEFAULT 'dev_only'::character varying,
  last_production_sync timestamp without time zone,
  sync_count integer DEFAULT 0,
  CONSTRAINT duplication_logs_pkey PRIMARY KEY (id),
  CONSTRAINT duplication_logs_source_restaurant_id_fkey FOREIGN KEY (source_restaurant_id) REFERENCES public.france_restaurants(id),
  CONSTRAINT duplication_logs_target_restaurant_id_fkey FOREIGN KEY (target_restaurant_id) REFERENCES public.france_restaurants(id)
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
  is_active boolean DEFAULT true,
  whatsapp_name character varying,
  address_type character varying DEFAULT 'text'::character varying CHECK (address_type::text = ANY (ARRAY['text'::character varying, 'geolocation'::character varying]::text[])),
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
  CONSTRAINT france_delivery_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id),
  CONSTRAINT france_delivery_assignments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id)
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
CREATE TABLE public.france_icons (
  id integer NOT NULL DEFAULT nextval('france_icons_id_seq'::regclass),
  emoji character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  category character varying NOT NULL,
  tags ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT france_icons_pkey PRIMARY KEY (id)
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
CREATE TABLE public.france_option_groups (
  id integer NOT NULL DEFAULT nextval('france_option_groups_id_seq'::regclass),
  group_name character varying NOT NULL UNIQUE,
  component_name character varying NOT NULL,
  unit character varying DEFAULT 'choix'::character varying,
  icon character varying DEFAULT '📋'::character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT france_option_groups_pkey PRIMARY KEY (id)
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
  status character varying DEFAULT 'en_attente'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'confirmee'::character varying, 'preparation'::character varying, 'prete'::character varying, 'assignee'::character varying, 'en_livraison'::character varying, 'livree'::character varying, 'servie'::character varying, 'recuperee'::character varying, 'annulee'::character varying]::text[])),
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
  assignment_started_at timestamp with time zone,
  audio_played boolean DEFAULT false,
  additional_notes text,
  delivery_latitude numeric,
  delivery_longitude numeric,
  delivery_address_type character varying DEFAULT 'text'::character varying,
  online_payment_status character varying DEFAULT 'not_sent'::character varying CHECK (online_payment_status::text = ANY (ARRAY['not_sent'::character varying, 'link_sent'::character varying, 'paid'::character varying, 'failed'::character varying]::text[])),
  CONSTRAINT france_orders_pkey PRIMARY KEY (id),
  CONSTRAINT france_orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id),
  CONSTRAINT france_orders_delivery_address_id_fkey FOREIGN KEY (delivery_address_id) REFERENCES public.france_customer_addresses(id),
  CONSTRAINT france_orders_driver_fkey FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id)
);
CREATE TABLE public.france_pizza_display_settings (
  id integer NOT NULL DEFAULT nextval('france_pizza_display_settings_id_seq'::regclass),
  restaurant_id integer NOT NULL UNIQUE,
  use_unified_display boolean DEFAULT true,
  custom_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT france_pizza_display_settings_pkey PRIMARY KEY (id),
  CONSTRAINT france_pizza_display_settings_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.france_product_display_configs (
  id integer NOT NULL DEFAULT nextval('france_product_display_configs_id_seq'::regclass),
  restaurant_id integer NOT NULL,
  product_id integer NOT NULL,
  display_type character varying NOT NULL,
  template_name character varying,
  show_variants_first boolean DEFAULT false,
  custom_header_text text,
  custom_footer_text text,
  emoji_icon character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT france_product_display_configs_pkey PRIMARY KEY (id)
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
  next_group_order integer,
  conditional_next_group jsonb,
  icon character varying DEFAULT NULL::character varying,
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
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
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
  icon character varying DEFAULT NULL::character varying,
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
CREATE TABLE public.france_restaurant_service_modes (
  id integer NOT NULL DEFAULT nextval('france_restaurant_service_modes_id_seq'::regclass),
  restaurant_id integer NOT NULL,
  service_mode character varying NOT NULL CHECK (service_mode::text = ANY (ARRAY['sur_place'::character varying, 'a_emporter'::character varying, 'livraison'::character varying]::text[])),
  is_enabled boolean DEFAULT true,
  display_name character varying NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT france_restaurant_service_modes_pkey PRIMARY KEY (id),
  CONSTRAINT france_restaurant_service_modes_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
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
  timezone character varying DEFAULT 'Europe/Paris'::character varying,
  country_code character varying DEFAULT 'FR'::character varying,
  hide_delivery_info boolean DEFAULT false,
  is_exceptionally_closed boolean DEFAULT false,
  latitude numeric,
  longitude numeric,
  audio_notifications_enabled boolean DEFAULT true,
  audio_volume integer DEFAULT 50 CHECK (audio_volume >= 0 AND audio_volume <= 100),
  audio_enabled_since timestamp without time zone,
  deployment_status character varying DEFAULT 'production'::character varying CHECK (deployment_status::text = ANY (ARRAY['development'::character varying, 'testing'::character varying, 'production'::character varying]::text[])),
  delivery_address_mode character varying DEFAULT 'address'::character varying CHECK (delivery_address_mode::text = ANY (ARRAY['address'::character varying, 'geolocation'::character varying]::text[])),
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
  phone_number character varying NOT NULL,
  chat_id character varying,
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
  current_workflow_id character varying,
  workflow_data jsonb DEFAULT '{}'::jsonb,
  workflow_step_id character varying,
  CONSTRAINT france_user_sessions_pkey PRIMARY KEY (id)
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
CREATE TABLE public.france_workflow_templates (
  id integer NOT NULL DEFAULT nextval('france_workflow_templates_id_seq'::regclass),
  restaurant_id integer,
  template_name character varying NOT NULL,
  description text,
  steps_config jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT france_workflow_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.green_api_health_check_queue (
  id bigint NOT NULL DEFAULT nextval('green_api_health_check_queue_id_seq'::regclass),
  scheduled_for timestamp with time zone NOT NULL DEFAULT now(),
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying]::text[])),
  trigger_type character varying NOT NULL DEFAULT 'automatic'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  error_message text,
  CONSTRAINT green_api_health_check_queue_pkey PRIMARY KEY (id)
);
CREATE TABLE public.green_api_health_logs (
  id bigint NOT NULL DEFAULT nextval('green_api_health_logs_id_seq'::regclass),
  checked_at timestamp with time zone NOT NULL DEFAULT now(),
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['healthy'::character varying, 'unhealthy'::character varying, 'rebooted'::character varying, 'critical_failure'::character varying]::text[])),
  state_instance character varying,
  error_message text,
  reboot_triggered boolean NOT NULL DEFAULT false,
  reboot_success boolean,
  response_time_ms integer,
  support_notified boolean DEFAULT false,
  support_notification_sent_at timestamp with time zone,
  support_notification_error text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  trigger_type character varying DEFAULT 'automatic'::character varying CHECK (trigger_type::text = ANY (ARRAY['automatic'::character varying, 'scheduled'::character varying, 'manual'::character varying]::text[])),
  CONSTRAINT green_api_health_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.green_api_reboot_queue (
  id bigint NOT NULL DEFAULT nextval('green_api_reboot_queue_id_seq'::regclass),
  scheduled_for timestamp with time zone NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying]::text[])),
  trigger_type character varying NOT NULL DEFAULT 'scheduled'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  error_message text,
  CONSTRAINT green_api_reboot_queue_pkey PRIMARY KEY (id)
);
CREATE TABLE public.green_api_scheduled_reboots (
  id bigint NOT NULL DEFAULT nextval('green_api_scheduled_reboots_id_seq'::regclass),
  scheduled_time time without time zone NOT NULL DEFAULT '03:00:00'::time without time zone,
  timezone character varying NOT NULL DEFAULT 'Europe/Paris'::character varying,
  is_enabled boolean NOT NULL DEFAULT false,
  last_executed_at timestamp with time zone,
  next_execution_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT green_api_scheduled_reboots_pkey PRIMARY KEY (id)
);
CREATE TABLE public.login_users (
  id integer NOT NULL DEFAULT nextval('login_users_id_seq'::regclass),
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  last_login timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT login_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.menu_ai_scripts (
  id integer NOT NULL DEFAULT nextval('menu_ai_scripts_id_seq'::regclass),
  script_sql text NOT NULL,
  dev_status character varying DEFAULT 'pending'::character varying,
  prod_status character varying DEFAULT 'not_applied'::character varying,
  command_source text,
  ai_explanation text,
  category_name character varying,
  created_at timestamp with time zone DEFAULT now(),
  dev_executed_at timestamp with time zone,
  prod_executed_at timestamp with time zone,
  dev_error_message text,
  prod_error_message text,
  rollback_sql text,
  created_by character varying DEFAULT 'menu-ai-admin'::character varying,
  CONSTRAINT menu_ai_scripts_pkey PRIMARY KEY (id)
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
CREATE TABLE public.payment_links (
  id bigint NOT NULL DEFAULT nextval('payment_links_id_seq'::regclass),
  order_id integer NOT NULL,
  restaurant_id integer NOT NULL,
  config_id bigint NOT NULL,
  provider character varying NOT NULL,
  payment_link_url text NOT NULL,
  payment_intent_id character varying,
  amount numeric NOT NULL,
  currency character varying DEFAULT 'EUR'::character varying,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'sent'::character varying, 'viewed'::character varying, 'paid'::character varying, 'failed'::character varying, 'expired'::character varying, 'cancelled'::character varying]::text[])),
  sent_by_id integer,
  sent_by_type character varying CHECK (sent_by_type::text = ANY (ARRAY['restaurant'::character varying, 'driver'::character varying, 'system'::character varying]::text[])),
  sent_at timestamp with time zone,
  viewed_at timestamp with time zone,
  paid_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '24:00:00'::interval),
  metadata jsonb DEFAULT '{}'::jsonb,
  webhook_events jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_links_pkey PRIMARY KEY (id),
  CONSTRAINT payment_links_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  CONSTRAINT payment_links_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id),
  CONSTRAINT payment_links_config_id_fkey FOREIGN KEY (config_id) REFERENCES public.restaurant_payment_configs(id)
);
CREATE TABLE public.production_sync_history (
  id integer NOT NULL DEFAULT nextval('production_sync_history_id_seq'::regclass),
  duplication_log_id integer,
  restaurant_id integer,
  sync_date timestamp without time zone DEFAULT now(),
  sync_type character varying NOT NULL,
  items_synced jsonb,
  sql_script text,
  executed_by character varying,
  execution_status character varying DEFAULT 'pending'::character varying,
  execution_notes text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT production_sync_history_pkey PRIMARY KEY (id),
  CONSTRAINT production_sync_history_duplication_log_id_fkey FOREIGN KEY (duplication_log_id) REFERENCES public.duplication_logs(id)
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
CREATE TABLE public.restaurant_payment_configs (
  id bigint NOT NULL DEFAULT nextval('restaurant_payment_configs_id_seq'::regclass),
  restaurant_id integer NOT NULL,
  provider character varying NOT NULL CHECK (provider::text = ANY (ARRAY['stripe'::character varying, 'lengopay'::character varying, 'wave'::character varying, 'orange_money'::character varying, 'custom'::character varying]::text[])),
  api_key_public character varying,
  api_key_secret character varying,
  merchant_id character varying,
  config jsonb DEFAULT '{}'::jsonb,
  success_url character varying,
  cancel_url character varying,
  webhook_url character varying,
  is_active boolean DEFAULT true,
  auto_send_on_order boolean DEFAULT false,
  send_on_delivery boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT restaurant_payment_configs_pkey PRIMARY KEY (id),
  CONSTRAINT restaurant_payment_configs_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.restaurant_vitrine_settings (
  id integer NOT NULL DEFAULT nextval('restaurant_vitrine_settings_id_seq'::regclass),
  restaurant_id integer NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  primary_color character varying NOT NULL DEFAULT '#ff0000'::character varying,
  secondary_color character varying NOT NULL DEFAULT '#cc0000'::character varying,
  accent_color character varying NOT NULL DEFAULT '#ffc107'::character varying,
  logo_emoji character varying NOT NULL DEFAULT '🍕'::character varying,
  subtitle character varying NOT NULL DEFAULT 'Commandez en 30 secondes sur WhatsApp!'::character varying,
  promo_text character varying DEFAULT '📱 100% DIGITAL SUR WHATSAPP'::character varying,
  feature_1 text DEFAULT '{"emoji": "🚀", "text": "Livraison rapide"}'::text,
  feature_2 text DEFAULT '{"emoji": "💯", "text": "Produits frais"}'::text,
  feature_3 text DEFAULT '{"emoji": "⭐", "text": "4.8 étoiles"}'::text,
  show_live_stats boolean NOT NULL DEFAULT true,
  average_rating numeric NOT NULL DEFAULT 4.8 CHECK (average_rating >= 0::numeric AND average_rating <= 5::numeric),
  delivery_time_min integer NOT NULL DEFAULT 25 CHECK (delivery_time_min > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_vitrine_settings_pkey PRIMARY KEY (id),
  CONSTRAINT restaurant_vitrine_settings_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);
CREATE TABLE public.sql_execution_log (
  id bigint NOT NULL DEFAULT nextval('sql_execution_log_id_seq'::regclass),
  sql_query text NOT NULL,
  executed_at timestamp with time zone NOT NULL,
  executed_by uuid,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sql_execution_log_pkey PRIMARY KEY (id),
  CONSTRAINT sql_execution_log_executed_by_fkey FOREIGN KEY (executed_by) REFERENCES auth.users(id)
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
CREATE TABLE public.system_support_contacts (
  id bigint NOT NULL DEFAULT nextval('system_support_contacts_id_seq'::regclass),
  contact_type character varying NOT NULL CHECK (contact_type::text = ANY (ARRAY['primary'::character varying, 'secondary'::character varying, 'emergency'::character varying]::text[])),
  phone_number character varying NOT NULL,
  full_name character varying NOT NULL,
  email character varying,
  is_active boolean NOT NULL DEFAULT true,
  notification_priority integer DEFAULT 1,
  available_hours jsonb DEFAULT '{"end": "23:59", "start": "00:00"}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT system_support_contacts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tacos_backup_20250125 (
  id integer,
  restaurant_id integer,
  category_id integer,
  name character varying,
  description text,
  product_type USER-DEFINED,
  base_price numeric,
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
  icon character varying
);
CREATE TABLE public.tacos_rollback_backup (
  id integer,
  restaurant_id integer,
  category_id integer,
  name character varying,
  description text,
  product_type USER-DEFINED,
  base_price numeric,
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
  icon character varying
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
CREATE TABLE public.workflow_sql_scripts (
  id integer NOT NULL DEFAULT nextval('workflow_sql_scripts_id_seq'::regclass),
  product_id integer NOT NULL,
  product_name character varying NOT NULL,
  sql_script text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  executed_dev boolean DEFAULT false,
  executed_prod boolean DEFAULT false,
  dev_executed_at timestamp without time zone,
  prod_executed_at timestamp without time zone,
  modifications_summary jsonb DEFAULT '{"deletes": 0, "inserts": 0, "updates": 0, "total_options": 0}'::jsonb,
  CONSTRAINT workflow_sql_scripts_pkey PRIMARY KEY (id),
  CONSTRAINT fk_workflow_scripts_product FOREIGN KEY (product_id) REFERENCES public.france_products(id)
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