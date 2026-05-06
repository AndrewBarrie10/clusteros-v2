#!/usr/bin/env python3
"""Generate cluster-library.json from clusters.json.

Reads clusters.json (377 entries, schema includes id, name, city, country (ISO-2),
stacks[], _evidence_count, _evidence_tier). Derives region, full country name,
continent, sector, and dominant configuration. Writes cluster-library.json at
the repo root.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ISO_TO_COUNTRY = {
    "AE": ("United Arab Emirates", "Asia"),
    "AR": ("Argentina", "South America"),
    "AT": ("Austria", "Europe"),
    "AU": ("Australia", "Oceania"),
    "BD": ("Bangladesh", "Asia"),
    "BE": ("Belgium", "Europe"),
    "BR": ("Brazil", "South America"),
    "CA": ("Canada", "North America"),
    "CH": ("Switzerland", "Europe"),
    "CL": ("Chile", "South America"),
    "CN": ("China", "Asia"),
    "CO": ("Colombia", "South America"),
    "CR": ("Costa Rica", "North America"),
    "CZ": ("Czech Republic", "Europe"),
    "DE": ("Germany", "Europe"),
    "DK": ("Denmark", "Europe"),
    "EE": ("Estonia", "Europe"),
    "EG": ("Egypt", "Africa"),
    "ES": ("Spain", "Europe"),
    "FI": ("Finland", "Europe"),
    "FR": ("France", "Europe"),
    "GB": ("United Kingdom", "Europe"),
    "GH": ("Ghana", "Africa"),
    "ID": ("Indonesia", "Asia"),
    "IL": ("Israel", "Asia"),
    "IN": ("India", "Asia"),
    "IT": ("Italy", "Europe"),
    "JP": ("Japan", "Asia"),
    "KE": ("Kenya", "Africa"),
    "KH": ("Cambodia", "Asia"),
    "KR": ("South Korea", "Asia"),
    "KZ": ("Kazakhstan", "Asia"),
    "LK": ("Sri Lanka", "Asia"),
    "MA": ("Morocco", "Africa"),
    "MN": ("Mongolia", "Asia"),
    "MX": ("Mexico", "North America"),
    "MY": ("Malaysia", "Asia"),
    "NG": ("Nigeria", "Africa"),
    "NL": ("Netherlands", "Europe"),
    "NO": ("Norway", "Europe"),
    "NZ": ("New Zealand", "Oceania"),
    "PA": ("Panama", "North America"),
    "PE": ("Peru", "South America"),
    "PH": ("Philippines", "Asia"),
    "PK": ("Pakistan", "Asia"),
    "PL": ("Poland", "Europe"),
    "PT": ("Portugal", "Europe"),
    "RW": ("Rwanda", "Africa"),
    "SA": ("Saudi Arabia", "Asia"),
    "SE": ("Sweden", "Europe"),
    "SG": ("Singapore", "Asia"),
    "TH": ("Thailand", "Asia"),
    "TW": ("Taiwan", "Asia"),
    "US": ("United States", "North America"),
    "UY": ("Uruguay", "South America"),
    "VN": ("Vietnam", "Asia"),
    "ZA": ("South Africa", "Africa"),
}

# Sector keywords. Each tuple is (regex, canonical name). The first match
# (after stable ordering by descending pattern length) wins for a given name.
SECTOR_PATTERNS_RAW = [
    # multi-word, capital-intensive / scientific
    (r"Quantum (?:&|and) Deep Science", "Quantum and Deep Science"),
    (r"Quantum (?:&|and) Photonics", "Quantum and Photonics"),
    (r"Photonics (?:&|and) Optics", "Photonics and Optics"),
    (r"Critical Technologies", "Critical Technologies"),
    (r"Compound Semiconductors", "Compound Semiconductors"),
    (r"Semiconductors?", "Semiconductors"),
    (r"Nanoelectronics", "Nanoelectronics"),
    (r"Hardware (?:&|and) Electronics", "Hardware"),
    (r"Hardware", "Hardware"),
    (r"Photonics", "Photonics"),
    (r"Quantum", "Quantum"),
    # advanced manufacturing
    (r"Advanced ?Manufacturing(?: Aerospace and Industrial Engineering)?", "Advanced Manufacturing"),
    (r"Advanced ?Materials", "Advanced Materials"),
    (r"Manufacturing Tech", "Manufacturing"),
    (r"Manufacturing", "Manufacturing"),
    # aerospace, space, defence
    (r"Aviation (?:&|and) Aerospace", "Aviation and Aerospace"),
    (r"Space (?:Technology|Coast)", "Space"),
    (r"SpaceTech", "Space"),
    (r"Space", "Space"),
    (r"Defence", "Defence"),
    # life sciences / health
    (r"Life Sciences? (?:&|and) (?:BioTech|Biotech|Robotics)", "Life Sciences"),
    (r"(?:Genome Valley |HELM )?Life ?Sciences?", "Life Sciences"),
    (r"BioMed (?:&|and) Digital Health", "BioMed and Digital Health"),
    (r"MedTech", "MedTech"),
    (r"HealthTech(?: (?:&|and) Digital Government)?", "HealthTech"),
    (r"Health Tech", "HealthTech"),
    (r"Health (?:and )?Life Sciences", "Health and Life Sciences"),
    (r"Health", "Health"),
    (r"Engineering Biology", "Engineering Biology"),
    (r"EngBio", "Engineering Biology"),
    # cyber
    (r"Cyber Security(?: (?:&|and) IT Services)?", "Cyber Security"),
    (r"Cybersecurity", "Cyber Security"),
    (r"Cyber", "Cyber Security"),
    # fintech / finance
    (r"FinTech (?:&|and) (?:Digital Assets|Payments|Mobility|Tech|Logistics Tech|Creative Tech|Crypto|Software|Enterprise Software)", "FinTech"),
    (r"Garment Tech (?:&|and) FinTech", "Garment Tech and FinTech"),
    (r"Fintech", "FinTech"),
    (r"FinTech", "FinTech"),
    (r"BPFS", "Business and Professional Services"),
    (r"Business (?:&|and) Professional Services", "Business and Professional Services"),
    # AI / robotics / deep tech
    (r"AI (?:&|and) (?:Deep Tech|Digital Tech|Enterprise Tech|Software|Cloud|Smart City|Robotics|Hardware)", "AI and Deep Tech"),
    (r"AI Software", "AI and Software"),
    (r"AI Robotics", "AI and Robotics"),
    (r"AI", "AI"),
    (r"Robotics (?:&|and) AI", "Robotics and AI"),
    (r"Robotics", "Robotics"),
    (r"Deep Tech (?:&|and) Semiconductors", "Deep Tech and Semiconductors"),
    (r"Deep Tech", "Deep Tech"),
    (r"Data (?:and |& )?AI", "Data and AI"),
    # net zero / clean / energy
    (r"Climate Tech Net Zero", "Climate Tech and Net Zero"),
    (r"CleanTech (?:&|and) (?:Energy Transition|Maritime Innovation|Energy)", "CleanTech"),
    (r"Clean(?: |-)?Tech", "CleanTech"),
    (r"Clean Energy", "Clean Energy"),
    (r"Net ?Zero", "Net Zero"),
    (r"MaritimeNetZero", "Maritime and Net Zero"),
    (r"Energy Transition", "Energy Transition"),
    (r"Energy", "Energy"),
    # digital / creative / media
    (r"Digital Creative", "Digital Creative"),
    (r"Digital Media", "Digital Media"),
    (r"Digital (?:&|and) (?:E-commerce|AI|Web3)", "Digital"),
    (r"Gaming (?:Digital |)(?:&|and) AI", "Gaming and Digital"),
    (r"Creative Tech (?:&|and) Gaming", "Creative Tech"),
    (r"Creative", "Creative"),
    (r"Digital", "Digital"),
    (r"Screen", "Screen"),
    # mobility / transport / logistics / maritime
    (r"Mobility (?:&|and) Auto Tech", "Mobility and Auto Tech"),
    (r"Automotive (?:&|and) Sustainability(?: Tech)?", "Automotive and Sustainability"),
    (r"Transport(?: Logistics Mobility)?", "Transport"),
    (r"Maritime Logistics", "Maritime and Logistics"),
    (r"Maritime", "Maritime"),
    (r"Marine", "Marine"),
    (r"Mobility", "Mobility"),
    (r"Logistics(?: Tech)?", "Logistics"),
    (r"Ports", "Ports"),
    # IT / enterprise / BPO
    (r"BPO (?:&|and) IT Services", "BPO and IT Services"),
    (r"IT Services (?:&|and) (?:Software|Digital)", "IT Services"),
    (r"Enterprise Tech (?:&|and) Mobility", "Enterprise Tech"),
    # tourism / hospitality / visitor
    (r"Tourism Technology", "Tourism Technology"),
    (r"Tourism (?:and )?Hospitality(?: Tech)?", "Tourism and Hospitality"),
    (r"Tourism", "Tourism"),
    (r"Visitor Economy", "Visitor Economy"),
    # simulation / training
    (r"Simulation (?:&|and) Training", "Simulation and Training"),
    # ag / food / forestry / aquaculture
    (r"AgTech", "AgTech"),
    (r"Agritech", "AgTech"),
    (r"Agri(?:-|\s)?food", "AgriFood"),
    (r"AgriFood", "AgriFood"),
    (r"Food (?:and|&) Drink", "Food and Drink"),
    (r"FoodDrink", "Food and Drink"),
    (r"Food Farming", "Food and Farming"),
    (r"Forestry", "Forestry"),
    (r"Aquaculture", "Aquaculture"),
    # additional UK NBD sector labels
    (r"Climate ?Tech", "Climate Tech"),
    (r"Clean ?Energy", "Clean Energy"),
    (r"Clean Growth", "Clean Growth"),
    (r"Low Carbon", "Low Carbon"),
    (r"Green Economy", "Green Economy"),
    (r"Healthtech", "HealthTech"),
    (r"Health ?Innovation", "Health Innovation"),
    (r"Agri ?Tech", "AgTech"),
    (r"Agri Food", "AgriFood"),
    (r"Built Environment Property", "Built Environment"),
    (r"AI Data Software", "AI and Data"),
    (r"Creative Media(?: Fashion)?", "Creative Media"),
    (r"Creative Industries", "Creative Industries"),
    (r"Financial(?: Professional)? Services", "Financial Services"),
    (r"Business Services", "Business Services"),
    (r"Chemicals", "Chemicals"),
    (r"Engineering", "Engineering"),
    (r"Environmental Intelligence", "Environmental Intelligence"),
    (r"Aerospace", "Aerospace"),
    (r"Digital Technology", "Digital"),
    (r"Defence(?: Security)?", "Defence"),
    # mining / govtech / innovation ecosystem
    (r"Mining Tech", "Mining Tech"),
    (r"GovTech(?: (?:&|and) Digital Infrastructure)?", "GovTech"),
    (r"Tech (?:&|and) Innovation Ecosystem", "Innovation Ecosystem"),
    (r"Innovation Ecosystem", "Innovation Ecosystem"),
    (r"Innovation", "Innovation"),
    (r"Tech", "Tech"),
]
SECTOR_PATTERNS = sorted(SECTOR_PATTERNS_RAW, key=lambda p: -len(p[0]))

CONFIDENCE_RANK = {"high": 3, "medium": 2, "low": 1}


def derive_sector_and_region(name):
    """Match the longest sector pattern that anchors at the end of the name.
    Returns (sector_canonical, region) or (None, name) if nothing matches."""
    for pat, canonical in SECTOR_PATTERNS:
        m = re.search(r'\b(' + pat + r')\s*$', name)
        if m:
            region = name[: m.start()].rstrip(" -–&,")
            return canonical, region.strip() or name
    return None, name


def pick_dominant_configuration(stacks):
    if not stacks:
        return None
    ranked = sorted(
        stacks,
        key=lambda s: (
            -CONFIDENCE_RANK.get(s.get("confidence", "").lower(), 0),
            s.get("canonical_id", "ZZZ"),
        ),
    )
    top = ranked[0]
    name = top.get("stack_name") or top.get("canonical_id") or None
    return name


def main():
    src = json.load(open(ROOT / "clusters.json"))
    out = []
    sector_misses = []
    for c in src:
        name = c.get("name") or c.get("id", "").replace("-", " ").title()
        iso = c.get("country", "")
        country_full, continent = ISO_TO_COUNTRY.get(iso, (iso, None))
        sector, region = derive_sector_and_region(name)
        if sector is None:
            sector_misses.append((c.get("id"), name))
        slug = c.get("id")
        entry = {
            "slug": slug,
            "name": name,
            "region": region,
            "country": country_full,
            "continent": continent,
            "sector": sector,
            "dominant_configuration": pick_dominant_configuration(c.get("stacks") or []),
            "pattern_tier": c.get("_evidence_tier"),
            "evidence_count": c.get("_evidence_count"),
            "url": f"/clusters/{slug}.html",
        }
        out.append(entry)

    # sort alphabetically by name for deterministic order
    out.sort(key=lambda e: e["name"].casefold())

    target = ROOT / "cluster-library.json"
    target.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")

    print(f"Wrote {len(out)} entries to {target.relative_to(ROOT)}")
    print(f"Sector misses: {len(sector_misses)}")
    if sector_misses:
        for sid, sname in sector_misses[:30]:
            print(f"  - {sid}: {sname}")


if __name__ == "__main__":
    main()
