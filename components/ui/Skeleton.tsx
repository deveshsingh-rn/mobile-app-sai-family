import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

type SkeletonBlockProps = {
  style?: ViewStyle | ViewStyle[];
};

export function SkeletonBlock({ style }: SkeletonBlockProps) {
  return (
    <View style={[styles.block, style]}>
      <MotiView
        from={{
          translateX: -180,
        }}
        animate={{
          translateX: 360,
        }}
        transition={{
          duration: 1250,
          loop: true,
          repeatReverse: false,
          type: 'timing',
        }}
        style={styles.shimmer}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.62)',
            'transparent',
          ]}
          end={{
            x: 1,
            y: 0,
          }}
          start={{
            x: 0,
            y: 0,
          }}
          style={styles.gradient}
        />
      </MotiView>
    </View>
  );
}

export function DirectoryCategoryGridSkeleton({
  count = 8,
}: {
  count?: number;
}) {
  return (
    <View style={styles.categoryGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.categoryItem}>
          <SkeletonBlock style={styles.categoryIcon} />
          <SkeletonBlock style={styles.categoryLabel} />
        </View>
      ))}
    </View>
  );
}

export function DirectoryHorizontalCardSkeleton({
  count = 2,
}: {
  count?: number;
}) {
  return (
    <View style={styles.horizontalRow}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <SkeletonBlock style={styles.logo} />
            <View style={styles.featureText}>
              <SkeletonBlock style={styles.lineWide} />
              <SkeletonBlock style={styles.lineMedium} />
            </View>
          </View>
          <SkeletonBlock style={styles.lineFull} />
          <View style={styles.pillRow}>
            <SkeletonBlock style={styles.pill} />
            <SkeletonBlock style={styles.pill} />
          </View>
          <View style={styles.pillRow}>
            <SkeletonBlock style={styles.smallPill} />
            <SkeletonBlock style={styles.smallPill} />
            <SkeletonBlock style={styles.smallPill} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function DirectoryListSkeleton({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listCard}>
          <SkeletonBlock style={styles.listImage} />
          <View style={styles.listBody}>
            <SkeletonBlock style={styles.lineWide} />
            <SkeletonBlock style={styles.lineFull} />
            <SkeletonBlock style={styles.lineMedium} />
            <View style={styles.pillRow}>
              <SkeletonBlock style={styles.smallPill} />
              <SkeletonBlock style={styles.smallPill} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function DirectoryHomeSkeleton() {
  return (
    <View>
      <DirectoryCategoryGridSkeleton />
      <View style={styles.sectionGap} />
      <DirectoryHorizontalCardSkeleton />
      <View style={styles.sectionGap} />
      <DirectoryHorizontalCardSkeleton />
    </View>
  );
}

const baseColor = '#EFE2CB';

const styles = StyleSheet.create({
  block: {
    backgroundColor: baseColor,
    overflow: 'hidden',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  categoryIcon: {
    borderRadius: 24,
    height: 72,
    width: 72,
  },
  categoryItem: {
    alignItems: 'center',
    marginBottom: 30,
    width: '22%',
  },
  categoryLabel: {
    borderRadius: 999,
    height: 12,
    marginTop: 14,
    width: 62,
  },
  featureCard: {
    backgroundColor: '#F8EFE3',
    borderColor: '#E7D6BE',
    borderRadius: 30,
    borderWidth: 1,
    marginRight: 18,
    padding: 22,
    width: 320,
  },
  featureHeader: {
    flexDirection: 'row',
  },
  featureText: {
    flex: 1,
    gap: 10,
    marginLeft: 16,
    marginTop: 8,
  },
  gradient: {
    flex: 1,
    width: 120,
  },
  horizontalRow: {
    flexDirection: 'row',
    paddingLeft: 24,
  },
  lineFull: {
    borderRadius: 999,
    height: 14,
    marginTop: 18,
    width: '100%',
  },
  lineMedium: {
    borderRadius: 999,
    height: 13,
    width: '62%',
  },
  lineWide: {
    borderRadius: 999,
    height: 14,
    width: '84%',
  },
  listBody: {
    flex: 1,
    gap: 10,
    marginLeft: 14,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7DDCD',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 18,
    padding: 16,
  },
  listImage: {
    borderRadius: 24,
    height: 96,
    width: 96,
  },
  logo: {
    borderRadius: 32,
    height: 64,
    width: 64,
  },
  pill: {
    borderRadius: 999,
    height: 28,
    width: 92,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  sectionGap: {
    height: 28,
  },
  shimmer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 120,
  },
  smallPill: {
    borderRadius: 999,
    height: 24,
    width: 74,
  },
});
