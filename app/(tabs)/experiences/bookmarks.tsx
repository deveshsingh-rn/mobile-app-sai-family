import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Sparkles, UserCircle2 } from 'lucide-react-native';

import { ExperienceEmptyState, ExperienceTopTabs } from '@/components/experiences';

export default function BookmarkedExperiencesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <UserCircle2 size={32} color="#8e5d10" strokeWidth={1.5} />
          <Text style={styles.headerTitle}>Leela Feed</Text>
          <Sparkles size={24} color="#8e5d10" strokeWidth={1.5} />
        </View>
        <ExperienceTopTabs activeTab="bookmarks" />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Bookmarks</Text>
          <Text style={styles.panelDescription}>Saved Sai experiences will appear here.</Text>
          <ExperienceEmptyState />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf0',
  },
  fixedTop: {
    backgroundColor: 'rgba(255, 250, 240, 0.94)',
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
    color: '#4e3309',
    fontSize: 20,
    fontWeight: '800',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 120,
    paddingTop: 0,
  },
  panel: {
    gap: 16,
    padding: 16,
  },
  panelTitle: {
    color: '#4e3309',
    fontSize: 24,
    fontWeight: '800',
  },
  panelDescription: {
    color: '#79571b',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 23,
  },
});
