from pathlib import Path
import json, re

root = Path('.')
clusters_data = json.loads(Path('clusters.json').read_text())
cluster_map = {c['id']: c for c in clusters_data}

fixed = 0
for path in sorted(root.glob('clusters/*.html')):
    html = path.read_text(encoding='utf-8', errors='ignore')
    changed = False

    # Fix domain
    if '"https://clusteros.io/' in html:
        html = html.replace('"https://clusteros.io/', '"https://www.clusteros.io/')
        changed = True

    # Add Place schema if not already present
    if '"@type": "Place"' not in html:
        cid = path.stem
        c = cluster_map.get(cid)
        if c:
            name = c.get('name', '').replace('"', '')
            city = c.get('city', '').replace('"', '')
            country = c.get('country', '').replace('"', '')
            lat = c.get('lat', '')
            lng = c.get('lng', '')
            geo = f',\n  "geo": {{"@type": "GeoCoordinates", "latitude": {lat}, "longitude": {lng}}}' if lat and lng else ''

            place_schema = f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Place",
  "name": "{name}",
  "description": "Regional innovation cluster diagnosed by ClusterOS. Full structural stall analysis and leverage hypothesis.",
  "url": "https://www.clusteros.io/clusters/{path.name}",
  "address": {{
    "@type": "PostalAddress",
    "addressLocality": "{city}",
    "addressCountry": "{country}"
  }}{geo}
}}
</script>'''
            html = html.replace('</head>', f'{place_schema}\n</head>', 1)
            changed = True

    if changed:
        path.write_text(html, encoding='utf-8')
        fixed += 1

print(f"Updated {fixed} cluster pages ✓")
print("\nNow run: git add . && git commit -m 'AIO: cluster Place schema, domain fix' && git push")
