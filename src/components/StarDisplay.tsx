import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarDisplayProps {
  rating?: number;
  size?: number; // 星の大きさを指定できるようにする
}

export const StarDisplay = ({ rating, size = 16 }: StarDisplayProps) => {
  if (!rating || rating === 0) {
    return null;
  }

  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((rate) => (
        <Ionicons
          key={rate}
          name={rate <= rating ? 'star' : 'star-outline'}
          size={size}
          color="#ffb400"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});