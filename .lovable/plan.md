

## Plan: Replace "Terms" with "Contact Us" link + Build 3 new pages

### Overview
Replace "Điều khoản sử dụng" in the footer Support section with "Liên hệ với chúng tôi" (scrolls to contact section on homepage). Then create three new pages: User Guide, FAQ, and Privacy Policy with full bilingual content.

### Changes

**1. Update Footer support links** (`src/components/Footer.tsx`)
- Replace the static `terms` item with a `contactUs` link
- Make `userGuide`, `faq`, `privacy` use `<Link>` to `/user-guide`, `/faq`, `/privacy`
- Make `contactUs` use `<Link to="/#contact">` or scroll to `#contact` section on homepage
- Refactor the support items from a simple `.map()` to individual items with proper routing

**2. Update i18n** (`src/i18n/vi.ts`, `src/i18n/en.ts`)
- Replace `footer.terms` with `footer.contactUs`: "Liên hệ với chúng tôi" / "Contact Us"
- Add full page content translations for:
  - `userGuidePage`: title, sections covering how to navigate, play games, track progress, use library
  - `faqPage`: title, common Q&A items (10+ questions about accounts, games, progress, etc.)
  - `privacyPage`: title, sections about data collection, usage, security, children's privacy, contact

**3. Create 3 new pages** (`src/pages/`)
- `UserGuide.tsx` — Accordion-based guide with sections: Getting Started, Navigation, Games, Progress Tracking, Library
- `FAQ.tsx` — Accordion FAQ with categorized questions and answers
- `PrivacyPolicy.tsx` — Structured privacy policy with standard sections
- All pages include Header + Footer, use `useLanguage()` for bilingual support, and follow existing page patterns

**4. Add routes** (`src/App.tsx`)
- `/user-guide` → `UserGuide`
- `/faq` → `FAQ`
- `/privacy` → `PrivacyPolicy`

### Files to create/edit
- **Edit**: `src/components/Footer.tsx`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/App.tsx`
- **Create**: `src/pages/UserGuide.tsx`, `src/pages/FAQ.tsx`, `src/pages/PrivacyPolicy.tsx`

