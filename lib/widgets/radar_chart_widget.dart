import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class RadarChartWidget extends StatelessWidget {
  final int pace;
  final int shooting;
  final int passing;
  final int dribbling;
  final int defending;
  final int physical;

  const RadarChartWidget({
    super.key,
    required this.pace,
    required this.shooting,
    required this.passing,
    required this.dribbling,
    required this.defending,
    required this.physical,
  });

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1.3,
      child: RadarChart(
        RadarChartData(
          radarShape: RadarShape.polygon,
          radarBackgroundColor: Colors.transparent,
          borderData: FlBorderData(show: false),
          radarBorderData: const BorderSide(color: Colors.white24, width: 1.5),
          titlePositionPercentageOffset: 0.2,
          titleTextStyle: const TextStyle(color: Colors.white, fontSize: 10),
          getTitle: (index, angle) {
            String text = '';
            switch (index) {
              case 0: text = 'PAC'; break;
              case 1: text = 'SHO'; break;
              case 2: text = 'PAS'; break;
              case 3: text = 'DRI'; break;
              case 4: text = 'DEF'; break;
              case 5: text = 'PHY'; break;
            }
            return RadarChartTitle(text: text);
          },
          tickCount: 5,
          ticksTextStyle: const TextStyle(color: Colors.transparent, fontSize: 10),
          tickBorderData: const BorderSide(color: Colors.white12, width: 1),
          gridBorderData: const BorderSide(color: Colors.white24, width: 1.5),
          dataSets: [
            RadarDataSet(
              fillColor: Theme.of(context).primaryColor.withValues(alpha: 0.4),
              borderColor: Theme.of(context).primaryColor,
              entryRadius: 2,
              dataEntries: [
                RadarEntry(value: pace.toDouble()),
                RadarEntry(value: shooting.toDouble()),
                RadarEntry(value: passing.toDouble()),
                RadarEntry(value: dribbling.toDouble()),
                RadarEntry(value: defending.toDouble()),
                RadarEntry(value: physical.toDouble()),
              ],
            ),
          ],
        ),
        swapAnimationDuration: const Duration(milliseconds: 400),
      ),
    );
  }
}
