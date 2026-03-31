#!/bin/bash
# Fetch full pipeline diagnostics for 3 sample clusters (one per evidence tier)
# Run this from a machine with API access, then read the output files.

API="https://clusteros-v3-production.up.railway.app/api/v1"

echo "Fetching P1: Tel Aviv AI & Deep Tech..."
curl -s "$API/diagnostic/2026Q1-17191903" | python3 -m json.tool > diagnostic_p1_telaviv.json
echo "  → diagnostic_p1_telaviv.json ($(wc -c < diagnostic_p1_telaviv.json) bytes)"

echo "Fetching P2: Detroit & Michigan Mobility & Auto Tech..."
curl -s "$API/diagnostic/2026Q1-17130424" | python3 -m json.tool > diagnostic_p2_detroit.json
echo "  → diagnostic_p2_detroit.json ($(wc -c < diagnostic_p2_detroit.json) bytes)"

echo "Fetching P3: Bangalore FinTech..."
curl -s "$API/diagnostic/2026Q1-17183912" | python3 -m json.tool > diagnostic_p3_bangalore.json
echo "  → diagnostic_p3_bangalore.json ($(wc -c < diagnostic_p3_bangalore.json) bytes)"

echo ""
echo "Also fetching canonical knowledge (stall + stack definitions)..."
curl -s "$API/knowledge" | python3 -m json.tool > canonical_knowledge.json
echo "  → canonical_knowledge.json ($(wc -c < canonical_knowledge.json) bytes)"

echo ""
echo "Done. Files ready for inspection."
