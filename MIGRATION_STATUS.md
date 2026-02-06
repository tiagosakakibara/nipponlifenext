# NipponLife Next.js Migration Status

## Phase 1: Core & Home Page (Completed)
- [x] **Project Setup**: Next.js 16, Tailwind v4, Supabase SSR, Next-intl.
- [x] **Layout**: Root Layout with i18n, Fonts, and Theme Provider.
- [x] **Components Ported**:
  - `Header` (Simplified Auth)
  - `Footer`
  - `LanguageSwitcher`
  - `ThemeProvider`
  - `ResponsiveImage`
  - `Carousel`
  - `BusinessCard`
- [x] **Data Fetching**: implemented in `src/app/[locale]/page.tsx` using Server Components.
- [x] **Services**: Ported `src/lib`, `src/api`, `src/types`.
- [x] **Translations**: Copied from `src/locales` to `messages/*.json`.

## Phase 2: Remaining Home Page Components (Completed)
- [x] **HeroSection**: Ported (using `storageService`, `next-intl`, and new layout).
- [x] **Community Cards**: `CommunityCard`, `CommunityQuestionsCard` migrated.
- [x] **Statistics Widgets**: `StatisticsCard`, `JapanChoroplethMap` migrated.
- [x] **Jobs Widget**: `HeaderJobs` (`FeaturedHighlights`) migrated.
- [x] **Gallery Section**: `GalleryAlbumCard` migrated.
- [x] **Reels Section**: `ReelsRow` and `ReelModal` migrated.
- [x] **Home UI Polish**: Adjusted card sizing, alignments, and section spacing.
- [x] **Build Fix**: Resolved Tailwind v4 / Turbopack root conflict and fixed translation keys.

## Phase 3: Other Core Pages
- [x] **News Page**: `/noticias` (List & Detail migrated)
- [x] **Jobs Page**: `/jobs` (List & Detail migrated)
- [x] **Events Page**: `/eventos` (List & Detail migrated)
- [x] **Business Page**: `/business` (Directory & Detail migrated)
- [x] **Community Page**: `/comunidade` (Main, Q&A, Post Detail migrated)
- [x] **Auth Pages**: Login/Register (needs Supabase Auth UI or Custom forms).
- [x] **User Profile**: `/perfil` (Form migrated)
- [x] Admin Layout & Navigation
- [x] Admin Dashboard (Home)
- [x] Admin Posts (News)
    - [x] List View
    - [x] Create Post
    - [x] Edit Post
    - [x] Rich Text Editor Integration
- [x] Admin Community Posts
- [x] Admin Businesses
- [x] Admin Jobs
- [x] Admin Events
- [x] Admin Categories
- [x] Admin Media Library
- [x] Admin Users
- [x] Admin Settings

## Notes
- `src/features` was temporarily removed to unblock the build. Re-add features incrementally.
- `next-themes` is used for Dark Mode.
- `next-intl` handles routing and translations.
