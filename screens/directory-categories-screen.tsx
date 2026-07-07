import React, {
  useCallback,
  useEffect,
} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  fetchDirectoryCategoriesRequest,
  selectDirectoryCategories,
  selectDirectoryCategoriesLoading,
  selectDirectoryError,
} from '@/store/directory';
import type { DirectoryCategory } from '@/store/directory/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const CATEGORY_FALLBACKS: Record<
  string,
  {
    color: string;
    icon: string;
    iconType:
      | 'Feather'
      | 'FontAwesome6'
      | 'Ionicons'
      | 'MaterialCommunityIcons';
  }
> = {
  education: {
    color: '#EAB308',
    icon: 'graduation-cap',
    iconType: 'FontAwesome6',
  },
  food: {
    color: '#EF4444',
    icon: 'utensils',
    iconType: 'FontAwesome6',
  },
  healthcare: {
    color: '#F97316',
    icon: 'stethoscope',
    iconType: 'FontAwesome6',
  },
  retail: {
    color: '#10B981',
    icon: 'shopping-bag',
    iconType: 'Feather',
  },
  services: {
    color: '#A855F7',
    icon: 'briefcase',
    iconType: 'Feather',
  },
};

const BACKEND_ICON_MAP: Record<
  string,
  {
    icon: string;
    iconType:
      | 'Feather'
      | 'FontAwesome6'
      | 'Ionicons'
      | 'MaterialCommunityIcons';
  }
> = {
  'briefcase-business': {
    icon: 'briefcase',
    iconType: 'Feather',
  },
  'building-2': {
    icon: 'building',
    iconType: 'FontAwesome6',
  },
  'graduation-cap': {
    icon: 'graduation-cap',
    iconType: 'FontAwesome6',
  },
  landmark: {
    icon: 'landmark',
    iconType: 'FontAwesome6',
  },
  mountain: {
    icon: 'terrain',
    iconType: 'MaterialCommunityIcons',
  },
  'person-standing': {
    icon: 'person',
    iconType: 'Ionicons',
  },
  'shopping-bag': {
    icon: 'shopping-bag',
    iconType: 'Feather',
  },
  utensils: {
    icon: 'utensils',
    iconType: 'FontAwesome6',
  },
};

function normalizeKey(value?: string | null) {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function categoryVisual(item: DirectoryCategory) {
  const key = normalizeKey(item.slug || item.name);
  const backendIcon = item.icon
    ? BACKEND_ICON_MAP[item.icon]
    : null;

  return {
    color:
      item.color ||
      CATEGORY_FALLBACKS[key]?.color ||
      '#F97316',
    icon:
      backendIcon?.icon ||
      CATEGORY_FALLBACKS[key]?.icon ||
      'storefront',
    iconType:
      backendIcon?.iconType ||
      (item.iconFamily &&
      ['Ionicons', 'Feather', 'FontAwesome6', 'MaterialCommunityIcons'].includes(
        item.iconFamily
      )
        ? (item.iconFamily as any)
        : undefined) ||
      CATEGORY_FALLBACKS[key]?.iconType ||
      'MaterialCommunityIcons',
  };
}

function renderIcon(
  iconType: string,
  icon: string,
  color: string
) {
  if (iconType === 'Feather') {
    return <Feather name={icon as any} size={24} color={color} />;
  }

  if (iconType === 'FontAwesome6') {
    return (
      <FontAwesome6
        name={icon as any}
        size={21}
        color={color}
        solid
      />
    );
  }

  if (iconType === 'Ionicons') {
    return <Ionicons name={icon as any} size={24} color={color} />;
  }

  return (
    <MaterialCommunityIcons
      name={icon as any}
      size={25}
      color={color}
    />
  );
}

function openCategory(item: DirectoryCategory) {
  router.push({
    pathname: '/directory/category',
    params: {
      category: item.name,
      categoryId: item.id,
      categorySlug: item.slug,
    },
  });
}

export default function DirectoryCategoriesScreen() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectDirectoryCategories);
  const loading = useAppSelector(selectDirectoryCategoriesLoading);
  const error = useAppSelector(selectDirectoryError);

  const loadCategories = useCallback(() => {
    dispatch(fetchDirectoryCategoriesRequest({ includeCounts: true }));
  }, [dispatch]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <SafeAreaView
      style={{
        backgroundColor: '#F5F3EF',
        flex: 1,
      }}>
      <StatusBar
        backgroundColor="#F5F3EF"
        barStyle="dark-content"
      />

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          paddingBottom: 14,
          paddingHorizontal: 18,
          paddingTop: 14,
        }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={{
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 22,
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}>
          <Ionicons
            color="#374151"
            name="arrow-back"
            size={22}
          />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            marginLeft: 14,
          }}>
          <Text
            style={{
              color: '#111111',
              fontSize: 24,
              fontWeight: '900',
            }}>
            All Categories
          </Text>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 13,
              fontWeight: '700',
              marginTop: 2,
            }}>
            {categories.length} directory categories
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            tintColor="#F97316"
            onRefresh={loadCategories}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 34,
          paddingHorizontal: 18,
          paddingTop: 8,
        }}>
        {loading && categories.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 44,
            }}>
            <ActivityIndicator color="#F97316" />
            <Text
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontWeight: '700',
                marginTop: 12,
              }}>
              Loading categories...
            </Text>
          </View>
        ) : null}

        {!loading && error && categories.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderColor: '#F0E7D8',
              borderRadius: 24,
              borderWidth: 1,
              padding: 24,
            }}>
            <MaterialCommunityIcons
              name="store-search"
              size={34}
              color="#F97316"
            />
            <Text
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontWeight: '700',
                lineHeight: 22,
                marginTop: 10,
                textAlign: 'center',
              }}>
              {error}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
          {categories.map((item) => {
            const visual = categoryVisual(item);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                onPress={() => openCategory(item)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E7DDCD',
                  borderRadius: 24,
                  borderWidth: 1,
                  marginBottom: 14,
                  padding: 16,
                  width: '48%',
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#FFF7ED',
                    borderRadius: 22,
                    height: 48,
                    justifyContent: 'center',
                    width: 48,
                  }}>
                  {renderIcon(
                    visual.iconType,
                    visual.icon,
                    visual.color
                  )}
                </View>

                <Text
                  numberOfLines={2}
                  style={{
                    color: '#111827',
                    fontSize: 16,
                    fontWeight: '900',
                    lineHeight: 21,
                    marginTop: 14,
                  }}>
                  {item.name}
                </Text>

                <Text
                  numberOfLines={2}
                  style={{
                    color: '#6B7280',
                    fontSize: 12,
                    fontWeight: '600',
                    lineHeight: 18,
                    marginTop: 6,
                  }}>
                  {item.description ||
                    'Trusted services from Sai Family devotees.'}
                </Text>

                <Text
                  style={{
                    color: '#F97316',
                    fontSize: 12,
                    fontWeight: '900',
                    marginTop: 12,
                  }}>
                  {item.listingCount || 0} listings
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
