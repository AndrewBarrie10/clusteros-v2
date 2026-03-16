from pathlib import Path
import re

root = Path('.')

OLD_FOOTER = '''      <div class="footer-col-label">Company</div>
      <a href="/about.html">About</a>
      <a href="/request.html">Request a Diagnostic</a>
      <a href="/pricing.html">Pricing</a>
    </div>'''

NEW_FOOTER = '''      <div class="footer-col-label">Company</div>
      <a href="/about.html">About</a>
      <a href="/request.html">Request a Diagnostic</a>
      <a href="/pricing.html">Pricing</a>
      <a href="mailto:andrew@communitylab.app">Contact</a>
    </div>'''

pages = list(root.glob('*.html')) + list(root.glob('clusters/*.html'))
fixed = 0
for path in pages:
    html = path.read_text(encoding='utf-8', errors='ignore')
    if OLD_FOOTER in html:
        path.write_text(html.replace(OLD_FOOTER, NEW_FOOTER), encoding='utf-8')
        fixed += 1

print(f"Footer contact added to {fixed} pages")

# Fix about page email - use JS to avoid Cloudflare obfuscation
about_path = root / 'about.html'
about = about_path.read_text(encoding='utf-8', errors='ignore')
new_about = re.sub(
    r'or email <a[^>]*>.*?</a>',
    'or email <span id="cta-email" style="color:#c8f0d0"></span><script>document.getElementById(\'cta-email\').textContent=\'andrew\'+(\'@\')+\'communitylab.app\';</script>',
    about, flags=re.DOTALL
)
if new_about != about:
    about_path.write_text(new_about, encoding='utf-8')
    print("About page email fixed")
else:
    print("About page email — already fixed or pattern changed")

print("\nDone. Run: git add . && git commit -m 'footer contact link, fix email' && git push")
