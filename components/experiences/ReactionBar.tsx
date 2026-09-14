import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EXPERIENCE_THEME } from '@/constants/experience-theme';

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
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  text: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 13,
    fontWeight: '800',
  },
});
