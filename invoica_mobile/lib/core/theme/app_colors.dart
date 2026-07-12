import 'package:flutter/material.dart';

/// Invoica brand palette. Single source of truth for colors — do not
/// hard-code hex values in widgets.
abstract final class AppColors {
  /// Primary brand purple.
  static const Color primary = Color(0xFFAE00FF);

  /// Full-screen image overlay: primary at 35% opacity.
  static const Color overlay = Color(0x59AE00FF);

  /// Deep purple — splash background, onboarding bottom panel, image fallback.
  static const Color deep = Color(0xFF650093);

  /// Secondary (filled) button fill on onboarding.
  static const Color buttonSecondary = Color(0xFF8901C8);

  /// Border of the secondary onboarding button.
  static const Color buttonSecondaryBorder = Color(0xFFC955FF);

  /// Secondary text (e.g. sign-in subhead).
  static const Color textSecondary = Color(0xFF363636);

  /// Muted text (captions, guest button label, "or" divider).
  static const Color textMuted = Color(0xFF6D6D6D);

  /// Hairline dividers (e.g. the "or" divider on sign-in).
  static const Color divider = Color(0xFFD9D9D9);

  static const Color white = Colors.white;
  static const Color black = Colors.black;

  /// Shared corner radius for buttons.
  static const double buttonRadius = 8;
}
