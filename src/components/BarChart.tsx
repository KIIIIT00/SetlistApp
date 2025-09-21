import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { tokens } from '../theme';

type Props = {
  data: {
    year: string;
    count: number;
  }[];
};

export const YearlyActivityChart = ({ data }: Props) => {
  const { theme } = useTheme();

  // グラフ用のデータを生成
  const chartData = {
    labels: data.map(item => item.year),
    datasets: [
      {
        data: data.map(item => item.count),
      },
    ],
  };
  
  const chartConfig = useMemo(() => ({
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.primary, 
    labelColor: (opacity = 1) => theme.subtext, 
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.primary,
    },
  }), [theme]);

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={{ alignItems: 'center', paddingVertical: tokens.spacing.m }}>
      <BarChart
        data={chartData}
        width={screenWidth - tokens.spacing.m * 4}
        height={220}
        yAxisLabel=""
        yAxisSuffix="本"
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        fromZero={true}
        showValuesOnTopOfBars={true}
      />
    </View>
  );
};