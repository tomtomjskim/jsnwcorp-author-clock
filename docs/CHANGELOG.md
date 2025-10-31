# Changelog

All notable changes to Author Clock will be documented in this file.

## [2.0.2] - 2025-10-31

### Fixed
- **Critical Bug: Quote text not appearing on interval mode**: Fixed quote refetch logic where changing quote interval settings (e.g., 1min → 5min) didn't display new quotes immediately
  - Root cause: Second useEffect only triggered when `quoteMode` changed, not when interval value changed
  - Solution: Consolidated two useEffect hooks into one that immediately refetches on any `settings.quoteInterval` change
  - Now works correctly on initial page load, switching from daily to interval, and changing between different interval values

- **Settings not immediately applied**: All settings changes now apply immediately without page refresh (PWA-appropriate UX)
  - Quote interval changes trigger immediate quote fetch
  - Time format changes apply instantly
  - Date format and position changes apply instantly

### Technical Details
- Removed redundant useEffect dependency on `quoteMode`
- Single useEffect now handles both interval setup and immediate refetch
- Updated in `/home/deploy/projects/author-clock/frontend/src/App.tsx:48-69`

---

## [2.0.1] - 2025-10-31

### Fixed
- **Settings panel click triggers fullscreen**: Extended `excludeSelectors` in `useDoubleClick` hook to include `label`, `[role="dialog"]`, and `.settings-panel`
- **Infinite re-render loop**: Removed `refetchRandom` from useEffect dependency array to prevent React Query function recreation issues

### Changed
- Added ARIA attributes to SettingsPanel component (`role="dialog"`, `aria-label`)

---

## [2.0.0] - 2025-10-31

### Added
- **Text Drag Prevention**: Clock and quote text can no longer be accidentally selected/dragged
  - Applied `user-select: none` CSS property to main content areas
  - Settings panel text remains selectable for usability

- **Double-Click/Double-Tap Fullscreen Toggle**:
  - Double-click or double-tap anywhere on the screen to toggle fullscreen mode
  - Automatically excludes buttons, links, and input elements
  - 300ms delay for double-click detection
  - Custom `useDoubleClick` hook for event handling

- **Auto-Hide Bottom Controls**:
  - Control panel automatically hides after 3 seconds of user inactivity
  - Shows again on mouse movement, keyboard input, or touch events
  - Always visible when cursor is in bottom 20% of screen
  - Smooth slide-down/slide-up animation (500ms transition)
  - Custom `useIdleDetection` hook with configurable timeout

- **Date Display with Customization**:
  - New `DateDisplay` component with multiple format options:
    - **Hidden**: No date display
    - **Korean Long**: "2025년 10월 31일 목요일"
    - **Korean Short**: "2025.10.31"
    - **English Long**: "Thursday, October 31, 2025"
    - **English Short**: "10/31/2025"
    - **ISO Format**: "2025-10-31"
  - Flexible positioning options:
    - Above time
    - Below time
    - Above quote
    - Below quote
  - Settings persist in localStorage
  - Format and position configurable through settings panel

### Changed
- Enhanced settings panel with two new sections:
  - Date format selection dropdown
  - Date position selection dropdown (shown only when date is not hidden)
- Improved main content layout with flexible gap spacing
- Updated TypeScript types to use browser-native `number` for timers instead of `NodeJS.Timeout`

### Technical Details
- New custom hooks:
  - `useDoubleClick.ts`: Handles double-click/double-tap events
  - `useIdleDetection.ts`: Tracks user activity and inactivity
- Extended `useSettings` hook:
  - Added `DateFormat` type with 6 format options
  - Added `DatePosition` type with 4 position options
  - Updated settings interface and defaults
- Enhanced ControlPanel animation:
  - Added `isVisible` prop
  - Implemented smooth translate and opacity transitions
  - Added `pointer-events-none` when hidden

### Package Updates
- Version bumped to 2.0.0
- No new dependencies added

---

## [1.1.0] - 2025-10-31

### Added
- **Time Format Settings**: Toggle between 24-hour and 12-hour (AM/PM) formats
- **Quote Rotation Intervals**: Configurable quote change intervals
  - Options: 1min, 5min, 10min, 30min, 1hour, 6hours, 12hours, 24hours (daily)
  - Automatic rotation based on selected interval
  - localStorage-based persistence
- **Settings Panel UI**:
  - Slide-in panel from right side
  - Time format selection (radio buttons)
  - Quote interval selection (dropdown)
  - Reset settings button
  - Backdrop overlay for focus

### Changed
- Clock component now supports both time formats
- Quote system switches between daily and interval modes automatically
- Control panel includes new settings button

### Technical Details
- New `useSettings` custom hook with localStorage integration
- New `SettingsPanel` component with slide animation
- Quote rotation logic with `setInterval` cleanup
- Default settings: 24h time, 1440min (daily) quote interval

---

## [1.0.0] - 2025-10-31

### Initial Release
- Real-time clock display with second precision
- Daily quote rotation system
- Korean and English language support
- Light/Dark theme toggle
- Fullscreen mode
- Quote statistics (likes, views)
- Responsive design for mobile and desktop
- PostgreSQL database with 6 tables
- Redis caching for performance
- Docker-based deployment
- 50+ seeded quotes from public domain sources
