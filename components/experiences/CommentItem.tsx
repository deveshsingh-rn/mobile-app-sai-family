import { StyleSheet, Text, View } from 'react-native';

type CommentItemProps = {
  authorName?: string;
  body?: string;
};

export function CommentItem({ authorName, body }: CommentItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.author}>{authorName || 'Sai Devotee'}</Text>
      <Text style={styles.body}>{body || 'Comment text will appear here.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffdf8',
    borderRadius: 8,
    padding: 14,
  },
  author: {
    color: '#4e3309',
    fontSize: 14,
    fontWeight: '800',
  },
  body: {
    color: '#79571b',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
});
