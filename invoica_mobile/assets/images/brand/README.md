# Brand assets

Expected files:

- `logo.svg` — Invoica logo mark (purple `#AE00FF`)
- `splash_bg.png` — splash screen background, soft white→lavender gradient (source: firstonboard.png)
- `auth_bg.png` — sign-in screen background, same gradient family (source: lastonboard.png)
- `wave_top.svg` — decorative wave, top-right of the sign-in screen (MISSING — skipped silently until added)
- `wave_bottom.svg` — decorative wave, anchored to the bottom of the sign-in screen (MISSING — skipped silently until added)
- `google.png` — Google "G" icon for the Google sign-in button (16px display size)
- `microsoft.png` — Microsoft icon for the Microsoft sign-in button (20px display size)

Google/Microsoft icons were provided as PNG rather than SVG; the buttons use `Image.asset` for them. Replace with SVGs later if desired (update `SignInScreen` accordingly).
