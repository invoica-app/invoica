import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/prefs/prefs.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/widgets/svg_or_fallback.dart';

/// Brand splash on the soft white→lavender gradient. Shows for at least
/// [minDisplayTime], then redirects based on the first-run / guest-session
/// flags.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  static const Duration minDisplayTime = Duration(milliseconds: 1200);

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future<void>.delayed(SplashScreen.minDisplayTime, _redirect);
  }

  void _redirect() {
    if (!mounted) return;
    final prefs = ref.read(sharedPreferencesProvider);
    final target = resolvePostSplashRoute(
      onboardingSeen: prefs.getBool(PrefsKeys.onboardingSeen) ?? false,
      guestSession: prefs.getBool(PrefsKeys.guestSession) ?? false,
    );
    context.go(target);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            'assets/images/brand/splash_bg.png',
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) =>
                const ColoredBox(color: AppColors.white),
          ),
          const Center(
            child: SvgOrFallback(
              'assets/images/brand/logo.svg',
              height: 99,
              fallback: Text(
                'Invoica',
                style: TextStyle(
                  fontFamily: AppTypography.fontFamily,
                  fontWeight: FontWeight.w700,
                  fontSize: 32,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
