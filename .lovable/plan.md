

## Plan: Add phone number and email validation to Contact Form

### What to change

**1. Update Zod schema in `ContactForm.tsx` (line 13-19)**

- **Phone**: Add regex validation to ensure only digits (and optional `+`, spaces, dashes) are allowed. Use `.regex(/^[0-9+\-\s]*$/)` to enforce numeric-only input.
- **Email**: Add `.refine()` or keep `.email()` — the user wants to ensure it's specifically a Gmail address (`@gmail.com`). Add `.refine(val => val.endsWith('@gmail.com'))` with appropriate error message.

**2. Update i18n translations (`vi.ts` and `en.ts`)**

Add error messages:
- Vietnamese: `"Số điện thoại chỉ được chứa số"`, `"Email phải là địa chỉ Gmail (@gmail.com)"`
- English: `"Phone number must contain only digits"`, `"Email must be a Gmail address (@gmail.com)"`

### Files to edit
- `src/components/ContactForm.tsx` — update zod schema for phone regex and email gmail check
- `src/i18n/vi.ts` — add validation error messages
- `src/i18n/en.ts` — add validation error messages

