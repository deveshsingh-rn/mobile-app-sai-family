import { StyleSheet, Text, View } from 'react-native';

export default function ExperiencesFeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>PILLAR 1</Text>
      <Text style={styles.title}>Leela Feed</Text>
      <Text style={styles.description}>Experience feed structure is ready for implementation.</Text>
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
  eyebrow: {
    color: '#8e5d10',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 14,
  },
  title: {
    color: '#4e3309',
    fontSize: 34,
    fontWeight: '800',
  },
  description: {
    color: '#79571b',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    marginTop: 10,
  },
});
