# TypePop Blob Cast — Batch Spec (v5 smooth-clay direction)

**Status:** ENFP + INTJ v5 concepts approved-as-shown to Ray on 2026-10-09; remaining 14 types
awaiting his go. This spec locks the style rules and briefs so the batch can start instantly.

**Style anchors (use as reference images for every generation):**
- `media-generation-typepop-blob-enfp-v5-0-4e598b74-282f-4dbd-ac3a-5f898693e945.webp`
- `media-generation-typepop-blob-intj-v5-0-2bcc1aa5-d452-4117-a08c-e0a94766b520.webp`

## Locked v5 style rules (do not drift)

1. **Body:** squat-to-upright egg/rounded blob, slightly taller than wide. Smooth, clean MATTE clay
   finish — NO fingerprints, cracks, or rough texture (Ray: v4 was "too much tactile").
2. **Sprout signature:** two-leaf green sprout, centered on top of head. Non-negotiable cast marker.
3. **Face:** two dark oval eyes (no eye-whites), small mouth; expression varies per type (see briefs).
4. **Limbs:** two short nub arms + two nub feet, same clay color as body.
5. **Prop:** exactly one signature clay prop per type, held or worn, rendered in the same clay
   material — this is the type's visual ID.
6. **Color:** one saturated-but-soft body color per type; all 16 must be mutually distinct.
7. **Scene:** plain warm-beige studio backdrop, soft ground shadow, straight-on or slight 3/4 view.
8. **Identity boundary:** inspired-by the Muse avatar is fine; NOT a copy. No face-plate, no fuzzy
   body — the sprout + smooth clay + props are our own identity.

## Animation-ready notes (from the Pip rebuild lesson)

The batch's hero renders are the idle state. When poses come (only after batch approval):
six states per character — **idle, blink, happy, walk-squash, sleep-puddle, wake-stretch**.
- Blink = swap two eye shapes (no redraw of the body).
- All motion is squash-and-stretch (scaleX down while scaleY up, and reverse) — no joints, no limbs.
- Sprout wiggle = simple rotation for tap reactions and happy states.
- Nap = body flattens into a puddle + floating Z's; wake = stretch + return.
- Distinct pose frames per state, NOT tweened stills — v1 of Pip proved tweens read as "just a sprite".

## Per-type briefs (remaining 14)

Derived from the approved type profiles in `content/types.json` (names/taglines/desc).
ENFP (coral-pink, party popper + confetti, open smile) and INTJ (indigo, round clay glasses,
chess knight held thoughtfully, small knowing smile) are DONE.

| Type | Name | Body color | Prop | Expression / pose |
|------|------|-----------|------|-------------------|
| ENFJ | The People Magnet | honey gold | clay megaphone held up | warm open smile, arms slightly open, inviting |
| ENTP | The Mischievous Genius | electric violet | clay lightbulb held overhead | mischievous smirk, one brow tilted up |
| ENTJ | The Boss Mode | crimson red | clay bar-chart with rising arrow | confident grin, standing tall |
| INFJ | The Quiet Mystic | soft lavender | clay crystal ball held close | gentle serene smile, calm stillness |
| INFP | The Daydream Poet | dreamy mauve-pink | clay open book, tiny clay stars rising from it | soft wistful smile, head slightly tilted |
| INTP | The Overthinker | cool mint teal | clay puzzle piece held up to eye | curious neutral mouth, head tilted, inspecting |
| ESFP | The Party Starter | sunny tangerine | clay disco ball held overhead | huge grin, mid-bounce energy |
| ESFJ | The Perfect Host | butter yellow | clay teapot held out offering | warm welcoming smile, leaning slightly forward |
| ESTP | The Adrenaline Human | bold lime green | clay lightning bolt gripped like a baton | bold grin, leaning forward, mid-dash |
| ESTJ | The Rule Keeper | slate blue-gray | clay clipboard with checkmarks | firm confident smile, standing square |
| ISFP | The Soft Aesthetic | sage green | clay paintbrush with a color dab | gentle shy smile, brush held delicately |
| ISFJ | The Warm Blanket | cozy cocoa brown | clay mug with clay steam swirls | soft caring smile, mug offered with both nubs |
| ISTP | The Cool Fixer | steel blue | clay wrench resting on shoulder | cool half-smile, relaxed stance |
| ISTJ | The Reliable Rock | warm olive taupe | clay alarm clock held up | steady dependable smile, upright posture |

## Batch run protocol

- One tight pass per type, in table order; show Ray each round, then WAIT for his steer —
  he corrects with one-line aesthetic verdicts and generating ahead of his steer reads as noise.
- Anchor every prompt on the two v5 webp files + this spec; spot-check for style drift after
  every 3–4 types (ENFP anchor re-check).
- Hero idle render first; pose sets only after the full 16-type batch is approved.
- Suggested gen order: ENFJ, ENTP, ENTJ (E's), then INFJ, INFP, INTP (IN's), then ESFP, ESFJ,
  ESTP, ESTJ (ES's), then ISFP, ISFJ, ISTP, ISTJ (IS's).
