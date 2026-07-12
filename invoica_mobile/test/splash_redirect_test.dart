import 'package:flutter_test/flutter_test.dart';
import 'package:invoica_mobile/core/router/app_router.dart';

void main() {
  group('resolvePostSplashRoute', () {
    test('first run goes to onboarding', () {
      expect(
        resolvePostSplashRoute(onboardingSeen: false, guestSession: false),
        Routes.onboarding,
      );
    });

    test('onboarding seen, no session goes to sign-in', () {
      expect(
        resolvePostSplashRoute(onboardingSeen: true, guestSession: false),
        Routes.signIn,
      );
    });

    test('guest session goes straight home', () {
      expect(
        resolvePostSplashRoute(onboardingSeen: true, guestSession: true),
        Routes.home,
      );
    });
  });
}
