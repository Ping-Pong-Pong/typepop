# MBTI-Style Personality Test: Market Research Report

*Researched Oct 8, 2026 · Public web sources only · Goal: inform a free, multilingual (EN + KO minimum) personality-test website/app monetized toward ~$1/day*

---

## 1. MBTI Basics

The Myers-Briggs framework sorts people along **4 dichotomies** (8 traits), producing **16 four-letter types**:

| Dimension | Pole 1 | Pole 2 | One-line meaning |
|---|---|---|---|
| Energy direction | **E** Extraversion | **I** Introversion | Where you focus attention and recharge: the outer world of people and action (E) vs. the inner world of ideas and reflection (I) |
| Information intake | **S** Sensing | **N** Intuition | How you perceive: concrete facts, details, and present experience (S) vs. patterns, possibilities, and future implications (N) |
| Decision-making | **T** Thinking | **F** Feeling | How you judge: impersonal logic, consistency, and truth (T) vs. values, empathy, and harmony (F) |
| Lifestyle/outer world | **J** Judging | **P** Perceiving | How you orient to the outside world: planned, decided, and orderly (J) vs. flexible, spontaneous, and open-ended (P) |

The 16 types (e.g., INTJ, ENFP, ISFJ…) are just the 16 combinations of one pole from each pair. The system traces to Carl Jung's *Psychological Types* (1921) — the underlying concepts (extraversion/introversion, the mental functions) are long-standing, public-domain psychological vocabulary; what is **not** public domain is the official instrument and the brand.

### Trademark / legal guardrails (important for our build)

- **"MBTI", "Myers-Briggs Type Indicator", "Myers-Briggs" and the MBTI logo are registered trademarks** of The Myers-Briggs Company / the MBTI Trust. Multiple sources carry the formal notice, e.g. CareerPlanner's trademark page lists "Myers-Briggs Type Indicator, Myers-Briggs, MBTI, Step I, Step II, and the MBTI logo are trademarks or registered trademarks of the MBTI Trust, Inc." ([careerplanner.com](https://www.careerplanner.com/Assessments/Video-Myers-Briggs-Mike-Shur.cfm)); an independent critique notes "MBTI is a registered trademark of The Myers-Briggs Company" and calls the instrument "a proprietary product… owned and sold by The Myers-Briggs Company" ([hypnotechs.com](https://hypnotechs.com/resources/mbti/infp)).
- The **official assessment is a paid product** administered via mbtionline.com (The Myers-Briggs Company), typically **$15–$40 per individual** depending on depth, up to ~$49.95 for deeper versions ([mybubbaandme.com](http://mybubbaandme.com/common-questions/is-the-myers-briggs-test-free/), [thegeniusquotient.com](https://thegeniusquotient.com/blogs/personality-tests-00/)); the official questionnaire itself is ~93 questions / ~20–30 minutes ([thegeniusquotient.com](https://thegeniusquotient.com/blogs/personality-tests-00/), [careerminds.com](https://careerminds.com/blog/the-myers-briggs-type-indicator-mbti)).
- **What this means for us:** do not use "MBTI" in the product name, domain, or branding (avoid trademark trouble), and do not copy the official instrument's items (they're copyrighted). Write **original questions** that measure the same public-domain dichotomy concepts — exactly what 16personalities, Michael Caloz, IDRlabs and others do. A good template is Michael Caloz's disclaimer on [michaelcaloz.com](https://www.michaelcaloz.com/personality/index.html?screen=last&Ti=13&Te=6&Fi=6&Fe=2&Si=2&Se=3&Ni=8&Ne=7&SJ=0&NF=2&NT=0&SP=0&iFi=1&iTi=1&iSi=0&iNi=0&iFe=0&iTe=1&iSe=0&iNe=0&E=0&I=2&N=2&S=0&T=0&F=2&J=0&P=2): "this is not a Myers-Briggs Type Indicator® (MBTI®) assessment test… [it] is entirely my own, using my questions, model, and algorithm."
- Naming options that avoid the trademark: "Personality Type Test", "Type Explorer", "16 Types", "Persona Quiz", Korean-friendly: 성격유형테스트 (seonggyeok yuhyeong test).

---

## 2. Most Popular FREE MBTI-Style Tests Online

### 16personalities (16personalities.com) — the market leader
- **Model:** NERIS® Type Explorer — a proprietary trait-based model inspired by (not identical to) the MBTI. Same four dichotomies, but renamed: Mind (E/I), Energy (S→"Observant"/N→"Intuitive"), Nature (T/F), Tactics (J/P→"Prospecting"), **plus a 5th letter: Identity, -A Assertive vs. -T Turbulent** (how one responds to stress). Types are grouped into 4 Roles: Analysts, Diplomats, Sentinels, Explorers ([personalityquiz.app](https://www.personalityquiz.app/personality-type-test/)).
- **Questions:** 60, ~10 minutes, **7-point Likert agree↔disagree statements** (documented as 1=Strongly Disagree to 7=Strongly Agree in community write-ups of the NERIS model, e.g. [github.com/renuka-sharma/mind-assistant](https://github.com/renuka-sharma/mind-assistant)).
- **Free vs paid:** the test and the rich, illustrated basic results are 100% free ([Google Play listing](https://play.google.com/store/apps/details?id=com.neris.sixteenpersonalities)). Flagship paid product is the **Premium Career Suite: $29 one-time** (40+ page career guide + AI career mentors; price re-checked July 2026 per [mypeeps.ai](https://mypeeps.ai/articles/is-16personalities-accurate)).
- **Popularity:** the world's most-taken free type test. A 2021 Korea JoongAng Daily article cited the developer Neris Analytics' claim of **40M+ takers worldwide, 70,000 in Korea** ([koreajoongangdaily.joins.com](https://koreajoongangdaily.joins.com/2021/11/26/englishStudy/journalism%20internship/SUNY2021-MBTI-profiling-offers-insights-an-icebreaker-and-maybe-even-love/20211126100847251.html)) — dated, but it signals the scale; the site runs in 50+ languages including Korean (see §4).

### Truity (truity.com) — the report-selling machine
- **MBTI-style product:** the **TypeFinder®** personality test (Jungian, 16-type output) — it also measures 23 personality facets for a richer profile ([scribd-hosted sample](https://www.scribd.com/document/684518559/The-TypeFinder-Personality-Test-Truity)). Sister tests: Big Five (60 questions, 5–10 min), Enneagram (~105 questions, 10–15 min) — question counts from Truity's own FAQs ([truity.com](https://www.truity.com/test/enneagram-personality-test-super), [truity.com](https://www.truity.com/test/big-five-personality-test?subid=archive)).
- **Format:** agree/disagree Likert statements. **Free:** take the test + see basic results; **paid:** unlock the full ~18-page report (facets, talents, blind spots, career fit) for a fee. Email account capture gates saved results — classic email-list building.
- **Popularity signals:** 10M+ Enneagram takers claimed on their site; 4.9/5 from ~4,800+ customer reviews of the paid TypeFinder report; also sells B2B/team products and runs an affiliate program.

### IDRlabs (idrlabs.com) — the viral-quiz factory
- **MBTI-style product:** "Personality Test Based on Jung and Briggs-Myers" — **44 questions**, free, outputs a 4-letter type; its FAQ explicitly states it is *not* the official MBTI ([idrlabs.com](https://www.idrlabs.com/test.php?ref=rashad.io)).
- **Format:** agree/disagree slider statements.
- **Free vs paid:** fully free to take and see results; monetizes via display ads.
- **Popularity signal:** its novelty quizzes ("Difficult Person Test", "Likable Person Test") repeatedly go viral on TikTok/Twitter with users sharing result screenshots ([thefocus.news](https://www.thefocus.news/lifestyle/find-out-how-likeable-you-are-with-a-short-personality-test/), [archive.thetab.com](https://archive.thetab.com/uk/2021/01/12/difficult-person-test-viral-twitter-idrlabs-189373?itm_source=parsely-api)) — the key lesson: **short, shareable-result quizzes drive the traffic; the type test monetizes the audience**.

### HumanMetrics (humanmetrics.com) — the old guard
- **Product:** Jung Typology Test™ — free, percentage-style results per dichotomy (e.g. "Introvert (38%)") with long Keirsey-style type descriptions and "famous personalities" lists.
- **Format:** simple forced-choice questions; results page upsells related tests (Jung Marriage compatibility test).
- **Popularity:** one of the oldest free type tests on the web, heavily used in school/university assignments — dated UI but enormous backlink equity from decades of classroom use.

### Keys2Cognition (keys2cognition.com) — the cognitive-functions niche
- **Product:** free test by Dr. Dario Nardi (UCLA), based on his neuroscience-of-personality research; measures the **8 cognitive functions** (Te, Ti, Fe, Fi, Se, Si, Ne, Ni) rather than just the 4 dichotomies, then matches your pattern to a type.
- **Format:** **48 questions** you rate on a scale ([es.scribd.com result doc](https://es.scribd.com/document/602093190/Keys-2-Cognition-Cognitive-Processes)); results show a bar profile per function with development levels.
- **Popularity:** beloved in typology enthusiast communities (typologycentral, reddit r/mbti); monetizes via Nardi's books/workshops, not the test.

### Michael Caloz (michaelcaloz.com) — the indie benchmark
- **Product:** free cognitive-functions test; the site claims **millions of takers**; everything — questions, model, algorithm, type descriptions — is the author's own, with an explicit MBTI-trademark disclaimer ([michaelcaloz.com](https://www.michaelcaloz.com/personality/index.html)).
- **Lesson:** a solo developer *can* reach millions with a free test, original content, and community word-of-mouth — this is the closest proof-of-concept for our project.

### Also worth knowing
- **ispeedreader.com** — free test (80 questions, ~5–10 min) combining Jung typology with the open-source Big Five item pool (rubynor/bigfive-web on GitHub); free basic type reports, paid **150+ page premium PDF reports** ([ispeedreader.com](https://ispeedreader.com/en/personality-test)). Shows the "open-source question bank" shortcut for building fast.
- **Open-source infrastructure:** the Big Five item pool (IPIP / rubynor/bigfive-web) is openly licensed — useful for a future Big Five mode. Multiple GitHub clones of 16personalities-style tests exist (multilingual, 7-point Likert, 30/60-question variants), e.g. [kjeymax/16-personalities](https://github.com/kjeymax/16-personalities) (bilingual, shareable ID-card export).

---

## 3. How Free Test Sites Make Money (Monetization)

| Revenue lever | How it works | Real price points observed |
|---|---|---|
| **Premium detailed reports** | Free test + free basic result; pay to unlock a long-form PDF (career, relationships, facets, growth) | 16personalities Premium Career Suite **$29** one-time ([mypeeps.ai](https://mypeeps.ai/articles/is-16personalities-accurate)); Truity ~18-page TypeFinder report (fee; 4.9/5 from ~4.8k reviews); ispeedreader 150+ page premium PDFs ("nominal fee") |
| **Display ads** | AdSense / Mediavine-style programmatic ads on test and result pages | Typical blog AdSense RPM **$5–20** (finance up to ~$30; entertainment/quiz sites often **$3–10**); US display RPM commonly cited at $2–10 ([medium.com/@aiquillbox](https://medium.com/@aiquillbox/adsense-revenue-calculator-25e7c0066747), [froggyads.com](https://www.froggyads.com/blog/adsense-average-cpm/)). A BlackHatWorld quiz-site thread has owners reporting ~$10/day ranges ([blackhatworld.com](https://www.blackhatworld.com/seo/how-much-money-can-you-make-with-a-quiz-site.1229064/page-2)) |
| **Email capture** | Gate "save my results" / "send my detailed report" behind an email signup → newsletter, course upsells | Truity requires email to save results; IDRlabs runs share-gated result cards |
| **B2B / teams** | Team workshops, hiring-adjacent tools, school licenses | Truity sells team/business products; The Myers-Briggs Company itself is B2B-first |
| **Affiliate** | Book/product recommendations per type (e.g., "books for INTJs" → Amazon links) | Truity runs an affiliate program; standard Amazon Associates rates |

### AdSense approval basics (for our new site)
- 18+ account holder; custom domain; HTTPS; mobile-friendly; clean navigation; no broken/under-construction pages ([bloggingjoy.com](https://bloggingjoy.com/how-to-get-adsense-approval-for-regional-language-blogs-in-india/), [lilys.ai](https://lilys.ai/en/notes/google-adsense-20251125/adsense-tutorial-2025-requirements-fix)).
- **Original, substantial content:** the usual guidance is 20–30 original articles (800–1,000+ words) — for a quiz site, the 16 original type profiles + how-it-works/about pages can serve as this corpus. Required pages: **About, Contact, Privacy Policy** (a must for any site collecting quiz answers/emails), plus Terms/Disclaimer.
- **No traffic minimum** officially; review takes ~1–7 days; don't apply with a bare single-page test and nothing else. Alternative networks with no minimum: Ezoic, PropellerAds ([techreflector25.blogspot.com](http://techreflector25.blogspot.com/2025/11/top-google-adsense-alternatives-2025.html)).

### Revenue math toward $1/day (~$30/month)
- **Ads-only:** at a realistic quiz-site RPM of $5–10, $30/month needs **3,000–6,000 pageviews/month ≈ 100–200 pageviews/day**. Each test completion = multiple pageviews (test page + result page + maybe a retake/share page), so ~50–100 test-takers/day gets there.
- **Report-only:** one $9 PDF report sale per week (~$36/month gross; ~$30 net after Gumroad fees) ≈ $1/day. But quiz traffic converts poorly (~0.1–0.5%); 1 sale/week needs roughly 1,000–5,000 visitors/week — a tall order for a brand-new site.
- **Most realistic early mix:** ads as the baseline + a cheap ($5–9) "detailed report" as the upside. The ads will almost certainly get to $1/day first.

---

## 4. The Korean / Asia Angle

### MBTI is a genuine cultural phenomenon in Korea
- The boom started around **end of 2019 and exploded during the pandemic**; personality tests have effectively replaced "what's your blood type?" as Korea's social shorthand ([koreabizwire.com](http://koreabizwire.com/personality-tests-take-hold-in-south-korea-but-experts-warn-of-misuse/325107)).
- Korea JoongAng Daily (2021): young Koreans flood Instagram with MBTI "situational reactions" memes; **Korean companies build viral branded tests** like "perfume MBTI" or "snack MBTI" to market to MZ customers ([koreajoongangdaily.joins.com](https://koreajoongangdaily.joins.com/2021/11/26/englishStudy/journalism%20internship/SUNY2021-MBTI-profiling-offers-insights-an-icebreaker-and-maybe-even-love/20211126100847251.html)).
- An MDPI big-data study (2024) found Korean public sentiment toward MBTI is **68.5% positive**, with MBTI treated "as a universal and representative cultural phenomenon in South Korea, akin to K-pop" ([mdpi.com](http://mdpi.com/2071-1050/16/10/4152)).
- It's socially load-bearing: "What's your MBTI?" is asked like a name; "Are you a T?" became a passive-aggressive jab ([omny.fm](https://omny.fm/shows/moneyfm-evening-show/the-big-story-why-is-the-mbti-taking-over-korea?in_playlist=prime-time)). Korean youth post results on social media, which pulls friends in — **built-in viral loop** ([koreajoongangdaily.joins.com](https://koreajoongangdaily.joins.com/2022/04/06/englishStudy/journalism%20internship/UTAH2021-Integrate-four-letters-into-their-daily-lives-MBTI/20220406113400595.html)).

### 16personalities already has a Korean version
- Yes — Korean (한국어) is on their official languages page among ~50 supported languages ([16personalities.com/languages](https://www.16personalities.com/languages)), and the test is directly reachable at 16personalities.com/ko/ (a Korean learning-YouTube channel links it: [youtube.com](https://www.youtube.com/watch?v=8x6dqZOz_Lk)).
- So the play isn't "the only Korean MBTI test" — it's **faster/funnier/share-friendlier**: short quizzes, cute result cards, Korean-meme tone, KakaoTalk share buttons.

### The Korean viral "test site" culture: ktestone (ktest.one / ktestone.com)
- **ktestone** (by "Kapable") is the archetype: a collection of short personality quizzes — *Personality Character Test, Love Character Test, Personal Color Test, Alcohol-BTI (drinking-habit test), Note Charm Test, Carp Bread Test*, etc. ([lemon8-app.com](https://www.lemon8-app.com/discover/ktestone%20love%20character%20test?region=sg), [dexerto.com](https://www.dexerto.com/entertainment/how-to-do-tiktoks-viral-ktestone-personality-test-2160514/)).
- **Formula:** ~12 questions, two choices each, ~2 minutes → a funny, ultra-shareable result ("Worried old soul", "Laughing fact attacker") → screenshot/shared on **TikTok** and KakaoTalk ([dexerto.com](https://www.dexerto.com/entertainment/how-to-do-tiktoks-viral-ktestone-personality-test-2160514/), [indy100.com](https://www.indy100.com/tiktok/tiktok-ktestone-personality-character-test)).
- **Tech note:** the tests are hosted as **static sites on GitHub Pages** (URLs like ktestone.com/kapable.github.io/personalColorEng/) ([forum.allkpop.com](https://forum.allkpop.com/thread/14960-cutest-personality-test/?postID=399268)) — i.e., the biggest Korean quiz brand runs on essentially *free hosting*, monetizing (presumably) via display ads. This is a strong precedent: **the product is cheap to build and host; the game is entirely about shareability and SEO**.
- Other Korean test formats to mirror: the viral "Tetomen/Estrowomen" style typologies, and brands' product-matching quizzes ([koreabizwire.com](http://koreabizwire.com/personality-tests-take-hold-in-south-korea-but-experts-warn-of-misuse/325107)).

### Korea-specific distribution notes
- **KakaoTalk** (Korea's dominant messenger) share integration is the equivalent of WhatsApp-share in the West — result cards must look good as shared link previews/images.
- **Naver** dominates Korean search; ranking on Naver (and Korean YouTube/TikTok) matters as much as Google for Korean traffic. For ad monetization in Korea, options include Google AdSense (works in Korea), plus local networks (Naver AdPost, Kakao AdFit) once traffic scales.

---

## 5. Question-Design Playbook

### How the pros structure it
- **60–80 statements** is the sweet spot (16personalities: 60 in ~10 min; ispeedreader: 80 in 5–10 min; IDRlabs Jung test: 44). **15–20 items per dichotomy** (balanced: half phrased toward each pole so "agree to everything" doesn't skew results — reverse-keying).
- **7-point agree↔disagree Likert** is the standard (16personalities-style). 5-point also works and is simpler on mobile. Randomize item order per session to reduce gaming.
- **Scoring:** sum per-dimension scores → convert to a **percentage split** (e.g., 68% Extraversion / 32% Introversion). The winning pole per dimension gives the 4-letter code; show the percentages as bars — users love arguing about their "borderline 52% T". HumanMetrics-style "slight/moderate/strong preference" labels add flavor.
- **Result page anatomy (the shareable unit):** type badge + catchy title ("The Campaigner") → percentage bars → 3–5 strengths / 3–5 growth areas → career/relationship snippets → **celebrity examples** (the Korean version should use K-pop idols/actors — there's even a crowd-sourced Korean "celebrity MBTI" list floating around: e.g., V of BTS as INFP, RM as ENFP, IU as INFJ) → big **share buttons** (KakaoTalk, X, copy-link, download-result-card image) → "retake / try our other quizzes" → email gate for the detailed report.

### Original example items (written fresh for this project — do not copy any site's items verbatim)
*Scale: 1 = Strongly disagree … 7 = Strongly agree. (R) = reverse-keyed.*

**E/I — Extraversion vs. Introversion** (themes: social energy, initiating, thinking aloud, recharge style, group vs. 1:1)
1. After a long day, I'd rather recharge alone than go out with friends. (I)
2. I tend to think out loud and work through ideas by talking about them. (E)
3. I usually wait for others to start a conversation rather than starting it myself. (I)
4. Being around a lot of people energizes me instead of draining me. (E)
5. I'd pick a deep one-on-one conversation over a lively group hangout. (I)

**S/N — Sensing vs. Intuition** (themes: details vs. big picture, practical vs. possible, present vs. future, literal vs. abstract)
1. I trust concrete facts and details more than gut feelings or hunches. (S)
2. I spend more time imagining future possibilities than focusing on the present moment. (N)
3. When learning something new, I prefer clear step-by-step instructions before hearing the big picture. (S)
4. I'd rather discuss theories and "what-ifs" than everyday practical matters. (N)
5. I notice small inconsistencies and details that others tend to miss. (S)

**T/F — Thinking vs. Feeling** (themes: logic vs. values, truth vs. tact, debate comfort, empathy, fairness vs. harmony)
1. When making a decision, I prioritize what makes logical sense over how people will feel about it. (T)
2. I can stay objective and detached even when someone around me is upset. (T)
3. Telling the truth matters more to me than keeping the peace. (T)
4. I make important choices with my heart as much as with my head. (F)
5. In a disagreement, I'd rather everyone feel heard than "win" the argument. (F)

**J/P — Judging vs. Perceiving** (themes: planning vs. spontaneity, deadlines, lists, routine, keeping options open)
1. I like to plan my week in advance rather than see how things unfold. (J)
2. Last-minute changes to plans stress me out more than they excite me. (J)
3. I prefer to keep my options open instead of committing to a decision early. (P)
4. I make to-do lists and actually follow them. (J)
5. I do my best work when there's no strict schedule and I can follow my curiosity. (P)

**Quality rules:** one idea per item; no double-barreled statements; avoid jargon ("cognitive functions"); keep reading level ~grade 6–8 (critical for Korean/ESL translation); write ~25% more items than needed and cut the weakest after pilot data.

---

## 6. Practical Path to $1/Day

### Phase 0 — Build (weeks 1–3)
- **One static site, multilingual from day one** (EN + KO; add JA/ZH later — ktestone proved even rough translations go viral). Host free/cheap: GitHub Pages, Vercel, or Cloudflare Pages. ktestone runs on GitHub Pages — hosting cost ≈ $0.
- **Question bank:** start with the original 60–80 items above (expanded to ~20/dimension), 16 original type profiles per language. Add a trademark-safe disclaimer modeled on Michael Caloz's.
- **Share-first result pages:** downloadable result-card images (K-pop-style aesthetics for KO), KakaoTalk/X/copy-link share, per-type deep-link URLs (`/type/infp`) for SEO.

### Phase 1 — Traffic (months 1–3)
- **Multilingual SEO:** one page per type per language (16 types × EN/KO = 32 indexable pages) + "what is [type]" explainers + celebrity-type pages. Long-tail Korean queries (e.g., "INFP 특징", "INTJ 궁합") are less competitive than English ones.
- **Viral quiz ladder:** ship *short* 12-question novelty quizzes first (ktestone formula: 2 minutes, funny results) to earn shares, then funnel takers to the full type test. Short quizzes are the traffic engine; the type test is the retention/monetization core.
- **Distribution:** TikTok/Reels/Shorts result-reveal videos, Korean communities (theqoo-style forums, allkpop for EN), Pinterest result cards.

### Phase 2 — Monetize (once ~50–100 visits/day)
1. **Display ads first** (AdSense or Ezoic): needs the content corpus (type pages double as AdSense-qualifying original content) + About/Contact/Privacy pages. At $5–10 RPM, 100–200 pageviews/day ≈ $0.50–2/day. **This is the most probable first dollar.**
2. **Paid detailed PDF report ($5–9) via Gumroad or Stripe Payment Links:** Gumroad takes **10% + $0.50 + ~2.9%+$0.30 processing** per sale on the free plan ([medium.com/@theethicalhustle](https://medium.com/@theethicalhustle/from-zero-to-2m-why-gumroad-became-the-go-to-platform-for-digital-creators-in-2025-9adfa2a1df68)); on a $7 report you'd keep roughly $5.50–6.00. One sale a week ≈ $1/day. Gate with "unlock your 20-page deep dive" on the result page + email capture.
3. **Email list:** "email me my results" → newsletter for future quizzes/products (compounds over time).
4. Later: affiliate (books per type), B2B team workshops, app version (AdMob).

### Honest effort-vs-likelihood assessment
- **The product is the easy part** (a competent static site in weeks; hosting ~$0). **Traffic is the entire game** — and it's not guaranteed. 16personalities won on polish + SEO over a decade; ktestone won on TikTok virality; Michael Caloz won on community credibility. A new site has none of these on day one.
- **Realistic:** $1/day via ads is achievable within **2–4 months** *if* the operator ships consistently (weekly quizzes/content, active TikTok/Shorts posting, real SEO). It's a "dozens of hours of unsexy distribution work" goal, not a "build it and they come" goal.
- **Risks:** Google AdSense can be slow/picky with thin tool sites (mitigate with the 32+ original type-profile pages); Korean traffic monetizes at lower RPMs than US traffic (offset with volume + the report upsell); quiz fads fade (mitigate with an evergreen type-test core under the viral quizzes).
- **Upside beyond $1/day:** the ceiling is real — Truity and 16personalities show premium reports convert at scale once traffic exists. But treat $1/day as the validation milestone, not the business plan.

---

## Recommended Approach (Summary)

1. **Build a free, static, multilingual (EN + KO) type test** with 100% original questions and type profiles; keep "MBTI" out of the branding; add a Caloz-style trademark disclaimer.
2. **Copy ktestone's playbook, not just 16personalities':** ship short 12-question viral quizzes (funny, 2-minute, hyper-shareable result cards with KakaoTalk share) as the traffic engine, with the full 60–80-question type test as the flagship.
3. **Monetize in order:** (a) display ads (AdSense) as the first-dollar lever — needs ~100–200 pageviews/day at $5–10 RPM; (b) a $5–9 detailed PDF report via Gumroad/Stripe as the upside lever; (c) email capture from day one for compounding.
4. **Differentiate in Korean:** K-pop-celebrity examples, meme-tone copy, cute result-card aesthetics, KakaoTalk-native sharing — areas where the translated 16personalities feels foreign.
5. **Expect the work to be distribution, not code:** plan on 2–4 months of consistent content + short-form video + SEO before $1/day is realistic, and treat that milestone as validation before investing in an app or bigger features.
