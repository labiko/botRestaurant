SELECT product_type, COUNT(*) as count FROM france_products GROUP BY product_type;
SELECT product_type, name, composition FROM france_products WHERE composition IS NOT NULL AND composition \!= '' LIMIT 10;
