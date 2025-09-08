# 🏗️ Diagramme de Classe - Bot Restaurant France

```mermaid
classDiagram
    %% ===================
    %% RESTAURANT CORE
    %% ===================
    class FranceRestaurants {
        +int id PK
        +string name
        +string slug
        +text address
        +string city
        +string phone
        +boolean is_active
        +string timezone
        +timestamp created_at
    }

    class FranceMenuCategories {
        +int id PK
        +int restaurant_id FK
        +string name
        +string slug
        +string icon
        +int display_order
        +boolean is_active
    }

    class FranceProducts {
        +int id PK
        +int restaurant_id FK
        +int category_id FK
        +string name
        +text description
        +text composition
        +numeric price_on_site_base
        +numeric price_delivery_base
        +string product_type
        +boolean is_active
        +int display_order
    }

    class FranceProductSizes {
        +int id PK
        +int product_id FK
        +string size_name
        +numeric price_on_site
        +numeric price_delivery
        +boolean includes_drink
        +int display_order
    }

    class FranceProductVariants {
        +int id PK
        +int product_id FK
        +string variant_name
        +numeric price_on_site
        +numeric price_delivery
        +int quantity
        +string unit
        +boolean is_active
        +int display_order
    }

    class FranceProductOptions {
        +int id PK
        +int product_id FK
        +string option_group
        +string option_name
        +numeric price_modifier
        +boolean is_required
        +int max_selections
        +int display_order
        +int group_order
        +boolean is_active
    }

    %% ===================
    %% ORDERS & SESSIONS
    %% ===================
    class FranceOrders {
        +int id PK
        +int restaurant_id FK
        +string phone_number
        +string customer_name
        +jsonb items
        +numeric total_amount
        +string order_status
        +string payment_mode
        +string service_mode
        +int delivery_address_id FK
        +int driver_id FK
        +timestamp created_at
    }

    class FranceUserSessions {
        +int id PK
        +string phone_number
        +string chat_id
        +int restaurant_id FK
        +string current_step
        +string bot_state
        +jsonb session_data
        +timestamp created_at
        +timestamp updated_at
    }

    class FranceCustomerAddresses {
        +bigint id PK
        +string phone_number
        +string address_label
        +text full_address
        +string google_place_id
        +numeric latitude
        +numeric longitude
        +boolean is_default
        +boolean is_active
        +string whatsapp_name
    }

    %% ===================
    %% DELIVERY SYSTEM
    %% ===================
    class FranceDeliveryDrivers {
        +bigint id PK
        +int restaurant_id FK
        +string first_name
        +string last_name
        +string phone_number
        +boolean is_available
        +boolean is_active
        +timestamp created_at
    }

    class FranceDeliveryAssignments {
        +int id PK
        +int order_id FK
        +int driver_id FK
        +string assignment_status
        +timestamp created_at
        +timestamp responded_at
        +timestamp expires_at
    }

    class DeliveryTokens {
        +int id PK
        +string token
        +int order_id FK
        +int driver_id FK
        +timestamp created_at
        +timestamp expires_at
        +boolean used
    }

    class DeliveryDriverActions {
        +int id PK
        +int order_id FK
        +int driver_id FK
        +int token_id FK
        +string action_type
        +timestamp action_timestamp
        +jsonb details
    }

    %% ===================
    %% CONFIGURATION
    %% ===================
    class FranceWorkflowTemplates {
        +int id PK
        +int restaurant_id FK
        +string template_name
        +text description
        +jsonb steps_config
        +boolean is_active
    }

    class FranceProductDisplayConfigs {
        +int id PK
        +int restaurant_id FK
        +int product_id FK
        +string display_type
        +string template_name
        +string emoji_icon
        +text custom_header_text
    }

    class FranceRestaurantServiceModes {
        +int id PK
        +int restaurant_id FK
        +string service_mode
        +boolean is_enabled
        +string display_name
        +text description
        +int display_order
        +jsonb config
    }

    class FranceCompositeItems {
        +int id PK
        +int composite_product_id FK
        +string component_name
        +int quantity
        +string unit
    }

    %% ===================
    %% AUXILIARY TABLES
    %% ===================
    class FranceAuthSessions {
        +bigint id PK
        +int user_id
        +string user_type
        +string session_token
        +timestamp expires_at
    }

    class MessageTemplates {
        +int id PK
        +int restaurant_id FK
        +string template_key
        +string language
        +text template_content
    }

    %% ===================
    %% RELATIONS
    %% ===================
    
    %% Restaurant Core Relations
    FranceRestaurants ||--o{ FranceMenuCategories : has
    FranceRestaurants ||--o{ FranceProducts : contains
    FranceMenuCategories ||--o{ FranceProducts : categorizes
    FranceProducts ||--o{ FranceProductSizes : has_sizes
    FranceProducts ||--o{ FranceProductVariants : has_variants
    FranceProducts ||--o{ FranceProductOptions : has_options
    FranceProducts ||--o{ FranceCompositeItems : composed_of

    %% Order Relations
    FranceRestaurants ||--o{ FranceOrders : receives
    FranceOrders ||--o| FranceCustomerAddresses : delivers_to
    FranceOrders ||--o| FranceDeliveryDrivers : assigned_to

    %% Session Relations
    FranceRestaurants ||--o{ FranceUserSessions : manages_sessions

    %% Delivery Relations
    FranceRestaurants ||--o{ FranceDeliveryDrivers : employs
    FranceOrders ||--o{ FranceDeliveryAssignments : has_assignments
    FranceDeliveryDrivers ||--o{ FranceDeliveryAssignments : assigned_to
    FranceOrders ||--o{ DeliveryTokens : generates
    FranceDeliveryDrivers ||--o{ DeliveryTokens : receives
    FranceOrders ||--o{ DeliveryDriverActions : triggers
    FranceDeliveryDrivers ||--o{ DeliveryDriverActions : performs

    %% Configuration Relations
    FranceRestaurants ||--o{ FranceWorkflowTemplates : configures
    FranceRestaurants ||--o{ FranceProductDisplayConfigs : customizes
    FranceProducts ||--o{ FranceProductDisplayConfigs : displayed_with
    FranceRestaurants ||--o{ FranceRestaurantServiceModes : supports
    FranceRestaurants ||--o{ MessageTemplates : uses

    %% Styling
    classDef restaurantCore fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef orderSystem fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef deliverySystem fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef configSystem fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef auxiliary fill:#fafafa,stroke:#616161,stroke-width:2px

    class FranceRestaurants,FranceMenuCategories,FranceProducts,FranceProductSizes,FranceProductVariants,FranceProductOptions,FranceCompositeItems restaurantCore
    class FranceOrders,FranceUserSessions,FranceCustomerAddresses orderSystem
    class FranceDeliveryDrivers,FranceDeliveryAssignments,DeliveryTokens,DeliveryDriverActions deliverySystem
    class FranceWorkflowTemplates,FranceProductDisplayConfigs,FranceRestaurantServiceModes configSystem
    class FranceAuthSessions,MessageTemplates auxiliary
```

## 📋 Légende des Domaines

| Couleur | Domaine | Description |
|---------|---------|-------------|
| 🔵 **Bleu** | **Restaurant Core** | Gestion des restaurants, menus, produits et leurs variantes |
| 🟣 **Violet** | **Order System** | Gestion des commandes, sessions utilisateurs et adresses |
| 🟢 **Vert** | **Delivery System** | Système de livraison avec livreurs et affectations |
| 🟠 **Orange** | **Configuration** | Templates de workflow et configurations d'affichage |
| ⚫ **Gris** | **Auxiliary** | Tables de support (auth, templates messages) |

## 🔗 Relations Principales

### **Restaurant → Products (1:N)**
- Un restaurant a plusieurs catégories de menu
- Chaque produit appartient à une catégorie
- Les produits peuvent avoir des tailles, variantes et options

### **Orders → Delivery (1:1)**
- Une commande peut être assignée à un livreur
- Système de tokens pour la validation des actions
- Traçabilité complète des actions de livraison

### **Configuration → Customization (1:N)**
- Chaque restaurant peut avoir ses propres templates de workflow
- Configuration d'affichage personnalisée par produit
- Modes de service paramétrables

## 🎯 Points Clés de l'Architecture

1. **Centralité du Restaurant** : `france_restaurants` est le hub principal
2. **Flexibilité des Produits** : Système extensible avec sizes, variants et options
3. **Traçabilité Complète** : Logs et actions pour le suivi des livraisons
4. **Configuration Dynamique** : Templates et configurations personnalisables
5. **Sessions Persistantes** : Gestion d'état pour les conversations WhatsApp