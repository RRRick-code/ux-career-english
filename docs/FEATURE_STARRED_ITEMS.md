# Feature: Starred Items

## 1. Overview
This feature introduces the ability to "star" (or favorite) specific language items (terms, phrases, and patterns). Users can mark important items while studying or browsing the library, and then engage in a focused study session that draws exclusively from their starred items.

**Core Principle:** All star data strictly follows the existing local data architecture. It is stored entirely within the browser's `localStorage` and does not modify the canonical JSON content files (`data/language_items.json`). This ensures backward compatibility and zero data loss for existing users.

## 2. Key Changes
- **Data Structure Extension:** Add a `starred` boolean property to the `LearningRecord` object in `src/types.ts`.
- **Home Page UI:** Count the number of starred items for each tab ("Terms & Phrases" and "Patterns"). If the count is greater than 0, display a new yellow "Study Starred" button below the "Random Study" button. If the count is 0, the button remains hidden.
- **Study Engine (`src/lib/study.ts`):** Introduce a new `"starred"` study mode. When triggered, the system filters the pool to include only items where `record.starred === true`, shuffles them, and selects a maximum of 20 items per round.
- **Card Interaction Enhancements:**
  - **Study Page:** Add a permanent, interactive star icon to the top-right corner of the flashcard. Clicking it toggles the star status and immediately saves it to local storage.
  - **Library List:** Display a solid yellow star icon in the top-right corner of item cards if they are starred.
  - **Item Detail Sheet:** Add a star toggle button to the title area (next to the "English" label), allowing users to easily star/unstar items while browsing.
- **Documentation Update:** Update `docs/DATA_ARCHITECTURE.md` to explicitly define the boundaries of "Local User Data", clarifying that `starred` status and learning progress belong exclusively to `localStorage`.

## 3. Implementation Steps
1. **Update Data Definitions (`src/types.ts`)**
   - Add `starred?: boolean;` to `LearningRecord`.
   - Add `"starred"` to the `StudyMode` union type.
2. **Upgrade Local Storage Logic (`src/lib/storage.ts`)**
   - Update `loadLearningRecords` to safely deserialize existing records, preserving the previous data and defaulting `starred` to `false` for backward compatibility.
3. **Expose Global Data Mutation (`src/hooks/use-learning-records.tsx`)**
   - Provide a `toggleStar(itemId: string)` method in the context.
   - If a user stars an unstudied item (progress is 0), silently initialize a local record with `progress: 0`, `status: "not_started"`, and `starred: true`.
4. **Refactor Study Selection Logic (`src/lib/study.ts`)**
   - Update `buildStudyRound` to handle the `"starred"` mode: filter the dataset for `starred === true`, shuffle the results, and slice the top 20 items.
5. **Build Home Page Entry Point (`src/pages/home-page.tsx`)**
   - Calculate the count of starred items for both scopes.
   - Render a "Study Starred" `<Link>` to `/study/term-phrase/starred` or `/study/pattern/starred` when the count > 0, styling it distinctively (e.g., amber/yellow).
6. **Enhance Study Page Interactions (`src/pages/study-page.tsx`)**
   - Update `parseStudyRoute` to recognize `mode === "starred"` and update the page title accordingly.
   - Inject a `Star` icon (from `lucide-react`) at the top-right (`absolute top-5 right-5 z-20`) of the central card structure, bound to `toggleStar`.
7. **Enhance Library Page & Detail Sheet**
   - Update `src/components/item-card.tsx` to set the container to `relative` and render a solid yellow star in the top-right if `isStarred` is true.
   - Update `src/pages/library-page.tsx` to pass the `isStarred` prop by reading `getRecord(item.id).starred`.
   - Update `src/components/item-detail-sheet.tsx` to include an interactive star button near the "English" section label, utilizing the `useLearningRecords` hook.
8. **Update Architecture Documentation (`docs/DATA_ARCHITECTURE.md`)**
   - Append a `## Local User Data` section detailing that learning progress and star statuses are strictly maintained in `localStorage` and should never pollute the source JSON files.

## 4. Technical Considerations
- **Backward Compatibility:** Legacy objects in `localStorage` lack the `starred` field. JavaScript will interpret this as `undefined`, so the logic must cleanly cast this to `false` to avoid crashes.
- **Event Bubbling:** The study page flashcard uses an invisible full-cover button to intercept "reveal" clicks. The new star button must have a higher `z-index` and explicitly call `e.stopPropagation()` in its `onClick` handler to prevent accidental card reveals.
- **State Reactivity:** Because the app relies on React Context for `records`, invoking `toggleStar` will automatically trigger re-renders across the Home Page counts, Library List, and Detail Sheet without needing an external event bus.

## 5. Success Criteria
- [ ] The "Study Starred" button appears on the Home Page only when at least one item in the respective tab is starred.
- [ ] Clicking "Study Starred" initiates a study session containing exactly the starred items (randomized, capped at 20).
- [ ] Legacy learning progress remains fully intact without throwing serialization errors for returning users.
- [ ] The star icon is visible and fully interactive in the top-right corner of the Study Page flashcard, regardless of whether the card is revealed or hidden.
- [ ] The Library UI correctly displays star indicators on individual cards and allows toggling via the detail sheet.
- [ ] The UI changes conform to the existing `shadcn UI` and `Tailwind CSS v4` design system.