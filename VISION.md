# TypePop — Product Vision (Phase 2/3)

*Logged 2026-10-08 from Ray's voice note. Phase 1 (web quiz) is built; this is
the long-term vision for the app.*

## The vision

Every MBTI type becomes a cute little character — think mascot-style, like a
Muse character. You take the quiz, and the quiz **creates your character**.

Then it becomes a "lazy game" (idle game): you don't really play it so much as
live alongside it.

- Your character idles on screen. **Mood bubbles** pop up over its head showing
  how it's feeling that day.
- You can **interact**: tap it, and **share how YOU are feeling** with it. It
  responds in ways aligned with its MBTI personality (an INTJ pal reacts
  differently than an ESFP pal).
- Later: your character gets **a room/house**. Friends download the app, create
  their own characters via the quiz, and everyone **lives in the same house
  together**. The shared house is the viral loop — "your friend's ENFP just
  moved in, create yours to join."

## Why it could work

- **Quiz → character** is a stronger share hook than quiz → text result. A cute
  character reveal card will outperform a type description card on shares.
- **Idle games retain**: daily check-in loop ("your pal missed you") is the
  cheapest retention mechanic in mobile gaming.
- **In-type behavior is the content moat**: 16 personalities × moods ×
  interactions = a content matrix competitors can't clone without doing the
  writing. Roommate banter between types (INTJ + ESFP) writes itself.
- **The house is the growth loop**: every shared house is an invite engine.

## Phased approach

### Phase 1 — Web quiz (DONE, 2026-10-08)
TypePop static site: 32-question bilingual quiz, 16 type profiles, shareable
result cards. Purpose: traffic, SEO, email list, quiz data.

### Phase 2 — Character reveal + companion (next)
1. **Design the 16 characters**: one consistent cute art style, color-coded per
   type. (Image generation can produce the full set; refine later with an
   artist if it takes off.)
2. **Character reveal on the web result page**: after the quiz, "meet your
   character" — animated reveal + character card. This bridges web → app and
   boosts shareability immediately, before any app exists.
3. **Companion app v1 (single-player)**: your character lives on your phone.
   - Idle behaviors + scheduled mood bubbles (local notifications:
     "Pip is feeling sleepy…")
   - Tap interactions: pat, feed, chat (scripted in-type responses v1)
   - Daily feeling check-in: you tell it your mood, it responds in-character
   - Local-first (no account needed) to keep v1 shippable
   - Tech: PWA first for speed, or Flutter/React Native if going straight to
     app stores (stores = discovery + push notifications)

### Phase 3 — The shared house (later)
1. Accounts + backend (Supabase/Firebase free tier): characters persist
   cross-device.
2. Shared house: invite link → friend takes quiz → their character moves in.
   Realtime presence; characters do autonomous in-type interactions with each
   other (scripted type-pair dialogues).
3. Viral loop instrumentation: invites sent / accepted, house size vs.
   retention.

### Phase 4 — Monetization expansion
- Cosmetics: outfits, room decor, character accessories (in-app purchase)
- Premium: deeper personality content, unlimited chat
- Ads on the free tier (idle games tolerate rewarded ads well:
  "watch an ad to cheer up your pal")
- The web quiz keeps running as the top-of-funnel + AdSense

## Key reference: Pokémon Pokopia (researched 2026-10-08)

Cozy life-sim for Switch 2 (Mar 2026) by Koei Tecmo/Omega Force + Game Freak,
published by Nintendo/TPC; 5M+ copies in ~4 months. You play a Ditto turned
human, rebuilding a withered Kanto and befriending 300+ Pokémon. Not an idle
game — but its **ambient creature-AI layer** is exactly our vibe, and that
layer is our whole product.

Mechanics to steal:
- **Ambient autonomous behavior**: creatures sleep, play, forage unprompted.
- **Furniture = behavior triggers** (signature mechanic): Pokémon *use* what you
  build — Marill rinses under a shower, Hitmonchan "sells" at a cash register,
  everyone snoozes on deckchairs. → Our decor items unlock per-type idle
  behaviors; monetizes naturally as furniture packs.
- **Funny vocal dialogue + pair conversations**: players love watching
  "spirited conversations from afar" even knowing lines are randomized.
- **Named individuals + friendship meter**: rising bond unlocks name-calling,
  gifts, mini-games — the attachment spike. Let users name their mascot.
- **Real-time clock sync**: day/night follows the system clock (players feel
  guilty waking sleeping Pokémon).

Design takeaways for us:
- Scripted in-type one-liners + two-mascot banter (INTJ + ESFP roommate comedy)
  deliver ~80% of the charm at ~5% of the cost — confirms "scripted first,
  LLM as premium later."
- "Field Guide" codex of the 16 types' likes/dislikes as a completionist hook
  (collect all 16 via friends' houses).
- Clock-driven moods first (E-types peppy in the morning, everyone naps
  afternoons) — free aliveness + daily check-in habit.

Art/animation note: Pokopia is full 3D (AAA budget) — not our path. Ours:
pixel-retro style for the interactive companion (cheap 2–4 frame ambient
loops: sleep, nap-on-furniture, wander, talk), clay renders for marketing and
shareable result/character cards, generated video loops for special moments
(character reveal, celebrations).

Full report: `research/pocopia-notes.md`.

## Open questions
- Art style lock-in: pixel-retro now leads for the interactive companion;
  confirm before batch-converting all 16 characters.
- Chat depth: scripted responses (cheap, predictable) vs. LLM in-character
  chat (magical, costs per message) — scripted first, LLM as premium.
- PWA vs. native for v1: PWA ships in weeks; native gets push + store
  discovery. Decide based on Phase 1 traffic.
- Character names: 16 mascot names to go with the 16 type names.

## Non-goals / guardrails
- Keep the quiz's original-questions rule: characters are our IP, types are
  public-domain dichotomies, "MBTI" trademark stays off the product.
- Don't build backend/accounts until Phase 3 — v1 companion stays local-first.
