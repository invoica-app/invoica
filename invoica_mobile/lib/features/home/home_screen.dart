import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/prefs/prefs.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Minimal stub — the real dashboard is a later milestone.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isGuest = ref
            .watch(sharedPreferencesProvider)
            .getBool(PrefsKeys.guestSession) ??
        false;

    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Invoica — dashboard coming soon',
                style: AppTypography.title,
              ),
              if (isGuest) ...[
                const SizedBox(height: 12),
                Chip(
                  label: Text(
                    'Guest session',
                    style: AppTypography.body
                        .copyWith(color: AppColors.buttonSecondary),
                  ),
                  side: const BorderSide(
                    color: AppColors.buttonSecondaryBorder,
                  ),
                  backgroundColor: AppColors.white,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
