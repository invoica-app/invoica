import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/sign_in_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../features/splash/splash_screen.dart';

abstract final class Routes {
  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String signIn = '/signin';
  static const String home = '/home';

  static String signInWithIntent(SignInIntent intent) =>
      '$signIn?intent=${intent.name}';
}

/// Where the splash screen sends the user once the minimum display time has
/// elapsed. Pure so it can be unit-tested without pumping widgets.
String resolvePostSplashRoute({
  required bool onboardingSeen,
  required bool guestSession,
}) {
  if (!onboardingSeen) return Routes.onboarding;
  if (guestSession) return Routes.home;
  return Routes.signIn;
}

/// Why the user landed on the sign-in screen; tweaks its copy.
enum SignInIntent { signup, login }

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: Routes.splash,
    routes: [
      GoRoute(
        path: Routes.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: Routes.onboarding,
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: Routes.signIn,
        builder: (context, state) {
          final intent = state.uri.queryParameters['intent'] == 'signup'
              ? SignInIntent.signup
              : SignInIntent.login;
          return SignInScreen(intent: intent);
        },
      ),
      GoRoute(
        path: Routes.home,
        builder: (context, state) => const HomeScreen(),
      ),
    ],
  );
});
