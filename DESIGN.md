---
name: Discipline Tracker
description: A witnessed ledger of becoming — earned medallions, stamped numbers, no cards pretending to be cards.
colors:
  ink-ground: "#16120d"
  ledger-page: "#1f1912"
  bone-text: "#ece4d6"
  faded-ink: "#a89a84"
  brass: "#c08a3e"
  brass-wash: "#3a2e1c"
  hairline: "#3a322a"
  rust: "#a6503a"
  sage: "#7c9473"
typography:
  heading:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Source Sans 3, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16px"
    lineHeight: 1.55
  label-mono:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, monospace"
    letterSpacing: "-0.01em"
rounded:
  flat: "0px"
  coin: "50%"
spacing:
  sm: "8px"
  md: "16px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink-ground}"
    rounded: "{rounded.flat}"
    padding: "10px 18px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.bone-text}"
    rounded: "{rounded.flat}"
  tag-chip:
    backgroundColor: "transparent"
    rounded: "{rounded.flat}"
    padding: "3px 8px"
---

# Design System: Discipline Tracker

## Overview

**Creative North Star: "The Milestone Ledger"**

Discipline Tracker refuses the generic SaaS-dashboard arrangement — gray task cards floating on a neutral ground, one lone brand-blue accent doing every job. Instead it reads like a personal record book: a near-black ink ground, ruled hairlines instead of card shadows, stamped mono numerals for anything measured (dates, hours, streaks), and a single committed brass accent standing in for "earned." Nothing is rounded except the one motif reserved for achievement — a coin-like medallion — so when something finally *is* round, it means something.

The system was chosen deliberately over the tool's own first instinct: the build process rolled a different "habit blanket" direction, and the user chose this milestone-ledger direction instead because it maps almost exactly onto the product's real mechanism — earned progress, a witnessed public record, serious identity-transformation framing — translated into an original visual language rather than any single program's literal iconography.

**Key Characteristics:**
- Near-black warm ink ground (dark-first; the use scene is an evening, alone, trying to start)
- One committed brass accent, never diluted into a rainbow of UI colors
- Flat everywhere except the one circular "earned" motif
- Mono numerals wherever a value is measured, not decorative
- Hairline rules do the work drop shadows usually do

## Colors

A warm near-black ground, one committed brass accent, and two quiet state colors — never a rainbow of UI chrome.

### Primary
- **Brass** (#c08a3e): the single "earned" accent — primary buttons, active nav state, filled progress, the coin toggle when checked, the wordmark.

### Neutral
- **Ink Ground** (#16120d): page background (dark mode default).
- **Ledger Page** (#1f1912): elevated surface — cards, panels, the ritual timer screen.
- **Bone Text** (#ece4d6): primary text on dark ground.
- **Faded Ink** (#a89a84): secondary/dim text, breadcrumbs, labels.
- **Hairline** (#3a322a): every rule, border, and row divider — never a shadow.

### Secondary (state colors)
- **Rust** (#a6503a): danger/delete actions, the "important" tag, overdue signaling.
- **Sage** (#7c9473): "done"/over-target progress fill, the "quick win" tag.

Light mode re-tints every token (warm paper #f2ecdf ground, deepened brass #96682a for contrast) rather than inverting; it is a second rendering of the same world, not a different one.

### Named Rules
**The One Accent Rule.** Brass is the only color allowed to mean "do this" or "this is earned." State colors (rust, sage) are reserved for status, never used interchangeably with brass for emphasis.

## Typography

**Display Font:** Roboto Slab (with Georgia, serif fallback)
**Body Font:** Source Sans 3 (with system sans fallback)
**Label/Mono Font:** JetBrains Mono (with ui-monospace fallback)

**Character:** A confident slab carries headings with ledger authority; a plain humanist sans carries body text without getting in the way; a monospace marks anything that was measured rather than written — dates, hours, streak counts — so the eye learns to trust mono numerals as data, not decoration.

### Hierarchy
- **Display/Headline** (700, h1–h3, -0.01em tracking): page titles, section headers, the wordmark.
- **Body** (400, 16px, 1.55 line-height): all prose and form content.
- **Label** (600, 11–12px, uppercase, 0.06–0.08em tracking): nav items, field labels, breadcrumbs, tag chips.
- **Mono/Numeral** (JetBrains Mono, tabular-nums): dates, the ritual countdown timer, streak counts, planned/actual hours, bar-chart axis labels.

### Named Rules
**The Measured-Number Rule.** Monospace is reserved for values that were counted or logged — never used as a generic "technical-looking" costume elsewhere.

## Layout

Single-column content capped at 880px, centered, with generous 20–28px outer padding. No sidebar, no multi-column dashboard grid — every page is a vertical sequence of ledger panels read top to bottom, matching the product's own Year→Month→Week→Day drill-down structure. The homepage photo wall is the one grid layout in the system (`auto-fill, minmax(160px, 1fr)`), deliberately distinct as the "experience" surface against the otherwise linear operate-mode pages.

## Elevation & Depth

Flat by design — no shadows anywhere in the system. Depth is conveyed two ways: a tone shift between the page ground and the slightly lighter "ledger page" surface, and hairline rules (`border-top: 1px solid`) separating stacked panels the way ruled lines separate ledger entries. A card never floats; it sits flush against the one above it.

### Named Rules
**The Flat-By-Default Rule.** No `box-shadow` exists anywhere in the stylesheet. If something needs to look "elevated," it gets a hairline and a tone shift, never a shadow.

## Shapes

Zero border-radius everywhere — buttons, inputs, cards, tag chips, heatmap cells — except the one reserved motif: true circles (`border-radius: 50%`) on the task-completion coin toggle and the homepage's medallion call-to-action. Rounding is not a default; it is a deliberate, singular signal for "this is earned."

### Named Rules
**The One Round Thing Rule.** Circles are reserved for the medallion/coin motif only. Nothing else in the system is ever rounded.

## Components

### Buttons
- **Shape:** flat rectangle, 0 radius, uppercase label, 0.06em tracking.
- **Primary:** brass fill (#c08a3e), ink-dark text (#16120d) — reads as stamped lettering on a brass plate.
- **Secondary:** transparent, hairline border, brass border/text on hover.
- **Danger:** rust fill (#a6503a), same flat shape.

### Chips (tags)
- **Style:** transparent background, 1px border in the tag's own color (via a `--chip-color` custom property), mono uppercase label — reads as an ink-stamped category mark, not a modern pill badge.
- **State:** in the add/edit tag picker, unselected chips sit at 55% opacity (ghost/unstamped); selecting one fills it solid in its own color with dark text (stamped).

### Cards / Containers
- **Corner Style:** 0 radius, always.
- **Background:** `ledger-page` tone, one shade lighter than the page ground.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Border:** `border-top: 1px hairline` only; stacked cards share rules rather than each getting a full box outline.

### Inputs / Fields
- **Style:** no box at all — a bottom-border-only underline field (ledger fill-in-the-blank), transparent background.
- **Focus:** underline color shifts from hairline to brass.

### Navigation
- Uppercase, 12px, 600 weight, 0.08em tracking labels; active state is a brass underline (2px), not a filled pill. The homepage additionally carries a `.ledger-masthead` — wordmark in Roboto Slab plus today's date and current streak in mono — as that surface's distinctive first-viewport treatment; inner pages use the plain nav strip.

### Task-completion coin (signature component)
A custom `appearance: none` circular checkbox: an empty brass ring at rest, fills solid brass with a small inset cutout when checked — the one place in the system where "done" is rendered as a medallion rather than a checkmark.

## Do's and Don'ts

### Do:
- **Do** keep brass as the only color meaning "primary action" or "earned" — never introduce a second brand color.
- **Do** use mono numerals for every measured value (dates, hours, streaks, countdowns).
- **Do** separate stacked panels with a hairline `border-top`, never a box-shadow or gap-plus-border combo.
- **Do** reserve true circles for the coin/medallion motif only.

### Don't:
- **Don't** add rounded corners to buttons, cards, inputs, or tag chips — zero radius is the system, not a placeholder.
- **Don't** add drop shadows, glass, or blur anywhere — depth comes from tone and hairlines only.
- **Don't** fill tag chips solid by default — only the "selected" state in a picker fills solid; static display chips stay outlined.
- **Don't** use monospace for body prose or headings — it is reserved for measured/logged values.
