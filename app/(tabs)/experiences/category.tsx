import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookOpenText, Sparkles, UserCircle2 } from 'lucide-react-native';

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
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <BookOpenText color="#F97316" size={22} />
            </View>
            <View style={styles.panelCopy}>
              <Text style={styles.panelTitle}>Browse by feeling</Text>
              <Text style={styles.panelDescription}>
                Choose the type of experience you want to read today.
              </Text>
            </View>
          </View>
          <CategoryChips activeValue="miracles" categories={CATEGORIES} />
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>Miracles</Text>
            <Text style={styles.guideText}>
              Stories of grace, help, healing, and moments devotees felt Sai Baba near them.
            </Text>
          </View>
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
    backgroundColor: '#FFFCF7',
    borderBottomColor: '#E9D8BD',
    borderBottomWidth: 1,
    paddingTop: 54,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTitle: {
    color: '#1F2937',
    fontSize: 24,
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
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  eyebrow: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '900',
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#23201D',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 120,
    paddingTop: 16,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7D7BE',
    borderRadius: 18,
    borderWidth: 1,
    gap: 18,
    margin: 16,
    padding: 17,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  panelIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  panelCopy: {
    flex: 1,
  },
  panelTitle: {
    color: '#1F2937',
    fontSize: 22,
    fontWeight: '900',
  },
  panelDescription: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 4,
  },
  guideCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  guideTitle: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: '900',
  },
  guideText: {
    color: '#78716C',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 23,
    marginTop: 6,
  },
});
