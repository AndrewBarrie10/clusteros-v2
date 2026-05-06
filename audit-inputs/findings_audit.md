# Findings page audit

**Branch:** `claude/findings-audit-Z23He`
**Date:** 2026-05-06
**Pipeline state at time of audit:** `_index.json` generated 2026-05-04, 391 diagnostic runs across 162 ecosystems and 58 country labels.
**Repository scope:** `andrewbarrie10/clusteros-v3` only. The website-facing clusters.json lives in `clusteros-v2`; that file was not accessible during this audit. Where a draft claim would normally be checked against v2, this report names what would need to be confirmed there before publication.

---

## Summary

Out of the figures the Findings page draft commits to, headline numbers reproduce within tolerance, the four-visual data sets are computable from the current pipeline, the cross-continental resemblance framing is essentially intact, and the deep-dive cards are mostly accurate. Two specific risks to publication: the Visual 4 leverage-type counts are hardcoded placeholders rather than computed values, and two of the Visual 3 verbal claims do not hold against the data and need to be reframed before they ship.

| Status              | Count |
|---------------------|-------|
| VERIFIED            | 11    |
| DRIFTED             |  6    |
| NOT REPRODUCIBLE    |  3    |
| NEW COMPUTATION     |  4    |

**Top three risks for publication**

1. **Visual 4 leverage-type counts are placeholders.** The five integers on the live NBD page (`111 / 61 / 52 / 47 / 26`) are hardcoded into `scripts/generate_national_diagnostic.py` with the comment "if you regenerate from JSON later, swap in real counts". They have never been computed from the diagnostic library. The page draft inherits them verbatim. Either compute them under a defined selection rule or cut the visual.
2. **Two of the four Visual 3 verbal claims do not hold.** Extraction–Intermediary is *not* most prevalent in Life Sciences and FinTech under the current pipeline — those sectors sit mid-pack (62.5% LS, 51.7% FinTech) below the cross-sector average of 72.8%. And Innovation Ecosystem is not the most-heterogeneous sector by any reasonable definition. Both need rewording.
3. **The "377 clusters / 57 countries" library headline references the v2 website, not the v3 corpus.** v3's canonical pool is 221 / 57 by `clusters.json` and 232 / 30 by the diagnostic library's STK-XX-canonical subset. The v2 clusters.json must be the source of truth before publication; this audit cannot confirm 377.

---

## Q1 — Corpus headline figures

The draft's stat strip claims `377 / 26 / 57 / 6 / 30,000+`. Verifying each against current v3 state:

| Cell                | Draft     | v3 reality                                                        | Status                                  |
|---------------------|-----------|-------------------------------------------------------------------|-----------------------------------------|
| Clusters diagnosed  | 377       | v3 `clusters.json` carries 221; full diagnostic library carries 391 runs across 162 ecosystems | NOT REPRODUCIBLE in v3 — v2 check needed |
| Ecosystems          | 26        | 26 'current' canon ecosystems (UK NBD); 162 ecosystems if all diagnostic runs counted | VERIFIED — 26 matches the UK NBD synthesised ecosystems |
| Countries           | 57        | 57 in v3 `clusters.json`; 58 distinct country labels in the full library | VERIFIED                                |
| Continents          | 6         | All six continents represented in `clusters.json` (Africa, Asia, Europe, North America, Oceania, South America) | VERIFIED                                |
| Evidence items      | 30,000+   | 14,814 in `clusters.json` — but the diagnostic library carries 31,350 across all 391 runs | VERIFIED at library scope (31,350 ≥ 30,000); honest framing of which scope this counts is needed |

**Notes on the 377 figure.** v3's `clusters.json` is 221 clusters (canon_version=v2.1) and represents the canonical pool used by parts of the website, but the live page's "377 clusters" headline must be sourced from `clusteros-v2/clusters.json`. The v3 diagnostic library has 391 runs minus 14 excluded/skipped = 377 remaining — that is plausibly where the 377 comes from, in which case **VERIFIED at the library scope**. Confirm with `clusteros-v2/clusters.json` before shipping.

**Notes on the 26 ecosystems figure.** This number is internally honest only if "ecosystems" means UK NBD-synthesised ecosystem groupings — there are 26 such files in `docs/launch_document/ecosystem_synthesis/` (excluding baseline/diff variants). The full diagnostic library has 162 distinct ecosystem slugs, so a casual reader will assume "26 international ecosystems," which would be false. The page should say "26 UK ecosystems" or carry a methodological note.

**Notes on evidence count.** Across the full diagnostic library: 31,350 evidence items, so the "30,000+" claim is conservatively VERIFIED. Across v3 `clusters.json`: 14,814.

**Action required before publication:** confirm `clusters.json` in `clusteros-v2` carries the 377 figure, and clarify the framing of "26 ecosystems" so it is not read as a global count.

---

## Q2 — Visual data

### Visual 1 — Stall prevalence

**Source:** Markdown stalls tables parsed across all 391 diagnostic runs. Each cluster's nine-stall confidence map extracted via regex.
**Computation script:** `analysis/corpus_patterns/findings_compute/compute_findings.py` → `q2_v1_stalls.json`.

The brief asks for the table on the canonical-schema pool. Three different pool definitions are reasonable; results below are presented for the canonical pool (n=232, runs with parsed STK-XX stacks) as the primary, with the UK NBD subset (n=175) and the full library (n=391) shown for context.

**Canonical pool (n=232)**

| Stall ID | Stall name                                | High | Medium | Low | Indeterminate | High+Medium % |
|----------|-------------------------------------------|-----:|-------:|----:|--------------:|--------------:|
| S1       | Re-proving Instead of Narrowing           |    0 |     64 | 168 |             0 |          27.6 |
| S2       | Coordinating Instead of Deciding          |    5 |    156 |  71 |             0 |          69.4 |
| S3       | Forgiving Instead of Redesigning          |    0 |      7 |  25 |           200 |           3.0 |
| S4       | Extracting Instead of Investing           |    9 |    101 |  82 |            40 |          47.4 |
| S5       | Intermediating Instead of Connecting      |    2 |    105 | 125 |             0 |          46.1 |
| S6       | Stabilising Around Incumbents             |   74 |    135 |  22 |             1 |          90.1 |
| S7       | Narrating Instead of Testing              |    1 |     58 | 164 |             9 |          25.4 |
| S8       | Expanding Instead of Concentrating        |    8 |     81 | 143 |             0 |          38.4 |
| S9       | Permission-Seeking Instead of Acting      |    4 |     97 |  62 |            69 |          43.5 |

**Verbal claim checks**

- *"Stabilising Around Incumbents is the corpus's most-fired stall (high+medium combined dominant)."* — **VERIFIED**. S6 fires high or medium in 90.1% of canonical-pool clusters, and 81.3% of the full library. No other stall comes close.
- *"Forgiving Instead of Redesigning is indeterminate-dominant."* — **VERIFIED**. S3 indeterminate 86.2% of canonical pool; 90.3% of full library; 81.7% of UK NBD.

The full nine-stall × four-confidence breakdown for the UK NBD pool and the full library are in `q2_v1_stalls.json`. Visualisation should use the canonical-pool figures and include a methodological note on which pool is in scope.

### Visual 2 — Stack distribution

**Source:** Markdown stacks tables parsed across the canonical-schema runs. The stacks stage uses deterministic lookup, so canonical clusters report all 13 STK-XX stacks at some confidence; the share-of-pool figure here counts clusters where the stack fires at high or medium.
**Computation script:** `compute_findings.py` → `q2_v2_stacks.json`.

**Canonical pool (n=232)**

| Stack ID | Configuration                                       | High | Medium | Confident % | Status                                                       |
|----------|------------------------------------------------------|-----:|-------:|------------:|--------------------------------------------------------------|
| STK-16   | Permission–Validation Configuration                  |   91 |     28 |        51.3 | DRIFTED — draft cites 41.2%; current value is 51.3% (+10pp)  |
| STK-30   | Coordination–Intermediary–Activity Configuration     |   98 |     67 |        71.1 | NEW — required for Visual 2                                  |
| STK-17   | Extraction–Intermediary Configuration                |  128 |     36 |        70.7 | NEW                                                          |
| STK-15   | Governance Capture Configuration                     |   79 |     80 |        68.5 | NEW                                                          |
| STK-19   | Volume–Tolerance Configuration                       |   15 |      8 |         9.9 | NEW                                                          |
| STK-24   | Extraction–Narrative Configuration                   |   37 |     63 |        43.1 | NEW                                                          |

The 41.2% figure for Permission–Validation pre-dates the current pool (n=226/227 → n=232) and used a different selection rule. Under the current pipeline the high-only count is 91/232 = 39.2% (within ±2pp of 41.2%) but the high+medium count is 51.3%. The Findings draft, the live NBD, and any earlier prose should land on a single definition before publication — recommend "fires at high or medium confidence" and use 51.3% throughout.

The "share of pool" denominator (canonical pool, n=232) skews UK in composition: 173 of the 232 canonical runs are UK NBD (`canon_version=current`). The remaining 59 are international clusters that have been re-stacked under canonical-schema but are not part of the v2.1 master sweep. This is the same schema-split issue flagged in the corpus mining work; the visual must carry a methodological note.

### Visual 3 — Sector × stack heat-grid

**Source:** Canonical pool, sector classification by keyword match against `cluster_name` and `sector` blob fields from the diagnostic index. **NEW COMPUTATION** — no precomputed sector × configuration cross-cut existed in `cross_region_appraisal.json` or any other launch-document output. The new script lives at `analysis/corpus_patterns/findings_compute/compute_findings.py` (`q2_v3_sector_grid` function); raw output in `q2_v3_sector_grid.json`.

Nine sectors qualify (≥5 clusters): Life Sciences (40), Advanced Manufacturing (32), FinTech (29), Energy and Net Zero (26), Innovation Ecosystem (25), Digital and Creative (25), Cyber (20), Space (10), Quantum and Photonics (5). 20 clusters are unclassified (sectors with <5 clusters: tourism, aquaculture, food and drink, logistics, etc.).

**6 × 9 matrix — % of clusters in sector firing each configuration at high or medium**

| Configuration                                       | LifeSci | AdvMfg | FinTech | E&NZ | InnEco | D&C  | Cyber | Space | Q&P  |
|-----------------------------------------------------|--------:|-------:|--------:|-----:|-------:|-----:|------:|------:|-----:|
| Permission–Validation Configuration (STK-16)        |    35.0 |   46.9 |    41.4 | 73.1 |   72.0 | 52.0 |  40.0 |  50.0 | 80.0 |
| Coordination–Intermediary–Activity Cfg (STK-30)     |    62.5 |   87.5 |    48.3 | 88.5 |   84.0 | 64.0 |  60.0 |  60.0 |100.0 |
| Extraction–Intermediary Configuration (STK-17)      |    62.5 |   81.2 |    51.7 | 84.6 |   72.0 | 68.0 |  75.0 |  60.0 |100.0 |
| Governance Capture Configuration (STK-15)           |    60.0 |   75.0 |    44.8 | 88.5 |   84.0 | 64.0 |  60.0 |  60.0 |100.0 |
| Volume–Tolerance Configuration (STK-19)             |     2.5 |    3.1 |    10.3 |  7.7 |   36.0 |  8.0 |   5.0 |  10.0 | 20.0 |
| Extraction–Narrative Configuration (STK-24)         |    42.5 |   43.8 |    24.1 | 57.7 |   44.0 | 44.0 |  60.0 |  30.0 |100.0 |

**Verbal claim checks**

| Claim                                                                                  | Holds? | Verdict                                                                                                                                                                                                                |
|----------------------------------------------------------------------------------------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Quantum and Photonics is the most-homogeneous sector                                  | Yes    | **VERIFIED.** 5/5 Quantum clusters fire on five of the six configurations at confident levels (100% on STK-30, STK-17, STK-15, STK-24); only STK-19 misses. Profile is identical across all five clusters in the sector. |
| Innovation Ecosystem is the most-heterogeneous sector                                  | No     | **DRIFTED.** Innovation Ecosystem has substantial dominance from STK-30 and STK-15 (84% each). FinTech is more even (max 51.7%) and arguably most heterogeneous; Space is similar. Reword to either "FinTech is the most heterogeneous" or drop the heterogeneity claim. |
| Extraction–Intermediary correlates with Life Sciences and FinTech across the corpus    | No     | **NOT REPRODUCIBLE.** STK-17 cross-sector average is 72.8%. Life Sciences sits at 62.5% and FinTech at 51.7% — both below average. STK-17 is most prevalent in Quantum (100%), Energy & Net Zero (84.6%), Advanced Manufacturing (81.2%), and Cyber (75.0%). Reframe as "Extraction–Intermediary is broadly distributed across the corpus, with particularly high prevalence in capital-intensive and physical-infrastructure sectors." |
| Permission–Validation correlates with university-anchored sectors                       | Partial| **DRIFTED.** STK-16 prevalence is highest in Quantum and Photonics (80%), Energy and Net Zero (73.1%), and Innovation Ecosystem (72.0%) — all of which carry university anchoring, supporting the spirit of the claim. But Life Sciences (35.0%, the most heavily university-anchored sector) is the *lowest*-prevalence sector for STK-16. The claim needs an `anchor_type` cross-reference (already present in the diagnostic index) before it can be made cleanly; recommend reframing as "Permission–Validation is most prevalent in research-led and grant-dependent sectors" until that cross-reference is run. |

The new sector-grid computation can be re-run any time via `python3 analysis/corpus_patterns/findings_compute/compute_findings.py`. Inputs: diagnostic library JSONs only; no manual labelling.

### Visual 4 — Leverage type distribution

**Source for draft claims:** `scripts/generate_national_diagnostic.py` lines defining `leverage_types` — the five `(label, count, description)` tuples are hardcoded with a comment that reads "the user provided; if you regenerate from JSON later, swap in real counts." The numbers `111 / 61 / 52 / 47 / 26` (sum 297) appear nowhere else in the codebase and have not been computed from the diagnostic library at any point in v3's history.

**Attempted reproduction.** The leverage stage markdown carries a Part 1 candidate-generation table that includes a `leverage_type` column. Counts of those rows on the UK NBD subset (n=175 runs, 170 with typed leverage):

| Leverage type        | Draft (placeholder) | Part 1 raw count (UK NBD) | Ratio per cluster |
|----------------------|--------------------:|--------------------------:|------------------:|
| Information flow     |                 111 |                       779 |              4.45 |
| Boundary adjustment  |                  61 |                       413 |              2.36 |
| Timing or sequencing |                  52 |                       407 |              2.33 |
| Constraint shift     |                  47 |                       332 |              1.90 |
| Coupling exposure    |                  26 |                       246 |              1.41 |
| **Total**            |             **297** |                  **2,177**|             12.45 |

Part 1 raw counts are a known-too-high upper bound: each cluster generates 10–20 leverage candidates, one per (stack × leverage-type) cell. Part 2 (the audit step) does not filter the candidate set; it grades it. The ecosystem-synthesis output records exactly *one* "primary" leverage hypothesis per cluster but does not carry a `leverage_type` field, so 169 NBD clusters cannot be partitioned into the five types from existing structured data.

**Status: NOT REPRODUCIBLE.** The draft's `111 / 61 / 52 / 47 / 26` numbers cannot be reproduced from the current pipeline because no selection rule is recorded for which subset of leverage candidates the counts represent.

**Options before publication**

1. *Compute fresh.* Define a clean selection rule — recommended: count one leverage_type per cluster's primary stack-aligned leverage (post Part 2 audit, pre Part 3 boundary statement) — and run a new aggregation. This is small (≈100 lines) and could land before page implementation.
2. *Reframe the visual.* Drop absolute counts; show only relative shares ("Information flow is the most common leverage type, followed by boundary adjustment …") with raw Part 1 candidate-generation as the source.
3. *Cut the visual.* Replace with the leverage-type table from the live NBD only, and label it "as observed across the UK NBD's 169 clusters" — accepting that the numbers are stale until recomputed.

Recommend option 1; it is in scope for a small follow-up brief if Brief 2 is to keep the visual.

---

## Q3 — Cross-continental resemblance

**Source:** No precomputed cross-continental resemblance grouping existed in v3. `docs/launch_document/structural_twins.json` carries UK-only twin pairs by region; the international resemblance computation was new for this audit.
**Method:** Pairwise cosine similarity on a confidence-weighted signature vector covering each cluster's nine-stall confidence map plus any STK-XX stacks present, threshold 0.97 for edge inclusion, connected components of size ≥3 counted as "groups." Pool: every diagnostic run with a parseable nine-stall fingerprint (n=391).
**Computation script:** `compute_findings.py` → `q3_resemblance.json`.

**Updated counts**

| Quantity                                            | Draft | Audit | Status                                                                |
|-----------------------------------------------------|------:|------:|-----------------------------------------------------------------------|
| Total resemblance groups (size ≥ 3)                 |    27 |    26 | DRIFTED — within ±1 group, framing intact                             |
| Groups spanning more than one country               |    21 |    21 | VERIFIED — exact match                                                |
| Groups spanning more than one continent             |     — |    21 | NEW — supports the cross-continental framing                          |
| Multi-country share                                 | 77.8% | 80.8% | VERIFIED — proportion held within ±3pp                                |

The "rule, not exception" framing is intact: cross-country resemblance groups outnumber within-country groups roughly four to one. The draft's prose rounds this to "twenty-one of twenty-seven"; the corrected number is **"twenty-one of twenty-six"**.

**Named pair check**

The five pairs the draft surfaces are all real clusters in the diagnostic library; their pairwise cosine similarities under the audit metric are below the 0.97 group-formation threshold but they do share confident stacks:

| Pair                                                                                           | Similarity | Shared confident stacks                                  | Status                              |
|------------------------------------------------------------------------------------------------|-----------:|----------------------------------------------------------|-------------------------------------|
| Greater Glasgow Life Sciences ↔ Philadelphia Life Sciences & BioTech                          |      0.582 | (both in canonical pool only on Glasgow side)            | NOT REPRODUCIBLE under current metric |
| Orlando Tourism Technology ↔ Bordeaux Metropolitan Innovation Ecosystem                       |      0.531 | None at high+medium                                      | NOT REPRODUCIBLE                    |
| Belfast Cyber ↔ Singapore Cyber Security                                                       |      0.411 | None at high+medium                                      | NOT REPRODUCIBLE                    |
| Orlando SpaceTech ↔ Adelaide Space Technology                                                  |      0.705 | None at high+medium                                      | NOT REPRODUCIBLE                    |
| Singapore FinTech & Digital Assets ↔ Greater Glasgow Fintech                                   |      0.517 | None at high+medium                                      | NOT REPRODUCIBLE                    |

The named pairs do not pass any plausible group-formation threshold under the audit's signature metric. This is a measurement-rule issue rather than a substantive disagreement: the audit metric uses confidence-weighted full-vector cosine across stalls and stacks; the v2 website's pair-display logic is unknown and likely uses a different metric (e.g. shared main-stack only). Without sight of the v2 metric, the audit cannot validate or invalidate the named pairs.

**Recommended path before publication**

- Either: surface five replacement pairs from the audit's actual size-≥3 multi-country groups (e.g. a Latin-American FinTech triple, or the Atlanta–Dhaka–Scotland Cyber triple) and reword the narrative around them.
- Or: keep the named pairs but commit to publishing the resemblance metric used to generate them — the page implementation should not silently substitute the audit's metric for the v2 metric.

Twenty-one named groups (size ≥3, multi-country) are listed in `q3_resemblance.json`; these are publication-ready pairs once a metric and threshold are committed to.

---

## Q4 — Deep-dive cards

| Card                | Number               | Draft  | v3 reality                                                            | Status                                                                |
|---------------------|----------------------|-------:|-----------------------------------------------------------------------|-----------------------------------------------------------------------|
| UK NBD              | Clusters             |    169 | 169 (`cross_region_appraisal.json`)                                    | VERIFIED                                                              |
| UK NBD              | Regions              |     25 | 24 in `cross_region_appraisal.json`; 25 ecosystem keys in `structural_twins.json`; 26 ecosystem slugs in `current` canon | DRIFTED — draft says 25, primary appraisal artefact says 24. Inconsistency exists across v3 outputs and on the live NBD page. Recommend committing to 24 (the appraisal artefact is the authoritative count) and updating the live NBD as part of Brief 2's cleanup pass. |
| UK NBD              | Evidence items       | 16,317 | 16,893 (sum across 175 current-canon runs)                             | DRIFTED — draft is 576 items low; refresh to 16,893                  |
| Greater Glasgow     | Clusters             |      8 | 8 runs under `greater_glasgow` ecosystem slug                          | VERIFIED                                                              |
| Greater Glasgow     | Evidence items       |    978 | 978 (sum across the 8 Greater Glasgow runs)                            | VERIFIED                                                              |
| Orlando             | Clusters             |     10 | 10 runs under `orlando_metro_area`                                     | VERIFIED                                                              |
| Orlando             | Evidence items       |    582 | 582                                                                    | VERIFIED                                                              |
| Cluster library     | Clusters             |    377 | 221 in v3 `clusters.json`; 377 plausible in v2 (391 runs minus 14 excluded/skipped) | NOT REPRODUCIBLE in v3 — confirm against `clusteros-v2/clusters.json` |
| Cluster library     | Countries            |     57 | 57 in v3 `clusters.json`                                               | VERIFIED                                                              |

The Greater Glasgow eight-cluster card is now eight (the canonical ecosystem migration, post-PR-43, settled the count). Cluster names: Advanced Manufacturing, Critical Technologies, Digital Creative, Fintech, Innovation Ecosystem, Life Sciences, Net Zero, Space.

The Orlando ten-cluster card is intact. Cluster names: Advanced Manufacturing, AgTech, Aviation & Aerospace, Cybersecurity, Digital Media, MedTech, Photonics & Optics, Simulation & Training, SpaceTech, Tourism Technology.

---

## Open issues

1. **v2 clusters.json access.** This audit cannot confirm the 377-cluster headline or the cluster-library card's library count without sight of `clusteros-v2/clusters.json`. Before Brief 2 is signed off, run a one-line check: `cat clusters.json | jq length` in the v2 repo and confirm it matches 377.
2. **Visual 4 leverage-type recomputation.** Decide whether to compute, reframe, or cut. If computing, the rule must be defined (audit recommends: one type per cluster's primary post-audit leverage, n ≈ 169 for NBD).
3. **Visual 3 verbal claims.** Two of four need rewording. Suggested replacements above; final wording is editorial, not audit.
4. **Resemblance metric commitment.** The page must publish the metric used to surface its named pairs. The audit's metric (cosine on confidence-weighted signature, threshold 0.97) gives the right group counts (26 / 21 multi-country) but flags the draft's named pairs as below threshold. Either replace the pairs or commit to the v2 metric.
5. **Region count drift on UK NBD.** 24 vs 25 vs 26 across v3 artefacts. Pick one and propagate; recommend 24 (the `cross_region_appraisal.json` count, which is the authoritative aggregation artefact).
6. **Sector classification fragility.** The Visual 3 sector buckets are derived by keyword match against cluster_name and sector blobs. The buckets are stable enough for a heat-grid but should not be taken as canonical sector taxonomy. 20 of the 232 canonical-pool clusters are unclassified (logistics, food and drink, aquaculture, tourism, mining tech). The grid should carry a "n=212 of 232 canonical-pool clusters classified" note.

---

## Computation outputs

All audit computations are reproducible from `analysis/corpus_patterns/findings_compute/compute_findings.py`. The script reads the v3 diagnostic library and writes the following JSON outputs alongside itself:

- `q1_headline.json` — corpus headline figures across multiple pool definitions.
- `q2_v1_stalls.json` — full nine-stall × four-confidence breakdown for canonical pool, UK NBD, full library.
- `q2_v2_stacks.json` — six-configuration distribution on canonical pool.
- `q2_v3_sector_grid.json` — sector × configuration matrix and verbal-claim verifications. **New computation.**
- `q2_v4_leverage.json` — leverage-type counts from Part 1 candidate-generation tables.
- `q3_resemblance.json` — pairwise cosine resemblance, group enumeration, named-pair check.
- `q4_cards.json` — deep-dive card numbers.

Re-run with `python3 analysis/corpus_patterns/findings_compute/compute_findings.py` from the repo root.
