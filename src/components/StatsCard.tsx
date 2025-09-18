import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AppTheme, tokens } from '../theme';

interface StatsCardProps {
  title: string;
  children: ReactNode;
}

export const StatsCard = ({ title, children }: StatsCardProps) => {
  const { theme } = useTheme();
  const isLightMode = theme.background === tokens.colors.light.background;
  const styles = createStyles(theme, isLightMode);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View>
        {children}
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme, isLightMode: boolean) => StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: tokens.spacing.l,
    marginBottom: tokens.spacing.m,
    ...(isLightMode && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    }),
  },
  title: {
    ...tokens.typography.subtitle,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: tokens.spacing.m,
  },
});

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 16,
//     marginHorizontal: 16,
//     marginTop: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
// });