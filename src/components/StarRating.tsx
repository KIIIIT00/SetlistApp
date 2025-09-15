import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating?: number;
  size?: number;
  onRate?: (rate: number) => void;
}

export const StarRating = ({ rating = 0, size = 16, onRate }: StarRatingProps) => {
  if (rating === 0 && !onRate) {
    return null;
  }

  const starElements = [1, 2, 3, 4, 5].map((rate) => {
    const iconName = rate <= rating ? 'star' : 'star-outline';
    const color = rate <= rating ? '#ffb400' : '#ccc';

    if (onRate) {
      return (
        <TouchableOpacity key={rate} onPress={() => onRate(rate)}>
          <Ionicons name={iconName} size={size} color={color} style={styles.star} />
        </TouchableOpacity>
      );
    }
    
    return <Ionicons key={rate} name={iconName} size={size} color={color} style={styles.star} />;
  });

  return <View style={styles.starContainer}>{starElements}</View>;
};

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 1, 
  },
});