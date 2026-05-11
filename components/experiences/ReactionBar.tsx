import { Pressable, StyleSheet, Text, View } from 'react-native';

const REACTIONS = ['Jai Sai Ram', 'Touched', 'Miracle'];

export function ReactionBar() {
  return (
    <View style={styles.row}>
      {REACTIONS.map((reaction) => (
        <Pressable key={reaction} style={styles.button}>
          <Text style={styles.text}>{reaction}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#fff4d5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  text: {
    color: '#8e5d10',
    fontSize: 13,
    fontWeight: '800',
  },
});
