# Figma Make prompt — Invoica Mobile

Paste the block below into Figma Make. It reflects the locked decisions: Flutter companion app, "Minimal Light" aesthetic, brand purple `#9747E6`, and the v1 screens from `RFC.md`.

---

Design a **mobile app UI** for **Invoica**, an invoice-management app for freelancers and small businesses. Platform: **iOS + Android (single design)**, portrait phone frames (393×852). This is an "on-the-go companion" to a web app, so it's focused and fast, not feature-bloated.

**Visual direction — "Minimal Light":** airy, calm, professional. Lots of whitespace, white cards on a light neutral background, hairline borders, soft shadows, generous rounded corners. A single accent color used sparingly. Modern fintech-clean, in the spirit of Linear / Stripe dashboards — not playful, not heavy.

**Design tokens:**
- Background: `#F6F6F8`. Card/surface: `#FFFFFF`. Hairline border: `#ECECF0`.
- Text primary: `#15151B`. Text secondary/muted: `#6B6B72` (~55% opacity feel).
- Accent (brand): `#9747E6` (purple). Use for primary buttons, active states, key figures, selected tab.
- Status colors: Paid/positive green `#2E9E5B` (tint `#E6F6EC`); Sent/info purple `#9747E6` (tint `#EFEAFB`); Overdue/danger red `#E5484D` (tint `#FDEAEA`); Draft neutral gray `#6B6B72` (tint `#F0F0F2`).
- Typography: Inter (or system SF/Roboto). Large bold numbers for money. Headings 20–30px bold; body 13–14px; labels 11px uppercase, letter-spaced, muted.
- Corner radius: cards 16px, hero cards 20px, chips/pills fully rounded, buttons 14px.
- Shadows: very soft and subtle (e.g. `0 4px 14px rgba(0,0,0,0.06)`).
- Status chips: small fully-rounded pills with tinted background + colored text.

**Navigation:** persistent **bottom tab bar** with 4 destinations — **Home, Invoices, Settings** — plus a prominent centered **"+" floating action button** (purple, rounded square, raised) for creating an invoice. Active tab is purple with a filled label.

**Screens to design:**

1. **Login** — clean centered layout, Invoica logo/wordmark, a primary **"Continue with Google"** button and a secondary text link **"Continue as guest"**. Minimal, lots of whitespace.

2. **Home / Dashboard** — greeting header ("Good morning, James") with avatar. A white hero card showing **Outstanding** balance ("$12,480.00") with a small "+8% vs last month" in purple. Below it, two small stat cards side by side: **Collected** ("$8,200", green) and **Overdue** ("$2,100", red). A row of status chips: "Sent 6", "Paid 14", "Draft 3". A simple revenue **bar chart** (last 6 months). A "Recent" section with 2–3 compact invoice rows. Pull-to-refresh feel.

3. **Invoice List** — title "Invoices" with a search icon. Horizontal filter pills: **All · Overdue · Sent · Paid · Draft** (selected pill is purple). A vertical list of invoice cards; each card shows client name, invoice number, due/paid date, amount (bold), and a status chip. **Overdue** cards have a thin red accent on the left edge. Show a mix of statuses.

4. **Invoice Detail** — back arrow + "Invoice #1042" + overflow menu. A hero card: status chip ("Overdue · Due Jun 28"), large total "$3,200.00", client + currency subtitle. A primary action row of buttons: **Mark Paid** (purple filled), **Share** (outline), **PDF** (icon button). Then sectioned white cards: **Bill To** (client name, email, phone), **Items** (line items with description + amount, then subtotal / tax / total), and **Payment** (bank/mobile-money details). Each section has an 11px uppercase muted label.

5. **Create / Edit Invoice** — a multi-section form optimized for mobile. Sections (collapsible or grouped, with the uppercase labels): **Your Company**, **Invoice Details** (number, invoice date, due date, currency), **Bill To** (client name, email, phone, address), **Line Items** (repeatable rows: description, qty, rate → auto-calculated amount, with an "Add item" button), **Tax & Discount**, **Notes**, **Payment Details**. A sticky bottom bar shows a live **running Total** on the left and a purple **Save / Send** button on the right. Clean inputs with rounded borders, clear labels, comfortable tap targets.

6. **Settings** — current user card (name, email, "Signed in with Google" / guest badge), a **Reminders** toggle with a "Remind me N days before due" stepper, app/theme info, and a **Log out** button.

**Also include:** a **dark mode** variant of the same system (dark neutral surfaces, same purple accent, same layout). Show empty states (e.g. "No invoices yet") and a couple of status variations.

Use realistic invoice content (client names like "Acme Co", "Doe Studio", "Beta LLC"; amounts; dates; USD). Keep everything consistent, gridded, and pixel-aligned. Prioritize clarity, generous spacing, and a premium-but-calm feel.
