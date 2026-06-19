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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { DirectoryListing } from '@/store/directory/types';

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
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

function listingOwnerName(item: DirectoryListing) {
  return (
    item.owner?.name ||
    item.ownerName ||
    item.businessName
  );
}

function formatDistance(distance?: number | null) {
  if (typeof distance !== 'number') {
    return 'Nearby';
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }

  return `${distance.toFixed(1)} km away`;
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#F0E7D8',
        borderRadius: 24,
        borderWidth: 1,
        marginTop: 24,
        padding: 26,
      }}>
      <MaterialCommunityIcons
        name="store-search"
        size={34}
        color="#F97316"
      />
      <Text
        style={{
          color: '#111827',
          fontSize: 17,
          fontWeight: '900',
          marginTop: 12,
        }}>
        No listings found
      </Text>
      <Text
        style={{
          color: '#6B7280',
          fontSize: 14,
          fontWeight: '600',
          lineHeight: 22,
          marginTop: 8,
          textAlign: 'center',
        }}>
        {message}
      </Text>
    </View>
  );
}

function FeaturedBusinessCard({
  item,
}: {
  item: DirectoryListing;
}) {
  const image = listingImage(item);
  const verified =
    item.verificationStatus === 'verified';
  const tags = (
    item.specialties?.length
      ? item.specialties
      : item.tags || []
  ).slice(0, 3);

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
        backgroundColor: '#F8EFE3',
        borderRadius: 26,
        marginBottom: 18,
        overflow: 'hidden',
        padding: 18,
      }}>
      <View
        style={{
          backgroundColor: '#F6E5C6',
          borderRadius: 84,
          height: 168,
          position: 'absolute',
          right: -28,
          top: -34,
          width: 168,
        }}
      />

      {verified && (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#FFF8ED',
            borderRadius: 16,
            flexDirection: 'row',
            paddingHorizontal: 12,
            paddingVertical: 7,
            position: 'absolute',
            right: 18,
            top: 18,
          }}>
          <Ionicons
            name="sparkles"
            size={13}
            color="#F97316"
          />
          <Text
            style={{
              color: '#111827',
              fontSize: 12,
              fontWeight: '800',
              marginLeft: 5,
            }}>
            Verified
          </Text>
        </View>
      )}

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          paddingRight: verified ? 100 : 0,
        }}>
        {image ? (
          <Image
            source={{
              uri: image,
            }}
            style={{
              borderColor: '#FFFFFF',
              borderRadius: 22,
              borderWidth: 3,
              height: 64,
              width: 64,
            }}
          />
        ) : (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderColor: '#FFFFFF',
              borderRadius: 22,
              borderWidth: 3,
              height: 64,
              justifyContent: 'center',
              width: 64,
            }}>
            <MaterialCommunityIcons
              name="storefront"
              size={28}
              color="#F97316"
            />
          </View>
        )}

        <View
          style={{
            flex: 1,
            marginLeft: 14,
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: '#111111',
              fontSize: 17,
              fontWeight: '900',
            }}>
            {listingOwnerName(item)}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: '#6B7280',
              fontSize: 14,
              fontWeight: '700',
              marginTop: 4,
            }}>
            {item.businessName}
          </Text>
        </View>
      </View>

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          marginTop: 18,
        }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={
              star <= Math.round(item.averageRating || 0)
                ? 'star'
                : 'star-outline'
            }
            size={15}
            color="#FBBF24"
            style={{
              marginRight: 2,
            }}
          />
        ))}

        <Text
          style={{
            color: '#111827',
            fontSize: 16,
            fontWeight: '900',
            marginLeft: 8,
          }}>
          {(item.averageRating || 0).toFixed(1)}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: '#6B7280',
            flex: 1,
            fontSize: 13,
            fontWeight: '700',
            marginLeft: 10,
          }}>
          {formatDistance(item.distanceKm)}
        </Text>
      </View>

      <Text
        numberOfLines={2}
        style={{
          color: '#6B7280',
          fontSize: 14,
          fontWeight: '600',
          lineHeight: 22,
          marginTop: 12,
        }}>
        {item.tagline ||
          item.description ||
          item.categoryName ||
          'Trusted community service'}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 10,
        }}>
        {tags.map((tag) => (
          <View
            key={tag}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              marginRight: 10,
              marginTop: 8,
              paddingHorizontal: 13,
              paddingVertical: 8,
            }}>
            <Text
              style={{
                color: '#4B5563',
                fontSize: 13,
                fontWeight: '700',
              }}>
              {tag}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function BusinessCategoryScreen() {
  const dispatch = useAppDispatch();
  const {
    category,
    categoryId,
    categorySlug,
  } = useLocalSearchParams<{
    category?: string;
    categoryId?: string;
    categorySlug?: string;
  }>();

  const categoryName =
    getParam(category)?.replace(/\n/g, ' ').trim() ||
    'Businesses';
  const id = getParam(categoryId);
  const slug = getParam(categorySlug);

  const listings = useAppSelector(selectDirectoryListings);
  const loading = useAppSelector(selectDirectoryListingsLoading);
  const pagination = useAppSelector(
    selectDirectoryListingsPagination
  );
  const error = useAppSelector(selectDirectoryError);

  const requestParams = useMemo(
    () => ({
      categoryId: id,
      categorySlug: slug,
      limit: 20,
      offset: 0,
      q: !id && !slug ? categoryName : undefined,
      sort: 'recommended' as const,
    }),
    [categoryName, id, slug]
  );

  const loadListings = useCallback(() => {
    dispatch(fetchDirectoryListingsRequest(requestParams));
  }, [dispatch, requestParams]);

  const loadMoreListings = useCallback(() => {
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

  const trustedCount =
    pagination?.total ?? listings.length;

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
          justifyContent: 'space-between',
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
            name="arrow-back"
            size={22}
            color="#374151"
          />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            marginHorizontal: 14,
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: '#111111',
              fontSize: 22,
              fontWeight: '900',
            }}>
            {categoryName}
          </Text>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 13,
              fontWeight: '700',
              marginTop: 2,
            }}>
            {trustedCount} trusted listings
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
          <MaterialCommunityIcons
            name="storefront"
            size={22}
            color="#F97316"
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
              paddingVertical: 42,
            }}>
            <ActivityIndicator
              color="#F97316"
              size="small"
            />
            <Text
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontWeight: '700',
                marginTop: 12,
              }}>
              Loading trusted listings...
            </Text>
          </View>
        ) : null}

        {!loading && error && listings.length === 0 ? (
          <EmptyState message={error} />
        ) : null}

        {!loading &&
        !error &&
        listings.length === 0 ? (
          <EmptyState
            message={`No approved ${categoryName.toLowerCase()} listings are available yet.`}
          />
        ) : null}

        {listings.map((item) => (
          <FeaturedBusinessCard
            key={item.id}
            item={item}
          />
        ))}

        {pagination?.hasMore ? (
          <TouchableOpacity
            activeOpacity={0.86}
            disabled={loading}
            onPress={loadMoreListings}
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
              <ActivityIndicator
                color="#F97316"
                size="small"
              />
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
