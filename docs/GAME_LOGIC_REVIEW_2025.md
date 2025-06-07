# Game Logic Review 2025

This document summarizes an audit of the current game logic implementation in comparison with `GAME_LOGIC_DUPLICATION_REPORT.md`. The goal is to verify the duplication issues and suggest an action plan for consolidation and maintenance.

## Verified Duplications

### Card Sorting
- `src/utils/cardSorting.ts` defines `RANK_ORDER` starting at `1` and provides `sortHumanPlayerCards`.
- `src/utils/cardSortUtils.ts` defines another `RANK_ORDER` starting at `0` with a different sorting function.
- `src/core/cardUtils.ts` implements yet another sorting approach based on `getCardStrength`.

### Belote/Rebelote Logic
- Belote detection exists in `src/core/gameRules.ts` via `checkBelote()`.
- Announcement tracking and complex state handling occurs in `src/store/gameSlice.ts`.

### Bidding Validation
- `isValidBid()` and `getValidBidValues()` reside in `src/core/gameRules.ts`.
- `GameManager.getMinimumBid()` hardcodes a `490` limit.
- `BiddingInterface.tsx` also uses a `maxBid = 490` constant.

### Legal Move Validation
- Core logic lives in `gameRules.ts` (`isLegalPlay`, `getLegalPlays`).
- Selectors (`selectors.ts`) and `GameFlowController` repeat validation checks and null guards.

### Score Calculation
- `calculateRoundScore()` in `gameRules.ts` performs complete scoring.
- `GameFlowController.completeRound()` replicates trick counting and result assembly.

### AI Strategy Wrapper
- `src/ai/AIStrategyClass.ts` forwards calls to `decideBid` and `decideCardPlay` without adding behaviour.

### Magic Strings and Constants
- Positions like `'north'`/`'south'` appear in many files (e.g. `types.ts`, `positionMapping.ts`).
- Team IDs appear both as `'A'/'B'` and `team1/team2` in selectors and state.
- Hard‑coded numbers for animation delay and z‑index remain in several files (`GameFlowController.ts`, component CSS).

### Declaration Handling
- Finding declarations occurs in `gameRules.ts` while state and comparisons happen in `gameSlice.ts` and `GameFlowController.ts`.

### Trump Card Ordering
- `CARD_VALUES` in `types.ts` define point values.
- `cardUtils.ts` and `aiStrategy.ts` each implement separate orderings for trump strengths.

## Additional Observations

- The project lacks a single source for game constants (bidding limits, animation delays, z‑indices), leading to scattered magic numbers.
- TypeScript enums exist for suits and ranks, but not for positions or team IDs, causing widespread string literals.
- Some selectors and helpers re-check for nulls even when upstream logic guarantees values, creating unnecessary defensive code.
- The test suite (`tests/`) covers many scenarios but may not fully validate all duplicated logic paths.

## Suggested Action Plan

1. **Create Central Modules**
   - `src/core/constants.ts` for all numeric constants and enums (bid values, animation delays, z‑indices, etc.).
   - `src/core/cardRanking.ts` to hold trump/non‑trump order, value mapping, and comparison helpers.
   - `src/core/cardSorting.ts` implementing all sorting strategies using `cardRanking` where appropriate.
   - `src/core/biddingRules.ts`, `beloteManager.ts`, `scoreCalculator.ts`, and `declarationManager.ts` as outlined in the duplication report.

2. **Refactor Existing Code**
   - Replace `AIStrategyClass.ts` with direct use of functions from `aiStrategy.ts`.
   - Remove `cardSortUtils.ts`; update imports to the new `cardSorting.ts`.
   - Consolidate bidding, declaration, and scoring logic so reducers and controllers only orchestrate flow, not business rules.
   - Replace string literals with enums from the constants module.

3. **Update Tests and Documentation**
   - Modify existing tests to use the new modules and ensure coverage of the unified logic.
   - Document the new architecture in `/docs` and update the README to reference centralized constants.

4. **Progressive Integration**
   - Implement changes per module (sorting, bidding, scoring, etc.) in separate refactoring phases, running tests after each.
   - Keep old functions temporarily with deprecation warnings if necessary to avoid breaking the app during incremental updates.

5. **Cleanup and Verification**
   - After migration, remove obsolete files and constants.
   - Run the full Playwright test suite and manual smoke testing to confirm consistent gameplay.
   - Perform a final audit to ensure no remaining magic numbers or duplicate logic remain.

## Conclusion

The duplication report accurately reflects the current state of the repository. Consolidating game logic into well‑defined modules will reduce maintenance cost and ensure consistent behaviour across gameplay, AI, and UI layers. Implementing the above action plan will bring the codebase closer to a single source of truth and make future enhancements easier.
