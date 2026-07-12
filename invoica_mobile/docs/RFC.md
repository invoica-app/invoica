# RFC: Invoica Mobile (Flutter Companion App)

- **Status:** Draft for review
- **Author:** Invoica team
- **Date:** 2026-06-25
- **Scope:** v1 — "on-the-go companion" for iOS + Android
- **Backend:** Existing Spring Boot / Kotlin REST API (`../backend`), unchanged for v1 except where explicitly flagged

---

## 1. Summary

Invoica Mobile is a standalone **Flutter** app that lets a freelancer or small-business owner manage invoices from their phone. It is a **companion** to the existing Next.js web app — not full parity. It reuses the existing REST API as-is and adds a clean, modern ("Dribbble-clean") mobile UI.

The single most important user value: **see what money is owed and act on it quickly** (mark paid, chase overdue, send a fresh invoice), with **reminders** so nothing slips.

### Non-goals (v1)
- Collecting invoice payments through a gateway (clients still pay off-platform via bank/MoMo details shown on the invoice).
- AI template-from-photo (`/api/ai/*`), Pro subscription/upgrade (`/api/subscription/*`), admin (`/api/admin/*`), feedback (`/api/feedback/*`).
- Offline-first / full local DB sync (basic caching only).

These are explicitly deferred; the architecture must leave room for them.

---

## 2. Users & top tasks

**Primary user:** the invoice *sender* (freelancer / SMB owner) who already uses the web app.

Top tasks, in priority order:
1. Glance at outstanding vs. collected and invoice status counts.
2. Find an invoice fast and open its detail.
3. Mark an invoice **Paid** (or **Sent**) in one or two taps.
4. Share an invoice (public link or PDF) with a client.
5. Create / edit an invoice on the go.
6. Be reminded of **due-soon** and **overdue** invoices.

The invoice *recipient* (client) is **not** a target user of this app in v1 (they use the public web link).

---

## 3. Tech & architecture

- **Framework:** Flutter (stable), Dart. Single codebase → iOS + Android.
- **State management:** Riverpod (testable, compile-safe, good for async/data-fetching). **Decided.**
- **Networking:** `dio` with interceptors (auth header injection, 401 handling, error normalization). Typed models with explicit JSON mapping (codegen via `json_serializable` optional).
- **Auth/session:** app JWT stored in `flutter_secure_storage`; attached as `Authorization: Bearer <token>`.
- **Notifications:** `flutter_local_notifications` (local scheduling, computed from invoice data). Remote push (FCM/APNs) deferred.
- **Config:** `API_BASE_URL` injected per build via `--dart-define`. No secrets committed.
- **Project layout (proposed):**
  ```
  lib/
    core/            # http client, auth, theme, router, errors, money utils, notifications
    features/
      auth/          # data / domain / presentation
      dashboard/
      invoices/      # list, detail, create-edit
      settings/
    shared/          # reusable widgets
  ```
- **Source-of-truth rule:** every API call maps to a real endpoint below. Totals/line-item amounts are authoritative from the server; the client may compute a live preview but must not overwrite server values.

---

## 4. API contracts (verified against backend)

> All authenticated endpoints require `Authorization: Bearer <jwt>`. Base path: `/api`.

### 4.1 Auth
| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| POST | `/auth/oauth/login` | `{ idToken: string, provider: "GOOGLE" \| "MICROSOFT" }` | `{ token, user }` | v1 uses `GOOGLE`. `token` is the app JWT. |
| POST | `/auth/guest/login` | _(none)_ | `{ token, user }` | Anonymous/guest session. |
| GET | `/auth/me` | — | `UserDto` | Validates session / hydrates current user. |

`UserDto = { id, email, name, provider, isGuest, isAdmin, plan }`.
`AuthProvider = GOOGLE | MICROSOFT | GUEST`. `plan` ∈ `FREE | PRO` (subscription not exposed in v1 UI).

### 4.2 Invoices
| Method | Path | Body / Params | Returns | Notes |
|---|---|---|---|---|
| GET | `/invoices` | `?status=&page=0&size=20` | `Page<InvoiceResponse>` | Sorted `createdAt` desc. `size` capped at 100. `status` optional filter. |
| GET | `/invoices/{id}` | — | `InvoiceResponse` | Owner only. |
| POST | `/invoices` | `CreateInvoiceRequest` | `InvoiceResponse` | Server computes totals + `publicToken`. |
| PUT | `/invoices/{id}` | `UpdateInvoiceRequest` (all fields optional, incl. `status`) | `InvoiceResponse` | **Mark Paid/Sent = PUT with `{status}` only.** |
| DELETE | `/invoices/{id}` | — | — | |
| POST | `/invoices/{id}/download` | — | _(records a download)_ | Increments `downloadCount`, sets `lastDownloadedAt`. |
| GET | `/invoices/dashboard-stats` | — | `UserDashboardStatsResponse` | Powers the home screen. |

### 4.3 Public (no auth) — used for share & PDF
| Method | Path | Returns | Notes |
|---|---|---|---|
| GET | `/invoices/public/{publicToken}` | `PublicInvoiceResponse` | Client-facing view. |
| GET | `/invoices/public/{publicToken}/pdf` | PDF bytes | **The grounded way to fetch a PDF of an existing invoice** (no auth needed; `publicToken` is on `InvoiceResponse`). |
| POST | `/invoices/pdf-preview` | PDF bytes | Auth; takes a full `CreateInvoiceRequest` (used for preview before save). |

> ⚠️ There is **no** authenticated `GET /invoices/{id}/pdf`. v1 will fetch existing-invoice PDFs via the public token endpoint. If a strictly-authenticated per-id PDF is later required, that is a **backend change**.

### 4.4 Key DTO shapes (abridged — see `../backend/.../dto/InvoiceDto.kt`)
- `InvoiceResponse`: company block, invoice meta (`invoiceNumber`, `invoiceDate`, `dueDate`), design (`primaryColor`, `fontFamily`, `templateId`), `currency`, client "Bill To" block, `taxRate`, `discount`, `notes`, payment block (MoMo + bank fields), `lineItems[]`, `totalAmount`, `status`, `downloadCount`, `lastDownloadedAt`, `publicToken`, `createdAt`, `updatedAt`.
- `LineItem`: `{ description, quantity:int, rate:decimal, amount:decimal }` (amount server-computed).
- `CreateInvoiceRequest` required fields: `companyName, address, city, zipCode, country, phone, companyEmail, invoiceNumber, invoiceDate, dueDate, clientEmail, lineItems[]`. Optional: client block, tax/discount/notes, payment block, design, `currency` (default `USD`).
- Validation to mirror client-side: `primaryColor` hex `^#[0-9a-fA-F]{6}$`; `clientPhone` `^\+[1-9]\d{6,14}$`; `taxRate` 0–100; `discount` ≥ 0; `quantity` positive; `rate` ≥ 0; emails valid.
- `InvoiceStatus = DRAFT | SENT | PAID | CANCELLED`.
- `UserDashboardStatsResponse = { revenueByMonth[{month,currency,total}], statusBreakdown: Map<status,count>, collections{collected,outstanding,currency,period}, availableCurrencies[] }`.

---

## 5. Feature requirements

Each feature lists: **purpose**, **screens**, **behavior**, **APIs**, **acceptance criteria**.

### 5.1 Authentication & session
- **Purpose:** get the user signed in and keep the JWT valid.
- **Screens:** Splash/bootstrap; Login (Google button + "Continue as guest").
- **Behavior:**
  - On launch, read JWT from secure storage; if present, call `GET /auth/me`. Success → Home. 401/absent → Login.
  - Google: `google_sign_in` → `idToken` → `POST /auth/oauth/login {idToken, provider:"GOOGLE"}` → store `token`, cache `user`.
  - Guest: `POST /auth/guest/login`.
  - Logout: clear secure storage + cached state → Login.
  - A `dio` interceptor attaches the Bearer token and, on 401, routes to Login.
- **Acceptance:** returning user with a valid token lands on Home without re-login; expired/invalid token cleanly forces re-login; guest can use the app and is visibly labeled as guest.

### 5.2 Home / Dashboard
- **Purpose:** money at a glance.
- **Screen:** Dashboard with: Outstanding vs. Collected (primary), status breakdown (Draft/Sent/Paid/Cancelled counts), revenue trend (simple bar/line), currency context.
- **Behavior:** fetch `GET /invoices/dashboard-stats`; pull-to-refresh; loading/empty/error states; tapping a status segment deep-links to the filtered invoice list. Multi-currency: respect `collections.currency` / `availableCurrencies` (don't sum across currencies).
- **APIs:** `GET /invoices/dashboard-stats`.
- **Acceptance:** numbers match the web dashboard for the same account; empty account shows a friendly zero-state; never sums mixed currencies into one figure.

### 5.3 Invoice list
- **Purpose:** find and triage invoices.
- **Screen:** scrollable list of invoice cards (client/company, number, amount+currency, due date, status chip), with filter tabs (All / Draft / Sent / Paid; **Overdue** derived client-side: `status==SENT && dueDate < today`).
- **Behavior:** paginated infinite scroll (`page`/`size`); server filter via `?status=` for real statuses; "Overdue" applied as a client-side filter over fetched SENT items (documented limitation: it filters the loaded page set, not a server query). Pull-to-refresh. Search by client/number is **client-side over loaded pages** in v1 (no server search endpoint — do not fake one). Tap → detail. Loading/empty/error states.
- **APIs:** `GET /invoices?status=&page=&size=`.
- **Acceptance:** scrolling loads more without dupes; status tabs filter correctly; tapping opens the right invoice; overdue tab visibly explains it reflects loaded items.

### 5.4 Invoice detail
- **Purpose:** full view + primary actions.
- **Screen:** header (number, status chip, total, currency, due date), Bill-To, line items table, subtotal/tax/discount/total, payment details (bank/MoMo), notes. Action bar: **Mark Paid**, **Mark Sent**, **Share link**, **View/Share PDF**, **Edit**, **Delete** (confirm).
- **Behavior:**
  - Mark Paid/Sent → `PUT /invoices/{id} {status}` → optimistic chip update with rollback on failure.
  - Share link → share `publicToken` URL (web public route).
  - View/Share PDF → `GET /invoices/public/{publicToken}/pdf` → save to temp → open/share sheet; optionally `POST /invoices/{id}/download` to record.
  - Delete → confirm dialog → `DELETE /invoices/{id}` → back to list.
- **APIs:** `GET /invoices/{id}`, `PUT /invoices/{id}`, `DELETE /invoices/{id}`, `GET /invoices/public/{publicToken}/pdf`, `POST /invoices/{id}/download`.
- **Acceptance:** status change persists and reflects on Home; PDF opens and is shareable; delete removes it and returns to an updated list; destructive actions are confirmed.

### 5.5 Create / edit invoice
- **Purpose:** issue or amend an invoice from the phone.
- **Screen:** sectioned form (mobile-friendly, multi-step or grouped scroll): Your company, Invoice meta (number/date/due/currency), Bill-To client, **Line items** (add/remove rows: description, qty, rate → live amount), Tax/Discount/Notes, Payment details, Email (subject/message). Live running **total preview** (client-side; server is authoritative on save).
- **Behavior:**
  - Create → `POST /invoices` with `CreateInvoiceRequest`. Edit → `PUT /invoices/{id}` with changed fields.
  - Client-side validation mirrors backend rules (§4.4) with inline errors before submit.
  - Currency picker from `availableCurrencies` (fallback to a sane default list incl. `USD`).
  - Map server 400 validation errors back onto the right fields.
- **APIs:** `POST /invoices`, `PUT /invoices/{id}`, (optional preview) `POST /invoices/pdf-preview`.
- **Acceptance:** a valid form creates an invoice that appears in the list; invalid input is blocked client-side and any server validation error is surfaced on the offending field; editing updates the invoice; total preview matches server `totalAmount` after save.

### 5.6 Notifications (reminders)
- **Purpose:** make sure overdue/due-soon invoices aren't forgotten.
- **Behavior (v1, no backend change):** on refresh/app open, compute from loaded invoices:
  - **Overdue:** `status==SENT && dueDate < today`.
  - **Due soon:** `status==SENT && today <= dueDate <= today+N` (N configurable, default 3 days).
  - Schedule **local** notifications via `flutter_local_notifications` (e.g., a daily digest: "3 invoices overdue, 1 due in 2 days"). Tapping opens the filtered list. Respect OS notification permission; degrade gracefully if denied.
- **APIs:** none new (derives from `/invoices`).
- **Acceptance:** with at least one overdue invoice, a local reminder is scheduled and tapping it deep-links to the overdue list; no reminders when nothing is due; works with permission granted, silently skips when denied.
- **Fast-follow (flagged, not v1):** *"Client opened your invoice"* push — backend would emit on public-view/download (data already tracked via `downloadCount`/`lastDownloadedAt`) and deliver via FCM/APNs. Requires backend + remote-push work; out of v1.

### 5.7 Settings / profile
- **Purpose:** account + app prefs.
- **Screen:** current user (name/email/provider, guest badge, `plan`), reminder lead-time (N days) + enable/disable, environment/API info (debug), logout.
- **APIs:** `GET /auth/me` (refresh).
- **Acceptance:** logout clears session; reminder preference persists and affects scheduling.

---

## 6. Cross-cutting requirements

- **Error handling:** every network call has loading / empty / error states with retry. 401 → re-auth. Normalize server error bodies into user-readable messages.
- **Theming:** light + dark; clean modern visual system (typography scale, spacing, rounded cards, accent color — final visual direction to be set via mockups). Honor invoice `primaryColor` where it represents brand (e.g., on previews) without breaking app theme.
- **Money & dates:** format per invoice `currency`; never arithmetic across currencies; dates shown locale-aware; server remains source of truth for `totalAmount` and line `amount`.
- **Accessibility:** sufficient contrast, scalable text, tap targets ≥ 44px, semantic labels on actions.
- **Security:** JWT only in secure storage; no token logging; HTTPS in non-local builds; no secrets in repo.
- **Performance:** list pagination; image/logo caching; avoid rebuild storms (scoped Riverpod providers).
- **Testing:** unit tests for JSON mapping, money/overdue logic, auth flow; widget tests for key screens; mock the API layer. Follow TDD where practical.
- **Analytics/observability (optional v1):** lightweight error logging hook; no PII.

## 7. Milestones (suggested; detailed sequencing in the implementation plan)

1. **Scaffold & core:** Flutter project, theme, router, dio client + auth interceptor, secure storage, config.
2. **Auth:** Google + guest login, bootstrap/session, logout.
3. **Invoice list + detail (read):** pagination, filters, detail view, PDF view/share.
4. **Actions:** mark Paid/Sent, delete, share link.
5. **Create/edit:** form, validation, line items, totals.
6. **Dashboard:** stats screen + deep links.
7. **Reminders:** local notifications + settings.
8. **Polish:** empty/error states, accessibility, dark mode, visual refinement.

## 8. Decisions & open questions
**Decided:**
- State management: **Riverpod**.
- Sign-in: **Google + Guest only** for v1 (Microsoft deferred, though backend supports it).

**Decided (visual):**
- Visual direction: **Minimal Light** — airy/neutral surfaces, white cards with hairline borders, single purple (`#9747E6`) accent, soft shadows, calm & professional. Dark mode is a tinted variant of the same system.

**Open:**
1. Screen-level layouts (validating via mockups: list, detail, create).
2. Minimum OS versions / device targets.
3. Is a strictly-authenticated per-id PDF endpoint needed, or is the public-token PDF acceptable for v1? (Affects whether a backend change is scheduled.)

## 9. Risks & mitigations
- **"Payment notification" expectation gap:** true auto "you got paid" needs gateway collection (not in backend). Mitigated by reframing v1 as reminders + manual mark-paid, with gateway collection as a separate future RFC.
- **No server-side search:** v1 search is client-side over loaded pages. Mitigation: document clearly; add a backend search endpoint later if needed.
- **PDF via public token:** acceptable but couples PDF access to the shareable token. Mitigation: revisit if a private PDF endpoint becomes necessary.
- **Dart learning curve / separate codebase:** accepted tradeoff for UI quality; mitigated by clear structure + tests.
