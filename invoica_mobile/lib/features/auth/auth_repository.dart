import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/prefs/prefs.dart';

enum AuthOutcome {
  /// Signed in (or guest session started) — proceed to the app.
  success,

  /// Provider not wired up yet — surface "Coming soon".
  notImplemented,
}

/// Auth entry points. OAuth is a separate ticket: swap [StubAuthRepository]
/// for a real implementation by overriding [authRepositoryProvider] — the
/// UI only depends on this interface.
abstract class AuthRepository {
  Future<AuthOutcome> signInWithGoogle();
  Future<AuthOutcome> signInWithMicrosoft();
  Future<AuthOutcome> continueAsGuest();
}

class StubAuthRepository implements AuthRepository {
  StubAuthRepository(this._prefs);

  final SharedPreferences _prefs;

  @override
  Future<AuthOutcome> signInWithGoogle() async => AuthOutcome.notImplemented;

  @override
  Future<AuthOutcome> signInWithMicrosoft() async =>
      AuthOutcome.notImplemented;

  @override
  Future<AuthOutcome> continueAsGuest() async {
    await _prefs.setBool(PrefsKeys.guestSession, true);
    return AuthOutcome.success;
  }
}

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => StubAuthRepository(ref.watch(sharedPreferencesProvider)),
);
