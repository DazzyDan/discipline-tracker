# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Single owner, personal use only — not multi-tenant. Pattern: can sustain deep focus once a task is started, but has a sharp activation-energy barrier against starting tasks when unsupervised; behaves differently when an activity feels observed/accountable versus private.

## Product Purpose
Close the "I decided to do this" → "I am doing this" gap. Hierarchical goal tracking (Year → Month → Week → Day) with time logging and planned-vs-actual comparison; a "starting ritual" (pre-task checklist → tiny first-step reveal → 5-minute commit timer) that directly targets the activation-energy blocker rather than just listing tasks; a vision-board homepage of the owner's own photos representing who they want to become; a public accountability log (calendar heatmap) that substitutes for the feeling of being watched; and analytics/weekly reflection on when starting actually happens versus stalls.

## Positioning
Not a generic to-do app. Two things a generic to-do app does not do: (1) it targets task-initiation friction specifically — checklist → tiny first step → 5-minute timer — not just task listing or reminders; (2) the GitHub repo itself is the database and GitHub Pages the host, so the owner's own public visit/commit history functions as a lightweight social-accountability substitute, with zero backend to run or pay for.

## Operating Context
Single owner, used mostly from one browser/device, daily. Hosted on GitHub Pages at a public repo (dazzydan.github.io/discipline-tracker). Reads are public and unauthenticated; writes require a GitHub fine-grained personal access token the owner pastes into Settings, stored only in that browser's localStorage. No account system and no login flow for anyone else — visitors can only view.

## Capabilities and Constraints
Plain HTML/CSS/vanilla JS only — no build step, no framework, no npm dependencies; must keep working as flat files served directly by GitHub Pages. No backend server; all data (`goals.json`, `logs.json`, `config.json`, `reflections.json`) lives as JSON files committed to the repo and read via raw.githubusercontent.com. Tasks carry user-defined colored tags (note/subtask/quick-win/important by default, editable in Settings). The repo must stay public for the no-backend read model to work.

## Brand Commitments
Name stays "Discipline Tracker" — confirmed by the owner, keep it in the title and headings across the redesign.

## Evidence on Hand
Real personal vision-board photos already committed at `images/vision/` (5 images) and listed in `data/config.json` under `vision.images` — these are the owner's actual personal photos representing their goals/identity, not placeholder or stock imagery; design around them as real content, don't treat them as decoration or replace them. No real usage history yet beyond a seeded sample task, which is being replaced by real tasks through the quick-add flow.

## Product Principles
- Friction reduction beats willpower: every screen or step must lower, never raise, the cost of starting.
- Public-by-default accountability is load-bearing: the public pages (homepage streak teaser, Log heatmap) are the "someone's watching" substitute — the redesign must not hide or weaken that visibility.
- One coherent visual system across all six pages, not a per-page patchwork.
- No backend, ever: every design decision must still work as static files plus client-side GitHub API calls.
- Personal, not corporate: a single person's discipline tool, not a SaaS product — avoid generic SaaS-template visual tells.

## Accessibility & Inclusion
No specific accessibility requirement established; no assistive-technology needs stated by the owner.
