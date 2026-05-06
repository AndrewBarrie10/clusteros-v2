"""
Findings page audit — computation script.

Parses the diagnostic library (docs/diagnostic_runs/) and clusters.json to compute
all figures the Findings page draft requires. Writes JSON outputs into this directory.

Usage:
  python3 compute_findings.py
"""
import json
import os
import re
from collections import Counter, defaultdict
from itertools import combinations

ROOT = "/home/user/clusteros-v3"
OUT = "/home/user/clusteros-v3/analysis/corpus_patterns/findings_compute"
os.makedirs(OUT, exist_ok=True)

# ─── Canonical references ──────────────────────────────────────────────
STALLS = {
    "S1": "Re-proving Instead of Narrowing",
    "S2": "Coordinating Instead of Deciding",
    "S3": "Forgiving Instead of Redesigning",
    "S4": "Extracting Instead of Investing",
    "S5": "Intermediating Instead of Connecting",
    "S6": "Stabilising Around Incumbents",
    "S7": "Narrating Instead of Testing",
    "S8": "Expanding Instead of Concentrating",
    "S9": "Permission-Seeking Instead of Acting",
}

STK = {
    "STK-15": "Governance Capture Configuration",
    "STK-16": "Permission–Validation Configuration",
    "STK-17": "Extraction–Intermediary Configuration",
    "STK-19": "Volume–Tolerance Configuration",
    "STK-24": "Extraction–Narrative Configuration",
    "STK-30": "Coordination–Intermediary–Activity Configuration",
}

CONFIG_SIX = ["STK-16", "STK-30", "STK-17", "STK-15", "STK-19", "STK-24"]

COUNTRY_CONTINENT = {
    'AE':'Asia','AR':'South America','AT':'Europe','AU':'Oceania','BD':'Asia','BE':'Europe',
    'BR':'South America','CA':'North America','CH':'Europe','CL':'South America','CN':'Asia',
    'CO':'South America','CR':'North America','CZ':'Europe','DE':'Europe','DK':'Europe',
    'EE':'Europe','EG':'Africa','ES':'Europe','FI':'Europe','FR':'Europe','GB':'Europe',
    'GH':'Africa','ID':'Asia','IL':'Asia','IN':'Asia','IT':'Europe','JP':'Asia','KE':'Africa',
    'KH':'Asia','KR':'Asia','KZ':'Asia','LK':'Asia','MA':'Africa','MN':'Asia','MX':'North America',
    'MY':'Asia','NG':'Africa','NL':'Europe','NO':'Europe','NZ':'Oceania','PA':'North America',
    'PE':'South America','PH':'Asia','PK':'Asia','PL':'Europe','PT':'Europe','RW':'Africa',
    'SA':'Asia','SE':'Europe','SG':'Asia','TH':'Asia','TW':'Asia','US':'North America','UY':'South America',
    'VN':'Asia','ZA':'Africa',
}

CONF_ORDER_INT = {"high": 3, "medium": 2, "low": 1, "indeterminate": 0}

# ─── Parsers ───────────────────────────────────────────────────────────
STALL_RE = re.compile(
    r'^\|\s*(?:STALL[_ ]?|S)(0?[1-9])\s*\|[^|]*\|[^|]*\|[^|]*\|\s*([A-Za-z]+)\s*\|',
    re.MULTILINE,
)
STACK_RE = re.compile(
    r'^\|\s*(STK-\d{2})\s*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|\s*([A-Za-z]+)\s*\|',
    re.MULTILINE,
)
LEVERAGE_RE = re.compile(r"\|\s*L\d+\s*\|\s*[^|]+\|\s*([^|]+?)\s*\|")


def parse_run_stalls(md):
    out = {}
    for sid_num, conf in STALL_RE.findall(md):
        sid = f"S{int(sid_num)}"
        cn = conf.lower()
        if cn not in CONF_ORDER_INT:
            continue
        if sid not in out or CONF_ORDER_INT[cn] > CONF_ORDER_INT[out[sid]]:
            out[sid] = cn
    return out


def parse_run_stacks(md):
    out = {}
    for stk, conf in STACK_RE.findall(md):
        cn = conf.lower()
        if cn not in CONF_ORDER_INT:
            continue
        if stk not in out or CONF_ORDER_INT[cn] > CONF_ORDER_INT[out[stk]]:
            out[stk] = cn
    return out


def parse_run_leverage_types(md):
    rows = LEVERAGE_RE.findall(md)
    counts = Counter()
    for raw in rows:
        t = raw.strip().lower()
        if "information" in t and "flow" in t:
            counts["Information flow"] += 1
        elif "boundary" in t:
            counts["Boundary adjustment"] += 1
        elif "timing" in t or "sequencing" in t:
            counts["Timing or sequencing"] += 1
        elif "constraint" in t:
            counts["Constraint shift"] += 1
        elif "coupling" in t:
            counts["Coupling exposure"] += 1
        else:
            counts[f"OTHER:{raw.strip()}"] += 1
    return counts


def load_all_runs():
    """Load and parse every diagnostic JSON. Return list of dicts."""
    idx = json.load(open(f"{ROOT}/docs/diagnostic_runs/_index.json"))
    out = []
    for r in idx["runs"]:
        path = f"{ROOT}/docs/diagnostic_runs/{r['path']}"
        try:
            d = json.load(open(path))
        except Exception:
            continue
        stages = d.get("stages", {})
        stalls_md = stages.get("stalls", {}).get("output", "")
        stacks_md = stages.get("stacks", {}).get("output", "")
        leverage_md = stages.get("leverage", {}).get("output", "")
        out.append({
            "run_id": r["run_id"],
            "ecosystem_slug": r["ecosystem_slug"],
            "ecosystem_label": r.get("ecosystem_label"),
            "cluster_slug": r["cluster_slug"],
            "cluster_name": r["cluster_name"],
            "country": r.get("country"),
            "geography": r.get("geography"),
            "sector": r.get("sector"),
            "anchor_type": r.get("anchor_type"),
            "lifecycle_stage": r.get("lifecycle_stage"),
            "evidence_count": r.get("evidence_count", 0),
            "evidence_tier": r.get("evidence_tier"),
            "canon_version": r.get("canon_version"),
            "stalls": parse_run_stalls(stalls_md),
            "stacks": parse_run_stacks(stacks_md),
            "leverage_types": parse_run_leverage_types(leverage_md),
        })
    return out


def is_canonical_run(r):
    """A run is in the canonical-schema pool iff its stacks parsed with STK-XX form."""
    return bool(r["stacks"]) and len(r["stalls"]) == 9


# ─── Q1 ────────────────────────────────────────────────────────────────
def q1_headline():
    cj = json.load(open(f"{ROOT}/clusters.json"))
    runs = load_all_runs()
    canonical = [r for r in runs if is_canonical_run(r)]

    countries_cj = set(c["country"] for c in cj if c.get("country"))
    continents_cj = set(COUNTRY_CONTINENT[c] for c in countries_cj if c in COUNTRY_CONTINENT)

    def country_to_continent_set(rs):
        return set(
            COUNTRY_CONTINENT.get(_country_code(r))
            for r in rs if COUNTRY_CONTINENT.get(_country_code(r))
        )

    out = {
        "draft_claims": {
            "clusters_diagnosed": 377,
            "ecosystems": 26,
            "countries": 57,
            "continents": 6,
            "evidence_items": "30,000+",
        },
        "v3_clusters_json": {
            "n": len(cj),
            "n_countries": len(countries_cj),
            "n_continents": len(continents_cj),
            "evidence_count_sum": sum(c.get("_evidence_count", 0) for c in cj),
            "note": "v3 canonical pool. The website (v2) clusters.json may carry a larger or differently-versioned pool.",
        },
        "diagnostic_library_full": {
            "n_runs": len(runs),
            "n_ecosystems": len(set(r["ecosystem_slug"] for r in runs)),
            "n_countries_iso_or_label": len(set(r["country"] for r in runs if r.get("country"))),
            "evidence_count_sum": sum(r["evidence_count"] for r in runs),
            "canon_version_breakdown": dict(Counter(r["canon_version"] for r in runs)),
        },
        "canonical_pool": {
            "definition": "Diagnostic runs where the stacks stage produced canonical STK-XX outputs and 9-stall confidence",
            "n_runs": len(canonical),
            "n_ecosystems": len(set(r["ecosystem_slug"] for r in canonical)),
            "n_countries_label": len(set(r["country"] for r in canonical if r.get("country"))),
            "evidence_count_sum": sum(r["evidence_count"] for r in canonical),
            "canon_version_breakdown": dict(Counter(r["canon_version"] for r in canonical)),
        },
        "current_canon_subset_uk_nbd": {
            "n_runs": sum(1 for r in runs if r["canon_version"] == "current"),
            "n_ecosystems": len(set(r["ecosystem_slug"] for r in runs if r["canon_version"] == "current")),
            "n_countries": len(set(r["country"] for r in runs if r["canon_version"] == "current" and r.get("country"))),
            "evidence_count_sum": sum(r["evidence_count"] for r in runs if r["canon_version"] == "current"),
        },
    }
    json.dump(out, open(f"{OUT}/q1_headline.json", "w"), indent=2)
    return out


def _country_code(r):
    """Map a diagnostic run's country/geography/ecosystem to ISO-2."""
    LABEL_TO_ISO = {
        "scotland": "GB", "england": "GB", "wales": "GB", "northern ireland": "GB",
        "uk": "GB", "united kingdom": "GB", "great britain": "GB",
        "united states": "US", "usa": "US", "us": "US",
        "singapore": "SG", "australia": "AU", "philippines": "PH", "germany": "DE",
        "france": "FR", "spain": "ES", "italy": "IT", "japan": "JP", "south korea": "KR",
        "korea": "KR", "china": "CN", "india": "IN", "brazil": "BR", "argentina": "AR",
        "chile": "CL", "colombia": "CO", "mexico": "MX", "canada": "CA", "egypt": "EG",
        "ghana": "GH", "kenya": "KE", "morocco": "MA", "nigeria": "NG", "rwanda": "RW",
        "south africa": "ZA", "saudi arabia": "SA", "israel": "IL", "uae": "AE",
        "united arab emirates": "AE", "kazakhstan": "KZ",
        "indonesia": "ID", "malaysia": "MY", "thailand": "TH", "vietnam": "VN", "pakistan": "PK",
        "bangladesh": "BD", "sri lanka": "LK", "cambodia": "KH", "mongolia": "MN", "taiwan": "TW",
        "new zealand": "NZ", "austria": "AT", "belgium": "BE", "switzerland": "CH",
        "czech republic": "CZ", "denmark": "DK", "estonia": "EE", "finland": "FI",
        "netherlands": "NL", "norway": "NO", "poland": "PL", "portugal": "PT", "sweden": "SE",
        "uruguay": "UY", "panama": "PA", "costa rica": "CR", "peru": "PE", "lithuania": "LT",
    }
    label = (r.get("country") or "").strip().lower()
    if label in LABEL_TO_ISO:
        return LABEL_TO_ISO[label]
    # Fallback: scan cluster name / ecosystem / geography for a country word
    blob = " ".join([
        (r.get("cluster_name") or ""),
        (r.get("ecosystem_label") or ""),
        (r.get("ecosystem_slug") or "").replace("_", " "),
        (r.get("geography") or ""),
    ]).lower()
    CITY_TO_ISO = {
        "san francisco": "US", "san diego": "US", "boston": "US", "austin": "US", "atlanta": "US",
        "denver": "US", "boulder": "US", "chicago": "US", "los angeles": "US", "philadelphia": "US",
        "minneapolis": "US", "new york": "US", "seattle": "US", "salt lake city": "US",
        "buffalo": "US", "madison": "US", "research triangle": "US", "pittsburgh": "US",
        "colorado springs": "US", "cape canaveral": "US", "raleigh": "US", "orlando": "US",
        "harwell": "GB", "cheltenham": "GB", "liverpool": "GB", "scotland": "GB",
        "copenhagen": "DK", "tel aviv": "IL", "abu dhabi": "AE", "dubai": "AE",
        "hyderabad": "IN", "porto": "PT", "basque": "ES", "eindhoven": "NL",
        "quebec": "CA", "medellin": "CO", "the hague": "NL", "zurich": "CH", "zug": "CH",
        "birmingham alabama": "US", "nairobi": "KE", "dhaka": "BD",
    }
    for city, iso in CITY_TO_ISO.items():
        if city in blob:
            return iso
    return None


# ─── Q2 V1 — stalls ────────────────────────────────────────────────────
def q2_v1_stalls():
    runs = load_all_runs()
    canonical = [r for r in runs if is_canonical_run(r)]
    nbd = [r for r in runs if r["canon_version"] == "current"]
    full = runs

    def build_table(pool, label):
        n = len(pool)
        table = []
        for sid in [f"S{i}" for i in range(1, 10)]:
            row = {"stall_id": sid, "stall_name": STALLS[sid], "n": n}
            cnt = Counter()
            for r in pool:
                cnt[r["stalls"].get(sid, "indeterminate")] += 1
            for cf in ("high", "medium", "low", "indeterminate"):
                row[cf] = cnt[cf]
                row[f"{cf}_pct"] = round(100 * cnt[cf] / n, 1) if n else 0
            row["high_plus_medium_pct"] = round(100 * (cnt["high"] + cnt["medium"]) / n, 1) if n else 0
            table.append(row)
        return {"label": label, "n": n, "table": table,
                "ranked_by_high_plus_medium": sorted(
                    [(r["stall_id"], r["high_plus_medium_pct"]) for r in table],
                    key=lambda x: -x[1])}

    out = {
        "primary_pool": "canonical_pool (canonical-schema runs only)",
        "draft_claim_top_stall": "S6 Stabilising Around Incumbents (high+medium combined dominant)",
        "draft_claim_indeterminate_dominant": "S3 Forgiving Instead of Redesigning",
        "canonical_pool": build_table(canonical, "canonical_pool"),
        "uk_nbd": build_table(nbd, "uk_nbd_current_canon"),
        "full_library": build_table(full, "full_diagnostic_library"),
    }
    json.dump(out, open(f"{OUT}/q2_v1_stalls.json", "w"), indent=2)
    return out


# ─── Q2 V2 — stacks ────────────────────────────────────────────────────
def q2_v2_stacks():
    runs = load_all_runs()
    canonical = [r for r in runs if is_canonical_run(r)]
    n = len(canonical)
    rows = []
    for sid in CONFIG_SIX:
        c = Counter()
        for r in canonical:
            c[r["stacks"].get(sid, "indeterminate")] += 1
        confident = c["high"] + c["medium"]
        any_conf = sum(1 for r in canonical if sid in r["stacks"])
        rows.append({
            "stack_id": sid,
            "stack_name": STK[sid],
            "n": n,
            "high": c["high"],
            "medium": c["medium"],
            "low": c["low"],
            "indeterminate": c["indeterminate"],
            "confident_pct": round(100 * confident / n, 1),
            "any_conf_pct": round(100 * any_conf / n, 1),
        })

    # All STKs observed
    all_stk = Counter()
    for r in canonical:
        for sid in r["stacks"]:
            all_stk[sid] += 1

    out = {
        "pool": "canonical_pool (canonical-schema runs only)",
        "n": n,
        "definition": "Share of clusters where stack fires at high or medium confidence",
        "draft_pv_pct": 41.2,
        "rows": rows,
        "all_stack_ids_observed": dict(all_stk.most_common()),
    }
    json.dump(out, open(f"{OUT}/q2_v2_stacks.json", "w"), indent=2)
    return out


# ─── Q2 V3 — sector × stack heat-grid ──────────────────────────────────
SECTOR_KEYWORDS = [
    ("Life Sciences",          ["life science", "biotech", "biopharm", "lifescience", "medtech", "pharma", "health and life", "health & life", "health innovation", "clinical"]),
    ("FinTech",                ["fintech", "financial tech", "digital asset", "insurtech", "regtech"]),
    ("Cyber",                  ["cyber", "infosec"]),
    ("Advanced Manufacturing", ["advanced manufactur", "manufactur", "precision engineer", "industrial automation"]),
    ("Space",                  ["space", "satellite", "spacetech"]),
    ("Energy and Net Zero",    ["energy", "net zero", "netzero", "clean energy", "cleantech", "renewable", "low carbon", "climatetech", "climate"]),
    ("Quantum and Photonics",  ["quantum", "photonic", "compound semicond", "semiconduct"]),
    ("Digital and Creative",   ["digital", "creative", "media", "screen", " ai ", "software", "data analytics", " data "]),
    ("Innovation Ecosystem",   ["innovation ecosystem", "regional innovation", "innovation_ecosystem"]),
]


def classify_sector(r):
    blob = ((r.get("sector") or "") + " " + (r.get("cluster_name") or "") + " " + (r.get("cluster_slug") or "")).lower()
    matches = []
    for label, kws in SECTOR_KEYWORDS:
        if any(kw in blob for kw in kws):
            matches.append(label)
    if not matches:
        return None
    if "Innovation Ecosystem" in matches and len(matches) > 1:
        matches = [m for m in matches if m != "Innovation Ecosystem"]
    return matches[0]


def q2_v3_sector_grid():
    runs = load_all_runs()
    canonical = [r for r in runs if is_canonical_run(r)]
    buckets = defaultdict(list)
    unclassified = []
    for r in canonical:
        b = classify_sector(r)
        if b:
            buckets[b].append(r)
        else:
            unclassified.append(r["cluster_name"])

    qualifying = {k: v for k, v in buckets.items() if len(v) >= 5}

    grid = {}
    for sec, pool in qualifying.items():
        nP = len(pool)
        row = {"n_clusters": nP}
        for sid in CONFIG_SIX:
            confident = sum(1 for r in pool if r["stacks"].get(sid) in ("high", "medium"))
            row[sid] = {"n_confident": confident, "pct_confident": round(100 * confident / nP, 1)}
        grid[sec] = row

    sectors_sorted = sorted(grid.keys(), key=lambda s: -grid[s]["n_clusters"])

    def pct(s, sid):
        return grid[s][sid]["pct_confident"]

    homogeneity_rank = sorted(grid.keys(), key=lambda s: -max(pct(s, sid) for sid in CONFIG_SIX))
    def variance(s):
        vals = [pct(s, sid) for sid in CONFIG_SIX]
        m = sum(vals) / len(vals)
        return sum((v - m) ** 2 for v in vals) / len(vals)
    heterogeneity_rank = sorted(grid.keys(), key=variance)  # low variance = more homogeneous

    # Verbal claim checks
    claims = {}
    if grid:
        # Quantum most homogeneous (highest single-config dominance)
        claims["quantum_most_homogeneous"] = {
            "claimed_sector": "Quantum and Photonics",
            "actual_top_homogeneous_sector": homogeneity_rank[0],
            "supports_claim": homogeneity_rank[0] == "Quantum and Photonics",
        }
        claims["innovation_most_heterogeneous"] = {
            "claimed_sector": "Innovation Ecosystem",
            "actual_top_heterogeneous_sector": heterogeneity_rank[-1],  # highest variance
            "supports_claim": heterogeneity_rank[-1] == "Innovation Ecosystem",
        }
        # Extraction–Intermediary in Life Sciences and FinTech
        ei_avg = sum(pct(s, "STK-17") for s in qualifying) / len(qualifying)
        claims["extraction_intermediary_correlates_ls_fintech"] = {
            "STK-17_pct_by_sector": {s: pct(s, "STK-17") for s in sectors_sorted},
            "average_across_sectors": round(ei_avg, 1),
            "ls_pct": pct("Life Sciences", "STK-17") if "Life Sciences" in qualifying else None,
            "fintech_pct": pct("FinTech", "STK-17") if "FinTech" in qualifying else None,
        }
        # Permission–Validation in university-anchored sectors
        claims["permission_validation_university_anchored"] = {
            "STK-16_pct_by_sector": {s: pct(s, "STK-16") for s in sectors_sorted},
            "note": "University-anchor classification needs anchor_type cross-reference; reported as raw pct here.",
        }

    out = {
        "source": "diagnostic library, canonical pool (canonical-schema runs only)",
        "sectors": sectors_sorted,
        "n_unclassified": len(unclassified),
        "unclassified_examples": unclassified[:30],
        "below_threshold": {k: len(v) for k, v in buckets.items() if len(v) < 5},
        "grid": grid,
        "homogeneity_rank_high_to_low": homogeneity_rank,
        "heterogeneity_rank_low_variance_to_high": heterogeneity_rank,
        "claim_check": claims,
    }
    json.dump(out, open(f"{OUT}/q2_v3_sector_grid.json", "w"), indent=2)
    return out


# ─── Q2 V4 — leverage type distribution ────────────────────────────────
def q2_v4_leverage():
    runs = load_all_runs()
    nbd = [r for r in runs if r["canon_version"] == "current"]
    canonical = [r for r in runs if is_canonical_run(r)]

    def aggregate(pool, label):
        total = Counter()
        n_with = 0
        n_without = 0
        for r in pool:
            if any(not k.startswith("OTHER") and v > 0 for k, v in r["leverage_types"].items()):
                n_with += 1
            else:
                n_without += 1
            for k, v in r["leverage_types"].items():
                total[k] += v
        return {
            "label": label, "n_runs": len(pool),
            "n_runs_with_typed_leverage": n_with,
            "n_runs_without_typed_leverage": n_without,
            "counts": dict(total.most_common()),
            "total_typed_hypotheses": sum(v for k, v in total.items() if not k.startswith("OTHER")),
        }

    out = {
        "draft_claims_uk_nbd": {
            "Information flow": 111, "Boundary adjustment": 61,
            "Timing or sequencing": 52, "Constraint shift": 47, "Coupling exposure": 26,
        },
        "uk_nbd": aggregate(nbd, "current_canon_uk_nbd"),
        "canonical_pool": aggregate(canonical, "canonical_pool"),
        "full_library": aggregate(runs, "full_library"),
        "note": "Leverage hypothesis counts in scripts/generate_national_diagnostic.py are HARDCODED (with comment 'if you regenerate from JSON later, swap in real counts'). Verifying against parsed markdown.",
    }
    json.dump(out, open(f"{OUT}/q2_v4_leverage.json", "w"), indent=2)
    return out


# ─── Q3 — cross-continental resemblance ────────────────────────────────
def q3_resemblance():
    runs = load_all_runs()
    # Pool: every run with the full 9-stall fingerprint (canonical + legacy with parsed stalls)
    pool = [r for r in runs if len(r["stalls"]) == 9]

    conf_score = {"high": 1.0, "medium": 0.7, "low": 0.3, "indeterminate": 0.0}

    def signature(r):
        sig = {}
        for sid, cf in r["stacks"].items():
            score = conf_score.get(cf, 0)
            if score:
                sig[("stk", sid)] = score
        for sid, cf in r["stalls"].items():
            score = conf_score.get(cf, 0)
            if score:
                sig[("stl", sid)] = score
        return sig

    sigs = [(i, r, signature(r)) for i, r in enumerate(pool)]

    def cosine(a, b):
        keys = set(a) | set(b)
        if not keys:
            return 0.0
        dot = sum(a.get(k, 0) * b.get(k, 0) for k in keys)
        na = sum(v * v for v in a.values()) ** 0.5
        nb = sum(v * v for v in b.values()) ** 0.5
        return dot / (na * nb) if na and nb else 0.0

    THRESHOLD = 0.97
    edges = []
    for (i, _, si), (j, _, sj) in combinations(sigs, 2):
        s = cosine(si, sj)
        if s >= THRESHOLD:
            edges.append((i, j, s))

    parent = list(range(len(pool)))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(x, y):
        px, py = find(x), find(y)
        if px != py:
            parent[px] = py
    for i, j, _ in edges:
        union(i, j)

    components = defaultdict(list)
    in_some_edge = set()
    for i, j, _ in edges:
        in_some_edge.add(i); in_some_edge.add(j)
    for i in in_some_edge:
        components[find(i)].append(i)

    groups_ge3 = [v for v in components.values() if len(v) >= 3]
    groups_ge2 = [v for v in components.values() if len(v) >= 2]

    def summarise(idxs):
        members = [pool[i] for i in idxs]
        countries = sorted(set(_country_code(m) for m in members if _country_code(m)))
        continents = sorted(set(COUNTRY_CONTINENT.get(c) for c in countries if COUNTRY_CONTINENT.get(c)))
        return {
            "size": len(members),
            "n_countries": len(countries),
            "countries": countries,
            "n_continents": len(continents),
            "continents": continents,
            "members": [{"name": m["cluster_name"], "country_label": m.get("country"), "country_iso": _country_code(m)} for m in members],
        }

    summaries_ge3 = [summarise(v) for v in groups_ge3]
    summaries_ge2 = [summarise(v) for v in groups_ge2]
    multi_country_ge3 = sum(1 for g in summaries_ge3 if g["n_countries"] > 1)
    multi_country_ge2 = sum(1 for g in summaries_ge2 if g["n_countries"] > 1)
    multi_continent_ge3 = sum(1 for g in summaries_ge3 if g["n_continents"] > 1)

    # Named pair check
    named_pairs = [
        ("Greater Glasgow Life Sciences", "Philadelphia Life Sciences & BioTech"),
        ("Orlando Tourism Technology", "Bordeaux Metropolitan Innovation Ecosystem"),
        ("Belfast Cyber", "Singapore Cyber Security"),
        ("Orlando SpaceTech", "Adelaide Space Technology"),
        ("Singapore FinTech & Digital Assets", "Greater Glasgow Fintech"),
    ]
    by_name = {r["cluster_name"]: r for r in pool}
    pair_results = []
    for a, b in named_pairs:
        ra = by_name.get(a) or next((r for r in pool if a.lower() in r["cluster_name"].lower()), None)
        rb = by_name.get(b) or next((r for r in pool if b.lower() in r["cluster_name"].lower()), None)
        result = {"a": a, "b": b,
                  "a_resolved": ra and ra["cluster_name"],
                  "b_resolved": rb and rb["cluster_name"]}
        if ra and rb:
            result["similarity"] = round(cosine(signature(ra), signature(rb)), 3)
            sa = {sid: cf for sid, cf in ra["stacks"].items() if cf in ("high", "medium")}
            sb = {sid: cf for sid, cf in rb["stacks"].items() if cf in ("high", "medium")}
            shared = sorted(set(sa) & set(sb))
            result["shared_confident_stacks"] = [
                {"id": sid, "name": STK.get(sid, sid), "a_conf": sa[sid], "b_conf": sb[sid]}
                for sid in shared
            ]
        pair_results.append(result)

    out = {
        "source": "diagnostic library full pool (n=391, runs with parsed 9-stall fingerprint) — pairwise cosine on stacks+stalls signature",
        "threshold": THRESHOLD,
        "n_pool": len(pool),
        "n_pairwise_edges": len(edges),
        "n_groups_size_ge2": len(groups_ge2),
        "n_groups_size_ge2_multi_country": multi_country_ge2,
        "n_groups_size_ge3": len(groups_ge3),
        "n_groups_size_ge3_multi_country": multi_country_ge3,
        "n_groups_size_ge3_multi_continent": multi_continent_ge3,
        "draft_framing": "27 groups, 21 multi-country",
        "groups_size_ge3": summaries_ge3,
        "groups_size_ge2": summaries_ge2,
        "named_pair_check": pair_results,
    }
    json.dump(out, open(f"{OUT}/q3_resemblance.json", "w"), indent=2)
    return out


# ─── Q4 — deep-dive cards ──────────────────────────────────────────────
def q4_cards():
    nbd = json.load(open(f"{ROOT}/docs/launch_document/cross_region_appraisal.json"))
    runs = load_all_runs()
    nbd_runs = [r for r in runs if r["canon_version"] == "current"]
    gg_runs = [r for r in runs if r["ecosystem_slug"] == "greater_glasgow"]
    orl_runs = [r for r in runs if "orlando" in r["ecosystem_slug"]]
    cj = json.load(open(f"{ROOT}/clusters.json"))
    canonical = [r for r in runs if is_canonical_run(r)]

    out = {
        "uk_nbd": {
            "draft_claims": {"clusters": 169, "regions": 25, "evidence": 16317},
            "appraisal_json": {"n_clusters": nbd["n_clusters"], "n_regions": nbd["n_regions"]},
            "current_canon_runs": {
                "n_runs": len(nbd_runs),
                "n_ecosystems": len(set(r["ecosystem_slug"] for r in nbd_runs)),
                "evidence_sum": sum(r["evidence_count"] for r in nbd_runs),
            },
            "regions_inconsistency_note": "appraisal n_regions=24 vs structural_twins.json has 25 keys vs draft says 25.",
        },
        "greater_glasgow": {
            "draft_claims": {"clusters": 8, "evidence": 978},
            "computed": {
                "n_runs": len(gg_runs),
                "evidence_sum": sum(r["evidence_count"] for r in gg_runs),
                "cluster_names": [r["cluster_name"] for r in gg_runs],
            },
        },
        "orlando": {
            "draft_claims": {"clusters": 10, "evidence": 582},
            "computed": {
                "n_runs": len(orl_runs),
                "evidence_sum": sum(r["evidence_count"] for r in orl_runs),
                "cluster_names": [r["cluster_name"] for r in orl_runs],
            },
        },
        "cluster_library": {
            "draft_claims": {"clusters": 377, "countries": 57},
            "v3_clusters_json": {
                "n_clusters": len(cj),
                "n_countries": len(set(c["country"] for c in cj if c.get("country"))),
            },
            "v3_canonical_pool": {
                "n_runs": len(canonical),
                "n_countries_label": len(set(r["country"] for r in canonical if r.get("country"))),
            },
        },
    }
    json.dump(out, open(f"{OUT}/q4_cards.json", "w"), indent=2)
    return out


if __name__ == "__main__":
    print("Q1…")
    q1_headline()
    print("Q2 V1…")
    q2_v1_stalls()
    print("Q2 V2…")
    q2_v2_stacks()
    print("Q2 V3…")
    q2_v3_sector_grid()
    print("Q2 V4…")
    q2_v4_leverage()
    print("Q3…")
    q3_resemblance()
    print("Q4…")
    q4_cards()
    print(f"\nAll outputs written to {OUT}")
