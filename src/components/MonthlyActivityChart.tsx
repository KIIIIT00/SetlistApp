import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { BarChart } from "react-native-gifted-charts";
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';
import { getMonthlyActivity, MonthlyActivity } from '../database/db'; 

type Props = {
  year: string;
};

export const MonthlyActivityChart = ({ year }: Props) => {
  const [activity, setActivity] = useState<MonthlyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    const loadData = async () => {
        if (!year) return;
        setIsLoading(true);
        const data = await getMonthlyActivity(year);
        setActivity(data);
        setIsLoading(false);
    };
    loadData();
  }, [year]);

  const fullMonthData = useMemo(() => {
      return Array.from({ length: 12 }, (_, i) => {
          const month = String(i + 1).padStart(2, '0');
          const existingData = activity.find(d => d.month === month);
          return {
            value: existingData ? existingData.count : 0,
            label: `${i + 1}月`,
          };
      });
  }, [activity]);

  if (isLoading) {
    return <View style={styles.loadingContainer}><Text style={styles.noDataText}>読み込み中...</Text></View>;
  }

  if (!activity || activity.length === 0) {
    return <Text style={styles.noDataText}>データがありません</Text>;
  }

  const maxValue = Math.max(...fullMonthData.map(d => d.value), 4);
  const stepValue = Math.ceil(maxValue / 5) || 1;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.container}>
        <BarChart
            data={fullMonthData}
            barWidth={25}
            spacing={20}
            yAxisTextStyle={{ color: theme.subtext }}
            yAxisLabelSuffix="本"
            xAxisLabelTextStyle={{ color: theme.subtext }}
            maxValue={stepValue * 5}
            noOfSections={5}
            stepValue={stepValue}
            rulesColor={theme.separator}
            rulesType="dashed"
            frontColor={theme.primary}
            isAnimated
        />
        </View>
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { 
    paddingRight: tokens.spacing.l, 
    paddingVertical: tokens.spacing.m,
  },
  loadingContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 150 
  },
  noDataText: { 
    color: theme.emptyText, 
    textAlign: 'center', 
    padding: tokens.spacing.xl 
  },
});