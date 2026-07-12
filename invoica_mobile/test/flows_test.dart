import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:invoica_mobile/app.dart';
import 'package:invoica_mobile/core/analytics/analytics.dart';
import 'package:invoica_mobile/core/prefs/prefs.dart';
import 'package:invoica_mobile/features/auth/sign_in_screen.dart';
import 'package:invoica_mobile/features/home/home_screen.dart';
import 'package:invoica_mobile/features/onboarding/onboarding_screen.dart';
import 'package:invoica_mobile/features/splash/splash_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<SharedPreferences> prefsWith([Map<String, Object> values = const {}]) {
  SharedPreferences.setMockInitialValues(values);
  return SharedPreferences.getInstance();
}

Widget app(SharedPreferences prefs, {Analytics? analytics}) => ProviderScope(
  overrides: [
    sharedPreferencesProvider.overrideWithValue(prefs),
    if (analytics != null) analyticsProvider.overrideWithValue(analytics),
  ],
  child: const InvoicaApp(),
);

/// Pump past the splash screen's minimum display time.
Future<void> passSplash(WidgetTester tester) async {
  await tester.pump(
    SplashScreen.minDisplayTime + const Duration(milliseconds: 100),
  );
  await tester.pumpAndSettle();
}

/// Records logged events so tests can assert on names and params.
class FakeAnalytics implements Analytics {
  final events = <(String, Map<String, Object>?)>[];

  @override
  void logEvent(String name, [Map<String, Object>? params]) {
    events.add((name, params));
  }
}

void expectLastEvent(
  FakeAnalytics analytics,
  String name,
  Map<String, Object> params,
) {
  expect(analytics.events, isNotEmpty);
  expect(analytics.events.last.$1, name);
  expect(analytics.events.last.$2, params);
}

void main() {
  group('splash redirect', () {
    testWidgets('first run lands on onboarding', (tester) async {
      final prefs = await prefsWith();
      await tester.pumpWidget(app(prefs));
      expect(find.byType(SplashScreen), findsOneWidget);
      await passSplash(tester);
      expect(find.byType(OnboardingScreen), findsOneWidget);
    });

    testWidgets('onboarding seen lands on sign-in', (tester) async {
      final prefs = await prefsWith({PrefsKeys.onboardingSeen: true});
      await tester.pumpWidget(app(prefs));
      await passSplash(tester);
      expect(find.byType(SignInScreen), findsOneWidget);
    });

    testWidgets('guest session lands on home', (tester) async {
      final prefs = await prefsWith({
        PrefsKeys.onboardingSeen: true,
        PrefsKeys.guestSession: true,
      });
      await tester.pumpWidget(app(prefs));
      await passSplash(tester);
      expect(find.byType(HomeScreen), findsOneWidget);
    });
  });

  group('onboarding carousel', () {
    testWidgets('swiping advances the page and the dots', (tester) async {
      final handle = tester.ensureSemantics();
      final prefs = await prefsWith();
      await tester.pumpWidget(app(prefs));
      await passSplash(tester);

      expect(find.bySemanticsLabel('Page 1 of 3'), findsOneWidget);

      await tester.drag(find.byType(PageView), const Offset(-400, 0));
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('Page 2 of 3'), findsOneWidget);

      await tester.drag(find.byType(PageView), const Offset(-400, 0));
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('Page 3 of 3'), findsOneWidget);

      handle.dispose();
    });

    testWidgets('Get Started marks onboarding seen and opens sign-up intent', (
      tester,
    ) async {
      final prefs = await prefsWith();
      await tester.pumpWidget(app(prefs));
      await passSplash(tester);

      await tester.tap(find.text('Get Started'));
      await tester.pumpAndSettle();

      expect(prefs.getBool(PrefsKeys.onboardingSeen), isTrue);
      expect(find.byType(SignInScreen), findsOneWidget);
      expect(find.text('Create your Invoica account'), findsOneWidget);
    });

    testWidgets('"I already have an account" opens login intent', (
      tester,
    ) async {
      final prefs = await prefsWith();
      await tester.pumpWidget(app(prefs));
      await passSplash(tester);

      await tester.tap(find.text('I already have an account'));
      await tester.pumpAndSettle();

      expect(prefs.getBool(PrefsKeys.onboardingSeen), isTrue);
      expect(find.byType(SignInScreen), findsOneWidget);
      expect(find.text('Sign in to Invoica'), findsOneWidget);
    });
  });

  group('sign-in', () {
    testWidgets('guest flow sets guest_session and reaches home', (
      tester,
    ) async {
      final prefs = await prefsWith({PrefsKeys.onboardingSeen: true});
      await tester.pumpWidget(app(prefs));
      await passSplash(tester);
      expect(find.byType(SignInScreen), findsOneWidget);

      await tester.tap(find.text('Continue as guest'));
      await tester.pumpAndSettle();

      expect(prefs.getBool(PrefsKeys.guestSession), isTrue);
      expect(find.byType(HomeScreen), findsOneWidget);
      expect(find.text('Guest session'), findsOneWidget);
    });

    testWidgets('Google shows Coming soon and stays on sign-in', (
      tester,
    ) async {
      final prefs = await prefsWith({PrefsKeys.onboardingSeen: true});
      await tester.pumpWidget(app(prefs));
      await passSplash(tester);

      await tester.tap(find.text('Continue with Google'));
      await tester.pump();

      expect(find.text('Coming soon'), findsOneWidget);
      expect(find.byType(SignInScreen), findsOneWidget);
    });

    testWidgets('Microsoft shows Coming soon and stays on sign-in', (
      tester,
    ) async {
      final prefs = await prefsWith({PrefsKeys.onboardingSeen: true});
      await tester.pumpWidget(app(prefs));
      await passSplash(tester);

      await tester.tap(find.text('Continue with Microsoft'));
      await tester.pump();

      expect(find.text('Coming soon'), findsOneWidget);
      expect(find.byType(SignInScreen), findsOneWidget);
    });
  });

  group('analytics', () {
    testWidgets('events fire with correct names and params', (tester) async {
      final analytics = FakeAnalytics();
      final prefs = await prefsWith();
      await tester.pumpWidget(app(prefs, analytics: analytics));
      await passSplash(tester);

      expectLastEvent(analytics, 'onboarding_viewed', {'slide': 1});

      await tester.drag(find.byType(PageView), const Offset(-400, 0));
      await tester.pumpAndSettle();
      expectLastEvent(analytics, 'onboarding_viewed', {'slide': 2});

      await tester.tap(find.text('Get Started'));
      await tester.pumpAndSettle();
      expectLastEvent(analytics, 'onboarding_get_started', {'slide': 2});

      await tester.tap(find.text('Continue as guest'));
      await tester.pumpAndSettle();
      expectLastEvent(analytics, 'auth_option_selected', {'provider': 'guest'});
    });
  });
}
