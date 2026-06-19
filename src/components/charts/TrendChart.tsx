import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../../theme';
import { TrendData } from '../../types';

interface TrendChartProps {
  title: string;
  trendData: TrendData;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  title,
  trendData,
  height = 220,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - theme.spacing.containerPadding * 2 - 16;

  const data = {
    labels: trendData.labels,
    datasets: [
      {
        data: trendData.data,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: [trendData.legendLabel],
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: theme.spacing.borderRadiusLg,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {trendData.data.length > 0 ? (
        <View style ={{marginLeft: -12}}>
          <LineChart
            data={data}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      ) : (
        <View style={[styles.emptyContainer, { height }]}>
          <Text style={styles.emptyText}>
            No data available for trend chart.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.xs,
    borderRadius: theme.spacing.borderRadiusMd,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.borderRadiusMd,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.sizes.sm,
  },
});

export default TrendChart;
