# TypePop Companion PWA — Migration Plan

Drafted 2026-10-10. Status: proposed, awaiting Ray's decisions at the bottom.

## Why leave the artifact platform

The Muse web artifact was a sketchpad: great for proving the interaction loop, but a dead end for a product. It can't persist data, can't send push notifications (the retention engine of any idle-companion game — "your blob misses you"), can't do IAP or ads, and can't be shared publicly. Everything past the demo needs a real home.

## The move: PWA first, native later

A Progressive Web App is the right bridge, not a compromise:

- **Reuses the prototype.** The Phaser 3 code in `prototype/` moves almost as-is — behavior scheduler, tap reactions, mood bubbles, check-ins, bond meter, day/night.
- **Ships with the quiz site.** Same repo, same GitHub Pages deployment (`/companion/` path). One deploy, one link.
- **Installable + push-capable.** Add-to-homescreen on iOS/Android; web push works on iOS 16.4+ and Android for installed PWAs.
- **Validates retention before spending.** If people keep a blob on their home screen for two weeks, *then* invest in Flutter + backend for the shared-house phase. If not, we learned it for ~$0.

## What moves

- `prototype/game.js` — full behavior system, unchanged logic
- Blob pose assets (`prototype/assets/blobs/`) — ENFP set wired first; directory structure ready for all 16 types as pose sets land
- Room scene, cozy styling, day/night tint

## What gets cut or deferred

- Artifact-only chrome and demo scaffolding
- Shared house, accounts, friends' characters → Phase 3 (needs backend: Supabase/Firebase)
- LLM-driven chat → keep scripted in-type one-liners for v1 (cheap, on-brand, no API bill)

## What gets added

- **PWA shell**: `manifest.json` (name, icons, theme), service worker (offline cache + asset precaching), install prompt handling
- **Persistence**: localStorage (bond level, blob name, mood history, settings). IndexedDB if asset count grows.
- **Quiz → companion handoff**: result page gets "Meet your blob" — launches `/companion/?type=ENFP`, pre-selects the character
- **Push notifications (v1.1, not v1)**: web push needs a server to *send* pushes — options are a tiny Cloudflare Worker or Supabase Edge Function with VAPID keys. v1 ships without proactive push; retention comes from streaks and check-ins on open. Honest tradeoff, documented here so we don't pretend v1 has it.
- **Share card refresh** with blob art (already in art backlog)

## Architecture

- Static hosting: GitHub Pages from the `typepop` repo (`site/` = quiz, `companion/` = PWA)
- Phaser 3 vendored (no CDN dependency risk), plain JS like the prototype — no build step until we need one
- No backend in v1. `M3` introduces the minimal push worker.

## Monetization path (the $1/day goal)

- **v1**: none. Validate retention first; monetizing an unproven loop is premature.
- **v2**: cosmetics via Stripe payment links (web-friendly, no app-store cut, no IAP infra), tip jar
- **Native later**: real IAP + rewarded ads when/if we go Flutter

## Milestones

- **M1** — Companion runs as a standalone installable page on GitHub Pages: ENFP blob, persistence, offline support
- **M2** — All 16 types wired (pose sets completing via the art loop); quiz result page links into the companion
- **M3** — Push backend (Cloudflare Worker or Supabase); daily check-in streaks
- **M4** — Go/no-go on Flutter native, decided by retention data — not by vibes

## Decisions needed from Ray

1. **Domain**: stay on `ping-pong-pong.github.io/typepop` or buy a real domain (typepop.*)?
2. **Push**: okay with a tiny Cloudflare Worker for v1.1, or defer push entirely until native?
3. **Monetization v1**: tip jar / Stripe cosmetics link from the start, or pure validation with zero monetization?
