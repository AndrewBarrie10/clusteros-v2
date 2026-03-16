
from pathlib import Path
import re, json

root = Path('.')

META_DESCS = {
    'index.html': 'ClusterOS diagnoses why regional innovation clusters stall and provides the coordination infrastructure to change it. Free self-diagnostic — identify your stalls, see your stack, get a printable report.',
    'diagnostic.html': 'The ClusterOS diagnostic identifies structural stalls in regional innovation ecosystems using a 5-stage evidence pipeline. 75+ clusters diagnosed across 20+ countries.',
    'signals-systems.html': 'How ClusterOS works: four actors, one substrate. Every selfish action by founders, corporates, researchers and stewards generates intelligence that makes the whole cluster more effective.',
    'digital-infrastructure.html': 'ClusterOS is coordination infrastructure, not a platform. The architecture: MCP intelligence substrate, sovereign database, actor journey generation, and steward interrogation layer.',
    'findings.html': 'What 200+ ClusterOS diagnostics found: stall frequency distribution, structural resemblances between ecosystems, and the nine canonical patterns that prevent clusters from compounding.',
    'leverage.html': 'How ClusterOS identifies leverage hypotheses: the specific structural intervention most likely to shift a stall configuration. Based on 75+ diagnosed clusters.',
    'pricing.html': 'ClusterOS engagement tiers: self-diagnostic (free), snapshot diagnostic, full diagnostic, and platform deployment. Pricing for regional innovation ecosystem analysis.',
    'about.html': "ClusterOS is built by Community Lab Ltd, Edinburgh. Founded by Andrew Barrie, co-founder of Barrie & Hibbert (acquired by Moody's Analytics). Coordination infrastructure for regional economies.",
    'request.html': 'Request a ClusterOS diagnostic for your innovation cluster. Stall analysis, actor mapping, leverage hypothesis, and substrate design for regional ecosystems.',
    'notes.html': 'ClusterOS Lab Notes: detailed analysis of structural stalls, stacks, and leverage hypotheses from 75+ ecosystem diagnostics.',
    'data.html': 'ClusterOS diagnostic database: structured data on 75+ diagnosed innovation clusters, stall patterns, structural resemblances, and leverage hypotheses.',
}

SCHEMA_INDEX = '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.clusteros.io/#organization",
      "name": "ClusterOS",
      "alternateName": "Community Lab Ltd",
      "url": "https://www.clusteros.io",
      "description": "Coordination infrastructure for regional innovation ecosystems. Diagnostic intelligence identifying why clusters stall and what structural changes would compound value.",
      "founder": {"@type": "Person", "name": "Andrew Barrie"},
      "location": {"@type": "Place", "address": {"@type": "PostalAddress", "addressLocality": "Edinburgh", "addressCountry": "GB"}},
      "contactPoint": {"@type": "ContactPoint", "email": "andrew@communitylab.app", "contactType": "customer service"}
    },
    {
      "@type": "WebSite",
      "@id": "https://www.clusteros.io/#website",
      "url": "https://www.clusteros.io",
      "name": "ClusterOS",
      "description": "Diagnostic intelligence for regional innovation ecosystems",
      "publisher": {"@id": "https://www.clusteros.io/#organization"}
    },
    {
      "@type": "SoftwareApplication",
      "name": "ClusterOS Diagnostic",
      "url": "https://www.clusteros.io",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "AI-powered diagnostic tool for regional innovation ecosystems. Identifies structural stalls, compares against 75+ global clusters, and generates personalised leverage hypotheses.",
      "offers": {"@type": "Offer", "price": "0", "priceCurrency": "GBP", "description": "Free self-diagnostic"}
    }
  ]
}
</script>'''

# 1. Meta descriptions
fixed = 0
for name, desc in META_DESCS.items():
    path = root / name
    if not path.exists(): continue
    html = path.read_text(encoding='utf-8')
    meta_tag = f'<meta name="description" content="{desc}">'
    if 'name="description"' in html:
        html = re.sub(r'<meta name="description"[^>]+>', meta_tag, html)
    else:
        html = html.replace('</head>', f'{meta_tag}\n</head>', 1)
    if name == 'index.html' and 'application/ld+json' not in html:
        html = html.replace('</head>', f'{SCHEMA_INDEX}\n</head>', 1)
    path.write_text(html, encoding='utf-8')
    fixed += 1
print(f"Meta descriptions: {fixed} pages ✓")

# 2. Lab notes Article schema
ln_pages = sorted(root.glob('ln-*.html'))
fixed_ln = 0
for path in ln_pages:
    html = path.read_text(encoding='utf-8')
    if 'application/ld+json' in html: continue
    title_m = re.search(r'<title>([^<]+)</title>', html)
    title = title_m.group(1) if title_m else path.stem
    schema = f'''<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"Article","headline":"{title}","url":"https://www.clusteros.io/{path.name}","publisher":{{"@type":"Organization","name":"ClusterOS","url":"https://www.clusteros.io"}}}}
</script>'''
    html = html.replace('</head>', f'{schema}\n</head>', 1)
    path.write_text(html, encoding='utf-8')
    fixed_ln += 1
print(f"Article schema: {fixed_ln} lab notes ✓")

# 3. llms.txt
llms = Path('llms.txt')
if not llms.exists():
    print("WARNING: llms.txt not found — copy it manually from outputs")
else:
    print(f"llms.txt: present ✓")

print("\nDone. Now run: git add . && git commit -m 'AIO: meta descriptions, structured data, llms.txt' && git push")
