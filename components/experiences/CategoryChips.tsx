import { Pressable, StyleSheet, Text, View } from 'react-native';

export type ExperienceCategory = {
  label: string;
  value: string;
};

type CategoryChipsProps = {
  activeValue?: string;
  categories: ExperienceCategory[];
  onChange?: (value: string) => void;
};

export function CategoryChips({ activeValue, categories, onChange }: CategoryChipsProps) {
  return (
    <View style={styles.row}>
      {categories.map((category) => {
        const isActive = activeValue === category.value;

        return (
          <Pressable
            key={category.value}
            onPress={() => onChange?.(category.value)}
            style={[styles.chip, isActive && styles.chipActive]}>
            <Text style={[styles.label, isActive && styles.labelActive]}>{category.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#fffdf8',
    borderColor: '#e5c878',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: '#8e5d10',
    borderColor: '#8e5d10',
  },
  label: {
    color: '#79571b',
    fontSize: 13,
    fontWeight: '800',
  },
  labelActive: {
    color: '#fffaf0',
  },
});
