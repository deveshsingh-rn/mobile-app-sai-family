import React, {
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  fetchDirectoryListingsRequest,
  selectDirectoryError,
  selectDirectoryListings,
  selectDirectoryListingsLoading,
  selectDirectoryListingsPagination,
} from '@/store/directory';
import type {
  DirectoryListParams,
  DirectoryListing,
} from '@/store/directory/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

type DiscoveryMode = 'featured' | 'nearby' | 'trending';

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function compactNumber(value?: number | null) {
  const count = value || 0;

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }

  return String(count);
}

function listingImage(item: DirectoryListing) {
  return (
    item.logoUrl ||
    item.bannerUrl ||
    item.gallery?.[0]?.url ||
    item.owner?.avatarUrl ||
    item.owner?.profileImageUrl ||
    item.ownerAvatarUrl ||
    null
  );
}

function listingTags(item: DirectoryListing) {
  return [
    ...(item.specialties || []),
    ...(item.serviceAreas || []),
    ...(item.tags || []),
    ...(item.subcategories || []),
  ].slice(0, 3);
}

function modeCopy(mode: DiscoveryMode) {
  if (mode === 'trending') {
    return {
      empty:
        'Trending businesses will appear as devotees interact with listings.',
      icon: 'trending-up' as const,
      sort: 'trending' as const,
      subtitle: 'Most active Sai Directory listings this week',
      title: 'Trending This Week',
    };
  }

  if (mode === 'nearby') {
    return {
      empty:
        'Nearby devotee services will appear here when listings are available for your area.',
      icon: 'navigate-outline' as const,
      sort: 'nearby' as const,
      subtitle: 'Community businesses closest to your selected area',
      title: 'Devotees Near You',
    };
  }

  return {
    empty:
      'Featured businesses will appear here after listings are approved.',
    icon: 'sparkles-outline' as const,
    sort: 'recommended' as const,
    subtitle: 'Recommended and trusted Sai community services',
    title: 'Featured Businesses',
  };
}

function ListingCard({
  item,
}: {
  item: DirectoryListing;
}) {
  const image = listingImage(item);
  const tags = listingTags(item);
  const verified = item.verificationStatus === 'verified';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: '/directory/business-details',
          params: {
            id: item.id,
          },
        })
      }
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E7DDCD',
        borderRadius: 28,
        borderWidth: 1,
        marginBottom: 18,
        padding: 16,
      }}>
      <View
        style={{
          flexDirection: 'row',
        }}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={{
              borderRadius: 24,
              height: 96,
              width: 96,
            }}
          />
        ) : (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#FFF7ED',
              borderRadius: 24,
              height: 96,
              justifyContent: 'center',
              width: 96,
            }}>
            <MaterialCommunityIcons
              color="#F97316"
              name="storefront"
              size={34}
            />
          </View>
        )}

        <View
          style={{
            flex: 1,
            marginLeft: 14,
          }}>
          <View
            style={{
              alignItems: 'flex-start',
              flexDirection: 'row',
            }}>
            <Text
              numberOfLines={1}
              style={{
                color: '#111827',
                flex: 1,
                fontSize: 17,
                fontWeight: '900',
              }}>
              {item.businessName}
            </Text>

            {verified ? (
              <Ionicons
                color="#16A34A"
                name="shield-checkmark"
                size={18}
              />
            ) : null}
          </View>

          <Text
            numberOfLines={2}
            style={{
              color: '#6B7280',
              fontSize: 13,
              fontWeight: '700',
              lineHeight: 19,
              marginTop: 5,
            }}>
            {item.tagline ||
              item.description ||
              item.categoryName ||
              'Trusted community service'}
          </Text>

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: 10,
            }}>
            <Ionicons
              color="#FBBF24"
              name="star"
              size={15}
            />
            <Text
              style={{
                color: '#4B5563',
                fontSize: 13,
                fontWeight: '900',
                marginLeft: 5,
              }}>
              {(item.averageRating || 0).toFixed(1)}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: '#9CA3AF',
                flex: 1,
                fontSize: 12,
                fontWeight: '800',
                marginLeft: 8,
              }}>
              {compactNumber(item.recommendationCount)} recommends
            </Text>
          </View>
        </View>
      </View>

      {tags.length ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 12,
          }}>
          {tags.map((tag) => (
            <View
              key={`${item.id}-${tag}`}
              style={{
                backgroundColor: '#FFF7ED',
                borderRadius: 999,
                marginRight: 8,
                marginTop: 6,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}>
              <Text
                style={{
                  color: '#9A3412',
                  fontSize: 11,
                  fontWeight: '900',
                }}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function DirectoryDiscoveryListScreen() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    mode?: DiscoveryMode;
  }>();
  const mode = (getParam(params.mode) || 'featured') as DiscoveryMode;
  const copy = modeCopy(mode);
  const listings = useAppSelector(selectDirectoryListings);
  const loading = useAppSelector(selectDirectoryListingsLoading);
  const pagination = useAppSelector(selectDirectoryListingsPagination);
  const error = useAppSelector(selectDirectoryError);

  const requestParams = useMemo<DirectoryListParams>(
    () => ({
      limit: 20,
      offset: 0,
      sort: copy.sort,
    }),
    [copy.sort]
  );

  const loadListings = useCallback(() => {
    dispatch(fetchDirectoryListingsRequest(requestParams));
  }, [dispatch, requestParams]);

  const loadMore = useCallback(() => {
    if (!pagination?.hasMore || loading) {
      return;
    }

    dispatch(
      fetchDirectoryListingsRequest({
        ...requestParams,
        offset:
          pagination.nextOffset ??
          (pagination.offset || 0) +
            (pagination.limit || 20),
      })
    );
  }, [dispatch, loading, pagination, requestParams]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

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
          paddingBottom: 16,
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
              color: '#111827',
              fontSize: 23,
              fontWeight: '900',
            }}>
            {copy.title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: '#6B7280',
              fontSize: 13,
              fontWeight: '700',
              marginTop: 2,
            }}>
            {copy.subtitle}
          </Text>
        </View>

        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#FFF7ED',
            borderRadius: 22,
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}>
          <Ionicons
            color="#F97316"
            name={copy.icon}
            size={22}
          />
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            tintColor="#F97316"
            onRefresh={loadListings}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 34,
          paddingHorizontal: 18,
          paddingTop: 8,
        }}>
        {loading && listings.length === 0 ? (
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
              Loading listings...
            </Text>
          </View>
        ) : null}

        {!loading && error && listings.length === 0 ? (
          <Text
            style={{
              color: '#DC2626',
              fontSize: 14,
              fontWeight: '800',
              lineHeight: 22,
              marginTop: 20,
              textAlign: 'center',
            }}>
            {error}
          </Text>
        ) : null}

        {!loading && !error && listings.length === 0 ? (
          <Text
            style={{
              color: '#6B7280',
              fontSize: 14,
              fontWeight: '700',
              lineHeight: 22,
              marginTop: 20,
              textAlign: 'center',
            }}>
            {copy.empty}
          </Text>
        ) : null}

        {listings.map((item) => (
          <ListingCard key={item.id} item={item} />
        ))}

        {pagination?.hasMore ? (
          <TouchableOpacity
            activeOpacity={0.86}
            disabled={loading}
            onPress={loadMore}
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderColor: '#E7DDCD',
              borderRadius: 20,
              borderWidth: 1.5,
              height: 58,
              justifyContent: 'center',
              marginTop: 4,
            }}>
            {loading ? (
              <ActivityIndicator color="#F97316" />
            ) : (
              <Text
                style={{
                  color: '#4B5563',
                  fontSize: 16,
                  fontWeight: '900',
                }}>
                Load more listings
              </Text>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
