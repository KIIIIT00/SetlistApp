import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
  title: string;
  children: React.ReactNode;
}

export const StatsCard = ({ title, children }: StatsCardProps) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});