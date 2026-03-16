from pathlib import Path

root = Path('.')

OLD = '      <a href="mailto:andrew@communitylab.app">Contact</a>'
NEW = '      <a href="/request.html">Contact</a>'

pages = list(root.glob('*.html')) + list(root.glob('clusters/*.html'))
fixed = 0
for path in pages:
    html = path.read_text(encoding='utf-8', errors='ignore')
    if OLD in html:
        path.write_text(html.replace(OLD, NEW), encoding='utf-8')
        fixed += 1

print(f"Fixed contact link on {fixed} pages")
print("\nDone. Run: git add . && git commit -m 'fix footer contact link' && git push")
