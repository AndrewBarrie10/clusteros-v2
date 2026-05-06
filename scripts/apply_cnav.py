#!/usr/bin/env python3
"""Apply the canonical site nav (cnav) to every page in the repo.

For each target HTML file:
  1. Inject <link rel="stylesheet" href="/cnav.css"> into <head> (idempotent).
  2. Inject <script src="/cnav.js" defer></script> into <head> (idempotent).
  3. Replace the legacy top-of-body <nav>...</nav> block with the canonical
     cnav header + mobile menu, and strip the legacy
     <div class="nav-mobile-menu" id="nav-mobile-menu">...</div> if present.

Special cases:
  - national-diagnostic.html keeps its <nav class="side-nav"> (in-document
    sidebar). Canonical nav is inserted BEFORE it.
  - index.html has the canonical inserted in place of the current top <nav>;
    the home-page sticky bar is left untouched here (handled separately).
  - clusters/*.html and superclusters/*.html: legacy nav-back link is dropped;
    breadcrumb continues to do in-document navigation.

Idempotent. Running twice produces the same result.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CSS_TAG = '<link rel="stylesheet" href="/cnav.css">'
JS_TAG = '<script src="/cnav.js" defer></script>'

CNAV_HTML = """<header class="cnav" role="navigation" aria-label="Primary">
  <a class="cnav-logo" href="/">Cluster<span>OS</span></a>
  <ul class="cnav-links">
    <li><a href="/diagnostic.html" data-cnav="product">Product</a></li>
    <li><a href="/findings.html" data-cnav="findings">Findings</a></li>
    <li><a href="/cluster-library" data-cnav="cluster-library">Cluster Library</a></li>
    <li><a href="/notes.html" data-cnav="notes">Lab Notes</a></li>
    <li><a href="/about.html" data-cnav="about">About</a></li>
  </ul>
  <button class="cnav-burger" id="cnav-burger" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="cnav-mobile">
    <span></span><span></span><span></span>
  </button>
</header>
<div class="cnav-mobile" id="cnav-mobile" hidden>
  <a href="/diagnostic.html" data-cnav="product">Product</a>
  <a href="/findings.html" data-cnav="findings">Findings</a>
  <a href="/cluster-library" data-cnav="cluster-library">Cluster Library</a>
  <a href="/notes.html" data-cnav="notes">Lab Notes</a>
  <a href="/about.html" data-cnav="about">About</a>
</div>"""

LEGACY_MOBILE_RE = re.compile(
    r'<div class="nav-mobile-menu" id="nav-mobile-menu"[^>]*>.*?</div>\s*',
    re.DOTALL,
)
# Match a <nav ...>...</nav> block. Used carefully — we only ever replace the
# FIRST nav after <body>, and we exclude side-nav (NBD) explicitly.
FIRST_NAV_RE = re.compile(r'<nav\b[^>]*>.*?</nav>\s*', re.DOTALL)
SIDE_NAV_TAG_RE = re.compile(r'<nav\s+class="side-nav"', re.IGNORECASE)


def inject_head_assets(html: str) -> str:
    """Add cnav.css link and cnav.js script to <head> if missing."""
    changed = False
    if CSS_TAG not in html:
        html = re.sub(r'(</head\s*>)', f'  {CSS_TAG}\n\\1', html, count=1, flags=re.IGNORECASE)
        changed = True
    if JS_TAG not in html:
        html = re.sub(r'(</head\s*>)', f'  {JS_TAG}\n\\1', html, count=1, flags=re.IGNORECASE)
        changed = True
    return html


def replace_first_nav(html: str, where: str) -> tuple[str, bool]:
    """Inject the canonical cnav into the page.

    - If the page already carries cnav, no-op.
    - If the file is in clusters/ or superclusters/, INSERT canonical above
      the legacy minimal <nav> (with the back-link); legacy back-link stays
      as in-document navigation per the brief.
    - If the legacy nav is the side-nav (NBD), INSERT canonical above it.
    - Otherwise REPLACE the first <nav>...</nav> with the canonical, and
      strip the legacy <div class="nav-mobile-menu" id="nav-mobile-menu">
      block if present.
    """
    if 'class="cnav"' in html:
        return html, False
    body_match = re.search(r'<body\b[^>]*>', html, re.IGNORECASE)
    if not body_match:
        print(f"  [skip] {where}: no <body>")
        return html, False
    body_start = body_match.end()
    rest = html[body_start:]
    nav_match = FIRST_NAV_RE.search(rest)

    insert_only = (
        where.startswith("clusters/") or
        where.startswith("clusters\\") or
        where.startswith("superclusters/") or
        where.startswith("superclusters\\")
    )

    if not nav_match:
        new_html = html[: body_start] + '\n' + CNAV_HTML + '\n' + html[body_start:]
        return new_html, True

    nav_text = nav_match.group(0)
    is_side_nav = bool(SIDE_NAV_TAG_RE.search(nav_text))

    if insert_only or is_side_nav:
        idx = body_start + nav_match.start()
        new_html = html[:idx] + CNAV_HTML + '\n\n' + html[idx:]
        return new_html, True

    # REPLACE the legacy nav.
    new_rest = rest[: nav_match.start()] + CNAV_HTML + '\n' + rest[nav_match.end():]
    new_html = html[: body_start] + new_rest
    new_html, _ = LEGACY_MOBILE_RE.subn('', new_html, count=1)
    return new_html, True


def process_file(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    src = path.read_text()
    out = inject_head_assets(src)
    out, replaced = replace_first_nav(out, str(rel))
    if out == src:
        return False
    path.write_text(out)
    print(f"  [ok]   {rel}")
    return True


def main(argv: list[str]) -> int:
    targets: list[Path] = []
    if len(argv) > 1:
        for arg in argv[1:]:
            for match in (ROOT / Path(arg).parent).glob(Path(arg).name) if "*" in arg else [ROOT / arg]:
                if match.is_file() and match.suffix == ".html":
                    targets.append(match)
    else:
        # Default target list: every HTML page in the repo except the partial
        # and any helper pages we don't manage.
        skip = {ROOT / "_nav-partial.html"}
        for p in sorted(ROOT.glob("*.html")):
            if p in skip:
                continue
            targets.append(p)
        for p in sorted((ROOT / "clusters").glob("*.html")):
            targets.append(p)
        for p in sorted((ROOT / "superclusters").glob("*.html")):
            targets.append(p)

    changed = 0
    for p in targets:
        if process_file(p):
            changed += 1
    print(f"\n{changed}/{len(targets)} files modified.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
