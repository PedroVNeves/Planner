
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';

interface Metric {
  id: string;
  name: string;
  unit: string;
  target: number;
}

interface MetricLog {
  date: string;
  value: number;
}

interface MetricChartProps {
  metric: Metric;
  logs: MetricLog[];
}

const CHART_HEIGHT = 100;
const CHART_WIDTH = '100%';

const MetricChart: React.FC<MetricChartProps> = ({ metric, logs }) => {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start, end });

    const logMap = new Map<string, number>();
    logs.forEach(log => {
      logMap.set(log.date, log.value);
    });

    return weekDays.map(day => {
      const dateString = format(day, 'yyyy-MM-dd');
      return {
        date: day,
        value: logMap.get(dateString) || 0,
      };
    });
  }, [logs]);

  const maxValue = useMemo(() => {
    const values = chartData.map(d => d.value);
    const maxLogValue = Math.max(...values);
    return Math.max(maxLogValue, metric.target || 0) * 1.2 || 1;
  }, [chartData, metric.target]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    chartContainer: {
      height: CHART_HEIGHT,
      width: CHART_WIDTH,
      backgroundColor: theme.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    bar: {
      flex: 1,
      backgroundColor: theme.primary,
      marginHorizontal: '1%',
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    targetLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      borderTopWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: theme.accent,
    },
    targetText: {
        position: 'absolute',
        right: 4,
        fontSize: 10,
        color: theme.accent,
    }
  }), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{metric.name} ({metric.unit})</Text>
      <View style={styles.chartContainer}>
        {chartData.map((data, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              { height: `${(data.value / maxValue) * 100}%` },
            ]}
          />
        ))}
        {metric.target > 0 && (
          <View style={[styles.targetLine, { bottom: `${(metric.target / maxValue) * 100}%` }]}>
            <Text style={styles.targetText}>{metric.target}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MetricChart;
