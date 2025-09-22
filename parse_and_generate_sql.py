#!/usr/bin/env python3
"""
Script pour parser extracted_data_complete.txt et générer un script SQL d'insertion complet.
Traite les données JSON de Pizza Yolo 77 pour insertion dans Supabase DEV.
"""

import json
import re
import os
from typing import Dict, List, Any

class SQLGenerator:
    def __init__(self):
        self.output_file = "03-insert-all-prod-data.sql"
        self.data_sections = {
            'restaurants': [],
            'categories': [],
            'products': [],
            'options': [],
            'sizes': [],
            'variants': [],
            'components': []
        }

    def escape_sql_string(self, value: Any) -> str:
        """Échapper les caractères spéciaux pour SQL"""
        if value is None:
            return 'NULL'

        if isinstance(value, (dict, list)):
            # Convertir les objets JSON en string
            json_str = json.dumps(value, ensure_ascii=False, separators=(',', ':'))
            # Échapper les quotes
            return f"'{json_str.replace(chr(39), chr(39) + chr(39))}'"

        if isinstance(value, bool):
            return 'true' if value else 'false'

        if isinstance(value, (int, float)):
            return str(value)

        # String
        string_value = str(value)
        # Échapper les apostrophes
        escaped = string_value.replace("'", "''")
        return f"'{escaped}'"

    def parse_file(self, file_path: str):
        """Parser le fichier extracted_data_complete.txt"""
        print(f"[INFO] Lecture du fichier: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extraire chaque section
        self._extract_restaurants(content)
        self._extract_categories(content)
        self._extract_products(content)
        self._extract_options(content)
        self._extract_sizes(content)
        self._extract_variants(content)
        self._extract_components(content)

    def _extract_restaurants(self, content: str):
        """Extraire les données restaurants"""
        print("[RESTAURANTS] Extraction des restaurants...")
        pattern = r'RESTAURANTS \| (\[.*?\])'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            try:
                self.data_sections['restaurants'] = json.loads(match.group(1))
                print(f"[SUCCESS] {len(self.data_sections['restaurants'])} restaurant(s) trouve(s)")
            except json.JSONDecodeError as e:
                print(f"[ERROR] Erreur JSON restaurants: {e}")

    def _extract_categories(self, content: str):
        """Extraire les données catégories"""
        print("[CATEGORIES] Extraction des categories...")
        pattern = r'CATEGORIES \| (\[.*?\])'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            try:
                self.data_sections['categories'] = json.loads(match.group(1))
                print(f"[SUCCESS] {len(self.data_sections['categories'])} categorie(s) trouvee(s)")
            except json.JSONDecodeError as e:
                print(f"[ERROR] Erreur JSON categories: {e}")

    def _extract_products(self, content: str):
        """Extraire les données produits"""
        print("[PRODUCTS] Extraction des produits...")
        pattern = r'PRODUCTS  \| (\[.*?\])'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            try:
                self.data_sections['products'] = json.loads(match.group(1))
                print(f"[SUCCESS] {len(self.data_sections['products'])} produit(s) trouve(s)")
            except json.JSONDecodeError as e:
                print(f"[ERROR] Erreur JSON produits: {e}")

    def _extract_options(self, content: str):
        """Extraire les données options (en chunks)"""
        print("[OPTIONS] Extraction des options...")

        # Chercher tous les chunks d'options
        patterns = [
            r'OPTIONS CHUNK 1/5 \| (\[.*?\])',
            r'OPTIONS CHUNK 2/5 \| (\[.*?\])',
            r'OPTIONS CHUNK 3/5 \| (\[.*?\])',
            r'OPTIONS CHUNK 4/5 \| (\[.*?\])',
            r'OPTIONS CHUNK 5/5 \| (\[.*?\])'
        ]

        all_options = []
        for i, pattern in enumerate(patterns, 1):
            match = re.search(pattern, content, re.DOTALL)
            if match:
                try:
                    chunk_options = json.loads(match.group(1))
                    all_options.extend(chunk_options)
                    print(f"[SUCCESS] Chunk {i}/5: {len(chunk_options)} options")
                except json.JSONDecodeError as e:
                    print(f"[ERROR] Erreur JSON options chunk {i}: {e}")

        self.data_sections['options'] = all_options
        print(f"[SUCCESS] Total options: {len(all_options)}")

    def _extract_sizes(self, content: str):
        """Extraire les données tailles"""
        print("[SIZES] Extraction des tailles...")
        pattern = r'SIZES \| (\[.*?\])'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            try:
                self.data_sections['sizes'] = json.loads(match.group(1))
                print(f"[SUCCESS] {len(self.data_sections['sizes'])} taille(s) trouvee(s)")
            except json.JSONDecodeError as e:
                print(f"[ERROR] Erreur JSON tailles: {e}")

    def _extract_variants(self, content: str):
        """Extraire les données variantes"""
        print("[VARIANTS] Extraction des variantes...")
        pattern = r'VARIANTS \| (\[.*?\])'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            try:
                self.data_sections['variants'] = json.loads(match.group(1))
                print(f"[SUCCESS] {len(self.data_sections['variants'])} variante(s) trouvee(s)")
            except json.JSONDecodeError as e:
                print(f"[ERROR] Erreur JSON variantes: {e}")

    def _extract_components(self, content: str):
        """Extraire les données composants"""
        print("[COMPONENTS] Extraction des composants...")
        pattern = r'COMPONENTS \| (\[.*?\])'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            try:
                self.data_sections['components'] = json.loads(match.group(1))
                print(f"[SUCCESS] {len(self.data_sections['components'])} composant(s) trouve(s)")
            except json.JSONDecodeError as e:
                print(f"[ERROR] Erreur JSON composants: {e}")

    def generate_sql(self):
        """Générer le script SQL complet"""
        print("\n[SQL] Generation du script SQL...")

        sql_content = self._generate_header()
        sql_content += self._generate_restaurants_sql()
        sql_content += self._generate_categories_sql()
        sql_content += self._generate_products_sql()
        sql_content += self._generate_options_sql()
        sql_content += self._generate_sizes_sql()
        sql_content += self._generate_variants_sql()
        sql_content += self._generate_components_sql()
        sql_content += self._generate_footer()

        # Écrire le fichier
        with open(self.output_file, 'w', encoding='utf-8') as f:
            f.write(sql_content)

        print(f"[SUCCESS] Script SQL genere: {self.output_file}")
        print(f"[INFO] Taille: {len(sql_content)} caracteres")

    def _generate_header(self) -> str:
        """Générer l'en-tête du script SQL"""
        return """-- ===============================================
-- 🍕 SCRIPT D'INSERTION PIZZA YOLO 77 - PRODUCTION
-- ===============================================
--
-- Ce script contient TOUTES les données de production
-- extraites de extracted_data_complete.txt
--
-- IMPORTANT: Transaction complète - tout réussit ou tout échoue
--
-- Tables concernées:
-- - france_restaurants (1 restaurant)
-- - france_menu_categories (23 catégories)
-- - france_products (144 produits)
-- - france_product_options (973 options)
-- - france_product_sizes (102 tailles)
-- - france_product_variants (16 variantes)
-- - france_composite_items (34 composants)
--
-- ===============================================

BEGIN;

-- Nettoyage préalable (optionnel - décommenter si nécessaire)
-- DELETE FROM france_composite_items WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1);
-- DELETE FROM france_product_variants WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1);
-- DELETE FROM france_product_sizes WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1);
-- DELETE FROM france_product_options WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1);
-- DELETE FROM france_products WHERE restaurant_id = 1;
-- DELETE FROM france_menu_categories WHERE restaurant_id = 1;
-- DELETE FROM france_restaurants WHERE id = 1;

"""

    def _generate_restaurants_sql(self) -> str:
        """Générer SQL pour les restaurants"""
        if not self.data_sections['restaurants']:
            return ""

        sql = "-- ===============================================\n"
        sql += "-- 🏪 INSERTION RESTAURANTS\n"
        sql += "-- ===============================================\n\n"

        for restaurant in self.data_sections['restaurants']:
            columns = []
            values = []

            for key, value in restaurant.items():
                if key not in ['created_at', 'updated_at']:  # Skip timestamps
                    columns.append(key)
                    values.append(self.escape_sql_string(value))

            columns.append('created_at')
            columns.append('updated_at')
            values.append('NOW()')
            values.append('NOW()')

            sql += f"INSERT INTO france_restaurants ({', '.join(columns)})\n"
            sql += f"VALUES ({', '.join(values)});\n\n"

        return sql

    def _generate_categories_sql(self) -> str:
        """Générer SQL pour les catégories"""
        if not self.data_sections['categories']:
            return ""

        sql = "-- ===============================================\n"
        sql += "-- 📂 INSERTION CATÉGORIES\n"
        sql += "-- ===============================================\n\n"

        for category in self.data_sections['categories']:
            columns = []
            values = []

            for key, value in category.items():
                if key not in ['created_at', 'updated_at']:
                    columns.append(key)
                    values.append(self.escape_sql_string(value))

            columns.append('created_at')
            columns.append('updated_at')
            values.append('NOW()')
            values.append('NOW()')

            sql += f"INSERT INTO france_menu_categories ({', '.join(columns)})\n"
            sql += f"VALUES ({', '.join(values)});\n\n"

        return sql

    def _generate_products_sql(self) -> str:
        """Générer SQL pour les produits"""
        if not self.data_sections['products']:
            return ""

        sql = "-- ===============================================\n"
        sql += "-- 🍕 INSERTION PRODUITS\n"
        sql += "-- ===============================================\n\n"

        for product in self.data_sections['products']:
            columns = []
            values = []

            for key, value in product.items():
                if key not in ['created_at', 'updated_at']:
                    columns.append(key)
                    values.append(self.escape_sql_string(value))

            columns.append('created_at')
            columns.append('updated_at')
            values.append('NOW()')
            values.append('NOW()')

            sql += f"INSERT INTO france_products ({', '.join(columns)})\n"
            sql += f"VALUES ({', '.join(values)});\n\n"

        return sql

    def _generate_options_sql(self) -> str:
        """Générer SQL pour les options"""
        if not self.data_sections['options']:
            return ""

        sql = "-- ===============================================\n"
        sql += "-- ⚙️ INSERTION OPTIONS\n"
        sql += "-- ===============================================\n\n"

        for option in self.data_sections['options']:
            columns = []
            values = []

            for key, value in option.items():
                if key not in ['created_at', 'updated_at']:
                    columns.append(key)
                    values.append(self.escape_sql_string(value))

            columns.append('created_at')
            columns.append('updated_at')
            values.append('NOW()')
            values.append('NOW()')

            sql += f"INSERT INTO france_product_options ({', '.join(columns)})\n"
            sql += f"VALUES ({', '.join(values)});\n\n"

        return sql

    def _generate_sizes_sql(self) -> str:
        """Générer SQL pour les tailles"""
        if not self.data_sections['sizes']:
            return ""

        sql = "-- ===============================================\n"
        sql += "-- 📏 INSERTION TAILLES\n"
        sql += "-- ===============================================\n\n"

        for size in self.data_sections['sizes']:
            columns = []
            values = []

            for key, value in size.items():
                if key not in ['created_at', 'updated_at']:
                    columns.append(key)
                    values.append(self.escape_sql_string(value))

            columns.append('created_at')
            columns.append('updated_at')
            values.append('NOW()')
            values.append('NOW()')

            sql += f"INSERT INTO france_product_sizes ({', '.join(columns)})\n"
            sql += f"VALUES ({', '.join(values)});\n\n"

        return sql

    def _generate_variants_sql(self) -> str:
        """Générer SQL pour les variantes"""
        if not self.data_sections['variants']:
            return ""

        sql = "-- ===============================================\n"
        sql += "-- 🔄 INSERTION VARIANTES\n"
        sql += "-- ===============================================\n\n"

        for variant in self.data_sections['variants']:
            columns = []
            values = []

            for key, value in variant.items():
                if key not in ['created_at', 'updated_at']:
                    columns.append(key)
                    values.append(self.escape_sql_string(value))

            columns.append('created_at')
            columns.append('updated_at')
            values.append('NOW()')
            values.append('NOW()')

            sql += f"INSERT INTO france_product_variants ({', '.join(columns)})\n"
            sql += f"VALUES ({', '.join(values)});\n\n"

        return sql

    def _generate_components_sql(self) -> str:
        """Générer SQL pour les composants"""
        if not self.data_sections['components']:
            return ""

        sql = "-- ===============================================\n"
        sql += "-- 🧩 INSERTION COMPOSANTS\n"
        sql += "-- ===============================================\n\n"

        for component in self.data_sections['components']:
            columns = []
            values = []

            for key, value in component.items():
                if key not in ['created_at', 'updated_at']:
                    columns.append(key)
                    values.append(self.escape_sql_string(value))

            columns.append('created_at')
            columns.append('updated_at')
            values.append('NOW()')
            values.append('NOW()')

            sql += f"INSERT INTO france_composite_items ({', '.join(columns)})\n"
            sql += f"VALUES ({', '.join(values)});\n\n"

        return sql

    def _generate_footer(self) -> str:
        """Générer le pied du script SQL"""
        return """-- ===============================================
-- 🔍 VÉRIFICATIONS FINALES
-- ===============================================

-- Vérifier les insertions
SELECT 'france_restaurants' as table_name, COUNT(*) as count FROM france_restaurants WHERE id = 1
UNION ALL
SELECT 'france_menu_categories', COUNT(*) FROM france_menu_categories WHERE restaurant_id = 1
UNION ALL
SELECT 'france_products', COUNT(*) FROM france_products WHERE restaurant_id = 1
UNION ALL
SELECT 'france_product_options', COUNT(*) FROM france_product_options WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1)
UNION ALL
SELECT 'france_product_sizes', COUNT(*) FROM france_product_sizes WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1)
UNION ALL
SELECT 'france_product_variants', COUNT(*) FROM france_product_variants WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1)
UNION ALL
SELECT 'france_composite_items', COUNT(*) FROM france_composite_items WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1);

-- Si tout est correct, valider la transaction
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ===============================================
-- ✅ SCRIPT TERMINÉ
-- ===============================================
--
-- Données importées pour Pizza Yolo 77:
-- - 1 restaurant
-- - 23 catégories
-- - 144 produits
-- - 973 options
-- - 102 tailles
-- - 16 variantes
-- - 34 composants
--
-- 🚀 Prêt pour Supabase DEV !
-- ===============================================
"""

def main():
    """Fonction principale"""
    generator = SQLGenerator()

    # Chemin du fichier
    input_file = "menu-ai-admin/extracted_data_complete.txt"

    if not os.path.exists(input_file):
        print(f"[ERROR] Fichier non trouve: {input_file}")
        return

    try:
        # Parser le fichier
        generator.parse_file(input_file)

        # Générer le SQL
        generator.generate_sql()

        print("\n[SUCCESS] Script genere avec succes !")
        print(f"[FILE] Fichier de sortie: {generator.output_file}")
        print("\n[SUMMARY] Resume des donnees:")
        for section, data in generator.data_sections.items():
            print(f"  - {section}: {len(data)} items")

    except Exception as e:
        print(f"[ERROR] Erreur: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()