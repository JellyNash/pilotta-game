# Responsive Design Cheatsheet - MANDATORY FOR ALL STYLING

**⚠️ CRITICAL: This cheatsheet MUST be followed for ALL styling and responsive work in this project. No exceptions.**

## Core Principles

| #  | Area | Guideline | Code / Tip |
|----|------|-----------|------------|
| **1** | **Design tokens** | Keep every size, space, color, break-point, z-index in one `tokens.css` (or JSON). Import the same constants in TS/JS. | `--space-m: clamp(0.75rem, 1.25vw, 1.25rem);` |
| **2** | **Cascade layers** | Load global resets first, tokens next, utilities after, components last. Use `@layer` to avoid specificity fights. | `@layer reset, tokens, utils, comps;` |
| **3** | **Fluid sizing** | Use `clamp(min, fluid, max)` for text, gaps, cards. Min/max in `rem`, fluid part in `vw`. | `font-size: clamp(1rem, 2.5vw, 1.8rem);` |
| **4** | **Container queries** | Style by parent width, not viewport. Mark parent: `container-type: inline-size;` then query it. | `@container (min-width: 28rem) { .card-grid { grid-template-columns: repeat(3,1fr); } }` |
| **5** | **Viewport units** | Replace `vh` with `dvh` / `svh` for full-height sections. Keep a fallback line above for old browsers. | `.hero { height: 100vh; height: 100dvh; }` |
| **6** | **Grid-first layout** | Use CSS Grid for page areas, `subgrid` for nested tracks, and flex only for small axis alignment. | `.page { display: grid; grid-template: "nav" auto "main" 1fr / 1fr; }` |
| **7** | **Anchor positioning** | For tool-tips, pickers, popovers: tie them to a reference with `anchor-name` + `position-anchor` rules—no JS needed. | `.popover { anchor-name: --btn; } .menu { position-anchor: --btn; top: anchor(bottom); }` |
| **8** | **Aspect ratio** | Always set `aspect-ratio` so media boxes scale without padding hacks. | `.thumb { aspect-ratio: 16/9; }` |
| **9** | **Responsive images** | Use `<picture>` with `type="image/avif"` first, then webp, then fallback PNG/JPG. Pair with `sizes` to cut data. | `<source srcset="hero.avif 1x, hero@2x.avif 2x" type="image/avif">` |
| **10** | **Variable fonts** | Load a single variable font. Expose weight/width via `font-variation-settings`. Saves requests and scales cleanly. | `font-variation-settings: "wght" 540;` |
| **11** | **Logical props** | Use `margin-inline`, `padding-block`, `inset-inline` so RTL support is automatic. | `.box { padding-inline: var(--space-m); }` |
| **12** | **Safe areas** | On notch devices add padding with `env(safe-area-inset-*)`. | `padding-top: env(safe-area-inset-top);` |
| **13** | **Prefers-reduced-motion** | Wrap heavy animations in `@media (prefers-reduced-motion: no-preference) { … }`. | |
| **14** | **Scroll performance** | Add `content-visibility: auto; contain: layout paint size;` to long lists or card decks. | |
| **15** | **JS impact** | Read size/orientation from ResizeObserver or the `ResizeObserverEntry.contentBoxSize`, not `window.resize`. | |
| **16** | **Testing matrix** | Automate screenshots at xs (<360 px), sm (640), md (768), lg (1024), xl (1280), ultra-wide (1920+). Include Safari+iOS to catch 100dvh quirks. | |
| **17** | **Accessibility** | Ensure all focusable items keep visible focus, `tabindex` is logical, and line length stays 45-80 chars with clamp() (#3). | |
| **18** | **Z-index scale** | Tokens: `--z-bg:0; --z-base:10; --z-pop:100; --z-modal:200; --z-toast:300`. Use only these; no magic numbers. | |
| **19** | **Dark mode** | Drive theme via `data-theme` attribute plus `@media (prefers-color-scheme: dark)` fallback. | |
| **20** | **Docs** | Save quick notes in `/docs/responsive.md`. List every token and rule so the next dev knows the system. | |

## Additional Critical Areas

### Real-world Edge Cases
- **Why it matters**: Dynamic data, web-components, third-party iframes, OS virtual keyboards, and extreme aspect ratios will expose bugs.
- **What to do**: Automate visual tests at every deploy. Run manual smoke tests on real devices (iOS Safari, Android Chrome, desktop Firefox, ultrawide).

### Performance vs. Fluidity
- **Why it matters**: Clamp(), container queries, and anchor-pos all add CSS calc work. Over-using them on thousands of nodes can cause jank on low-end mobiles.
- **What to do**: Audit with Lighthouse and the Performance panel. Use content-visibility, virtualisation, or split your CSS bundles.

### Accessibility and Interaction
- **Why it matters**: Layout rules do not cover keyboard order, focus traps, ARIA roles, or screen-reader text flow. A visually perfect page can still be unusable.
- **What to do**: Run axe-core, NVDA + VoiceOver checks. Keep a keyboard-only test script in the QA checklist.

## Minimal Extra Steps

### Define Exit Criteria
- No horizontal scroll at ≤ 320 px
- All text passes WCAG AA contrast
- Interactive focus order matches visual order

### Lock a Testing Matrix
- **Viewports**: 320×568, 768×1024, 1366×768, 1920×1080, 3440×1440
- **Browsers**: Latest Chrome, Safari, Firefox, Edge
- **Devices**: At least one real iPhone, one real Android, one Windows laptop

### Automate Regression
- Storybook + Chromatic or Percy screenshots on every PR
- Playwright scripts that resize the viewport and snapshot critical pages

### Review After Design Changes
Any new component must:
- Use tokens, not ad-hoc numbers
- Pass the matrix
- Add story + screenshot test before merge

## Project-Specific Rules

### NEVER Do This:
- ❌ Use fixed pixel values without clamp()
- ❌ Use Tailwind utility classes for sizing (use tokens.css)
- ❌ Create compound scale calculations
- ❌ Add media queries when clamp() would work
- ❌ Ignore container queries for component sizing
- ❌ Use vh without dvh/svh fallback
- ❌ Add magic z-index numbers

### ALWAYS Do This:
- ✅ Check tokens.css first before adding any dimension
- ✅ Use clamp() for all sizes, spaces, and typography
- ✅ Test at 320px width minimum
- ✅ Include safe area insets for mobile
- ✅ Use container queries for component-level responsiveness
- ✅ Initialize CSS variables before React hydration
- ✅ Document any new tokens immediately

## Reference Implementation
See `/mnt/c/Projects/pilotta-game/COMPREHENSIVE_UI_SCALABILITY_ACTION_PLAN.md` for the current implementation plan that follows these principles.