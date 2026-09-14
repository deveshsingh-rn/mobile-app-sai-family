import { StyleSheet, Text, View } from 'react-native';

import { EXPERIENCE_THEME } from '@/constants/experience-theme';

export function FeaturedExperience() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Featured</Text>
      <Text style={styles.title}>Featured Sai experiences will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  eyebrow: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
});
