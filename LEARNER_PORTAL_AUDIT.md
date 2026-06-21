# Learner Portal Production UI Audit

Audit date: 2026-06-21  
Scope: `course-compass-main` learner-facing routes and shared UI. This document was written before implementation changes.

## Executive findings

- The shared Tailwind `container` is capped at 1400px and used almost everywhere. At large widths this makes the application feel like a centered half-width site instead of a full learner workspace.
- The catalogue compounds that cap with a permanently reserved 280px filter column. The course player compounds it with a fixed 350px curriculum rail. Both need fluid `minmax(0, 1fr)` content and responsive rails.
- Several pages use intentionally readable text measures (`max-w-2xl`, `max-w-4xl`). Those should remain on prose, but must not constrain the page shell or card grids.
- The catalogue has no explicit request error state. Learning paths and certificates log failures and then show an empty state, which misrepresents a service failure as no data.
- Learning-path cards link to `/paths/:slug`, while the registered route is `/learning-paths/:id`.
- Wishlist/bookmark persistence exists on course detail, but there is no route where learners can review saved courses.
- Assessments and assignments are combined into the course-work center and use real API data. Preserve this contract; improve its responsive hierarchy and state clarity rather than splitting the backend workflow.
- Theme persistence and pre-paint theme application already exist. Preserve both. The semantic palette needs clearer heading/side-heading/action/status roles and reduced-motion support.
- Mobile navigation is functional, but lacks an explicit expanded state and the catalogue filter interaction expands inline rather than opening as a dismissible mobile panel.
- A number of source strings contain mojibake (`â€¦`, `Â·`, `â€¢`), reducing production polish and assistive-technology output quality.

## Route and page audit

| Surface | Route | Current assessment | Required action |
|---|---|---|---|
| Home | `/` | Strong marketing hierarchy; shared width constraint applies | Preserve content; adopt fluid shell/tokens |
| Dashboard | `/dashboard` | Good real-data hierarchy and honest metrics | Make shell fluid; improve mobile metric/card sizing and retry semantics |
| Catalogue | `/courses` | Feature-rich search/filter/sort; desktop rail compresses results; missing fetch error | Restructure to fluid content + responsive filter panel; add error/retry |
| Course detail | `/courses/:id` | Substantial production flow, enrollment and wishlist actions present | Preserve contracts; verify fluid two-column behavior and modal semantics |
| Course player | `/learn/:id` | Complete lesson/progress workflow; fixed rail and modal semantics need work | Use fluid grid, responsive curriculum drawer/rail, accessible dialog behavior |
| Learning paths | `/learning-paths` | Useful roadmap cards; wrong detail link; empty copy is creator-facing | Fix route; add error/retry and learner-focused empty state |
| Path detail | `/learning-paths/:id` | Strong roadmap storytelling; page unnecessarily capped at 5xl | Fluid shell with readable inner prose |
| Assessments/assignments | `/courses/:courseId/work` | Real persisted submissions and feedback | Improve full-width grid, loading/error/empty states, labels and status styling |
| Certificates | `/certificates`, `/certificate/:courseId`, `/verify/:verificationId` | Real certificate data and verification routes | Add request error/retry; retain bounded printable certificate canvas |
| Notifications | `/notifications` | Real data, loading and empty state; max-width unnecessarily limits center | Use fluid shell while keeping notification text readable |
| Wishlist/favourites | course-detail action only | Persistence exists, discoverability and collection page missing | Add protected `/wishlist` page backed by bookmarks API |
| Profile | `/profile` | Real profile/avatar API and forms | Fluid shell, form state/accessibility verification |
| Settings | `/settings` | Broad production-ready preferences and real theme controls | Preserve; make shell fluid; apply new semantic tokens |
| Support | `/support` | FAQ and authenticated ticket flow are functional | Preserve; improve form validation/error announcement and fluid shell |
| Community/live/AI tutor/practice | protected feature routes | Real API-backed feature pages; dense one-file composition | Apply shared shell/states; preserve contracts |
| Authentication | login/register/reset routes | Strong forms and route return behavior | Preserve readable form widths; fix text encoding and focus consistency |
| Not found | `*` | Present | Keep navigation recovery clear |

## Interaction and accessibility audit

- Search has combobox roles and keyboard suggestion navigation. Keep it and add a visible label for non-placeholder identification.
- Filter inputs are native and keyboard operable, but their visual controls should expose focus within the label.
- Icon-only navigation actions have labels; the mobile menu button should expose `aria-expanded` and `aria-controls`.
- Custom overlays in course detail/player need `role="dialog"`, `aria-modal`, labelled headings, Escape dismissal, and controlled page scrolling.
- Loading indicators need consistent `role="status"`/screen-reader text. Error messages need `role="alert"` and retry actions.
- Small status text and accent-on-tinted-background combinations need semantic light/dark values with AA contrast.
- Motion-heavy hover/entrance effects need a `prefers-reduced-motion` override and should follow the saved reduced-motion preference.
- Tables/long toolbars must scroll internally at small widths instead of creating page-level horizontal overflow.

## Production comparison principles

The restructuring follows established patterns visible across large learning products: a persistent but non-dominant global navigation; prominent “continue learning”; searchable catalogues with filters that do not steal mobile space; course detail pages with a stable primary action; players that prioritize content while keeping curriculum reachable; and explicit empty, loading, and failure feedback. UptoSkills is used as the colour-identity reference (orange, teal, deep navy), not as a layout clone.

Direct web comparison was attempted during the audit, but the browsing service returned HTTP 403. No claim in this audit depends on scraped competitor content.

## Implementation priorities

1. Replace capped page containers with a full-width `.app-container` shell and bounded text utilities.
2. Add semantic heading, side-heading, action, status, surface, and focus tokens for both themes.
3. Repair catalogue/player/path responsive constraints and the incorrect path link.
4. Add the missing wishlist collection route using the existing bookmark contract.
5. Add honest fetch failure states, accessible mobile/dialog behavior, reduced motion, and encoding cleanup.
6. Verify at 320, 375, 768, 1024, 1280, and 1440+ widths; then run lint, TypeScript, and production build.
