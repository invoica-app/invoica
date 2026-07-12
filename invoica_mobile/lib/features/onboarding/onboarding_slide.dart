import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

/// Content for one onboarding page.
class OnboardingSlideData {
  const OnboardingSlideData({required this.imageAsset, required this.headline});

  final String imageAsset;
  final String headline;
}

// The `\n` breaks are deliberate: each headline is designed as a fixed
// two-line layout.
const onboardingSlides = <OnboardingSlideData>[
  OnboardingSlideData(
    imageAsset: 'assets/images/onboarding/slide1.png',
    headline: 'Invoicing,\nMade Effortless',
  ),
  OnboardingSlideData(
    imageAsset: 'assets/images/onboarding/slide2.png',
    headline: 'Get paid faster,\nGet paid your way',
  ),
  OnboardingSlideData(
    imageAsset: 'assets/images/onboarding/slide3.png',
    headline: 'Grow with\nevery Invoice',
  ),
];

/// One onboarding page: full-bleed photo, brand overlay, and the headline
/// sitting just above the bottom panel. The panel itself (dots + buttons) is
/// fixed in [OnboardingScreen] so it doesn't scroll with the pages.
class OnboardingSlide extends StatelessWidget {
  const OnboardingSlide({
    super.key,
    required this.data,
    required this.panelHeight,
  });

  final OnboardingSlideData data;
  final double panelHeight;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // The purple brand tint and bottom fade are baked into the slide
        // images — no runtime overlay, it would double-tint.
        Image.asset(
          data.imageAsset,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) =>
              const ColoredBox(color: AppColors.deep),
        ),
        Positioned(
          left: 24,
          right: 24,
          bottom: panelHeight + 24,
          child: Text(
            data.headline,
            textAlign: TextAlign.center,
            style: Theme.of(
              context,
            ).textTheme.displayLarge?.copyWith(color: AppColors.white),
          ),
        ),
      ],
    );
  }
}
