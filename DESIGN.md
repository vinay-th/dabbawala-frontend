---
name: Bombay Ledger & Rail
colors:
  surface: '#fff8f0'
  surface-dim: '#dfd9d0'
  surface-bright: '#fff8f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f3ea'
  surface-container: '#f4ede4'
  surface-container-high: '#eee7de'
  surface-container-highest: '#e8e2d9'
  on-surface: '#1e1b16'
  on-surface-variant: '#4a463f'
  inverse-surface: '#33302a'
  inverse-on-surface: '#f7f0e7'
  outline: '#7b766e'
  outline-variant: '#ccc6bc'
  surface-tint: '#785a00'
  primary: '#785a00'
  on-primary: '#ffffff'
  primary-container: '#fff8f1'
  on-primary-container: '#8e6d18'
  inverse-primary: '#eac165'
  secondary: '#ba080b'
  on-secondary: '#ffffff'
  secondary-container: '#df2c23'
  on-secondary-container: '#fffbff'
  tertiary: '#076c41'
  on-tertiary: '#ffffff'
  tertiary-container: '#e7ffeb'
  on-tertiary-container: '#298154'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf9b'
  primary-fixed-dim: '#eac165'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5b4300'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4a9'
  on-secondary-fixed: '#410001'
  on-secondary-fixed-variant: '#930004'
  tertiary-fixed: '#9ef5be'
  tertiary-fixed-dim: '#82d8a3'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#005230'
  background: '#fff8f0'
  on-background: '#1e1b16'
  surface-variant: '#e8e2d9'
typography:
  display:
    fontFamily: Instrument Serif
    fontSize: 144px
    lineHeight: 136px
    letterSpacing: -0.035em
  display-md:
    fontFamily: Instrument Serif
    fontSize: 72px
    lineHeight: 74px
    letterSpacing: -0.025em
  display-mobile:
    fontFamily: Instrument Serif
    fontSize: 52px
    lineHeight: 54px
    letterSpacing: -0.03em
  body:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-sm:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  label:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  evidence:
    fontFamily: Geist Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  signboard:
    fontFamily: Barlow Condensed
    fontSize: 28px
    fontWeight: '800'
    letterSpacing: 0.06em
spacing:
  container: 1280px
  gutter: 32px
  text-max: 520px
---

## Brand & Style
A quiet, printed-paper product site with one cinematic idea: the whole page is a single
steel tiffin, and scrolling opens it one tier at a time. Premium SaaS restraint
(huge type, huge whitespace, almost no chrome) with Mumbai carried by the tiffin, the
skyline backdrop, the local train, the monsoon, railway signboard numerals and one
Marathi line. Mumbai through atmosphere, not ornament.

## Rules of restraint
- One idea per viewport: one headline, one description, one visual.
- No cards, no borders around text blocks, no badges, no stat rows, no ticker, no icon rows.
- Hard offset shadow only on the primary button. Everything else is flat.
- Yellow once per viewport (active tier or the CTA). Red only on "if it fails" stamps.
  Green only on signal lights. Teal and slate only as backdrop tones.
- No gradients, glass, blur, 3D, stock photos or emoji. Flat shaded vector only.
- Landing page only carries the story. Demo, replay, fleet, docs and stack live on
  separate pages and are NOT on this page.

## Colors
Chai Paper is the floor. Kaali Ink for text and outlines. Peeli Yellow marks the active
tier and the primary action. The backdrop uses Ink at 6-10% opacity on Paper; it should
disappear when you squint. Paper-Shade and Tiffin Steel are used for tiffin shading.
Monsoon Slate appears only as a slow background wash in the late stages.

## Typography
- Display: Instrument Serif, set very large and tight. One italic word per headline for emphasis.
- Body and UI: Geist. Generous line height, 520px max width.
- Labels and evidence: Geist Mono, uppercase, tracked.
- Signboard numerals (stage numbers, platform stations): Barlow Condensed ExtraBold,
  like railway enamel plates. Used only for numerals and station names.
- Marathi wordmark line only: Tiro Devanagari Marathi.

## Layout
12-column grid, 1280px container. Text block on the left (max 520px), tiffin on the
right. Section height is always 100vh. Large margins, left-aligned text.

## Components
- Primary button: yellow fill, ink text (Geist Mono caps), 2px ink border, 4px hard shadow,
  presses flat on click. Secondary: underlined text link with an arrow.
- Tiffin tier: flat steel illustration, 2px ink outline, three-tone vertical shading, steel
  clasp. Active tier fills Peeli Yellow.
- "If it fails" line: a small red rotated stamp word (DENIED, REFUSED, HALTED, SAFE-STOP)
  followed by one sentence.
- Evidence chip: Geist Mono on Paper-Shade, 1 per stage.
- Rail progress: a thin vertical or bottom rail with 5 station dots in Barlow Condensed.

## Backdrop (Mumbai, ambient, never competes with the text)
Three layers, all ink at 6-10% opacity:
1. Far: a line-art Mumbai horizon: Marine Drive curve with its street lights, the Bandra-Worli
   Sea Link cables, Gateway of India arch and Rajabai clock tower silhouette.
2. Mid: a flat local train with window bars gliding across the horizon every ~40s.
3. Near: faint diagonal monsoon rain hairlines and 2-3 paper-cut clouds drifting slowly.
The horizon pans slightly with scroll progress; the sky shifts by a few percent from
morning paper to golden hour to monsoon slate by stage 5.

## Scroll story (the core interaction)
The page is a pinned scene of ~700vh. The tiffin is the page: the lid is the hero, and each
scroll step lifts the top layer away to reveal the next check. See "Scroll states" in the
prompt for the exact choreography.

## Motion
Ease: power3.out. Scrubbed with scroll (scrub: 1) for tier movement; time-based for
text and stamps. All motion disabled under prefers-reduced-motion (render stacked
static sections instead).
## App Console (post-landing page)
Calm, flat, hairline-divided panels on Chai Paper. The map is the only rich surface.
- Shell: fixed 100vh, three regions (left Scenarios 320px, center Map, right Inspector 380px),
  separated by 1px Ink hairlines. No cards, no hard shadows. Only the primary button keeps its hard shadow.
- Outcome tags: small Geist Mono caps with a 8px dot. Green = success (DELIVERED, APPROVED,
  REROUTED, RESUMED). Yellow = waiting (ASK HUMAN, EXPIRED). Red = refusal or halt
  (REFUSED, DENIED, HALTED, SAFE-STOP, REVERTED, REJECTED). Red is never decorative.
- Scenario row: TC-id in Geist Mono, title in Geist 15px, tag on the right. Selected row:
  4px Peeli Yellow left bar on Paper Shade.
- Map canvas: Paper Shade #E9DFCA floor with the 20px ledger grid, ink linework, no frame shadow.
  Robots keep their ring colours (Ramu yellow, Sakhu teal, Janu steel) and code marks.
  Baseline route: thin dashed ink. Route chosen by 0G: solid yellow with ink casing.
- Playback bar: flat strip at the bottom of the map, timeline with markers
  (green / yellow / red), Geist Mono time.
- Motion (no scroll animation): robots glide along routes; status lights change colour; stamps
  thud in once on refusals; the random picker cycles a highlight through the list for ~600ms; panels
  cross-fade. Disabled under prefers-reduced-motion.