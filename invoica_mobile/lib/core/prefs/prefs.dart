import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// SharedPreferences keys used for the first-run / session gates.
abstract final class PrefsKeys {
  static const String onboardingSeen = 'onboarding_seen';
  static const String guestSession = 'guest_session';
}

/// Overridden in main() (and in tests) with the real instance.
final sharedPreferencesProvider = Provider<SharedPreferences>(
  (ref) => throw UnimplementedError(
    'sharedPreferencesProvider must be overridden in ProviderScope',
  ),
);
