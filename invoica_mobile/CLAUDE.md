# Invoica Mobile — CLAUDE.md

Flutter mobile companion app for **Invoica** (invoice management). This is a **separate, standalone Flutter codebase** that talks to the existing Spring Boot / Kotlin REST API in `../backend`. It does **not** share code with the Next.js web app in `../frontend`.

> Status: **Scaffolded (iOS-only for now; Android later).** Splash, onboarding carousel, sign-in (stubbed OAuth + working guest flow), and a home stub exist with passing widget tests. `flutter analyze` and `flutter test` must stay clean. Missing assets: Satoshi font files (pubspec `fonts:` block is commented out until they're added — see `assets/fonts/README.md`) and the sign-in wave SVGs (skipped silently — see `assets/images/brand/README.md`).
>
> Note: the current scaffold uses `shared_preferences` for first-run/guest flags and the **user-provided brand tokens** in `lib/core/theme/app_colors.dart` (primary `#AE00FF`, deep `#650093`) — these supersede the older `#9747E6` mockup palette in `docs/` where they conflict.

## What this app is

An **on-the-go companion** — not full feature parity (yet). It lets a freelancer/SMB owner:
- See money at a glance (outstanding vs. collected, status breakdown).
- Browse, view, create, and edit invoices.
- Mark invoices Sent/Paid, share the public link, view/share the PDF.
- Get reminders for due-soon and overdue invoices.

Deliberately **out of v1**: real payment-gateway collection, AI template-from-photo, Pro subscription/upgrade, admin dashboard, feedback. The architecture must not block adding these later.

## Tech stack & key decisions

- **Flutter** (stable channel), **Dart**. Chosen over React Native for UI polish; accepted tradeoff is no code sharing with the web app and learning Dart.
- **State management:** Riverpod (preferred) — see RFC for rationale. Confirm during planning before committing.
- **Networking:** `dio` (interceptors for auth + error handling) + typed models. Consider `retrofit`/`json_serializable` for codegen.
- **Auth:** `google_sign_in` → Google ID token → backend exchanges for app JWT. Guest login also supported. JWT in `flutter_secure_storage`.
- **Local notifications:** `flutter_local_notifications` for due-soon/overdue reminders (computed client-side from invoice `dueDate` + `status`). Remote push (FCM) is a fast-follow, not v1.
- **Targets:** iOS first (scaffolded with `--platforms ios`); Android later — so no Cupertino-specific widgets in shared UI, custom branded components only.
- **Routing:** `go_router` (`/splash`, `/onboarding`, `/signin?intent=signup|login`, `/home`). First-run gate via `shared_preferences` keys `onboarding_seen` / `guest_session` (`lib/core/prefs/prefs.dart`).
- **Analytics:** `Analytics` interface + `DebugAnalytics` in `lib/core/analytics/` (swap via `analyticsProvider`).

## Backend API (source of truth)

- Base URL is configurable per environment (e.g. `--dart-define=API_BASE_URL=...`). Local web app uses `http://localhost:8080/api`.
- Auth is **JWT Bearer** on every authenticated call: `Authorization: Bearer <token>`.
- Full, exact endpoint + DTO contracts are documented in **`docs/RFC.md`**. Treat that doc + the actual Kotlin source in `../backend/src/main/kotlin/com/invoicer` as the source of truth — **do not invent endpoints or fields.**
- If the mobile app needs something the API doesn't expose (e.g. an authenticated `GET /invoices/{id}/pdf`, or "client opened" push), that is a **backend change** and must be called out explicitly, not faked client-side.

## Conventions

- **Do not hallucinate API behavior.** Every network call must map to a real endpoint in `../backend`. When unsure, read the controller/DTO before coding.
- Match Dart/Flutter idioms: `snake_case` files, `PascalCase` types, `lowerCamelCase` members. `flutter analyze` clean; format with `dart format`.
- Models are immutable; map JSON ↔ Dart explicitly (or via codegen). Money is handled carefully (use `Decimal`/string-safe parsing, never naive doubles for currency math where avoidable — server is source of truth for totals).
- Follow TDD where practical (widget/unit tests for logic and API mapping). See the team's testing skill during implementation.
- Keep features in vertical slices: `lib/features/<feature>/` (data / domain / presentation), with shared infra in `lib/core/`.

## Useful commands (post-scaffold)

```bash
flutter pub get          # install deps
flutter run              # run on connected device/emulator
flutter analyze          # static analysis (must be clean)
dart format .            # format
flutter test             # run tests
```

## Pointers

- RFC / requirements: `docs/RFC.md`
- Backend API: `../backend/src/main/kotlin/com/invoicer/controller/`
- Backend DTOs: `../backend/src/main/kotlin/com/invoicer/dto/`
- Web app (reference for UX, not code): `../frontend`
