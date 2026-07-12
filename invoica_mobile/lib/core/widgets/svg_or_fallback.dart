import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Renders an SVG asset, or [fallback] when the asset is missing from the
/// bundle. Lets the app run before all brand assets are dropped in
/// (e.g. wave_top.svg / wave_bottom.svg on the sign-in screen).
class SvgOrFallback extends StatefulWidget {
  const SvgOrFallback(
    this.assetPath, {
    super.key,
    this.width,
    this.height,
    this.fit = BoxFit.contain,
    this.fallback,
  });

  final String assetPath;
  final double? width;
  final double? height;
  final BoxFit fit;

  /// Shown when the asset can't be loaded. Defaults to nothing.
  final Widget? fallback;

  @override
  State<SvgOrFallback> createState() => _SvgOrFallbackState();
}

class _SvgOrFallbackState extends State<SvgOrFallback> {
  late Future<ByteData> _bytes;

  @override
  void initState() {
    super.initState();
    _bytes = _load();
  }

  @override
  void didUpdateWidget(SvgOrFallback oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.assetPath != widget.assetPath) {
      setState(() => _bytes = _load());
    }
  }

  // The Future(() => ...) wrapper ensures any load failure — a synchronous
  // throw or a failed future — surfaces as a future error the FutureBuilder
  // handles.
  Future<ByteData> _load() => Future(() => rootBundle.load(widget.assetPath));

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ByteData>(
      future: _bytes,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return widget.fallback ?? const SizedBox.shrink();
        }
        final data = snapshot.data;
        if (data == null) return const SizedBox.shrink();
        return SvgPicture.memory(
          data.buffer.asUint8List(),
          width: widget.width,
          height: widget.height,
          fit: widget.fit,
        );
      },
    );
  }
}
