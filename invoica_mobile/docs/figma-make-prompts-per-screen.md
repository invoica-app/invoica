# Figma Make prompts — per screen (high fidelity)

Run these **one at a time** in Figma Make. Each is self-contained: it repeats the shared design system so every screen comes out consistent. Order suggested: Login → Dashboard → List → Detail → Create/Edit → Settings.

The shared block below is embedded in every prompt — you don't need to paste it separately, but it's here for reference.

## Shared design system (embedded in each prompt)

> **Invoica** invoice app, **iOS + Android**, portrait phone (393×852). Aesthetic: **"Minimal Light"** — airy, calm, professional; whitespace; white cards on light neutral bg; hairline borders; soft shadows; rounded corners; single purple accent used sparingly (Linear/Stripe-clean).
> Tokens — bg `#F6F6F8`, surface `#FFFFFF`, border `#ECECF0`, text `#15151B`, muted `#6B6B72`, accent `#9747E6`. Status: Paid green `#2E9E5B`/`#E6F6EC`, Sent purple `#9747E6`/`#EFEAFB`, Overdue red `#E5484D`/`#FDEAEA`, Draft gray `#6B6B72`/`#F0F0F2`. Type: Inter; money large+bold; headings 20–30px bold; body 13–14px; labels 11px uppercase letter-spaced muted. Radius: cards 16, hero 20, buttons 14, chips full. Shadows very soft (`0 4px 14px rgba(0,0,0,.06)`). Bottom nav: **Home · Invoices · Settings** + centered raised purple **"+"** FAB; active tab purple.

---

## 1 — Login

Design the **Login screen** for **Invoica** (invoice app), iOS+Android portrait (393×852), aesthetic "Minimal Light": airy, white surfaces on `#F6F6F8`, hairline borders `#ECECF0`, text `#15151B` / muted `#6B6B72`, purple accent `#9747E6`, Inter type, soft shadows, rounded corners (buttons 14px).

Layout, vertically centered with generous whitespace:
- Top third: the **Invoica** wordmark/logo (simple, modern) with a one-line tagline "Invoices, sorted." in muted text.
- A primary **"Continue with Google"** button — full-width, white surface with hairline border, Google "G" logo on the left, dark label, subtle shadow.
- Below it, a full-width **purple** primary button is NOT used here; instead a secondary text link **"Continue as guest"** centered in muted text.
- Footer: tiny muted legal line "By continuing you agree to our Terms & Privacy."
- No bottom nav on this screen.

Show both **light and dark** variants. Premium, calm, lots of breathing room.

---

## 2 — Home / Dashboard

Design the **Home / Dashboard screen** for **Invoica**, iOS+Android portrait (393×852), "Minimal Light" system: bg `#F6F6F8`, white cards, border `#ECECF0`, text `#15151B`/muted `#6B6B72`, accent `#9747E6`, status colors Paid green `#2E9E5B`/`#E6F6EC`, Overdue red `#E5484D`/`#FDEAEA`, Sent purple `#EFEAFB`, Inter type, card radius 16 / hero 20, soft shadows.

Content top → bottom:
- **Header:** "Good morning," (muted) over "James 👋" (bold), with a round avatar on the right.
- **Hero card** (white, radius 20): label "Outstanding" (muted), large bold figure **$12,480.00**, and "▲ 8% vs last month" in purple.
- **Two stat cards** side by side: **Collected** $8,200 (value in green) and **Overdue** $2,100 (value in red), each white with muted label.
- **Status chips** row: pills "Sent 6" (purple tint), "Paid 14" (green tint), "Draft 3" (gray tint).
- **Revenue chart:** a clean **6-month bar chart** in a white card, bars in purple, muted month labels (Jan–Jun), small "Revenue" heading.
- **Recent** section heading, then 2–3 compact invoice rows (client name bold, "#1042 · Due Jun 28" muted, amount bold right-aligned, small status chip).
- **Bottom tab bar:** Home (active, purple) · Invoices · centered raised purple **"+"** FAB · Settings.

Include a **dark mode** variant. Pixel-aligned, calm, premium.

---

## 3 — Invoice List

Design the **Invoice List screen** for **Invoica**, iOS+Android portrait (393×852), "Minimal Light": bg `#F6F6F8`, white cards, border `#ECECF0`, text `#15151B`/muted `#6B6B72`, accent `#9747E6`, status tints Paid `#E6F6EC`/green `#2E9E5B`, Sent `#EFEAFB`/purple, Overdue `#FDEAEA`/red `#E5484D`, Draft `#F0F0F2`/gray, Inter, card radius 16, chips full-rounded, soft shadows.

Content:
- **Header:** large bold title "Invoices" with a search icon button (white, hairline border, rounded) on the right.
- **Filter pills** (horizontal, scrollable): **All** (selected = solid purple, white text), then Overdue, Sent, Paid, Draft (white, hairline border, muted text).
- **Invoice cards list** (≈6 cards, vertical, gap ~10px). Each white card row: left = client name (bold 14px) + secondary line ("Overdue · #1042" or "Due Jul 2 · #1043" or "Paid Jun 20 · #1041", muted — overdue secondary text in red); right = amount (bold 15px) above a small status chip. **Overdue cards** have a 3px red left-edge accent. Mix statuses realistically (Acme Co overdue $3,200; Beta LLC sent $980; Doe Studio paid $1,500; Nova Inc draft $5,400; Acme Co paid $2,100).
- **Bottom tab bar:** Home · Invoices (active, purple) · centered raised purple **"+"** FAB · Settings.

Also show an **empty state** ("No invoices yet" with a subtle illustration and a purple "Create your first invoice" button) and a **dark mode** variant.

---

## 4 — Invoice Detail

Design the **Invoice Detail screen** for **Invoica**, iOS+Android portrait (393×852), "Minimal Light": bg `#F6F6F8`, white cards, border `#ECECF0`, text `#15151B`/muted `#6B6B72`, accent `#9747E6`, status Overdue red `#E5484D`/`#FDEAEA`, Paid green `#2E9E5B`, Inter, card radius 16 / hero 20, section labels 11px uppercase letter-spaced muted, soft shadows.

Content (scrollable):
- **Top bar:** back chevron · "Invoice #1042" (bold) · overflow "⋯" menu.
- **Hero card** (white, centered): status chip "Overdue · Due Jun 28" (red tint), large bold total **$3,200.00**, subtitle "Acme Co · USD" (muted).
- **Action row** (3 buttons): **Mark Paid** (full purple, white text, primary) · **Share** (white, hairline border) · **PDF** (square icon button, white, hairline border).
- **Bill To** card: uppercase label, "Acme Co" bold, "billing@acme.com · +1 555 0142" muted.
- **Items** card: uppercase label "Items"; rows "Design work · 20h … $2,400", "Hosting · 4mo … $800"; divider; "Subtotal $3,200" (muted), bold "Total $3,200.00".
- **Payment** card: uppercase label, "Bank transfer · GTBank · 0123456789".
- **Bottom tab bar** present (Invoices active).

Show a **Paid** state variant too (green chip, "Mark Paid" replaced by "Marked Paid ✓" / disabled), plus **dark mode**.

---

## 5 — Create / Edit Invoice

Design the **Create / Edit Invoice screen** for **Invoica**, iOS+Android portrait (393×852), "Minimal Light": bg `#F6F6F8`, white input surfaces, border `#ECECF0`, text `#15151B`/muted `#6B6B72`, accent `#9747E6`, Inter, input/card radius 14–16, section labels 11px uppercase letter-spaced muted, comfortable tap targets, soft shadows.

A **multi-section mobile form** (scrollable, grouped sections each with an uppercase label and white cards):
- **Top bar:** "New Invoice" (or "Edit Invoice"), close "✕" left.
- **Your Company:** company name, email, phone, address inputs (some pre-filled).
- **Invoice Details:** invoice number, invoice date (date field), due date (date field), currency dropdown (USD).
- **Bill To:** client name, client email, client phone, client address.
- **Line Items:** repeatable rows — each row has description (wide), quantity (small), rate (small), and an auto-calculated **amount** shown bold on the right; a dashed **"+ Add item"** button below; show 2 example rows.
- **Tax & Discount:** tax rate (%) and discount inputs side by side.
- **Notes:** multiline text area.
- **Payment Details:** method selector (Bank / Mobile money) revealing relevant fields (bank name, account name, account number).
- **Sticky bottom bar** (always visible): left shows live **Total $3,200.00** (bold), right shows a **purple "Save & Send"** button; a secondary "Save draft" text link.

Clean inputs with clear labels above fields, inline validation example (one field showing a red error "Required"). Include **dark mode**.

---

## 6 — Settings

Design the **Settings screen** for **Invoica**, iOS+Android portrait (393×852), "Minimal Light": bg `#F6F6F8`, white cards, border `#ECECF0`, text `#15151B`/muted `#6B6B72`, accent `#9747E6`, Inter, card radius 16, soft shadows.

Content:
- **Header:** "Settings" bold title.
- **User card:** round avatar, "James Amo" (bold), "artisanworld95@gmail.com" (muted), and a small pill "Signed in with Google" (purple tint). (Show a "Guest" badge variant too.)
- **Reminders** card: a row "Due-date reminders" with a purple **toggle (on)**; a sub-row "Remind me _3_ days before due" with a small stepper control.
- **Preferences** card: rows for "Appearance" (Light/Dark/System), "Default currency (USD)" — each row with label + chevron.
- **About** card: rows "Help & feedback", "Terms", "Privacy", app version "v1.0.0" muted.
- **Log out** button — full-width, white with hairline border, red text.
- **Bottom tab bar:** Settings active (purple).

Include **dark mode** variant.
