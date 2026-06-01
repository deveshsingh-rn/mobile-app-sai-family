import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Sparkles, UserCircle2 } from 'lucide-react-native';

import { CategoryChips, ExperienceTopTabs } from '@/components/experiences';

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Miracles', value: 'miracles' },
  { label: 'Prayers', value: 'prayers' },
  { label: 'Dreams', value: 'dreams' },
  { label: 'Darshan', value: 'darshan' },
  { label: 'Blessings', value: 'blessings' },
];

export default function ExperienceCategoryScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <UserCircle2 size={23} color="#1F2937" strokeWidth={1.8} />
            </View>
            <View>
              <Text style={styles.eyebrow}>Explore</Text>
              <Text style={styles.headerTitle}>Categories</Text>
            </View>
          </View>
          <View style={styles.primaryAction}>
            <Sparkles size={17} color="#FFFFFF" strokeWidth={2} />
          </View>
        </View>
        <ExperienceTopTabs activeTab="category" />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Categories</Text>
          <CategoryChips activeValue="miracles" categories={CATEGORIES} />
          <Text style={styles.panelDescription}>Category feeds will load here when connected with the API.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  fixedTop: {
    backgroundColor: '#FAFAF9',
    borderBottomColor: '#E7D7BE',
    borderBottomWidth: 1,
    paddingTop: 54,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#1F2937',
    fontSize: 22,
    fontWeight: '900',
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  eyebrow: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '900',
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 120,
    paddingTop: 0,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7D7BE',
    borderRadius: 14,
    borderWidth: 1,
    gap: 16,
    margin: 16,
    padding: 16,
  },
  panelTitle: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: '900',
  },
  panelDescription: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 23,
  },
});
