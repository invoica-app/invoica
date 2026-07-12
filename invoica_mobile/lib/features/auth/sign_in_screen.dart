import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/analytics/analytics.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/widgets/svg_or_fallback.dart';
import 'auth_repository.dart';

class SignInScreen extends ConsumerWidget {
  const SignInScreen({super.key, required this.intent});

  final SignInIntent intent;

  static const Size _buttonSize = Size(314, 47);
  static const double _buttonGap = 22;

  Future<void> _select(
    BuildContext context,
    WidgetRef ref,
    String provider,
    Future<AuthOutcome> Function(AuthRepository) call,
  ) async {
    ref
        .read(analyticsProvider)
        .logEvent('auth_option_selected', {'provider': provider});
    final outcome = await call(ref.read(authRepositoryProvider));
    if (!context.mounted) return;
    switch (outcome) {
      case AuthOutcome.success:
        context.go(Routes.home);
      case AuthOutcome.notImplemented:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Coming soon')),
        );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final title = intent == SignInIntent.signup
        ? 'Create your Invoica account'
        : 'Sign in to Invoica';

    return Scaffold(
      backgroundColor: AppColors.white,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/images/brand/auth_bg.png',
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) =>
                  const ColoredBox(color: AppColors.white),
            ),
          ),
          // Decorative waves — skipped silently until the SVGs are dropped in.
          const Positioned(
            top: 0,
            right: 0,
            child: SvgOrFallback('assets/images/brand/wave_top.svg'),
          ),
          const Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SvgOrFallback(
              'assets/images/brand/wave_bottom.svg',
              fit: BoxFit.fitWidth,
            ),
          ),
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) => SingleChildScrollView(
                padding: EdgeInsets.only(
                  left: 32,
                  right: 32,
                  top: constraints.maxHeight * 0.4,
                  bottom: 24,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTypography.title),
                    const SizedBox(height: 6),
                    Text(
                      'Create and send invoices in minutes',
                      style: AppTypography.body
                          .copyWith(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 28),
                    Center(
                      child: Column(
                        children: [
                          _AuthButton(
                            label: 'Continue with Google',
                            background: AppColors.white,
                            foreground: AppColors.black,
                            border: const BorderSide(
                              color: AppColors.primary,
                              width: 0.5,
                            ),
                            icon: const _BrandIcon(
                              'assets/images/brand/google.png',
                              size: 16,
                            ),
                            onPressed: () => _select(
                              context,
                              ref,
                              'google',
                              (repo) => repo.signInWithGoogle(),
                            ),
                          ),
                          const SizedBox(height: _buttonGap),
                          _AuthButton(
                            label: 'Continue with Microsoft',
                            background: AppColors.primary,
                            foreground: AppColors.white,
                            icon: const _BrandIcon(
                              'assets/images/brand/microsoft.png',
                              size: 20,
                            ),
                            onPressed: () => _select(
                              context,
                              ref,
                              'microsoft',
                              (repo) => repo.signInWithMicrosoft(),
                            ),
                          ),
                          const SizedBox(height: _buttonGap),
                          const SizedBox(
                            width: 314,
                            child: _OrDivider(),
                          ),
                          const SizedBox(height: _buttonGap),
                          _AuthButton(
                            label: 'Continue as guest',
                            background: AppColors.white,
                            foreground: AppColors.textMuted,
                            border: const BorderSide(
                              color: AppColors.primary,
                              width: 0.5,
                            ),
                            onPressed: () => _select(
                              context,
                              ref,
                              'guest',
                              (repo) => repo.continueAsGuest(),
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'No account needed. Sign up later to save your history.',
                            textAlign: TextAlign.center,
                            style: AppTypography.caption,
                          ),
                        ],
                      ),
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

class _AuthButton extends StatelessWidget {
  const _AuthButton({
    required this.label,
    required this.background,
    required this.foreground,
    required this.onPressed,
    this.border,
    this.icon,
  });

  final String label;
  final Color background;
  final Color foreground;
  final VoidCallback onPressed;
  final BorderSide? border;
  final Widget? icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: SignInScreen._buttonSize.width,
      height: SignInScreen._buttonSize.height,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: background,
          foregroundColor: foreground,
          side: border,
          // The button has a fixed 314x47 frame; default Material padding
          // would overflow the icon+label row.
          padding: EdgeInsets.zero,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon != null) ...[icon!, const SizedBox(width: 10)],
            Text(
              label,
              style: AppTypography.body.copyWith(color: foreground),
            ),
          ],
        ),
      ),
    );
  }
}

/// Provider icon PNG; disappears gracefully if the asset is missing.
class _BrandIcon extends StatelessWidget {
  const _BrandIcon(this.assetPath, {required this.size});

  final String assetPath;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      assetPath,
      width: size,
      height: size,
      errorBuilder: (context, error, stackTrace) =>
          SizedBox(width: size, height: size),
    );
  }
}

class _OrDivider extends StatelessWidget {
  const _OrDivider();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(
          child: Divider(thickness: 0.5, color: AppColors.divider),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'or',
            style: AppTypography.body.copyWith(color: AppColors.textMuted),
          ),
        ),
        const Expanded(
          child: Divider(thickness: 0.5, color: AppColors.divider),
        ),
      ],
    );
  }
}
