import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>SAI FAMILY</Text>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.description}>Your devotee profile and member information will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
