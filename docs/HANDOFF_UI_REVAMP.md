# UI Revamp Handoff — Claude → Codex

Written by Claude, handing off mid-task because of a context/usage limit, not because the work is done. Read this whole file before touching code — it front-loads everything I'd otherwise have to re-discover by trial and error.

## What this project is

"Entertainment Power Players" — a subscription mobile app (React Native / Expo) for entertainment-industry career networking, plus a React admin panel, on Supabase. The client supplied a full dark-theme redesign as mockup images and asked for the **entire app rebuilt to match them, screen by screen, pixel-accurate**. The user's own words, verbatim, across this task: *"make everything according to the images"*, *"i want accuracy"*, *"i want it to be fully aligned with the images"*, *"YES DO IT END TO END... FOR EVERY SCREEN LOOK AT ITS RESPECTIVE SCREEN IMAGE AND EXTRACT ALL INFO FROM IT AND MAKE THE APP FULL REPLICA OF IT"*.

That is the bar. Not "inspired by," not "close enough" — replica. The user directly rejected my first attempt at this (Login/onboarding) as "nowhere near, literally fully different" when I built from memory/vibes instead of measuring the actual mockup. That correction is why the method below exists — don't skip it.

## Branch and commit state

- Branch: **`ui-revamp`**, pushed to `origin/ui-revamp`. `main` is untouched and demoable — do not merge until the user asks.
- Working tree is clean as of this handoff. Last commit: `3762879 feat(mobile): build the Home screen against mockup 9`.
- Commit after every screen (or tight group of screens) that's verified. Don't batch multiple unverified screens into one commit — if screen N+1 turns out wrong, you want to be able to `git log` back to a known-good screen N without unpicking a mixed commit.
- Run `npx tsc --noEmit` and `npx jest` before every commit, not after. I broke tests twice by committing first and fixing second — always broken by a design change invalidating a test's text-matching assertion (see "Tests" section below for the pattern and how to fix it correctly).
- Commit message convention: explain *why*, not just what — what was wrong, what the mockup actually showed (with sampled values if colors were involved), what changed. Look at the existing `ui-revamp` commit log for the tone/format to match.
- Attribution footer (this repo's convention right now — check the system reminder in your own session for the current version, it may differ):
  ```
  Co-Authored-By: <your model name> <noreply@anthropic.com>
  ```

## The method — do not deviate from this

This is the single most important thing in this handoff. Every screen, no exceptions:

1. **Extract the mockup panel.** The reference images live in `docs/ui-*.png/.jpg/.jpeg` (see full list below), each a sheet of 2-3 screens side by side. Crop just the one screen you're building, using Python/PIL, e.g.:
   ```python
   from PIL import Image
   im = Image.open('docs/ui-XX-YY-....png').convert('RGB')
   w, h = im.size
   panel = im.crop((int(w*fx0), int(h*fy0), int(w*fx1), int(h*fy1)))
   panel.save('/tmp/ref-<screenname>.png')
   ```
   Getting the crop fractions right takes 1-2 tries — check the saved crop with the Read tool before trusting it.

2. **Read the cropped panel directly** (Read tool on the PNG). Extract every detail: exact copy text, layout structure, what's above/below what, icon choices, spacing rhythm, what's present that you'd never have guessed (e.g. an Apple sign-in button, a password reveal toggle, a specific hairline rule) — and equally, what's *absent* that you'd have been tempted to add.

3. **Sample real pixel colors and positions**, don't eyeball hex values. This matters enormously — I got a gradient wrong by guessing "lime to orange" when the real mockup ramp passes through amber in the middle, and a plain two-stop blend renders as muddy olive-brown. Use numpy on the cropped panel:
   ```python
   from PIL import Image
   import numpy as np
   im = Image.open('/tmp/ref-X.png').convert('RGB')
   a = np.asarray(im).astype(int); h, w, _ = a.shape
   def avg(label, fx0, fx1, fy0, fy1):
       r = a[int(h*fy0):int(h*fy1), int(w*fx0):int(w*fx1)].reshape(-1,3).mean(axis=0).astype(int)
       print(f'  {label:22s} #{r[0]:02X}{r[1]:02X}{r[2]:02X}')
   ```
   For exact positions/heights (e.g. "is this button 44pt or 50pt tall"), scan for saturated/bright rows and convert pixel-y to points using `scale = 390/panel_width_px` (assumes a 390pt-wide iPhone reference, which is what all these mockups were drawn at). I did this for Login and it caught that my fields and buttons were ~35% oversized and my headline was 34px Bold when the real mockup is 28px Medium — that one fix corrected the *whole app* at once since it lived in the shared type scale (`theme/typography.ts`).

4. **Build/edit the screen and any new shared component it needs.**

5. **Screenshot your actual build and composite it side-by-side against the mockup crop** before claiming anything matches. This is non-negotiable — judging a screen in isolation is exactly how the first Login attempt went wrong; the differences only became obvious once mockup and build sat next to each other. See "Screenshot tooling" below for the exact mechanism (Expo web + Playwright + a preview harness), which is already built and working.

6. **Compare, list every difference, fix them, re-screenshot, re-compare.** Repeat until it actually matches — not "close enough," matches.

7. **Typecheck, test, commit, push.**

Do this for every single screen. It's slower than eyeballing, but eyeballing is what produced the rejected first draft. The user explicitly said they don't care about speed, only accuracy.

## Screenshot / verification tooling (already built, reuse it)

**Expo web dev server** must be running for any of this to work:
```bash
cd apps/mobile && npx expo start --web --port 8090
```
Check `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8090` returns 200 before screenshotting. If port 8090 is taken by a stale process, use a different port and adjust the scripts below accordingly. A recurring non-bug: the browser console will show `TypeError: ExpoSecureStore.default.getValueWithKeyAsync is not a function` — this is expected, `expo-secure-store` has no web implementation, it's harmless on web preview and does not indicate a real problem.

**Playwright** is set up in the scratchpad (not the repo — it's throwaway tooling):
```
/tmp/claude-1000/-home-bilaltahir-Desktop-markhor-proj/017ef8df-b038-4c31-8d60-435e301be05e/scratchpad/pw/
```
That directory has `node_modules/playwright` installed already (`npm install playwright --no-save`) and several small `.mjs` capture scripts (`slides.mjs`, `login.mjs`, `signup.mjs`, `forgot.mjs`, `tracks.mjs`, `preview.mjs` etc.) — look at any of them as a template; they're all the same shape:
```js
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:8090/...', { waitUntil: 'networkidle', timeout: 180000 });
await page.waitForTimeout(9000); // Expo web's bundle takes a while to boot, don't shortcut this
await page.screenshot({ path: '/tmp/s-whatever.png' });
await browser.close();
```
If that scratchpad path is gone in your session (new session = new scratchpad path), just recreate it: `mkdir -p <scratchpad>/pw && cd <scratchpad>/pw && npm init -y && npm install playwright --no-save`. Takes about a minute.

**The dev-only preview harness** — this is the important piece, in `apps/mobile/App.tsx`. Screens behind real auth (Home, TrackPicker, anything in the main tab stack) can't be reached by just clicking through onboarding on a fresh session. Rather than fake Supabase auth state, I added a URL param that renders one screen in isolation:
```
http://localhost:8090/?preview=Home
http://localhost:8090/?preview=TrackPicker
http://localhost:8090/?preview=Splash
```
It's gated behind `__DEV__ && Platform.OS === 'web'`, so it cannot leak into a real build. **To add a new screen to it**: import the screen component at the top of `App.tsx`, add a `case 'ScreenName': return <ScreenComponent {...props} />;` inside the `previewScreen()` switch. The `props` object passed is a fake `{ navigation: noop, route: { params: {} } }` — fine for screens that just render and call `navigation.navigate` on press (those presses no-op harmlessly in preview), but if a screen reads `route.params` for something essential, you may need to fake that too.

**This harness must be removed before merging `ui-revamp` into `main`.** It's clearly commented as dev-only/temporary in `App.tsx` but flag it to the user before the final merge regardless — a good moment to double check nothing shipped depends on it.

**Compositing mockup vs. build side-by-side** — the actual comparison step:
```python
from PIL import Image
r = Image.open('/tmp/ref-X.png'); m = Image.open('/tmp/s-X.png')
W = 400
r2 = r.resize((W, int(r.height*W/r.width))); m2 = m.resize((W, int(m.height*W/m.width)))
c = Image.new('RGB', (W*2+24, max(r2.height, m2.height)), (16,16,16))
c.paste(r2, (0,0)); c.paste(m2, (W+24, 0))
c.save('/tmp/cmp-X.png')
```
Then Read `/tmp/cmp-X.png` and actually look — left is always mockup, right is always your build, in every comparison I made throughout this task. Keep that convention so you don't confuse yourself.

## Reference image inventory

All in `docs/`, already renamed from the client's original garbage filenames to something legible, committed to git. **Do not re-rename or move them** — every script and every prior commit message references these exact names.

| File | Contains |
|---|---|
| `brand-logo-full.png` | Full logo lockup (star + "epp" + "Entertainment Power Players" wordmark) — transparent PNG, ~2000px, use for `Logo variant="full"` |
| `brand-logo-mark.png` | Star + "epp" mark only, no wordmark — transparent PNG, ~2500x2119, use for `Logo variant="mark"` |
| `onboarding-concert-photo.png` | The crowd/stage photo used on onboarding slide 1 — 1290x2000 portrait, already copied into `apps/mobile/assets/onboarding-concert.png` |
| `ui-design-all-screens.png` | Master sheet, all 24 screens at small size — useful as an index/overview but too small to extract precise detail from directly; use the per-range files below for actual pixel work |
| `ui-01-03-splash-onboarding.png` | Screens 1-3: Splash, Onboarding slide 1, Onboarding slide 2 |
| `ui-04-06-onboarding-login-signup.jpeg` | Screens 4-6: Onboarding slide 3, Login, Sign Up |
| `ui-07-08-forgot-password-tracks.jpg` | Screens 7-8: Forgot Password, Track Selection |
| `ui-09-11-home-directory-contacts.png` | Screens 9-11: **Home**, **Directory (category list)**, Contact List |
| `ui-12-14-contact-paywall-tracker.jpeg` | Screens 12-14: Contact Detail, Paywall, Tracker Dashboard |
| `ui-15-16-log-activity-challenges.jpg` | Screens 15-16: Log Activity, Challenges Track List |
| `ui-19-20-quote-profile.png` | Screens 19-20: Quote Share Card, Profile |

**No close-up exists for screens 17, 18, 21-24** (Challenge Detail/counter, Inspiration Feed, Edit Profile, Subscription, Notifications, Admin Contacts) — only the small master sheet. Extract what you can from `ui-design-all-screens.png` at as high a zoom as PIL will give you without pure upscaling artifacts, and where genuinely ambiguous, extrapolate from the established design language (brand gradient buttons, IconTile pattern, Card surfaces, etc.) rather than guessing wildly. Flag anything you had to substantially invent when you report progress to the user.

## What's done (screens 1-9, all verified against mockups)

| # | Screen | File | Notes |
|---|---|---|---|
| 1 | Splash | `src/features/onboarding/SplashScreen.tsx` | Auto-navigates in ~1.1s — use `?preview=Splash` to actually see it, `waitUntil:'commit'` + short timeout in the capture script, or you'll miss it |
| 2-4 | Onboarding slides 1-3 | `src/features/onboarding/IntroSlidesScreen.tsx` | Slide 1 = photo, slide 2 = stat card + custom SVG trend line, slide 3 = cascading dark cards |
| 5 | Login | `src/features/onboarding/LoginScreen.tsx` | Full match incl. Apple button + password eye toggle |
| 6 | Sign Up | `src/features/onboarding/SignUpScreen.tsx` | Added a Full Name field the old build didn't have; wired it through to `signUpWithEmail`'s `user_metadata.full_name` rather than collecting and discarding it |
| 7 | Forgot Password | `src/features/onboarding/ForgotPasswordScreen.tsx` | New "streaks" Aurora variant (diagonal light beams, not corner blobs) — this screen and only this screen uses it |
| 8 | Track Selection | `src/features/onboarding/TrackPickerScreen.tsx` | 2x3 grid, alternating amber/lime icons via new `trackIcons` map in `theme/icons.ts` |
| 9 | Home | `src/features/home/HomeScreen.tsx` (**new file, new feature folder**) | Did not exist before — Directory tab used to open straight on the category grid. Now Home is the tab's landing screen, category grid is one level in. Greeting + avatar + "This Week" progress card (3 bars, computed from the *existing* tracker store — `countsForWeek`/`goalsForWeek`, nothing new invented) + Quick Access row into the other tabs |

### Shared components built/changed along the way (reuse these, don't reinvent)

- **`theme/colors.ts`** — full dark palette, sampled from the logo (`#90D010` lime, `#F05000` orange, `#F0A010` amber) and mockup backgrounds (`#050F11` background family).
- **`theme/gradients.ts`** — `gradients.brand` is the real 4-stop CTA ramp (`#75DA3D → #9CBB2A → #F27C10 → #FC5D06`, NOT a naive 2-stop lime-to-orange — that renders muddy). Also `gradients.barAmber/barLime/barOrange` for the three Home progress bars (sampled separately — they each stay in one hue, they don't sweep the full brand ramp). `auroras.standard/warm/subtle` are the soft corner-blob backdrops; a `streaks` variant lives in the `Aurora` component itself for the diagonal-beam treatment Forgot Password uses.
- **`theme/typography.ts`** — corrected scale, measured off the mockups. `display` is 28px Medium (NOT 34px Bold — that was the original wrong guess). If you're about to add a new text size anywhere, measure it the way described above rather than picking a "reasonable-looking" number.
- **`components/Aurora.tsx`** — corner-blob glow (SVG radial gradient — a `LinearGradient` clipped to a circle leaves a visible hard edge, learned that the hard way) + the `streaks` diagonal-beam variant.
- **`components/Avatar.tsx`** — initials on a deterministic per-name gradient. **Deliberately no stock/AI face photos** — these represent real industry contacts, fabricating photos for them is misleading. Takes an optional `imageUrl` prop for if real contact photos ever exist.
- **`components/Logo.tsx`** — renders `brand-logo-full.png` or `brand-logo-mark.png` at a given width, aspect-correct.
- **`components/IconTile.tsx`, `components/CategoryCard.tsx`** — I was mid-revision on `CategoryCard` when cut off (see "Where I stopped" below) — check it's actually finished before reusing as-is.
- **`components/SocialButton.tsx`** — shared Apple/Google button, used by both Login and Sign Up.
- **`components/FormField.tsx`** — labeled input, 44pt tall (measured), with password reveal toggle built in via a `secureTextEntry` + eye icon.
- **App-shell fixes in `App.tsx`**: `NavigationContainer` was still on the light `DefaultTheme` — switched to `DarkTheme` (fixes white flashes between screen transitions). `StatusBar` was `style="dark"` — switched to `style="light"` (fixes near-invisible clock/battery glyphs on the dark bar). These were real bugs, not stylistic choices — worth knowing they're intentional if you see them.

## Where I stopped — pick up here

I was **mid-analysis on screen 10, Directory (category list)**, cropped as `/tmp/ref-directory.png` from `docs/ui-09-11-home-directory-contacts.png` (crop fractions used: `(0.352, 0.048, 0.663, 0.985)` — those worked, reuse them if the crop is still valid, i.e. if that source file hasn't changed).

What I'd found before being cut off, so you don't have to re-derive it:
- The mockup's category rows use **circular icon tiles** (not the rounded-square `IconTile` the current `CategoryCard` renders), each filled with a **solid muted per-category color with a warm radial glow** — confirmed by cropping and viewing the Fashion tile directly (a warm brown-orange circle, brighter near the glyph, glyph itself a bright saturated orange hanger outline). This is visually different from the gradient-sweep rounded-square tiles I'd built for the earlier "cascading cards" on onboarding slide 3 — don't reuse that pattern here, it's a different visual language.
- There's a **search bar with a filter icon button** at the top ("Search categories...") that doesn't exist in the current `CategoryGridScreen.tsx` at all.
- There's a **"Directory" heading with a small chevron/sort icon** top-right that also doesn't exist currently.
- Exact per-category tile colors were proving noisy to sample by pixel-averaging (the averages were picking up background bleed and the glyph itself, not a clean tile fill) — my last action was switching to cropping and visually reading small tile crops one at a time instead of statistical averaging. That's the right call for small solid-color UI chrome like this; save the numpy-averaging approach for gradients and large surfaces where noise washes out. **Do this for each of the 5 category tiles (Fashion, Film+TV, Gaming, Music, Sports) before writing any color into code** — I'd only actually looked at Fashion's.

**Concretely, next steps in order:**
1. Crop and visually inspect the remaining 4 category tiles (Film+TV, Gaming, Music, Sports) the same way I did Fashion (`im.crop(...).resize((300,180))` then Read it).
2. Decide: new tile variant on `CategoryCard`/`IconTile` (circular, solid-fill-with-glow, no gradient sweep) vs. a genuinely new small component. Given it's visually distinct from every other icon-tile usage in the app so far, I'd lean toward adding a `shape="circle"` + `fill="solid"` option to the existing `IconTile` rather than a parallel component — but check what's actually in `IconTile.tsx` now (I hadn't finished editing it) before deciding.
3. Add the search bar + filter button and the "Directory" heading + chevron to `CategoryGridScreen.tsx`.
4. Wire the current `CategoryCard` (or its successor) into `CategoryGridScreen.tsx`, matching the per-category colors you sampled.
5. Screenshot via the existing Directory tab flow (Home → tap Directory Quick Access tile, or add `?preview=CategoryGrid` to the harness) and composite against `/tmp/ref-directory.png`.
6. Typecheck, test, commit, push.
7. Continue to screen 11 (Contact List — same sheet, further right), then 12-24 in order, same method every time.

## Remaining screens (10-24), in mockup order

10. Directory / category list — **in progress, see above**
11. Contact List (A-Z contacts within a category) — same sheet as 9-10
12. Contact Detail — `ui-12-14-contact-paywall-tracker.jpeg`
13. Paywall
14. Tracker Dashboard
15. Log Activity — `ui-15-16-log-activity-challenges.jpg`
16. Challenges Track List
17. Challenge Detail (counter type) — **no close-up mockup, master sheet only**
18. Inspiration Feed — **no close-up mockup, master sheet only**
19. Quote Share Card — `ui-19-20-quote-profile.png`
20. Profile
21. Edit Profile — **no close-up mockup, master sheet only**
22. Subscription — **no close-up mockup, master sheet only**
23. Notifications — **no close-up mockup, master sheet only**
24. Admin Panel Contacts — **no close-up mockup, master sheet only; this is the React admin app in `apps/admin/`, a completely separate codebase/theme system (plain CSS + tokens in `apps/admin/src/index.css`, not React Native) — see below**

## The admin panel — separate, not started under this task

The user's scope explicitly includes the admin panel ("both for app and admin"), but **none of the work in this task branch has touched it yet** — everything above is `apps/mobile/` only. It needs the same dark-theme treatment following the same method (extract mockup → sample colors/positions → build → screenshot-compare → fix → commit), but:
- It's a Vite + plain CSS React app, not React Native — the tooling is completely different (no Expo web / Playwright-preview-harness needed; you can literally run `npm run dev` and hit it in a normal browser, or use headless Chrome directly since there's no RN-web translation layer to fight).
- It already went through **one prior, unrelated dark-theme pass** earlier in this project's history (see `apps/admin/src/index.css` and prior commits like "full UI/UX revamp per Entertainment_Power_Players_UI_UX_Revamp_Prompt.md" and the mobile-responsiveness/login-page fixes) — that was a *different, earlier* design direction (warm editorial terracotta-on-cream, later flipped to a generic dark theme), **not** based on these specific mockup images. Do not assume the admin panel's current dark styling matches these mockups just because it's already dark — check it against screen 24's master-sheet crop the same way as everything else, expect it to need real changes.
- There is a related but distinct document at `docs/Entertainment_Power_Players_UI_UX_Revamp_Prompt.md` from an earlier phase of this project — skim it for context on the admin panel's existing design system, but the images in `docs/ui-*` are the authoritative source of truth for this specific task, per the user's explicit instruction.

## Tests — the recurring failure pattern, and how to fix it correctly

Every time a screen's visible text changes (a headline, a button label, a screen that no longer starts on the content it used to), some existing Jest test that was doing `getByText('exact old copy')` breaks. This happened repeatedly and is not a sign anything is actually wrong — it's expected collateral from a real visual overhaul. The fix is **never** to weaken the test's intent, always to **re-anchor it on something structurally stable**:
- Prefer `getByLabelText` with an explicit `accessibilityLabel` you control, over `getByText` on copy that's likely to change again.
- If matching a nav-bar/tab-bar element, remember **React Navigation's tab buttons carry an accessibility label like `"Tracker, tab, 2 of 5"`**, not just `"Tracker"` — and if any *other* on-screen element (e.g. a Home Quick Access tile) happens to render bare text/label `"Tracker"` too, `getByText`/`getByLabelText('Tracker')` will either match the wrong element or throw "multiple elements found." I hit this exact collision between the tab bar and Home's Quick Access tiles — the fix was `getByLabelText(new RegExp('^Tracker, tab,'))` to disambiguate. Watch for this pattern any time a Quick-Access-style shortcut duplicates a tab's label.
- If a test is asserting "screen X rendered" via some heading text that a redesign changed, re-point it at a more structural anchor (a section heading that's unlikely to be pure marketing copy, an accessibility label you added deliberately, a control the screen can't function without like its primary CTA).
- Run the **full** suite (`npx jest`, not a single file) before every commit — a change to a shared component (`Button`, `FormField`, theme tokens) can break tests in files you didn't touch and wouldn't think to check.

Current state: **all 14 test suites / 50 tests passing** as of the last commit. Keep it that way — don't commit red.

## Things that will bite you if you don't know them going in

- **`expo-secure-store` has no web implementation.** The console error about it on every web preview load is expected noise, not a bug to chase.
- **React Navigation tab screens stay mounted when inactive** (not unmounted) — this caused the test collision above, and means if you're debugging "why does pressing X seem to do nothing," check whether you're actually hitting a stale/hidden instance of a similarly-labeled element rather than the one you think.
- **Give the Expo web bundle real time to boot** in capture scripts — 8-12 seconds via `waitForTimeout` after `goto`, not less. Screenshots taken too early show a blank or partial page and look like a bug when they're just a race.
- **Splash auto-navigates in ~1.1s** — screenshot it via the preview harness or with a very short `waitForTimeout` + `waitUntil: 'commit'`, or you'll capture whatever screen it moved on to instead.
- **Gradient math**: never assume a 2-color CSS/React Native gradient interpolation will look like the mockup's — sample actual pixels along the real gradient and use the real stop colors/positions (`locations` prop in `expo-linear-gradient`), especially for anything green-to-orange, since the naive linear blend passes through a muddy brown that doesn't exist in the mockups.
- **Disabled-state opacity can look like a color bug when it isn't.** A form's primary button renders muted/dark when the form is empty (form validation disables it, and `Button`'s disabled style drops opacity) — don't "fix" a gradient that's actually rendering correctly-but-disabled. Fill the form fields before judging whether a CTA's color is right.
- The user is **allergic to overclaiming progress**. Earlier in this task I said "5 screens are done" when one of them (Splash) hadn't actually been visually verified yet — just dark-and-therefore-assumed-fine. Got called out for it, correctly. Only say a screen is "done" after you've actually produced and looked at a side-by-side comparison image, not after you've written code that you believe should look right.

## Suggested first message to the user when you pick this up

Something like: confirm you've read this handoff, confirm the branch/commit state matches what's described here (`git log --oneline -1` should show the Home-screen commit as HEAD, working tree clean), then say you're continuing with Directory (screen 10) using the same measure-then-build-then-compare method, and that you'll check in once that screen and Contact List (11, same source sheet) are both verified. Don't ask permission to use the method — the user already approved it explicitly and repeatedly; just get moving and show results.
