import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Invoica type scale (Satoshi). All sizes live here so they can be tuned in
/// one place — e.g. we may bump button/body text from 12 to 14 for
/// accessibility after review.
///
/// Until the Satoshi .otf files are added (see assets/fonts/README.md),
/// Flutter silently falls back to the system font for this family.
abstract final class AppTypography {
  static const String fontFamily = 'Satoshi';

  /// Onboarding headlines. Satoshi Bold 40, line-height 49.
  /// Color-inheriting — apply color at the call site.
  static const TextStyle display = TextStyle(
    fontFamily: fontFamily,
    fontWeight: FontWeight.w700,
    fontSize: 40,
    height: 49 / 40,
  );

  /// Screen titles ("Sign in to Invoica"). Satoshi Bold 20.
  static const TextStyle title = TextStyle(
    fontFamily: fontFamily,
    fontWeight: FontWeight.w700,
    fontSize: 20,
    color: AppColors.black,
  );

  /// Body / button labels. Satoshi Medium 12.
  static const TextStyle body = TextStyle(
    fontFamily: fontFamily,
    fontWeight: FontWeight.w500,
    fontSize: 12,
    color: AppColors.black,
  );

  /// Fine print. Satoshi Regular 8, letter-spacing 0.72.
  static const TextStyle caption = TextStyle(
    fontFamily: fontFamily,
    fontWeight: FontWeight.w400,
    fontSize: 8,
    letterSpacing: 0.72,
    color: AppColors.textMuted,
  );

  static TextTheme get textTheme => const TextTheme(
        displayLarge: display,
        titleLarge: title,
        bodyMedium: body,
        bodySmall: caption,
      );
}
