import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BarChart } from "react-native-gifted-charts";
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';
import { RankingItem } from '../database/db';

type ChartDataItem = {
    value: number;
    label: string;
};

type Props = {
  data: RankingItem[];
  onPress?: (artistName: string) => void;
};

export const ArtistRankingChart = ({ data, onPress }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!data || data.length === 0) {
    return <Text style={styles.noDataText}>グラフを表示するデータがありません</Text>;
  }

//   const chartData = data.map(item => ({
//     value: item.count,
//     labelComponent: () => (
//       <TouchableOpacity onPress={() => onPress && onPress(item.name)}>
//         <Text 
//           style={styles.yAxisLabel}
//           numberOfLines={1} 
//           ellipsizeMode='tail'
//         >
//           {item.name}
//         </Text>
//       </TouchableOpacity>
//     ),
//     frontColor: theme.primary,
//     topLabelComponent: () => (
//         <Text style={styles.topLabelText}>{item.count}回</Text>
//     )
//   })).reverse();
    const chartData: ChartDataItem[] = data.map(item => ({
    value: item.count,
    label: item.name, // ラベルはシンプルなテキストに戻す
    frontColor: theme.primary,
    topLabelComponent: () => (
        <Text style={styles.topLabelText}>{item.count}回</Text>
    )
  })).reverse();

  return (
    <View style={styles.container}>
      <BarChart
        horizontal
        data={chartData}
        barWidth={22}
        barBorderRadius={4}
        spacing={20}
        yAxisTextStyle={styles.yAxisLabel}
        yAxisThickness={0}
        yAxisLabelWidth={120}
        xAxisThickness={1}
        xAxisColor={theme.separator}
        xAxisLabelTextStyle={{ color: theme.subtext, fontSize: 10 }}
        hideRules
        initialSpacing={10}
        maxValue={Math.max(...data.map(d => d.count)) + 1}
        noOfSections={3}
        rulesColor={theme.separator}
        rulesType="solid"
        isAnimated
        showValuesAsTopLabel
        onPress={(item: ChartDataItem) => {
            if (onPress && item.label) {
                onPress(item.label);
            }
        }}
      />
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        paddingVertical: tokens.spacing.m,
    },
    noDataText: {
        color: theme.emptyText,
        textAlign: 'center',
        padding: tokens.spacing.xl,
    },
    yAxisLabel: {
        color: theme.text, 
        fontSize: 12, 
        textAlign: 'right',
        marginRight: tokens.spacing.s,
    },
    topLabelText: {
        color: theme.subtext,
        fontSize: 12,
        marginLeft: tokens.spacing.xl,
    }
});