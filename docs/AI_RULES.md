# AI Rules – NipponLife

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (Auth + Database + Storage)
- next-intl (i18n: pt, en, ja)
- Deployed on Vercel

## General Rules

- Fix ONLY the described issue
- Do NOT refactor unrelated code
- Do NOT add features
- Do NOT change styling unless required
- Minimal changes only

## Layout Rules

- Mobile-first
- Desktop adjustments only when necessary
- Avoid fixed heights unless explicitly needed

## Output Format

- Max 3 short bullets explaining the cause
- Show ONLY the exact code lines changed
- No extra explanations

## Global Typography System (Do Not Reinterpret)

The NipponLife project uses a fixed and official typography system.

Primary Font (UI / Body / Default):

- DM Sans
- Usage:
- Body text
- Paragraphs
- Forms
- Buttons
- General UI text

Secondary Font (Headings / Emphasis):

- Montserrat
- Usage:
- Headings (H1–H6)
- Section titles
- Emphasized UI labels
- Navigation titles

Japanese / Cultural Font:

- Shippori Mincho
- Usage:
- Japanese language content
- Cultural or editorial sections
- Content requiring a traditional Japanese aesthetic

Rules:

- Do NOT introduce new fonts
- Do NOT replace fonts
- Do NOT suggest alternatives
- Always use the fonts above according to their intended usage
- Font decisions are considered frozen global knowledge

## Global Color System (Do Not Reinterpret)

The NipponLife project uses a fixed and official color palette.
This palette defines the visual identity of the project and must not be reinterpreted.

Primary Colors:

- Primary Red: #D70F24
- Primary Blue: #003768

Neutral Colors:

- White: #FFFFFF
- Light Gray: #EAEAEA

Accent / Link Color:

- Accent Blue: #5593C3

Usage Rules:

- Do NOT introduce new colors
- Do NOT approximate similar shades
- Always use the exact HEX values defined above
- Accent Blue (#5593C3) is reserved for links, highlights, and accents
- Neutral colors are preferred for backgrounds and layout structure
- Primary colors define brand identity and emphasis

Rules:

- Never invent colors
- Never suggest alternative palettes
- Never change colors unless explicitly instructed
- Color decisions are considered frozen global knowledge

## Global Database & Supabase Rules (Do Not Reinterpret)

The NipponLife project uses Supabase as the single source of truth for all data.

General Rules:

- Supabase is the authoritative database
- Do NOT assume tables or schema changes
- Do NOT recreate existing tables
- Do NOT invent alternative data models
- Always respect existing schema and policies

## Authentication Model (Supabase Auth)

- User authentication is handled by Supabase Auth
- The `auth.users` table is the canonical user source
- The `profiles` table is used to extend user data
- Do NOT create custom user tables
- Do NOT duplicate authentication logic

## Canonical Tables (Confirmed Existing)

The following tables are confirmed to exist and must be treated as canonical.
Do NOT question their existence.
Do NOT recreate them.

Core:

- profiles
- site_settings
- media

Content:

- posts
- post_views
- categories
- guides
- guides_categories

Community:

- community_posts
- community_post_comments
- community_answers
- community_questions
- community_likes
- community_reels
- community_categories
- community_cost_of_living_entries
- community_stats_v

Business / Jobs:

- businesses
- jobs
- job_applications
- calendar_events

Statistics:

- statistics_kpis
- statistics_snapshots
- statistics_prefecture_density
- statistics_salary_comparison
- statistics_top_nationalities
- statistics_tourism

Views:

- v_community_cost_of_living_by_*

## Row Level Security (RLS)

- RLS is enabled and actively used
- Sensitive tables are protected by policies
- Public read access exists for published content
- Admin access is restricted via policies

Rules:

- Do NOT disable RLS unless explicitly instructed
- Do NOT bypass policies
- Any policy change must be documented

## Database Migrations Rule (Mandatory)

- Database schema changes are tracked via migrations
- Any change to tables, views, or policies must be documented
- After schema changes, update the related feature `.md`
- Do NOT leave database changes undocumented

## Mandatory Reading Rule

This file must be read before any code or schema change.
Its rules override any other documentation unless explicitly stated.
