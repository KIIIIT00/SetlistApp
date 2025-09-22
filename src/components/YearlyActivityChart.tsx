import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Text, Dimensions, ActivityIndicator } from 'react-native';
import { BarChart } from "react-native-gifted-charts";
import { useFocusEffect } from '@react-navigation/native';
import { getYearlyActivity, YearlyActivity } from '../database/db';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

// --- ★★★ ここから修正 ★★★ ---
type Props = {
  onYearSelect: (year: string | null) => void;
};

export const YearlyActivityChart = ({ onYearSelect }: Props) => {
  const [activity, setActivity] = useState<YearlyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useFocusEffect(
    useCallback(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await getYearlyActivity();
            setActivity(data);
            if (data.length > 0 && !selectedYear) {
                const latestYear = data[0].year;
                setSelectedYear(latestYear);
                onYearSelect(latestYear);
            }
            setIsLoading(false);
        };
        loadData();
    }, [])
  );

  const chartData = useMemo(() => {
    return activity.map(item => ({
        value: item.count,
        label: item.year,
        frontColor: item.year === selectedYear ? theme.primary : theme.subtext,
    }));
  }, [activity, selectedYear, theme]);
  // --- ★★★ ここまで修正 ★★★ ---

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator /></View>;
  }

  if (!activity || activity.length === 0) {
    return <Text style={styles.noDataText}>グラフを表示するデータがありません</Text>;
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (tokens.spacing.m * 4);
  const numberOfBars = Math.max(chartData.length, 5);
  const spacing = 20;
  const barWidth = (chartWidth - (numberOfBars * spacing)) / numberOfBars;

  const maxValue = Math.max(...chartData.map(d => d.value), 4);
  const stepValue = Math.ceil(maxValue / 5) || 1;

  return (
    <View style={styles.container}>
      <BarChart
        data={chartData}
        width={chartWidth}
        barWidth={barWidth}
        spacing={spacing}
        yAxisTextStyle={{ color: theme.subtext }}
        xAxisLabelTextStyle={{ color: theme.subtext }}
        yAxisLabelSuffix="本"
        maxValue={stepValue * 5}
        noOfSections={4}
        stepValue={stepValue}
        rulesColor={theme.separator}
        rulesType="dashed"
        isAnimated
        onPress={(item: { label: string; }) => {
            const newSelectedYear = item.label === selectedYear ? null : item.label;
            setSelectedYear(newSelectedYear);
            onYearSelect(newSelectedYear);
        }}
      />
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: { 
      alignItems: 'center', 
      paddingVertical: tokens.spacing.m 
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