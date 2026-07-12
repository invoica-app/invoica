import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Analytics abstraction. Swap [DebugAnalytics] for a real backend
/// (Firebase, PostHog, ...) by overriding [analyticsProvider].
///
/// Event names in use:
/// - onboarding_viewed {slide}
/// - onboarding_get_started {slide}
/// - onboarding_login_tapped {slide}
/// - auth_option_selected {provider}
abstract class Analytics {
  void logEvent(String name, [Map<String, Object>? params]);
}

/// Prints events to the console in debug builds; no-op in release.
class DebugAnalytics implements Analytics {
  @override
  void logEvent(String name, [Map<String, Object>? params]) {
    if (kDebugMode) {
      debugPrint('[analytics] $name ${params ?? {}}');
    }
  }
}

final analyticsProvider = Provider<Analytics>((ref) => DebugAnalytics());
