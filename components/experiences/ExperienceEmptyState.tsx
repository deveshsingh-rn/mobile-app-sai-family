import { StyleSheet, Text, View } from 'react-native';
import { EXPERIENCE_THEME } from '@/constants/experience-theme';

export function ExperienceEmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No experiences yet</Text>
      <Text style={styles.description}>Be the first to share a Sai blessing with the family.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  title: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 20,
    fontWeight: '800',
  },
  description: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
});
