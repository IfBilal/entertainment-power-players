# ENTERTAINMENT POWER PLAYERS — COMPLETE UI/UX REVAMP IMPLEMENTATION PROMPT

## 0. ROLE AND PRIMARY OBJECTIVE

You are the lead product designer, senior mobile UI/UX engineer, senior React Native engineer, and senior React web engineer responsible for completely revamping the visual design and user experience of the Entertainment Power Players application.

You are NOT being asked to merely recolor the existing application.

You are NOT being asked to add random animations.

You are NOT being asked to make the product look like an AI application.

You are NOT being asked to make a generic SaaS dashboard.

You are NOT being asked to turn the product into a social-media clone.

Your task is to transform the existing implementation into a cohesive, premium, highly intentional product experience that feels like it was designed by a world-class product/design studio for the entertainment industry.

The final product should feel:

- Premium
- Editorial
- Sophisticated
- Aspirational
- Creative
- Professional
- Human
- Functional
- Polished
- Modern
- Visually rich without being noisy
- Motion-aware without being gimmicky
- Information-dense where useful and spacious where useful
- Consistent across mobile, admin web, and authentication web pages

The central design idea is:

> A premium career companion for people building careers through relationships, industry knowledge, deliberate activity, and consistent progress.

The product should communicate:
"Your career is built through people, action, and momentum."

Every major visual decision should reinforce that idea.

---

# 1. PRODUCT CONTEXT — DO NOT LOSE THE PRODUCT'S ACTUAL PURPOSE

The application is a subscription product for people building a career in entertainment.

The product has four pillars:

1. Directory
2. Tracker
3. Challenges
4. Inspiration

The mobile app has five bottom tabs:

- Directory
- Tracker
- Challenges
- Inspiration
- Profile

The Directory is an entertainment-industry contact directory spanning:

- Fashion
- Film/TV
- Gaming
- Music
- Sports

The Tracker lets users record:

- Contacts
- Events
- Follow-ups

and compare activity against weekly goals.

Challenges provide six career-action tracks containing:

- Single completion challenges
- Counter-based challenges

Inspiration provides industry quotes, including Quote of the Day, saving, and sharing.

Profile manages:

- Personal information
- Subscription
- Selected tracks
- Notifications
- Privacy
- Terms
- Support
- Account deletion

Free users can access appropriate free content while paid directory/challenge content is gated by subscription.

The admin panel manages:

- Contacts
- Categories
- Quotes
- Tracks
- Challenges
- CSV import
- Ordering
- Activation/deactivation

Content is runtime-editable and must never be visually coupled to hardcoded assumptions.

Do not redesign the information architecture in a way that violates these functional requirements.

The visual system should improve the experience without breaking existing business logic, entitlement behavior, Firestore structure, navigation requirements, or content-management capabilities.

---

# 2. THE DESIGN NORTH STAR

The design north star is:

## "Editorial ambition meets professional utility."

Imagine a product that combines:

- the confidence of a premium fashion/editorial publication,
- the usability of a modern productivity application,
- the clarity of a professional networking tool,
- the emotional motivation of a career-development product.

Do NOT literally copy any existing product.

Use the above as conceptual references only.

The UI should feel distinctive enough that a user could recognize Entertainment Power Players without seeing the logo.

---

# 3. WHAT THE PRODUCT MUST NOT LOOK LIKE

Strictly avoid the following:

- Generic purple/indigo AI-app styling
- Neon gradients
- Rainbow gradients
- Glassmorphism everywhere
- Excessive blur
- Excessive floating cards
- Generic dashboard templates
- Huge shadows
- Pure black shadows
- Excessive pill-shaped UI
- Excessive badges
- Excessive outlined buttons
- Random illustrations
- Stock photography used as decoration
- Random 3D blobs
- AI-generated decorative art with no semantic purpose
- Excessive icons
- Excessive borders
- Overly dense enterprise UI
- Childish gamification
- Social-media-like engagement mechanics
- Flashing effects
- Confetti everywhere
- Excessive parallax
- Constant movement
- Long animation durations
- Decorative charts that do not represent real data
- Fake statistics
- Fake user activity
- Fake testimonials
- Fake profile photos for directory contacts
- UI elements that imply functionality that does not exist

Do not add a visual element merely because it looks impressive.

Every visual element must either:

1. Communicate information,
2. Improve navigation,
3. Reinforce the brand,
4. Provide feedback,
5. Improve comprehension,
6. Create emotional motivation,
7. Improve perceived quality without harming usability.

---

# 4. CORE VISUAL LANGUAGE

The product should use a warm, sophisticated visual foundation.

Do NOT make the interface look beige and lifeless.

The background is warm paper rather than cold white.

Use:

Primary background:
#FBF7F0

Primary ink:
#221B14

Primary accent:
#B0501C

However, do not use these three colors mechanically.

Build a complete semantic color system around them.

Recommended tokens:

background:
#FBF7F0

surface:
#FFFDF9

surfaceSubtle:
#F5EFE6

surfaceStrong:
#EEE5D9

ink:
#221B14

inkSecondary:
#5F554C

inkTertiary:
#8B8075

inkMuted:
#A69B90

border:
#DED4C8

borderSubtle:
#EAE2D8

accent:
#B0501C

accentDark:
#8F3F16

accentSoft:
#E9C7B5

accentFaint:
#F5E4DA

success:
#41634B

successSoft:
#DDE8DE

warning:
#8A641F

warningSoft:
#F1E5C7

danger:
#9B3B32

dangerSoft:
#F0DAD6

info:
#526B73

infoSoft:
#DCE7E9

These secondary semantic colors must be used sparingly.

The interface should still visually read as:

WARM NEUTRALS + DARK INK + TERRACOTTA

not:

WARM NEUTRALS + SIX RANDOM COLORS.

---

# 5. COLOR USAGE RULES

Use the accent color primarily for:

- Primary CTA
- Active navigation
- Progress highlights
- Selected states
- Important interactive controls
- Favorite state
- Key data emphasis
- Links when necessary
- Focus states
- Subscription CTA
- Completion emphasis

Do not make entire cards terracotta.

Do not make every icon terracotta.

Do not make every heading terracotta.

Do not use accent as a decorative background everywhere.

The accent should remain valuable because it is relatively scarce.

A user should subconsciously understand:

"TERRACOTTA = ACTION / PROGRESS / IMPORTANCE."

---

# 6. TYPOGRAPHY SYSTEM

Use:

Fraunces for expressive/editorial typography.

Inter for functional/product typography.

Do not use Fraunces for everything.

## Fraunces

Use for:

- Major screen titles
- Hero headlines
- Important motivational statements
- Quote typography
- Large numerical moments where appropriate
- Onboarding headlines
- Empty-state headlines where emotional context matters
- Subscription headline

Use a confident editorial weight.

Avoid excessive italics.

## Inter

Use for:

- Navigation
- Buttons
- Labels
- Inputs
- Contact metadata
- Filter controls
- Search
- Tables
- Admin interface
- Supporting text
- Descriptions
- Form labels
- System messages
- Dates
- Numbers when used as utility data

Suggested type scale:

Display:
40–46px / 44–50 line height

Hero:
32–38px / 36–44

H1:
30–34px / 36–40

H2:
24–28px / 30–34

H3:
19–22px / 25–28

Body:
15–17px / 22–25

Body Small:
13–14px / 18–20

Caption:
11–12px / 15–17

Navigation:
12–13px / 16–18

Button:
14–15px / 18–20

Do not make all typography tiny.

This is a mobile premium product and readability is more important than fitting more content onto the screen.

---

# 7. SPACING SYSTEM

Use a consistent spacing scale.

Base unit:
4px

Tokens:

4
8
12
16
20
24
28
32
40
48
56
64
80

Use:

16–20px horizontal page padding on most mobile screens.

24px between major sections.

32–40px before major visual transitions.

Use generous whitespace around editorial content.

Do not fill every available pixel.

However, whitespace must be purposeful.

A large empty area should be paired with a strong typographic or visual focal point.

Avoid "empty because nothing was designed there."

---

# 8. CORNER RADIUS SYSTEM

Use rounded corners, but avoid making every element look like a pill.

Tokens:

radiusXS = 6px
radiusSM = 10px
radiusMD = 14px
radiusLG = 18px
radiusXL = 24px
radiusXXL = 30px

Use:

- 10–14px for inputs
- 14–18px for normal cards
- 18–24px for feature cards
- 24–30px for hero/editorial panels
- Full pill only for tags, compact status indicators, or intentionally pill-shaped controls

Buttons should generally use 12–16px radius rather than giant pills.

---

# 9. SHADOW SYSTEM

Avoid black shadows.

Use warm ink-tinted shadows.

Default:
0 4px 16px rgba(34, 27, 20, 0.06)

Elevated:
0 8px 28px rgba(34, 27, 20, 0.10)

Floating:
0 14px 40px rgba(34, 27, 20, 0.12)

Do not apply shadows to every component.

Prefer:

- borders for structural grouping,
- background contrast for hierarchy,
- shadows only for elevation.

---

# 10. TEXTURE AND BACKGROUND TREATMENT

The background should feel subtly tactile without becoming a paper texture gimmick.

Use the base #FBF7F0.

Optionally apply an extremely subtle noise/paper texture with opacity approximately 0.015–0.025.

It must be almost imperceptible.

Do not use a visible paper image.

Do not use gradients.

Use subtle background compositions on major screens:

- faint oversized typography,
- tiny line motifs,
- thin editorial rules,
- subtle grid fragments,
- tiny category symbols,
- abstract connection lines.

These should remain behind content and never reduce readability.

Example conceptual composition:

------------------------------------------------
DIRECTORY

        Your industry network
              500+

     ────────────────

  FASHION      FILM/TV
     ◌            ◉

        GAMING
          ◆

  MUSIC        SPORTS
    ♪             ▲
------------------------------------------------

The visual motifs should feel like editorial design, not a technical dashboard.

---

# 11. ICONOGRAPHY

Use one coherent icon family.

Icons should be:

- clean
- geometric
- slightly expressive
- consistent in stroke weight
- optically balanced
- not cartoonish

Category icons are especially important.

The categories:

Fashion
Film/TV
Gaming
Music
Sports

should each have a distinctive icon.

Examples conceptually:

Fashion:
sunglasses / garment-inspired symbol

Film/TV:
film frame / camera-inspired symbol

Gaming:
controller

Music:
note / waveform-inspired symbol

Sports:
ball or movement-inspired symbol

Do not introduce photographs for directory contacts because the product specification explicitly says contacts do not carry photos.

Category icons can be visually large and expressive.

---

# 12. GLOBAL NAVIGATION

The five-tab navigation remains:

Directory
Tracker
Challenges
Inspiration
Profile

Do not replace this with a hamburger menu.

Create a premium custom bottom navigation.

Structure:

------------------------------------------------
     ◉          ◉          ◉          ◉          ◉
 Directory   Tracker   Challenges Inspiration Profile
------------------------------------------------

Inactive:
inkMuted icon + label

Active:
accent icon + label

Active tab should have a subtle visual indicator.

Do not use a giant colored pill behind the active tab.

Use either:

- small terracotta line,
- tiny accent dot,
- subtle icon container,
- restrained underline-like marker.

Navigation should feel stable and quiet.

On keyboard/open modal states, ensure navigation behavior is appropriate.

Respect safe areas.

---

# 13. SCREEN TRANSITIONS

Default navigation transition:

- 220–280ms
- ease-out
- opacity + slight vertical movement

Push:
new screen rises approximately 8–12px while fading in.

Modal/sheet:
translate from bottom with spring-like easing.

Tab switch:
do not fully reload visually.

Use subtle crossfade/translate only.

Avoid excessive page zoom.

Do not animate large amounts of content independently.

Respect reduced-motion accessibility settings.

---

# 14. MICRO-INTERACTION SYSTEM

All interactive controls should have clear feedback.

Buttons:

On press:
scale to approximately 0.97–0.98.

Duration:
80–120ms.

Release:
spring back.

If supported, use subtle haptic feedback for:

- primary actions
- completion
- favorite
- important toggles

Do not vibrate for every tap.

Favorite:
heart scales approximately 1.0 → 1.15 → 1.0.

Completion:
checkmark draws/fades in.

Counter:
number transitions rather than abruptly changing.

Progress:
animate fill from previous value to new value.

Chart:
animate bars on initial load.

Avoid looping animations except where genuinely informative.

---

# 15. COMPONENT DESIGN SYSTEM

Create reusable primitives.

Required components:

- AppText
- AppHeading
- AppButton
- SecondaryButton
- TertiaryButton
- IconButton
- SearchBar
- FilterButton
- CategoryCard
- ContactRow
- SectionHeader
- ProgressBar
- ProgressRing
- StatCard
- ActivityCard
- ChallengeRow
- CounterControl
- QuoteCard
- EmptyState
- ErrorState
- Skeleton
- BottomSheet
- Modal
- Toast
- Divider
- Tag
- Avatar/Initials component for user profile only
- PaywallCard
- SubscriptionOption
- SettingsRow
- FormField

Build the visual system around tokens.

Do not duplicate arbitrary styles screen-by-screen.

---

# 16. BUTTON SYSTEM

Primary button:

Background:
#B0501C

Text:
#FFFDF9

Radius:
14px

Height:
48–52px

Font:
Inter semibold 14–15px

Pressed:
#8F3F16

Primary buttons should be visually strong.

Secondary:
transparent/surface background

Border:
#DED4C8

Text:
#221B14

Tertiary:
no background/no border

Text:
accent or ink

Danger:
use danger semantic token only for destructive actions.

Avoid using outlined buttons for everything.

---

# 17. INPUT SYSTEM

Inputs should feel like premium physical controls.

Background:
#FFFDF9

Border:
#DED4C8

Radius:
12–14px

Height:
48–54px

Focused border:
accent

Focused subtle glow:
rgba(176,80,28,0.12)

Placeholder:
#A69B90

Text:
#221B14

Error:
danger border + concise error message.

Labels should remain visible above fields.

Do not rely solely on placeholders.

---

# 18. LOADING SYSTEM

Never use blank screens.

Use skeleton loaders.

Skeleton color:
#EFE7DC

Animated shimmer must be subtle.

For major editorial screens, use a combination of:

- skeleton text lines
- placeholder blocks
- faint icon silhouettes

Do not use an enormous spinner in the center of the screen unless the entire screen genuinely cannot render anything.

---

# 19. EMPTY STATES

Empty states must be designed.

Do not display:

"No data."

Instead:

Small semantic icon/graphic.

Editorial heading.

One-sentence explanation.

Optional CTA.

Example:

TRACKER with no activity:

"Your week starts here."

"Log your first connection, event, or follow-up and start building momentum."

[Log activity]

The empty state should feel motivating, not like an error.

---

# 20. ERROR STATES

Errors must be calm and useful.

Example:

"Something went off track."

"We couldn't load your directory right now."

[Try again]

Avoid technical Firebase error messages.

Do not hide important failure information.

---

# 21. HOME / DEFAULT EXPERIENCE

There is no dedicated Home tab.

Do not create a fake sixth tab.

Directory remains the first primary tab.

However, the app should feel cohesive when the user launches it.

The initial Directory state should be visually rich enough to establish the brand.

---

# 22. DIRECTORY — COMPLETE REDESIGN

Directory is one of the core product experiences.

The current specification requires:

- category grid
- contact counts
- alphabetical category lists
- sticky letters
- A–Z jump bar
- global search
- filters
- contact detail
- favorites
- mark as contacted
- paywall for free users

Do not change functionality.

## Directory header

Top area:

Small eyebrow:
YOUR INDUSTRY

Large Fraunces headline:
"People worth knowing."

Supporting text:
"Explore the people shaping entertainment."

Optional dynamic total:
"500+ industry contacts"

Do not hardcode the number.

Use runtime data.

## Category explorer

Use five visually distinct but monochromatic category cards.

Cards should not be identical rectangles.

Use a composition such as:

Fashion — large icon, category name, count
Film/TV — icon, name, count
Gaming — icon, name, count
Music — icon, name, count
Sports — icon, name, count

Use varying internal composition rather than random colors.

Example:

Card:
surfaceStrong background
large faint icon in background
foreground category icon
name
count

The icon may sit partially outside the normal content box.

Keep clipping intentional.

Subtle press animation:
scale 0.98.

## Search

Search should be prominent but not oversized.

Use:

[ magnifying glass  Search people, companies or roles ]

Search bar with:

surface background
subtle border
12–14px radius

When focused:
accent border.

## Category list

Once inside a category:

Header:

< Back

FASHION

"128 people"

Search/filter controls.

Then:

A

A24
Production
Los Angeles

...

B

...

The A–Z rail should be thin and elegant.

Do not make it a giant vertical block.

Use 10–12px typography.

## Contact row

Do not use giant cards.

Use structured editorial list rows.

Suggested:

Name
Role · Company
City

Favorite icon on right.

Optional tiny category marker.

Use 72–84px row height depending on content.

Dividers should be extremely subtle.

On press:
background changes slightly.

## Contact detail

This should feel like a premium profile sheet.

Header:

category label
name in Fraunces
role
company

Then a structured contact section.

Actions:

Call
Email
Website

Use large, clear action buttons/icons.

Do not show empty fields.

Favorite should be prominent but restrained.

"Mark as contacted" should be a clear primary action.

Consider a contextual bottom action area:

[ Mark as contacted ]

When marked:
button transforms into a completed state with checkmark.

## Free user lock state

Do NOT show an ugly lock screen.

Show category preview:

Category icon
Category name
Contact count

Then a premium access panel:

"Your industry network is waiting."

"Unlock the full directory and start building your network."

Benefits:

Access every contact
Save favorites
Track conversations
...

[ Unlock Directory ]

Keep it aligned with subscription product identity.

---

# 23. TRACKER — COMPLETE REDESIGN

Tracker should feel like a personal career momentum dashboard.

Do not make it look like Excel.

Header:

THIS WEEK

Fraunces:
"Your momentum."

Then current week:

Week 37 · Sep 7–13

Use actual user timezone/week data.

## Hero progress area

Create a visually compelling weekly summary.

Example:

                    16
              TOTAL ACTIONS

         ─────────────────
          YOUR WEEKLY GOAL

             16 / 23

Use progress visualization.

Then three activity metrics:

CONTACTS
7 / 10

EVENTS
3 / 5

FOLLOW-UPS
6 / 8

Each should use:

small icon
large number
goal
progress bar

Do not make three giant unrelated cards.

Consider one unified "Momentum" surface containing three rows.

## Progress bars

Track:
0 → goal

Use accent for achieved progress.

If progress exceeds goal:
cap visual bar at 100% but display actual number.

Animation:
fill over 500–700ms on screen entry.

## Log activity

Create a visually prominent but not oversized CTA:

[ + Log activity ]

On tap, open bottom sheet.

Bottom sheet options:

CONTACT
EVENT
FOLLOW-UP

Each option has a meaningful icon.

Do not use a generic three-column button grid if it becomes cramped.

## Activity log

Use timeline-like visual structure.

Example:

TODAY

09:42

●

Connected with Sarah Jones
Music · Sony

12:10

●

Industry event
Music networking meetup

The vertical line is a subtle brand motif.

This is one place where a "connection path" visual can naturally belong.

## Eight-week chart

Heading:
"Your networking rhythm"

Subtitle:
"Activity across the last 8 weeks"

Chart should be visually beautiful.

Bars should have:

- rounded top corners
- subtle background grid
- accent active/primary bars
- muted historical bars

Do not make a giant chart.

Animate bars on initial render.

Do not add decorative chart data.

Use actual data.

## History

Group by week.

Example:

THIS WEEK

Activity rows

LAST WEEK

Activity rows

Swipe-to-delete should have clear destructive feedback.

---

# 24. CHALLENGES — COMPLETE REDESIGN

Challenges should feel like progression, not chores.

Header:

YOUR PATH

"Build your career, one move at a time."

Selected tracks pinned first.

## Track cards

Each track card should communicate:

- track name
- completed/total
- progress percentage
- progress visualization
- selected state

Avoid six generic rectangles.

Use a large progress ring or partial circular visual.

Example:

NETWORKING
          68%
       ◯────◯

8 of 12 complete

[ Continue ]

The selected tracks can have a subtle "Selected" marker.

## Track detail

Header:

NETWORKING

68% COMPLETE

Progress ring centered or slightly offset.

Then:

"Keep the momentum going."

Challenges below.

## Single challenge

Structure:

[ ✓ ] Attend an industry event

Optional description.

Completion state:
- check animation
- text transitions
- activity write-through remains invisible to user

Do not make completed challenges look dead.

Use subtle reduction in contrast, but retain hierarchy.

## Counter challenge

Example:

ATTEND 5 EVENTS

2 / 5

[ − ]   2   [ + ]

Progress bar below.

When reaching 5:

5 / 5
Complete

Animate the final increment.

Do not let the counter visually exceed target.

## Notes

Optional notes field should expand only when needed.

Avoid showing a large empty textarea under every challenge.

Use:
"Add a note"

Then expand on tap.

---

# 25. INSPIRATION — COMPLETE REDESIGN

This should be the most editorial screen.

Header:

INSPIRATION

Fraunces:
"Keep going."

Quote of the Day should be the visual hero.

## Quote hero

Use a large surface with:

- oversized quotation mark
- quote text
- author
- subtle category/industry label if data supports it
- save
- share

The quote typography should be large.

Do not cram multiple quotes above the fold.

Example structure:

QUOTE OF THE DAY

“Your quote text appears here.”

— Author

[ Save ] [ Share ]

Use a subtle editorial divider.

## Quote feed

Below:

MORE TO EXPLORE

Each quote card should vary slightly in composition while remaining within the component system.

Do not make all quote cards identical.

Use typographic hierarchy rather than imagery.

## Share card

The shareable quote image should be premium.

Include:

- warm background
- large quote
- author
- Entertainment Power Players branding
- subtle category motif
- no excessive decoration

The share card should look good when viewed independently on social media.

---

# 26. PROFILE — COMPLETE REDESIGN

Profile should feel calm and personal.

Header:

YOUR PROFILE

User identity:

Photo
Name
Email

Do not turn the profile into a dashboard.

Then grouped settings:

YOUR CAREER

Selected tracks

SUBSCRIPTION

Plan
Renewal date
Manage subscription

PREFERENCES

Notifications

ABOUT

Privacy policy
Terms
Support

ACCOUNT

Delete account

Use section labels in uppercase Inter small typography.

Use settings rows with:

icon
title
optional subtitle
chevron

Avoid excessive cards.

---

# 27. ONBOARDING REDESIGN

Onboarding is an opportunity to create the first "wow."

Do not make it three generic framework-style slides.

Use full-screen editorial compositions.

## Slide 1

Visual:
subtle connection network motif.

Headline:
"Your career is built through connections."

Supporting copy:
"Discover the people, actions and opportunities that move you forward."

## Slide 2

Visual:
category symbols arranged as an editorial composition.

Headline:
"Know your industry."

Supporting:
"Explore people across Fashion, Film/TV, Gaming, Music and Sports."

## Slide 3

Visual:
progress path / activity bars.

Headline:
"Make progress every week."

Supporting:
"Track your conversations, events and follow-ups."

## Track picker

Headline:
"Choose your path."

Supporting:
"Pick the areas you want to focus on. You can change them later."

Track options should be large, tactile selection surfaces.

Selected state:
accent border + subtle accent background + check.

Do not use a plain checkbox list.

---

# 28. AUTHENTICATION PAGES

Email/password, Apple, Google and forgot password should share the same design system.

Do not make authentication pages look like default Firebase pages.

Background:
warm paper.

Centered brand composition.

Logo.

Fraunces heading.

Form.

Primary CTA.

Provider buttons.

Divider.

Secondary navigation.

Example:

WELCOME BACK

"Keep building."

Email
Password

[ Continue ]

──────── or continue with ────────

[ Apple ]
[ Google ]

Forgot password?

The authentication screen should be clean but not empty.

Add a subtle editorial background motif behind the form.

---

# 29. PAYWALL DESIGN

Paywall is a major conversion screen.

It must feel premium, not aggressive.

Structure:

small label:
ENTERTAINMENT POWER PLAYERS

Fraunces:
"Build your industry network."

Supporting copy.

Then benefits:

✓ Full industry directory
✓ Save and organize contacts
✓ Career challenges
✓ Progress tracking

Pricing options:

Monthly
Annual

Clearly identify trial if configured.

Primary CTA:
[ Start membership ]

Restore purchases must remain accessible.

Subscription information and cancellation instructions must remain accessible from Profile.

Do not use fake urgency.

Do not use countdown timers.

Do not use red warning colors to pressure users.

---

# 30. ADMIN PANEL DESIGN PHILOSOPHY

The admin panel is NOT the mobile app scaled to desktop.

It is a professional content-management environment sharing the same brand identity.

The mobile product is:

EDITORIAL + EMOTIONAL

The admin is:

EDITORIAL + OPERATIONAL

Same:

- color system
- typography
- brand accent
- iconography
- spacing principles
- logo
- component language

Different:

- density
- navigation
- tables
- form layout
- information architecture

---

# 31. ADMIN NAVIGATION

Use a left sidebar on desktop.

Top:

logo
Entertainment Power Players

Navigation:

Contacts
Categories
Quotes
Tracks
Challenges

Do not add Analytics because the specification explicitly excludes reporting/analytics/subscriber numbers.

Sidebar active state:
subtle accent indicator.

Main content area:
warm neutral background.

---

# 32. ADMIN DASHBOARD / LANDING

Do not invent analytics.

If there is no dashboard requirement, do not create fake dashboard metrics.

Instead, after login, use a clean content-management landing page:

"Content management"

"Keep the experience current."

Then navigation cards:

Contacts
Categories
Quotes
Tracks
Challenges

These are functional shortcuts.

Do not show fake:
"1,284 users"
"98% engagement"
etc.

---

# 33. ADMIN CONTACTS

Contacts require:

- search
- create
- edit
- soft delete
- restore
- CSV import

Desktop layout:

Page title:
CONTACTS

"Manage the people in the industry directory."

Top action:
[ + Add contact ]

Secondary:
[ Import CSV ]

Search and filters.

Table.

Columns:

Name
Role
Company
Category
City
Status
Updated
Actions

Use a refined table.

Rows should not look like spreadsheet software.

Use 48–56px row heights.

Hover:
surfaceSubtle.

Actions:
three-dot menu.

---

# 34. ADMIN CONTACT FORM

Use a two-column desktop form where appropriate.

Primary fields:

Name
Role
Company
Email
Phone
Website
City
Category
Notes
Active

Do not put everything into one long narrow column if desktop width permits.

Use clear section grouping:

IDENTITY
CONTACT
CLASSIFICATION
NOTES
STATUS

Save action fixed or clearly visible.

Validation should be immediate but calm.

---

# 35. CSV IMPORT EXPERIENCE

This is an important workflow.

Design it as a stepper:

1. Upload
2. Map columns
3. Preview
4. Validate
5. Import
6. Results

Visual progress indicator at top.

Step 1:

Drag/drop upload area.

Step 2:

Source column → destination field mapping.

Step 3:

Preview first 10 rows.

Step 4:

Validation results.

Show:

VALID
1,985 rows

ISSUES
15 rows

Do not hide errors.

Step 5:

Import.

Step 6:

Success report.

Important:
valid rows can import even if others fail.

The UI must explain this clearly.

Error report should identify row numbers.

---

# 36. ADMIN CATEGORIES

Categories page should show five category entries.

Each:

icon
name
order
status
actions

Allow icon selection from bundled icon set.

The icon picker should show a visual grid.

Do not make the icon selection a raw text dropdown.

---

# 37. ADMIN QUOTES

Quotes page:

Page header:
INSPIRATION

"Manage the quotes shown to members."

List:

Quote
Author
Order
Status
Actions

Editing should use a large quote textarea with live preview.

This is an excellent place for a split layout:

LEFT:
form

RIGHT:
mobile-style quote preview

The preview uses the actual app design system.

This lets the admin understand what their content will look like.

---

# 38. ADMIN TRACKS AND CHALLENGES

Tracks page:

Track cards/list.

Track detail:

Track name
slug
order
active

Challenge list beneath.

Allow reorder.

Challenge form:

Title
Description
Type
Target when counter
Order
Active

For type selection:

SINGLE
COUNTER

When COUNTER is selected, reveal target field.

Do not show irrelevant fields when SINGLE is selected.

Use conditional form animation.

---

# 39. ADMIN CONTENT PREVIEW

Where useful, provide live previews.

Especially:

- quotes
- challenge cards
- category appearance

This creates confidence for the client/content team.

The preview should use the same shared design tokens as the mobile app where practical.

---

# 40. AUTH / NO-ACCESS ADMIN PAGE

Do not make it ugly.

Centered composition:

Logo

"Access restricted"

"This area is reserved for authorized administrators."

[ Sign out ]

Keep it minimal but branded.

---

# 41. RESPONSIVE ADMIN DESIGN

Desktop-first but responsive.

Breakpoints:

1440+
1200+
1024+
768+

At narrower widths:

sidebar collapses.

Tables should support horizontal scrolling or transform into responsive rows where necessary.

Do not let forms become unusably narrow.

---

# 42. ADMIN TABLE DETAILS

Table header:
Inter 12px semibold uppercase or title case.

Rows:
Inter 14px.

Primary text:
#221B14

Secondary:
#6F655B

Borders:
#EAE2D8

Hover:
#F5EFE6

Selected:
very subtle accent tint.

Pagination should be understated.

Do not use huge pagination controls.

---

# 43. ADMIN TOASTS

Success:
"Contact saved."

Error:
"Couldn't save contact. Try again."

Import:
"1,985 contacts imported. 15 rows need attention."

Toast should appear in lower/right desktop area.

Use semantic color subtly.

Do not create huge banners for every event.

---

# 44. RESPONSIVE MOBILE RULES

The mobile app is portrait-only.

Target:
iOS 15+
Android 8+

Do not design tablet layouts unless already supported.

Respect:

- safe area
- dynamic text sizing
- keyboard
- accessibility
- system navigation

Interactive target:
minimum approximately 44x44 points.

Avoid controls placed too close to screen edges.

Bottom sheets must respect safe areas.

---

# 45. DATA-DRIVEN DESIGN RULES

All content is runtime editable.

Therefore:

Never assume:

- category count
- number of contacts
- quote length
- challenge title length
- track name length
- author length
- company name length

Design for:

- short names
- extremely long names
- long quote text
- zero contacts
- one contact
- hundreds/thousands of contacts
- missing fields
- long descriptions

Text must wrap gracefully.

Do not clip content.

Do not use fixed heights where content can vary significantly.

---

# 46. REAL-TIME CONTENT CHANGES

The challenge list is read live.

If a challenge is edited while the user is on screen:

- wording updates gracefully
- do not reset scroll unnecessarily
- do not destroy local interaction state
- progress remains attached by challenge ID

The visual update should use a subtle crossfade if needed.

Do not flash the entire screen.

---

# 47. OFFLINE EXPERIENCE

Firestore offline persistence exists.

Offline UI should feel intentional.

Do not make the app look broken.

If cached content is available:
render it.

If the user performs an action offline:
show an appropriate pending state if supported.

Use a subtle offline indicator when necessary.

Do not display giant red "OFFLINE" banners.

---

# 48. ACCESSIBILITY

Do not sacrifice accessibility for aesthetics.

Ensure:

- sufficient text contrast
- large tap targets
- VoiceOver labels
- TalkBack labels
- semantic buttons
- dynamic type compatibility
- reduced motion support
- no information communicated solely through color
- clear focus states

Animations must respect reduced-motion settings.

---

# 49. PERFORMANCE

Premium does not mean heavy.

Avoid:

- huge background images
- expensive continuous animations
- unnecessary blur
- unnecessary re-renders
- massive SVGs
- complex animated canvases

Use native/platform-friendly animations where possible.

Use performant list rendering.

Directory uses FlashList/SectionList as specified.

Charts should remain smooth on lower-end supported devices.

---

# 50. ANIMATION TOKEN SYSTEM

Define:

motionFast = 120ms
motionStandard = 220ms
motionEmphasis = 320ms
motionSlow = 500–700ms

Easing:

fast:
ease-out

standard:
cubic-bezier / platform equivalent ease-out

emphasis:
spring

Avoid linear animation except progress-like continuous movement.

---

# 51. REUSABLE MOTION PATTERNS

Screen entrance:
opacity 0 → 1
translateY 8 → 0

Card press:
scale 1 → 0.98 → 1

Favorite:
scale 1 → 1.15 → 1

Progress:
value old → value new

Modal:
translateY 100% → 0

Toast:
opacity + translateY

List insertion:
fade + 6px rise

Deletion:
fade + height collapse

Do not animate every row independently on every scroll.

---

# 52. VISUAL HIERARCHY

Every screen must have:

1. Primary focal point
2. Secondary information
3. Supporting controls
4. Navigation

Before implementing a screen, explicitly identify:

"What should the user's eye see first?"

"What should they do next?"

"What information is secondary?"

If the answer is unclear, redesign the layout.

---

# 53. FUNCTIONAL VISUAL ELEMENTS

The user specifically wants the UI to feel like it contains meaningful visual content.

Therefore use:

- progress rings
- progress bars
- activity timelines
- category symbols
- weekly charts
- challenge progression
- editorial quote layouts
- contextual icons
- dynamic counts
- subtle connection motifs
- selected-state indicators
- live previews in admin

Do NOT fill space with meaningless decoration.

---

# 54. BRAND MOTIF — CONNECTIONS

Develop a subtle recurring motif around connections.

Potential visual:

small nodes connected by thin lines.

Use this in:

- onboarding
- tracker timeline
- empty states
- subtle background decoration
- challenge progression
- share cards

The motif should be thin and low contrast.

It must never look like a developer architecture diagram.

---

# 55. BRAND MOTIF — PROGRESSION

Use progress visually wherever real progress exists.

Examples:

Tracker:
weekly completion

Challenges:
track completion

Counter:
2 of 5

Subscription:
membership state

Do not invent progress where none exists.

---

# 56. BRAND MOTIF — EDITORIAL RULES

Use thin horizontal rules to divide major editorial sections.

Use small uppercase labels:

YOUR INDUSTRY
THIS WEEK
YOUR PATH
INSPIRATION
ACCOUNT

Typography:

Inter
11–12px
semibold
slight letter spacing

This gives the interface a publication-like hierarchy.

---

# 57. CARD PHILOSOPHY

Cards should represent meaningful groups.

Good:

Weekly momentum card
Quote hero
Category explorer
Track progression

Bad:

Card containing one button
Card containing one text label
Card around every list row

Use surfaces selectively.

List rows can use spacing and dividers instead of cards.

---

# 58. CONTENT DENSITY

Directory:
medium/high density

Tracker:
medium

Challenges:
medium

Inspiration:
low/medium, editorial

Profile:
medium

Admin:
high

Do not use the same spacing density everywhere.

---

# 59. SCREEN-BY-SCREEN QUALITY CHECK

For EVERY screen, verify:

- Is the hierarchy immediately obvious?
- Is there a visual focal point?
- Is there meaningful content?
- Does it communicate the product's purpose?
- Is the primary action obvious?
- Are secondary actions visually subordinate?
- Are empty states designed?
- Are loading states designed?
- Are errors designed?
- Are long text values supported?
- Is the screen visually related to the rest of the product?
- Does it feel premium?
- Is there any unnecessary decoration?
- Is any area empty without purpose?
- Is the accent being overused?
- Does motion improve comprehension?

---

# 60. COMPONENT STATES

Every component must have:

Default
Pressed
Focused
Disabled
Loading
Error where applicable
Selected where applicable
Completed where applicable

Do not implement only the happy state.

---

# 61. DIRECTORY CONTACT STATES

Contact row:

default
pressed
favorite
not favorite

Contact detail:

normal
favorite
contacted
missing optional fields

Subscription:

locked
unlocked

---

# 62. CHALLENGE STATES

Single:

incomplete
completed
loading
error

Counter:

0/target
partial
complete
decremented
loading
error

Track:

not started
in progress
complete

---

# 63. TRACKER STATES

Goal:

0
partial
complete
over goal

Activity:

new
saved
pending
deleted

Chart:

no data
partial data
full 8 weeks

---

# 64. INSPIRATION STATES

Quote:

available
saved
unsaved
sharing

Feed:

loading
empty
error

---

# 65. PROFILE STATES

Subscription:

free
active monthly
active annual
trial if configured
expired

Settings:

default
selected
loading
error

---

# 66. PAYWALL STATES

Monthly selected
Annual selected
Trial if configured
Purchase loading
Purchase success
Purchase error
Restore loading
Restore success
Restore failure

Do not let these states feel like default system dialogs.

---

# 67. ADMIN STATE DESIGN

Every CRUD interface must handle:

loading
empty
success
error
validation
unsaved changes
delete confirmation
restore
inactive status

Use confirmations only for destructive operations.

Soft delete should be clearly explained.

---

# 68. DELETE CONFIRMATION

For contact/admin destructive actions:

Title:
"Deactivate this contact?"

Supporting:
"The contact will disappear from the app but can be restored later."

Actions:

Cancel
Deactivate

Do not say "Delete permanently" because the specified operation is soft delete.

For user account deletion, use stronger confirmation because that is permanent.

---

# 69. USER ACCOUNT DELETION

The mobile account deletion screen must be clear and serious.

Explain:

- account deletion
- associated data removal
- sign-out behavior

Use danger styling only here.

No emotional manipulation.

---

# 70. SUBSCRIPTION STATUS

Profile subscription area should show:

Plan
Status
Renewal date if available
Manage subscription

Do not show meaningless metrics.

---

# 71. IMAGE USAGE

The application is not image-driven.

Do not introduce stock photos simply to make screens look full.

Use:

- typography
- icons
- shapes
- charts
- data
- whitespace
- subtle motifs

This is more aligned with the product's actual content.

Directory contacts specifically do not have photos.

---

# 72. LOGO AND BRANDING

The logo should have breathing room.

Do not put it inside an oversized decorative container.

Use it in:

- splash
- onboarding
- authentication
- paywall
- admin sidebar
- share cards

Logo placement should remain consistent.

---

# 73. SPLASH SCREEN

Keep it simple but premium.

Warm paper background.

Logo centered.

Subtle connection/progression motif.

Very short fade.

Do not use a long animated splash.

---

# 74. DESIGN TOKENS IMPLEMENTATION

Create centralized theme tokens.

Example conceptual structure:

theme.colors.background
theme.colors.surface
theme.colors.surfaceSubtle
theme.colors.ink
theme.colors.inkSecondary
theme.colors.accent
theme.colors.border

theme.typography.display
theme.typography.h1
theme.typography.h2
theme.typography.body
theme.typography.caption

theme.spacing.xs
theme.spacing.sm
theme.spacing.md
theme.spacing.lg
theme.spacing.xl

theme.radius.sm
theme.radius.md
theme.radius.lg

theme.shadow.sm
theme.shadow.md

theme.motion.fast
theme.motion.standard
theme.motion.emphasis

Do not scatter raw hex values throughout components.

---

# 75. IMPLEMENTATION ARCHITECTURE

Do not create a monolithic UI file.

Respect feature-based organization.

Mobile:

src/
  components/
  features/
    directory/
    tracker/
    challenges/
    inspiration/
    profile/
    auth/
    onboarding/
    subscription/
  services/
  theme/
  navigation/

Shared UI belongs in components.

Firebase access remains behind services.

State remains feature-oriented.

Do not mix Firebase calls directly into presentational components.

---

# 76. UI/STATE SEPARATION

Presentational components should not contain unnecessary business logic.

Example:

ProgressRing receives:
progress
size
label

It should not query Firestore.

DirectoryContactRow receives contact data and callbacks.

TrackerChart receives real activity values.

This makes the design system reusable.

---

# 77. CLOUD/BACKEND ARCHITECTURE — DO NOT BREAK IT

The UI revamp does not require replacing the backend architecture.

Existing architecture:

React Native mobile app
Firebase
Firestore
Firebase Auth
Cloud Functions
RevenueCat
React + Vite admin panel
Firebase Hosting

Maintain this architecture unless a concrete implementation problem requires change.

RevenueCat entitlement behavior remains server-authoritative.

Do not move entitlement decisions into the UI.

UI only renders the state provided by the application architecture.

---

# 78. DATA FLOW PRINCIPLE

Conceptually:

Firestore / Firebase
        ↓
services
        ↓
TanStack Query / feature state
        ↓
screen containers
        ↓
presentational components
        ↓
theme tokens + motion
        ↓
native UI

Do not:

screen
  ↓
direct Firebase query
  ↓
random local state
  ↓
hardcoded styling

---

# 79. RENDERING PRINCIPLE

When data changes:

Update only the affected UI region where practical.

Do not unnecessarily remount the entire screen.

For example:

Completing one challenge should update:

- challenge state
- track progress
- relevant tracker activity

without flashing/rebuilding the entire application.

Use stable keys.

Preserve scroll position when appropriate.

---

# 80. QUERY/STATE BEHAVIOR

Use existing TanStack Query architecture.

UI should correctly represent:

- loading
- stale data
- refetching
- errors
- offline cached data

Do not block the entire UI when a small component is refetching.

Prefer localized loading indicators.

---

# 81. OPTIMISTIC UI

Where safe and consistent with existing backend behavior, use optimistic UI for:

- favorite
- challenge tick
- counter increment/decrement
- simple preference toggles

If mutation fails:

rollback and show a concise error.

Do not fake successful subscription state.

Subscription changes remain authoritative.

---

# 82. FIREBASE SECURITY AND UI

Do not expose locked data to free users merely because the UI hides it.

The backend security rules remain authoritative.

The UI should show a polished lock/paywall state without attempting to fetch protected contact/challenge content.

---

# 83. ADMIN REAL-TIME CONTENT

When admin changes content:

the mobile app should update according to existing Firestore behavior.

Do not require app release.

The UI should handle content updates gracefully.

---

# 84. DESIGNING FOR LONG CONTENT

Long quote:

Use wrapping.

Long contact name:
wrap to two lines if necessary.

Long company:
wrap.

Long challenge description:
expand/collapse if necessary.

Never truncate important content without a way to see it.

---

# 85. DESIGNING FOR SMALL DATASETS

If only one category exists:

do not leave giant empty space.

If zero contacts:
show designed empty state.

If no tracker activity:
show motivational empty state.

If no saved quotes:
show designed empty state.

If no selected tracks:
guide user to select tracks.

---

# 86. DESIGNING FOR LARGE DATASETS

Directory should remain performant.

Use appropriate list virtualization.

A–Z jump bar must remain usable.

Search must remain visually responsive.

Do not render thousands of cards simultaneously.

---

# 87. SEARCH UX

Search behavior:

When inactive:
compact search bar.

When focused:
expand slightly if space allows.

Search results should clearly communicate:

people
company
role

No-result state:

"No people found."

"Try a different name, company, or role."

Do not display a blank screen.

---

# 88. FILTER SHEET

Filter sheet should include:

Role
City

Only values actually present in data.

Use selection controls.

Top:

FILTERS

[ Clear all ]

Bottom:

[ Apply filters ]

Do not make the filter sheet unnecessarily complicated.

---

# 89. SORTING

Directory remains alphabetical according to specified sortKey.

Do not introduce arbitrary sorting options unless required.

A–Z rail should reflect available letters.

---

# 90. CONTACT ACTIONS

Call
Email
Website

Use native behavior.

If field unavailable:
do not show the action.

Do not show disabled buttons for nonexistent data.

---

# 91. TRACKER LOG SHEETS

When logging contact:

Option to connect to directory contact.

Or manually type contact.

When logging event:

Name
Date
Notes

Follow-up:
appropriate existing data model.

Use bottom sheets rather than pushing through unnecessary screens.

---

# 92. GOAL EDITOR

Goal editor:

Contacts
Events
Follow-ups

Each gets one goal number per week.

Use numeric controls that are easy to manipulate.

Explain carry-forward behavior clearly.

Do not overload the screen.

---

# 93. WEEK NAVIGATION

Current week should be prominent.

If historical weeks are navigable, use compact date/week controls.

Do not create a complex calendar unless required.

Week identity should remain tied to ISO week behavior.

---

# 94. CHALLENGE TRACK PICKER

Track picker should be one of the most visually polished selection screens.

Use six track surfaces.

Selected:

accent border
subtle accent background
check icon

Unselected:

surface
border

On selection:
small scale + check animation.

---

# 95. CHALLENGE COMPLETION FEEDBACK

When completing a challenge:

1. Checkmark appears.
2. Progress bar/ring updates.
3. If track completion threshold changes, update it smoothly.
4. If a major track is completed, show a subtle celebration state.

Avoid confetti.

Possible completion message:

"Momentum made."

or

"Another move forward."

Use editorial language sparingly.

---

# 96. TRACK COMPLETION

When all challenges are completed:

show a premium completion state.

Large progress ring at 100%.

Headline:
"Track complete."

Supporting:
"You've finished this path. Keep building."

Do not invent rewards unless the product has them.

---

# 97. QUOTE OF THE DAY

Quote selection is deterministic.

Do not imply personalization if it is not personalized.

UI can say:

QUOTE OF THE DAY

not:

"Chosen especially for you"

unless actual personalization exists.

---

# 98. SHARE EXPERIENCE

Native share sheet should open.

Before share, render branded card.

Allow user to preview.

The card should use the same visual system.

---

# 99. PROFILE PHOTO

User photo may exist.

Use circular image.

If unavailable:
use initials with warm surface and ink.

Do not generate fake avatars.

---

# 100. ADMIN LIVE PREVIEW

For quotes especially:

Admin types quote
        ↓
Live preview updates
        ↓
Preview matches mobile QuoteCard

This should create a strong client-facing impression.

---

# 101. ADMIN FORM UX

Do not make forms feel like database editors.

Use:

section headers
descriptive helper text
clear grouping
smart conditional fields
inline validation
save feedback

Avoid excessive labels if context is obvious.

---

# 102. ADMIN CSV VALIDATION UI

Validation statuses:

Valid
Warning
Error

Warnings should not block valid import if business rules permit.

Errors should clearly identify:

row
field
problem

Example:

Row 142
Email
"Invalid email format"

Do not display raw exception traces.

---

# 103. ADMIN SOFT DELETE

Inactive content should be visually distinct but not visually dominant.

Status:
Active
Inactive

Use muted status badges.

Provide restore action.

---

# 104. ADMIN ORDERING

For reorderable content:

Use drag handles.

Show clear drag affordance.

During drag:
elevated surface
subtle shadow
slight scale

After drop:
smooth placement.

Do not require users to type order numbers for ordinary reordering.

---

# 105. ADMIN ICON PICKER

Icon picker:

grid
search if icon set becomes large
selected state

Preview selected icon next to category name.

---

# 106. ADMIN DESKTOP TYPOGRAPHY

Admin:

Fraunces:
page titles / major empty states

Inter:
everything operational.

Do not overuse editorial typography in dense tables.

---

# 107. ADMIN RESPONSIVE

At mobile widths, admin is still usable but not necessarily identical to mobile app.

Convert tables into stacked data rows where appropriate.

Keep action menus accessible.

---

# 108. AUTH WEB PAGES

Email confirmation/password reset pages should share:

background
logo
typography
button
input
message styling

Do not use generic Firebase branding.

Example:

EMAIL CONFIRMED

"You're ready to keep building."

[ Continue ]

Password reset:

RESET PASSWORD

"Choose a new password to get back into your account."

---

# 109. GLOBAL BRAND CONSISTENCY

Across:

Mobile
Admin
Auth
Share cards

must use:

same primary background family
same ink
same terracotta
same typography
same icon family
same radius philosophy
same tone of voice
same logo treatment

But adapt density to platform.

---

# 110. COPY STYLE

Tone:

confident
concise
aspirational
human
professional

Avoid:

"Unlock the power of AI"
"Revolutionize your workflow"
"Next-generation platform"

This is not an AI product.

Use language related to:

career
industry
connections
momentum
progress
opportunity
relationships
action

---

# 111. BUTTON COPY

Prefer:

Explore directory
View contacts
Mark as contacted
Log activity
Continue challenge
Choose tracks
Save quote
Share quote
Manage subscription
Start membership
Try again

Avoid:

Click here
Submit
Proceed
Execute
Confirm

when a more meaningful action label exists.

---

# 112. ICON + TEXT

Where an icon is used with text, maintain consistent alignment.

Do not randomly mix:

icon-left
icon-right
icon-above

Use the pattern appropriate to context.

---

# 113. VISUAL DEPTH

Use three depth levels:

Level 0:
background

Level 1:
surface / subtle cards

Level 2:
floating sheets / modals / important hero cards

Do not create 7 levels of shadows.

---

# 114. BORDER SYSTEM

Default border:
1px #DED4C8

Subtle:
1px #EAE2D8

Active:
1.5–2px accent where necessary

Avoid heavy black borders.

---

# 115. DECORATIVE LINE SYSTEM

Use thin rules:

1px

Opacity low.

Potential uses:

section separators
editorial labels
quote decoration
timeline connectors

Never create decorative borders around everything.

---

# 116. NUMERICAL TYPOGRAPHY

Important metrics can use slightly larger Inter or Fraunces.

Example:

07
Connections

The number should be visually dominant.

Use tabular/consistent numeral styling in charts if supported.

---

# 117. CHART DESIGN

Victory Native remains the chart technology.

Do not replace architecture unnecessarily.

Chart:

warm background
subtle grid
rounded bars
accent for relevant/current emphasis
muted historical bars

Labels must be readable.

No 3D charts.

No gradients.

No fake animations.

---

# 118. PROGRESS RING DESIGN

Progress ring:

track:
#E6DDD2

progress:
#B0501C

stroke:
approximately 8–10px depending on size

Rounded cap.

Center:

68%
COMPLETE

Animate from previous value.

For 0%:
show track.

For 100%:
subtle completion emphasis.

---

# 119. PROGRESS BAR DESIGN

Height:
6–8px

Radius:
full

Track:
#E8DED2

Fill:
#B0501C

For small metrics, use 6px.

Do not make every progress bar 16px tall.

---

# 120. CATEGORY VISUALS

Category cards should have large abstract iconography.

Possible visual arrangement:

        ◌
FASHION
128 contacts

or:

        ┌───────────
        │       ◌
        │ FASHION
        │ 128
        └───────────

The icon can be oversized at low opacity behind the content.

This makes category cards feel designed without requiring photographs.

---

# 121. PREMIUM FEEL CHECKLIST

Before declaring a screen complete, inspect:

Typography
Spacing
Alignment
Icon optical weight
Border consistency
Shadow consistency
Corner radius
Button hierarchy
Data hierarchy
Motion
Empty state
Loading state
Error state
Accessibility
Long content
Small content
Dark system? no — maintain warm light design
Brand consistency

---

# 122. NO DARK MODE FOR NOW UNLESS ALREADY REQUIRED

Do not introduce dark mode just because it is fashionable.

The product identity is warm, bright, editorial.

If dark mode already exists, adapt the same system rather than inventing a separate identity.

Otherwise keep the scope focused.

---

# 123. CLIENT-DEMO QUALITY

The following screens must be polished enough to serve as showcase screens:

1. Directory landing
2. Contact detail
3. Tracker
4. Challenge track
5. Inspiration quote
6. Onboarding
7. Paywall
8. Admin Contacts
9. Admin Quote live preview

Do not spend all visual effort on minor settings screens.

---

# 124. FIRST-IMPRESSION PRIORITY

The first 30 seconds should communicate:

"This is a professional entertainment career product."

User should understand:

- what the app does
- where to explore people
- how to track progress
- how challenges work
- why inspiration exists

without reading a manual.

---

# 125. IMPLEMENTATION PHASES

Implement in this order:

PHASE 1
Theme foundation
Typography
Colors
Spacing
Radii
Shadows
Motion
Icons
Base components

PHASE 2
Navigation
Onboarding
Auth
Directory

PHASE 3
Contact detail
Paywall
Subscription UI

PHASE 4
Tracker
Charts
Activity sheets

PHASE 5
Challenges
Progress rings
Completion interactions

PHASE 6
Inspiration
Quote cards
Share card

PHASE 7
Profile
Settings
Subscription details

PHASE 8
Admin shell
Contacts
CSV

PHASE 9
Categories
Quotes
Tracks
Challenges
Previews

PHASE 10
Auth web pages
Email confirmation
Password reset

PHASE 11
Global polish
Animations
Loading
Empty
Error
Offline
Accessibility
Performance

---

# 126. DO NOT REWRITE BUSINESS LOGIC UNNECESSARILY

This is primarily a UI/UX revamp.

Do not rewrite working backend logic merely to satisfy aesthetic preferences.

Do not alter:

- Firestore schema
- entitlement architecture
- security rules
- data IDs
- weekKey behavior
- soft-delete semantics
- challenge types
- admin permissions

unless required for a genuine bug.

---

# 127. DO NOT CREATE FAKE FUNCTIONALITY

Do not add:

- analytics
- social feed
- messaging
- AI assistant
- recommendations
- profile photos for contacts
- subscriber dashboard
- gamified points
- badges
- follower counts
- likes
- comments

unless they already exist in the actual requirements.

The product must become visually richer, not functionally fictional.

---

# 128. CODE QUALITY REQUIREMENTS

TypeScript strict.

No any.

No giant component files.

No duplicated styles.

No inline random hex colors.

No arbitrary magic numbers where tokens should exist.

No animation logic duplicated everywhere.

No direct Firebase access from leaf presentation components.

Keep feature boundaries intact.

---

# 129. DESIGN DOCUMENTATION

Create/update:

theme tokens
component documentation
motion rules
screen-level implementation notes

For each major screen, document:

Purpose
Hierarchy
Components
Data
States
Interactions
Animation
Responsive behavior

---

# 130. VISUAL QA

After implementing each screen:

Compare it against the design intent.

Check:

- 390x844 style mobile viewport
- smaller Android dimensions
- long text
- empty content
- large content
- keyboard open
- bottom sheet
- accessibility text scaling
- reduced motion

Admin:

1280px
1440px
1920px
1024px

---

# 131. FINAL POLISH PASS

After all functionality works, perform a dedicated visual polish pass.

Inspect:

- 1px misalignments
- inconsistent padding
- inconsistent radius
- wrong font weights
- icon size mismatches
- awkward line breaks
- excessive shadows
- excessive accent
- empty spaces
- unnecessary cards
- abrupt transitions
- loading flicker
- inconsistent terminology

Do not consider the job complete simply because every screen technically exists.

---

# 132. DEFINITION OF "DONE"

The redesign is complete only when:

1. Every mobile screen follows the design system.
2. Every admin screen follows the design system.
3. Auth pages follow the same identity.
4. All primary screens feel visually rich and purposeful.
5. No screen looks like a generic template.
6. No screen relies on decoration without meaning.
7. Motion is consistent.
8. Charts and progress visuals use real data.
9. Empty/loading/error states are designed.
10. Long runtime content is handled correctly.
11. Free/pro states are visually polished.
12. Admin CRUD remains efficient.
13. Accessibility remains intact.
14. Performance remains good.
15. Existing business logic remains intact.
16. The product feels unmistakably like one brand.

---

# 133. MOST IMPORTANT DESIGN PRINCIPLE

Do not interpret "premium" as:

more gradients
more shadows
more animations
more colors
more cards
more decoration

Interpret premium as:

better hierarchy
better spacing
better typography
better information architecture
better interaction feedback
better transitions
better component consistency
better use of data
better visual storytelling
better empty states
better details
better restraint

---

# 134. FINAL CREATIVE DIRECTION

The final visual personality should be:

WARM
+
EDITORIAL
+
ENTERTAINMENT INDUSTRY
+
CAREER FOCUSED
+
PROFESSIONAL
+
ASPIRATIONAL
+
DATA-AWARE
+
MOTION-AWARE
+
PREMIUM

The product should feel like:

"Someone took a serious career tool and gave it the visual quality of a premium entertainment brand."

It should NOT feel like:

"Someone took a generic SaaS dashboard and changed the colors."

---

# 135. FINAL INSTRUCTION TO THE CODING AGENT

Do not blindly implement this prompt as a checklist.

First inspect the existing codebase and understand:

- current navigation
- current screens
- current components
- current theme
- existing animations
- existing data flow
- current responsive behavior
- current Firebase integration
- current admin structure

Then map existing components to the new design system.

Reuse functional components where appropriate.

Replace weak visual components rather than duplicating them.

When a screen currently contains a plain component, ask:

"What is the most meaningful visual representation of this information?"

When you see a large empty area, ask:

"Should this become a meaningful data visualization, editorial composition, progress element, contextual iconography, or simply remain whitespace?"

Do not automatically fill space.

When adding visual richness, it must relate to the product.

When adding animation, it must communicate interaction or state.

When adding decoration, it must reinforce the entertainment/career/connection identity.

The final experience should feel intentionally art-directed.

The goal is not to make every screen spectacular independently.

The goal is to make the entire application feel like it belongs to one exceptionally well-designed premium product.

Build something the client can open for the first time and immediately understand:

"This is not a template."

"This is a real product."

"This feels premium."

"This feels like entertainment."

"This feels like career progression."

"This feels finished."

