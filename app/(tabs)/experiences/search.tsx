import { StyleSheet, Text, View } from 'react-native';

import { ExperienceTopTabs } from '@/components/experiences';

export default function SearchExperiencesScreen() {
  return (
    <View style={styles.container}>
      <ExperienceTopTabs activeTab="search" />
      <Text style={styles.title}>Search Experiences</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffaf0',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#4e3309',
    fontSize: 30,
    fontWeight: '800',
  },
});
