# 🚀 Unified Responsive Design Action Plan

*Integrates our Session 35 audit (178 violations) + competitor insights (ESLint px-linting, modal-compliance matrix)*

## Overview
This is the **ONLY** action plan to follow for achieving responsive design compliance. It supersedes all previous plans.

**Current State**: 42/100 compliance score, 178 critical violations  
**Target State**: 100/100 compliance, 0 violations, production-ready

---

## Phase 0: Governance & Tooling 🛡️
**Goal**: Freeze design-token spec and block future drift  
**Timeline**: IMMEDIATE (Day 1)

### Key Tasks
1. **Convert tokens.css to JSON export**
   ```bash
   # Install Style Dictionary
   npm install --save-dev style-dictionary
   ```
   - Create `tokens.json` as single source of truth
   - Export to: `tokens.css`, `tailwind.config.js`, TypeScript types
   - All systems import from same data source

2. **Add ESLint rule to block literal px** ✓
   ```javascript
   // .eslintrc.cjs
   module.exports = {
     rules: {
       "no-restricted-syntax": [
         "error",
         {
           "selector": "Literal[value=/^\\d+px$/]",
           "message": "Use clamp() with rem or token variables instead of px"
         }
       ]
     }
   };
   ```

3. **Add Stylelint rule for CSS** ✓
   ```javascript
   // stylelint.config.cjs
   module.exports = {
     plugins: ["stylelint-no-pixel-in-clamp"],
     rules: {
       "declaration-property-value-disallowed-list": {
         "/.*/": ["/\\d+px/"],
         "message": "Use rem or token variables instead of px"
       },
       "unit-disallowed-list": {
         "px": true,
         "message": "Use rem, %, or viewport units"
       }
     }
   };
   ```

4. **Configure rem-conversion plugin** ✓
   ```bash
   npm install --save-dev stylelint-rem-conversion
   # Auto-converts px to rem on save
   ```

**Proof of Need**: Competitor flagged 178 px violations; this prevents new ones while we fix existing.

---

## Phase 1: Breakpoint & Tailwind Alignment 🎯
**Goal**: One authoritative breakpoint map  
**Timeline**: Week 1, Day 2

### Key Tasks
1. **Export breakpoints from tokens**
   ```javascript
   // tokens.json
   {
     "breakpoints": {
       "xs": "20rem",   // 320px
       "sm": "40rem",   // 640px
       "md": "48rem",   // 768px
       "lg": "64rem",   // 1024px
       "xl": "90rem"    // 1440px
     }
   }
   ```

2. **Extend Tailwind theme**
   ```javascript
   // tailwind.config.js
   import tokens from './tokens.json';
   
   module.exports = {
     theme: {
       screens: tokens.breakpoints,
       extend: {
         // Map all token values
       }
     }
   };
   ```

3. **Remove ad-hoc utilities** ✓
   - Find: `max-w-md`, `w-full`, `h-screen` in Settings/StartScreen/GameOver
   - Replace with: `.modal-base` class using tokens
   - Components affected: ~12 files

**Proof of Need**: Eliminates dual-source conflict (Tailwind defaults vs our tokens).

---

## Phase 2: Automated px→token Migration 🤖
**Goal**: Eliminate raw pixel constants  
**Timeline**: Week 1, Day 3-4

### Key Tasks
1. **Run codemod for common values**
   ```bash
   # Create transform script
   npx jscodeshift -t px-to-token.js src/**/*.{ts,tsx,css}
   ```
   - Replace: `120px` → `var(--card-width)`
   - Replace: `168px` → `var(--card-height)`
   - Replace: `1000px` → `var(--perspective)`
   - Replace: `44px` → `var(--touch-target-min)`

2. **Convert media query breakpoints** ✓
   ```css
   /* Before */
   @media (max-width: 640px) { }
   
   /* After */
   @media (max-width: 40rem) { }
   ```

3. **Run Stylelint autofix**
   ```bash
   npx stylelint "**/*.css" --fix
   ```

**Proof of Need**: Competitor's list shows exact px values at each violation location.

---

## Phase 3: Container Query Enablement 📦
**Goal**: Make components self-scaling  
**Timeline**: Week 2, Day 1

### Key Tasks
1. **Add container-type to components**
   ```css
   /* PlayerHandFlex.css */
   .ph-flex-container {
     container-type: inline-size;
   }
   
   /* Modal roots */
   .modal-base {
     container-type: inline-size;
   }
   
   /* TrickArea */
   .trick-area-centered {
     container-type: inline-size;
   }
   ```

2. **Convert media queries to container queries**
   ```css
   /* Before */
   @media (max-width: 400px) { }
   
   /* After */
   @container (max-width: 25rem) { }
   ```

**Affected Files**:
- PlayerHandFlex.css (has inactive query)
- BiddingInterface.module.css
- DetailedScoreboard.module.css
- TrickPileViewer.css

**Proof of Need**: Our audit found container queries defined but non-functional due to missing container-type.

---

## Phase 4: Modal & Overlay Compliance 🪟
**Goal**: 100% cheat-sheet adherence for all modals  
**Timeline**: Week 2, Day 2-3

### Key Tasks
1. **Create modal-base class** ✓
   ```css
   .modal-base {
     container-type: inline-size;
     max-width: var(--modal-max-width);
     max-height: min(85dvh, 85vh);
     padding: max(
       var(--modal-padding),
       env(safe-area-inset-top) env(safe-area-inset-right) 
       env(safe-area-inset-bottom) env(safe-area-inset-left)
     );
     border-radius: var(--radius-lg);
     z-index: var(--z-modal);
     overflow-y: auto;
   }
   ```

2. **Replace all vh with dvh fallback** ✓
   ```css
   /* All modals, overlays, fullscreen elements */
   height: min(100dvh, 100vh);
   max-height: min(90dvh, 90vh);
   ```

3. **Add safe-area padding**
   - Settings modal
   - StartScreen overlay
   - GameOverScreen
   - ContractIndicator (top-right position)
   - DetailedScoreboard
   - RoundTransitionScreen

4. **Fix z-index typo**
   ```css
   /* RoundTransitionScreen.css */
   /* Before: z-index: var(--z-index-modal); */
   /* After: */ z-index: var(--z-modal);
   ```

**Proof of Need**: Competitor matrix lists non-compliant modals; our audit adds safe-area gaps.

---

## Phase 5: Card & Table Refactor 🃏
**Goal**: Single formula for all card sizes & 3D depth  
**Timeline**: Week 3, Day 1-2

### Key Tasks
1. **Fix TrickArea hardcoded dimensions**
   ```css
   /* Before */
   --card-width-base: calc(120px * var(--card-scale));
   --card-height-base: calc(168px * var(--card-scale));
   
   /* After */
   --card-width-base: var(--card-width);
   --card-height-base: var(--card-height);
   ```

2. **Tokenize perspective and depth**
   ```css
   :root {
     --perspective: clamp(37.5rem, 50vw, 62.5rem); /* 600-1000px */
     --layer-depth-sm: clamp(0.25rem, 0.5vw, 0.5rem);
     --layer-depth-md: clamp(0.5rem, 1vw, 1rem);
     --layer-depth-lg: clamp(0.75rem, 1.5vw, 1.5rem);
   }
   
   .announcement-container {
     perspective: var(--perspective);
   }
   
   .shadow-layer {
     transform: translateZ(calc(-1 * var(--layer-depth-md)));
   }
   ```

3. **Create touch target token**
   ```css
   :root {
     --touch-target-min: max(2.75rem, 44px);
   }
   
   /* Apply to all interactive elements */
   .ph-flex-card,
   button,
   .toggle-container {
     min-width: var(--touch-target-min);
     min-height: var(--touch-target-min);
   }
   ```

**Proof of Need**: Both audits flagged hardcoded card/perspective values.

---

## Phase 6: HUD & Typography Fluidity 📝
**Goal**: Fluid text on every screen size  
**Timeline**: Week 3, Day 3

### Key Tasks
1. **Replace Tailwind text utilities**
   ```css
   /* Create HUD-specific tokens */
   :root {
     --fs-hud-xs: var(--fs-xs);
     --fs-hud-sm: var(--fs-sm);
     --fs-hud-base: var(--fs-base);
     --fs-hud-lg: var(--fs-lg);
     --fs-hud-xl: var(--fs-xl);
   }
   ```

2. **Convert all text classes**
   ```tsx
   // Before
   <div className="text-xs">Team A</div>
   <div className="text-2xl">Score</div>
   
   // After
   <div style={{ fontSize: 'var(--fs-hud-xs)' }}>Team A</div>
   <div style={{ fontSize: 'var(--fs-hud-xl)' }}>Score</div>
   ```

3. **Add aspect-ratio for cards**
   ```css
   .card,
   .card-placeholder {
     aspect-ratio: 5/7;
   }
   ```

**Affected Components**:
- ScoreBoard.tsx
- ContractIndicator.tsx
- All HUD text elements

---

## Phase 7: Accessibility & Interaction ♿
**Goal**: 44px hit-areas, focus-visible, safe-area everywhere  
**Timeline**: Week 4, Day 1

### Key Tasks
1. **Enforce minimum touch targets**
   ```css
   /* Global rule */
   button,
   a,
   input,
   select,
   .interactive {
     position: relative;
     min-width: var(--touch-target-min);
     min-height: var(--touch-target-min);
   }
   
   /* For small visual elements, add invisible hit area */
   .small-button::before {
     content: '';
     position: absolute;
     inset: -0.5rem;
     /* Extends clickable area */
   }
   ```

2. **Add focus-visible tokens**
   ```css
   :root {
     --focus-ring-width: 0.125rem;
     --focus-ring-color: var(--color-primary);
     --focus-ring-offset: 0.125rem;
   }
   
   :focus-visible {
     outline: var(--focus-ring-width) solid var(--focus-ring-color);
     outline-offset: var(--focus-ring-offset);
   }
   ```

3. **Run accessibility audit**
   ```bash
   # Install and run axe-core
   npm install --save-dev @axe-core/playwright
   # Add to Playwright tests
   ```

---

## Phase 8: QA Matrix & Visual Tests 🧪
**Goal**: Catch edge-cases continuously  
**Timeline**: Week 4, Day 2-3

### Key Tasks
1. **Playwright screenshot matrix**
   ```javascript
   // playwright.config.ts
   const viewports = [
     { width: 320, height: 568 },   // iPhone SE
     { width: 375, height: 812 },   // iPhone X
     { width: 768, height: 1024 },  // iPad
     { width: 1366, height: 768 },  // Laptop
     { width: 1920, height: 1080 }, // Desktop
     { width: 3440, height: 1440 }  // Ultrawide
   ];
   ```

2. **Percy integration**
   ```bash
   npm install --save-dev @percy/playwright
   # Snapshot on every PR
   ```

3. **Critical path tests**
   - GameTable at all viewports
   - Every modal (Settings, Scoreboard, etc.)
   - TrickPileViewer gallery
   - Card interactions

---

## Phase 9: CI + Lint Guard 🚦
**Goal**: Prevent regression  
**Timeline**: Ongoing

### Key Tasks
1. **GitHub Actions workflow**
   ```yaml
   name: Responsive Compliance
   on: [push, pull_request]
   
   jobs:
     lint:
       steps:
         - run: npm run lint:css
         - run: npm run lint:js
         - run: npm run test:visual
   ```

2. **Pre-commit hooks**
   ```bash
   npx husky install
   npx husky add .husky/pre-commit "npm run lint"
   ```

---

## Phase 10: Documentation 📚
**Goal**: Keep future work compliant  
**Timeline**: Ongoing

### Key Tasks
1. **Update responsive guide**
   - Token reference table
   - Component patterns
   - Do's and don'ts

2. **Migration guide**
   - How to add new components
   - Token usage examples
   - Common pitfalls

---

## Validation Checklist ✅

- [ ] Static lint passes (0 px violations)
- [ ] Visual tests green across viewport matrix
- [ ] Axe-core score ≥ 95%
- [ ] No horizontal scroll at 320px
- [ ] All modals scale smoothly 320px → 3440px
- [ ] Touch targets ≥ 44px everywhere
- [ ] Safe areas respected on notched devices
- [ ] Container queries active where defined
- [ ] Single source of truth (tokens.json)
- [ ] CI prevents regression

---

## Dependencies & Tools

```bash
# Install all required tools
npm install --save-dev \
  style-dictionary \
  stylelint \
  stylelint-no-pixel-in-clamp \
  stylelint-rem-conversion \
  @axe-core/playwright \
  @percy/playwright \
  husky
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|---------|
| Compliance Score | 42/100 | 100/100 |
| Fixed px values | 178 | 0 |
| Container queries | 4 files | All components |
| Touch target violations | Unknown | 0 |
| Safe area coverage | ~10% | 100% |
| Automated testing | None | Full matrix |

---

**Remember**: This plan combines the best of both audits. Phase 0 (Governance) must be implemented IMMEDIATELY to stop new violations while fixing existing ones.