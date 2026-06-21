# UptoSkills-Inspired LMS Design System

The implementation lives in `course-compass-main/src/styles/index.css` and `admin/src/index.css`. Components consume semantic tokens instead of assuming a theme-specific color.

## Typography

- Display and page/section titles: Poppins, 600–800.
- UI, body, labels, and metadata: Inter, 400–700.
- Code and identifiers: JetBrains Mono in the learner app.
- Page title: responsive 30–48px; section title: 24–30px; card title: 16–20px; body: 14–16px; metadata: 11–13px.

## Semantic color roles

- Background: `--app-bg`, `--admin-shell-bg`, `--background`.
- Surface: `--surface`, `--surface-raised`, `--card`.
- Text: `--text-primary`, `--text-secondary`, `--muted-foreground`, `--text-inverted`.
- Actions: `--action-primary`, `--action-primary-hover`, `--action-secondary`.
- Status: `--status-success`, `--status-warning`, `--status-error`, `--status-info`.
- Focus: `--ring` / `--action-primary` at a visible 3px outline.

All roles provide light and dark values. Theme is applied before React mounts to avoid a flash and persists as light, dark, or system.

## Spacing

`--space-1/2/3/4/6/8/12/16` map to 4, 8, 12, 16, 24, 32, 48, and 64px.

## Shape and elevation

- Radius: 8, 12, 16, and 24px through `--radius-sm/md/lg/xl`.
- Card: `--shadow-card`.
- Elevated: `--shadow-elevated`.
- Overlay: `--shadow-overlay`.

## Reusable patterns

- `page-shell`, `page-eyebrow`, `page-title`, `page-description`.
- `section-heading`, `section-copy`.
- `surface-card`, `glass-card`, `course-card`.
- `btn-primary`, `btn-outline-teal`.
- `skeleton-block` and route-level loading compositions.
- Admin equivalents: `PageShell`, `StatWidget`, `StatGrid`, `FilterBar`, `EnterpriseTable`, `LoadingState`, and `EmptyState`.

## Accessibility contract

- Body and muted text use AA-oriented theme values.
- Every interactive control has a visible focus indicator.
- Icon-only controls require an accessible label.
- Search suggestions use combobox/listbox semantics and keyboard navigation.
- Motion respects the persisted reduced-motion preference where the page exposes it, and system reduced motion remains available to CSS/user agents.
