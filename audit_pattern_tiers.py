"""
ClusterOS Pattern Gate Audit
Pulls pattern tier (P1/P2/P3) for every run and prints a summary.
Run with: python audit_pattern_tiers.py
"""

import requests
import time
from collections import Counter

API_BASE = "https://clusteros-v3-production.up.railway.app/api/v1"

def get_all_runs():
    r = requests.get(f"{API_BASE}/runs")
    r.raise_for_status()
    return r.json().get("runs", [])

def get_pattern_tier(run_id):
    try:
        r = requests.get(f"{API_BASE}/diagnostic/{run_id}", timeout=15)
        r.raise_for_status()
        data = r.json()
        stages = data.get("stages", {})
        patterns = stages.get("patterns", {})
        tier = patterns.get("tier", "MISSING")
        leverage = stages.get("leverage", {})
        has_leverage = bool(leverage.get("output", "").strip())
        return tier, has_leverage
    except Exception as e:
        return f"ERROR: {e}", False

def main():
    print("Fetching all runs...")
    runs = get_all_runs()
    print(f"Total runs: {len(runs)}\n")

    results = []
    for i, run in enumerate(runs):
        run_id = run["run_id"]
        name = run["cluster_name"]
        print(f"[{i+1}/{len(runs)}] {name} ({run_id})...", end=" ", flush=True)
        tier, has_leverage = get_pattern_tier(run_id)
        print(f"{tier} | leverage: {'YES' if has_leverage else 'NO'}")
        results.append({
            "run_id": run_id,
            "name": name,
            "tier": tier,
            "has_leverage": has_leverage
        })
        time.sleep(0.3)  # be gentle on the API

    # Summary
    print("\n" + "="*60)
    print("PATTERN GATE SUMMARY")
    print("="*60)

    tier_counts = Counter(r["tier"] for r in results)
    leverage_count = sum(1 for r in results if r["has_leverage"])

    for tier, count in sorted(tier_counts.items()):
        pct = count / len(results) * 100
        print(f"  {tier}: {count} clusters ({pct:.0f}%)")

    print(f"\n  Leverage present: {leverage_count}/{len(results)} ({leverage_count/len(results)*100:.0f}%)")
    print(f"  Leverage absent:  {len(results)-leverage_count}/{len(results)}")

    print("\n" + "="*60)
    print("CLUSTERS WITHOUT LEVERAGE (P3 or MISSING)")
    print("="*60)
    for r in results:
        if not r["has_leverage"]:
            print(f"  {r['tier']:20s} {r['name']}")

    print("\n" + "="*60)
    print("CLUSTERS WITH LEVERAGE (P1 or P2)")
    print("="*60)
    for r in results:
        if r["has_leverage"]:
            print(f"  {r['tier']:20s} {r['name']}")

if __name__ == "__main__":
    main()
