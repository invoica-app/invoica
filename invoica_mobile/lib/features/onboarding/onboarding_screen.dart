import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/analytics/analytics.dart';
import '../../core/prefs/prefs.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import 'onboarding_slide.dart';

/// 3-slide swipe carousel. No auto-advance. Both CTAs appear on every slide
/// and mark onboarding as seen before moving to sign-in.
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  static const double panelHeight = 203;

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;

  @override
  void initState() {
    super.initState();
    ref.read(analyticsProvider).logEvent('onboarding_viewed', {'slide': 1});
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onPageChanged(int page) {
    setState(() => _page = page);
    ref
        .read(analyticsProvider)
        .logEvent('onboarding_viewed', {'slide': page + 1});
  }

  Future<void> _finish(SignInIntent intent) async {
    final analytics = ref.read(analyticsProvider);
    analytics.logEvent(
      intent == SignInIntent.signup
          ? 'onboarding_get_started'
          : 'onboarding_login_tapped',
      {'slide': _page + 1},
    );
    await ref
        .read(sharedPreferencesProvider)
        .setBool(PrefsKeys.onboardingSeen, true);
    if (!mounted) return;
    context.go(Routes.signInWithIntent(intent));
  }

  @override
  Widget build(BuildContext context) {
    // Grow the panel by the home-indicator inset so the SafeArea below doesn't
    // eat into the 203pt of usable content.
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    return Scaffold(
      backgroundColor: AppColors.deep,
      body: Stack(
        fit: StackFit.expand,
        children: [
          PageView.builder(
            controller: _controller,
            onPageChanged: _onPageChanged,
            itemCount: onboardingSlides.length,
            itemBuilder: (context, index) => OnboardingSlide(
              data: onboardingSlides[index],
              panelHeight: OnboardingScreen.panelHeight + bottomInset,
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            // No fill color: the slide images fade to purple at the bottom by
            // design, so the full-bleed image shows through behind the CTAs.
            // (When an image is missing, the slide's deep-purple fallback
            // already covers this area.)
            child: SizedBox(
              height: OnboardingScreen.panelHeight + bottomInset,
              width: double.infinity,
              child: SafeArea(
                top: false,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _Dots(current: _page, count: onboardingSlides.length),
                    _GetStartedButton(
                      onPressed: () => _finish(SignInIntent.signup),
                    ),
                    _HaveAccountButton(
                      onPressed: () => _finish(SignInIntent.login),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Dots extends StatelessWidget {
  const _Dots({required this.current, required this.count});

  final int current;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      liveRegion: true,
      label: 'Page ${current + 1} of $count',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < count; i++)
            AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOut,
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: i == current ? 36 : 9,
              height: 6,
              decoration: BoxDecoration(
                color: i == current ? AppColors.white : Colors.white54,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
        ],
      ),
    );
  }
}

class _GetStartedButton extends StatelessWidget {
  const _GetStartedButton({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 275,
      height: 39,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.white,
          foregroundColor: AppColors.black,
        ),
        child: const Text('Get Started', style: AppTypography.body),
      ),
    );
  }
}

class _HaveAccountButton extends StatelessWidget {
  const _HaveAccountButton({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 275,
      height: 42,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.buttonSecondary,
          foregroundColor: AppColors.white,
          side: const BorderSide(color: AppColors.buttonSecondaryBorder),
        ),
        child: Text(
          'I already have an account',
          style: AppTypography.body.copyWith(color: AppColors.white),
        ),
      ),
    );
  }
}
