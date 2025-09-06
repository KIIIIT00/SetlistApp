import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { LiveForm } from '../components/LiveForm';
import { useNavigation } from '@react-navigation/native';

export const AddLiveScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <LiveForm onSave={() => navigation.goBack()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});