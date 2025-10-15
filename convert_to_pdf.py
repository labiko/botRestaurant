#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import markdown
from weasyprint import HTML, CSS
from pathlib import Path

# Fichiers d'entrée et sortie
input_file = Path("PROJECTIONS_FINANCIERES_SAAS_89EUR.md")
output_file = Path("PROJECTIONS_FINANCIERES_SAAS_89EUR.pdf")

# Lire le fichier markdown
with open(input_file, 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convertir markdown en HTML avec extensions
html_content = markdown.markdown(
    md_content,
    extensions=['tables', 'fenced_code', 'nl2br']
)

# CSS moderne et professionnel
css_content = """
@page {
    size: A4;
    margin: 2cm 1.5cm;

    @top-center {
        content: "Projections Financières SaaS - Bot Resto";
        font-size: 9pt;
        color: #666;
        font-family: 'Segoe UI', Arial, sans-serif;
    }

    @bottom-right {
        content: "Page " counter(page) " / " counter(pages);
        font-size: 9pt;
        color: #666;
        font-family: 'Segoe UI', Arial, sans-serif;
    }
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 10pt;
    line-height: 1.6;
    color: #333;
    background: #fff;
}

h1 {
    color: #2c3e50;
    font-size: 24pt;
    font-weight: 700;
    margin: 30pt 0 20pt 0;
    padding-bottom: 10pt;
    border-bottom: 3px solid #3498db;
    text-align: center;
}

h2 {
    color: #34495e;
    font-size: 18pt;
    font-weight: 600;
    margin: 25pt 0 15pt 0;
    padding-bottom: 5pt;
    border-bottom: 2px solid #e74c3c;
    page-break-after: avoid;
}

h3 {
    color: #2980b9;
    font-size: 14pt;
    font-weight: 600;
    margin: 20pt 0 12pt 0;
    page-break-after: avoid;
}

h4 {
    color: #7f8c8d;
    font-size: 12pt;
    font-weight: 600;
    margin: 15pt 0 10pt 0;
}

p {
    margin: 8pt 0;
    text-align: justify;
}

strong {
    font-weight: 700;
    color: #2c3e50;
}

em {
    font-style: italic;
    color: #555;
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 15pt 0;
    font-size: 9pt;
    page-break-inside: avoid;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

th {
    padding: 10pt 8pt;
    text-align: left;
    font-weight: 600;
    border: 1px solid #5a67d8;
}

td {
    padding: 8pt;
    border: 1px solid #ddd;
    text-align: left;
}

tbody tr:nth-child(even) {
    background-color: #f8f9fa;
}

tbody tr:hover {
    background-color: #e3f2fd;
}

/* Code blocks */
pre, code {
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    background-color: #f5f5f5;
    padding: 10pt;
    border-radius: 4px;
    border-left: 4px solid #3498db;
    margin: 10pt 0;
    overflow-x: auto;
    page-break-inside: avoid;
}

code {
    padding: 2pt 4pt;
    color: #e74c3c;
}

/* Horizontal rules */
hr {
    border: none;
    border-top: 2px solid #ecf0f1;
    margin: 20pt 0;
}

/* Lists */
ul, ol {
    margin: 10pt 0 10pt 20pt;
}

li {
    margin: 5pt 0;
}

/* Emoji support */
.emoji {
    font-size: 12pt;
}

/* Alerts/Warnings */
p:has(> strong:first-child) {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    padding: 10pt;
    margin: 15pt 0;
    border-radius: 4px;
}

/* Success boxes */
blockquote {
    background: #d4edda;
    border-left: 4px solid #28a745;
    padding: 12pt;
    margin: 15pt 0;
    border-radius: 4px;
    color: #155724;
}

/* Links */
a {
    color: #3498db;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

/* Page breaks */
.page-break {
    page-break-after: always;
}

/* First page header */
body > p:first-of-type {
    text-align: center;
    font-size: 11pt;
    color: #7f8c8d;
    margin-bottom: 30pt;
    line-height: 1.8;
}

/* Highlight important numbers */
td:contains("€"), td:contains("XOF"), td:contains("%") {
    font-weight: 600;
}

/* Table of contents */
ul li a {
    color: #2c3e50;
    font-weight: 500;
}
"""

# HTML complet avec structure
html_full = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projections Financières SaaS - Bot Resto</title>
</head>
<body>
    {html_content}
</body>
</html>
"""

# Générer le PDF
print(f"🔄 Conversion de {input_file} en PDF...")
print(f"📄 Génération en cours...")

html_obj = HTML(string=html_full)
css_obj = CSS(string=css_content)

html_obj.write_pdf(
    output_file,
    stylesheets=[css_obj]
)

print(f"✅ PDF généré avec succès : {output_file}")
print(f"📊 Taille du fichier : {output_file.stat().st_size / 1024:.2f} KB")
