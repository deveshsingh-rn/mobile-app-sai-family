import { StyleSheet, Text, View } from 'react-native';

export default function ExperienceCategoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Experience Category</Text>
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
