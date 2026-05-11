import { StyleSheet, Text, View } from 'react-native';

export type ExperienceCardProps = {
  authorName?: string;
  category?: string;
  preview?: string;
  title?: string;
};

export function ExperienceCard({ authorName, category, preview, title }: ExperienceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.category}>{category || 'Experience'}</Text>
      <Text style={styles.title}>{title || 'Sai Experience'}</Text>
      <Text style={styles.preview}>{preview || 'Experience preview will appear here.'}</Text>
      <Text style={styles.author}>{authorName || 'Sai Devotee'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffdf8',
    borderColor: '#e5c878',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  category: {
    color: '#8e5d10',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#4e3309',
    fontSize: 18,
    fontWeight: '800',
  },
  preview: {
    color: '#79571b',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  author: {
    color: '#8e5d10',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
});
