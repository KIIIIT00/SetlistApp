import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from "react-native-gifted-charts";
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';
import { MonthlyActivity } from '../database/db';

type Props = {
  data: MonthlyActivity[];
};

export const MonthlyActivityChart = ({ data }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!data || data.length === 0) {
    return <Text style={styles.noDataText}>データがありません</Text>;
  }

  const fullMonthData = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    const existingData = data.find(d => d.month === month);
    return {
      value: existingData ? existingData.count : 0,
      label: `${i + 1}月`,
    };
  });

  return (
    <View style={styles.container}>
      <BarChart
        data={fullMonthData}
        barWidth={18}
        spacing={8}
        yAxisTextStyle={{ color: theme.subtext }}
        xAxisLabelTextStyle={{ color: theme.subtext, fontSize: 10 }}
        yAxisLabelSuffix="本"
        maxValue={Math.max(...fullMonthData.map(d => d.value)) + 1}
        noOfSections={3}
        rulesColor={theme.separator}
        rulesType="dashed"
        frontColor={theme.primary}
        isAnimated
      />
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: tokens.spacing.m, paddingLeft: tokens.spacing.s },
    noDataText: { color: theme.emptyText, textAlign: 'center', padding: tokens.spacing.xl },
});