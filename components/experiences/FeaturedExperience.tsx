import { StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#fff4d5',
    borderColor: '#ead08a',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  eyebrow: {
    color: '#8e5d10',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#4e3309',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
});
