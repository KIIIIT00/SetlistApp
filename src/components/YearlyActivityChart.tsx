import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BarChart } from "react-native-gifted-charts";
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

type ChartDataItem = {
    value: number;
    label: string;
    topLabelComponent?: () => JSX.Element;
};

type Props = {
  data: { year: string; count: number }[];
  onBarPress?: (year: string) => void;
  selectedYear?: string | null;
};

export const YearlyActivityChart = ({ data, onBarPress, selectedYear }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!data || data.length === 0) {
    return <Text style={styles.noDataText}>グラフを表示するデータがありません</Text>;
  }

  // gifted-charts用のデータ形式に変換
  const chartData: ChartDataItem[] = data.map(item => ({
    value: item.count,
    label: item.year,
  }));

  return (
    <View style={styles.container}>
      <BarChart
        data={chartData}
        barWidth={40}
        spacing={25}
        yAxisTextStyle={{ color: theme.subtext }}
        xAxisLabelTextStyle={{ color: theme.subtext }}
        yAxisLabelSuffix="本"
        maxValue={Math.max(...chartData.map(d => d.value)) + 2} 
        noOfSections={4} // Y軸の区切り数
        rulesColor={theme.separator}
        rulesType="dashed"
        frontColor={theme.primary}
        isAnimated
        onPress={(item: ChartDataItem) => {
            if (onBarPress) {
                onBarPress(item.label);
            }
        }}
        renderTooltip={(item: ChartDataItem) => (
            <View style={[
                styles.tooltip,
                item.label === selectedYear && { backgroundColor: theme.star }
            ]}>
                <Text style={styles.tooltipText}>{item.value}本</Text>
            </View>
        )}
      />
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: tokens.spacing.m },
    noDataText: { color: theme.emptyText, textAlign: 'center', padding: tokens.spacing.xl },
    tooltip: {
        backgroundColor: theme.primary,
        paddingHorizontal: tokens.spacing.s,
        paddingVertical: tokens.spacing.xs,
        borderRadius: 4,
    },
    tooltipText: {
        color: theme.buttonSelectedText,
        fontSize: 12,
        fontWeight: 'bold',
    },
});