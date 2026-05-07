#!/usr/bin/env python3
"""
verify-pages.py — drift detector for the ClusterOS website templating system.

Walks every top-level *.html file and confirms each page has wired into the
shared chrome (site.css + chrome.js + slot divs) and has its canonical meta
blocks (description, canonical, Open Graph, schema.org, data-bar-zone).

Usage:  python verify-pages.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.resolve()

# Pages that own their own chrome — skipped entirely.
EXCLUDED = {"diagnostic-journey.html", "diagnostic-report.html"}

# The template itself isn't a real page.
TEMPLATE_FILES = {"_template.html"}

# Cluster + supercluster pages are Phase 2; skip in Phase 1.
SKIP_DIRS = {"clusters", "superclusters", "node_modules", ".git"}

# Homepage is exempt from the data-bar-zone check (it uses scroll-based zone
# switching, handled in chrome.js).
HOMEPAGE_EXEMPT_BAR_ZONE = {"index.html"}

CHECKS = [
    ("site.css",     re.compile(r'<link[^>]+href="/site\.css"', re.I),       "site.css linked"),
    ("chrome.js",    re.compile(r'<script[^>]+src="/chrome\.js"', re.I),     "chrome.js loaded"),
    ("site-nav",     re.compile(r'<div[^>]+id="site-nav"', re.I),            "nav slot present"),
    ("site-bar",     re.compile(r'<div[^>]+id="site-intel-bar"', re.I),      "intel-bar slot present"),
    ("site-footer",  re.compile(r'<div[^>]+id="site-footer"', re.I),         "footer slot present"),
    ("description",  re.compile(r'<meta[^>]+name="description"', re.I),      "meta description"),
    ("canonical",    re.compile(r'<link[^>]+rel="canonical"', re.I),         "canonical link"),
    ("og:title",     re.compile(r'<meta[^>]+property="og:title"', re.I),     "open graph"),
    ("schema",       re.compile(r'<script[^>]+type="application/ld\+json"', re.I), "schema.org JSON-LD"),
    ("bar-zone",     re.compile(r'<body[^>]+data-bar-zone=', re.I),          "data-bar-zone declared"),
]


def check_page(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    missing: list[str] = []
    for key, pattern, label in CHECKS:
        if key == "bar-zone" and path.name in HOMEPAGE_EXEMPT_BAR_ZONE:
            continue
        if not pattern.search(text):
            missing.append(label)
    return missing


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html"))
    passed: list[str] = []
    failed: list[tuple[str, list[str]]] = []
    skipped: list[str] = []

    for path in pages:
        name = path.name
        if name in EXCLUDED:
            skipped.append(f"{name}  (excluded — owns its own chrome)")
            continue
        if name in TEMPLATE_FILES:
            skipped.append(f"{name}  (template scaffold)")
            continue
        missing = check_page(path)
        if missing:
            failed.append((name, missing))
        else:
            passed.append(name)

    print(f"Templating drift report — {ROOT}")
    print("─" * 72)
    if passed:
        print(f"\nPASS ({len(passed)}):")
        for n in passed:
            print(f"  ✓ {n}")
    if failed:
        print(f"\nFAIL ({len(failed)}):")
        for n, miss in failed:
            print(f"  ✗ {n}")
            for m in miss:
                print(f"      missing: {m}")
    if skipped:
        print(f"\nSKIPPED ({len(skipped)}):")
        for n in skipped:
            print(f"  – {n}")

    print("─" * 72)
    print(f"Result: {len(passed)} pass · {len(failed)} fail · {len(skipped)} skipped")
    print("(Cluster + supercluster pages under clusters/ and superclusters/ are not checked in Phase 1.)")

    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
