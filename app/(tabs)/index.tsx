import { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  CategoryChips,
  ExperienceCard,
  ExperienceEmptyState,
  ExperienceTopTabKey,
  ExperienceTopTabs,
  FeaturedExperience,
} from '@/components/experiences';

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Miracles', value: 'miracles' },
  { label: 'Prayers', value: 'prayers' },
  { label: 'Dreams', value: 'dreams' },
  { label: 'Darshan', value: 'darshan' },
  { label: 'Blessings', value: 'blessings' },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<ExperienceTopTabKey>('feed');

  return (
    <ImageBackground
      source={require('@/assets/images/sai-baba-background.jpeg')}
      resizeMode="cover"
      style={styles.container}>
      <View style={styles.backgroundOverlay} />
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>PILLAR 1</Text>
          <Text style={styles.title}>Leela Feed</Text>
          <Text style={styles.description}>Share and discover Sai experiences from the family.</Text>
        </View>

        <ExperienceTopTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <ExperienceTabContent activeTab={activeTab} />
      </ScrollView>
    </ImageBackground>
  );
}

function ExperienceTabContent({ activeTab }: { activeTab: ExperienceTopTabKey }) {
  switch (activeTab) {
    case 'search':
      return <SearchContent />;
    case 'post':
      return <PostContent />;
    case 'category':
      return <CategoryContent />;
    case 'bookmarks':
      return <BookmarksContent />;
    case 'feed':
    default:
      return <FeedContent />;
  }
}

function FeedContent() {
  return (
    <>
      <CategoryChips activeValue="all" categories={CATEGORIES} />

      <View style={styles.section}>
        <FeaturedExperience />
      </View>

      <View style={styles.section}>
        <ExperienceCard
          authorName="Sai Devotee"
          category="Daily Blessings"
          preview="Feed cards will connect to live experience data when we implement the API flow."
          title="Your Sai experiences will appear here"
        />
      </View>

      <ExperienceEmptyState />
    </>
  );
}

function SearchContent() {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Search Experiences</Text>
      <TextInput
        placeholder="Search miracles, prayers, dreams..."
        placeholderTextColor="#a98b54"
        style={styles.input}
      />
      <Text style={styles.panelDescription}>Search results will appear below this fixed top tab area.</Text>
    </View>
  );
}

function PostContent() {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Post Experience</Text>
      <Text style={styles.panelDescription}>Start the experience publishing form here.</Text>
      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Create Draft</Text>
      </Pressable>
    </View>
  );
}

function CategoryContent() {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Categories</Text>
      <CategoryChips activeValue="miracles" categories={CATEGORIES} />
      <Text style={styles.panelDescription}>Category feeds will load here when connected with the API.</Text>
    </View>
  );
}

function BookmarksContent() {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Bookmarks</Text>
      <Text style={styles.panelDescription}>Saved Sai experiences will appear here.</Text>
      <ExperienceEmptyState />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 250, 240, 0.52)',
  },
  fixedTop: {
    backgroundColor: 'rgba(255, 250, 240, 0.94)',
    borderBottomColor: '#ecd9a6',
    borderBottomWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 58,
    zIndex: 10,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: '#8e5d10',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 10,
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
    marginTop: 8,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 120,
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  section: {
    marginTop: 18,
  },
  panel: {
    gap: 16,
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
  input: {
    backgroundColor: '#fffdf8',
    borderColor: '#dfc684',
    borderRadius: 8,
    borderWidth: 1,
    color: '#3f2b0c',
    fontSize: 15,
    height: 52,
    paddingHorizontal: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#8e5d10',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fffaf0',
    fontSize: 15,
    fontWeight: '800',
  },
});
