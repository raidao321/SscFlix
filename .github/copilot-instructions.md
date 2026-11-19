# SSC Flix Copilot Instructions

- Source precedence: `SSC_Flix_Global_Design_System_&_Responsive_Shell_Blueprint.html` governs visual identity and control treatment; `SSC_Flix_Improved_UI_UX_Web_Tree_v2.md` governs destinations, journeys, breakpoints, reading sizes, accessibility and assessment behavior.
- Both reference files are preserved at the workspace root.
- Semantic design tokens live in `src/app/globals.css`. Later pages must consume the existing CSS custom properties rather than introducing a new palette.
- Shell ownership: `src/components/AppExperience.tsx` owns the student workspace, public shell and assessment shell. Reuse `Brand`, `Icon`, `Overlay`, and navigation definitions when extending pages.
- Responsive boundaries: desktop >=1024px (224px sidebar, 64px header, 32px gutters); tablet 768–1023px (72px rail, 64px header, 24px gutters); phone <=767px (56px header, 16px gutters, fixed 68px-plus-safe-area bottom navigation).
- Keep the 24/32 page title, 20/28 section title, 16/24 body, 18/28 question text, 14/20 metadata, 44px minimum interactive targets, 8px control radius, 12px card radius and 16px overlays/sheets.
- Add future feature pages through the shared shell and shared controls. Do not recreate navigation, theme handling, target-exam state or overlay behavior.
