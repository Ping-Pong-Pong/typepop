# TypePop 🎭 — free bilingual (EN/한국어) personality quiz site

A 16-type personality quiz website inspired by the classic four-dimension model
(E/I, S/N, T/F, J/P). All questions and type descriptions are **original** —
nothing copied from 16personalities, MBTI®, or any other test.

## What's built

- `site/index.html` — landing page (hero, how-it-works, 16-type grid)
- `site/quiz.html` + `site/js/quiz.js` — 32-question quiz, 5-point Likert scale,
  tap-to-advance, back button, per-dimension scoring with tie-breaking
- `site/result.html` + `site/js/result.js` — result page: type badge, score bars,
  strengths/watch-outs/celebs, **downloadable shareable result card** (canvas PNG),
  share buttons (X, copy link, native share; KakaoTalk placeholder)
- `site/types.html`, `site/type.html` — type directory + detail pages (SEO content)
- `site/about.html`, `site/privacy.html`, `site/contact.html` — About (with
  trademark disclaimer), Privacy (answers never leave the device), Contact
- `content/questions.json` — 32 original questions, 8 per dimension, balanced 4/4
  per pole, EN + KO
- `content/types.json` — 16 original type profiles (names, taglines, descriptions,
  strengths, growth edges, celeb examples), EN + KO
- `build.py` — validates content and inlines it into `site/js/data.js`

## Build & preview

```bash
cd ~/workspace/personality-test
python3 build.py            # validates content, generates site/js/data.js
cd site && python3 -m http.server 8000   # preview at http://localhost:8000
```

(Use a local server rather than `file://` — some browsers restrict canvas/fonts
on file URLs. The generated `data.js` inlines all content, so there are no
`fetch()` calls to worry about.)

## Going live (free)

1. Create a GitHub repo (e.g. `typepop-quiz`), push the contents of `site/`.
2. Repo Settings → Pages → Deploy from branch → `main` / root.
3. Free URL: `https://<user>.github.io/typepop-quiz/`. Custom domain optional
   (needed for AdSense — see below).

## Before-launch checklist

- [ ] Replace `hello@typepop.example` in `site/contact.html` with a real email
- [ ] KakaoTalk sharing: register a Kakao Developers app, get a JavaScript key,
      wire up `Kakao.Share` in `site/js/result.js` (currently shows "coming soon")
- [ ] AdSense: requires a custom domain, ~15+ pages of original content (the 16
      type pages + about/privacy/contact cover this), and some organic traffic
- [ ] `sitemap.xml` + `robots.txt` for SEO (easy add later)
- [ ] Consider separate `/ko/` URL paths for stronger Korean SEO (v2)

## Monetization roadmap (from research)

1. **Display ads first** — ~100–200 pageviews/day ≈ $1/day at typical quiz RPMs
2. **Detailed PDF report** ($5–9 via Gumroad) as upside later
3. **Email capture** from day one (not yet implemented — v2)

## Notes

- "MBTI" / Myers-Briggs Type Indicator® is a trademark of The Myers-Briggs
  Company. TypePop measures the same public-domain dichotomies with original
  items — the same approach as 16personalities et al. The About page carries
  a disclaimer.
- Celebrity examples in `types.json` are community-reported typings, labeled
  as such on the site ("for fun, not facts").
