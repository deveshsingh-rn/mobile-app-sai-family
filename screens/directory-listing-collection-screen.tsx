import React, {
  useCallback,
  useEffect,
} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  deleteDirectoryListingRequest,
  fetchDirectoryBookmarksRequest,
  fetchMyDirectoryListingsRequest,
  selectDirectoryBookmarks,
  selectDirectoryBookmarksLoading,
  selectDirectoryError,
  selectIsDirectoryListingActionPending,
  selectMyDirectoryListings,
  selectMyDirectoryListingsLoading,
  unbookmarkDirectoryListingRequest,
} from '@/store/directory';
import type { DirectoryListing } from '@/store/directory/types';
import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

type CollectionMode = 'saved' | 'mine';

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

function statusMeta(status?: string) {
  switch (status) {
    case 'published':
      return {
        backgroundColor: '#DCFCE7',
        color: '#15803D',
        label: 'Published',
      };
    case 'pending_review':
      return {
        backgroundColor: '#FEF3C7',
        color: '#B45309',
        label: 'Pending',
      };
    case 'rejected':
      return {
        backgroundColor: '#FEE2E2',
        color: '#B91C1C',
        label: 'Rejected',
      };
    case 'suspended':
      return {
        backgroundColor: '#F3E8FF',
        color: '#7E22CE',
        label: 'Suspended',
      };
    case 'draft':
      return {
        backgroundColor: '#E0F2FE',
        color: '#0369A1',
        label: 'Draft',
      };
    default:
      return {
        backgroundColor: '#F1F5F9',
        color: '#475569',
        label: 'Review',
      };
  }
}

function formatLocation(item: DirectoryListing) {
  return [item.city, item.state]
    .filter(Boolean)
    .join(', ') || 'Location not added';
}

function EmptyState({
  mode,
}: {
  mode: CollectionMode;
}) {
  const isSaved = mode === 'saved';

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#F0E7D8',
        borderRadius: 24,
        borderWidth: 1,
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 34,
      }}>
      <MaterialCommunityIcons
        color="#F97316"
        name={isSaved ? 'bookmark-outline' : 'store-plus'}
        size={36}
      />
      <Text
        style={{
          color: '#111827',
          fontSize: 18,
          fontWeight: '900',
          marginTop: 14,
          textAlign: 'center',
        }}>
        {isSaved
          ? 'No saved businesses yet'
          : 'No listings created yet'}
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
        {isSaved
          ? 'Bookmark trusted community services and they will appear here.'
          : 'Create your first community business listing to start receiving enquiries.'}
      </Text>
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() =>
          router.push(
            isSaved
              ? '/directory/business-search'
              : '/directory/create-listing'
          )
        }
        style={{
          alignItems: 'center',
          backgroundColor: '#F97316',
          borderRadius: 18,
          height: 50,
          justifyContent: 'center',
          marginTop: 18,
          paddingHorizontal: 20,
        }}>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: '900',
          }}>
          {isSaved ? 'Browse Directory' : 'Create Listing'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ListingCard({
  item,
  mode,
  onDelete,
  onUnsave,
}: {
  item: DirectoryListing;
  mode: CollectionMode;
  onDelete: (item: DirectoryListing) => void;
  onUnsave: (item: DirectoryListing) => void;
}) {
  const image = listingImage(item);
  const meta = statusMeta(item.status);
  const pending = useAppSelector((state) =>
    selectIsDirectoryListingActionPending(state, item.id)
  );
  const isSaved = mode === 'saved';

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
        borderRadius: 26,
        elevation: 2,
        marginBottom: 18,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
          height: 4,
          width: 0,
        },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      }}>
      <View style={{ flexDirection: 'row' }}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={{
              borderRadius: 22,
              height: 86,
              width: 86,
            }}
          />
        ) : (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#FFF7ED',
              borderRadius: 22,
              height: 86,
              justifyContent: 'center',
              width: 86,
            }}>
            <MaterialCommunityIcons
              color="#F97316"
              name="storefront"
              size={32}
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
                color: '#111111',
                flex: 1,
                fontSize: 17,
                fontWeight: '900',
                marginRight: 8,
              }}>
              {item.businessName}
            </Text>

            <View
              style={{
                backgroundColor: meta.backgroundColor,
                borderRadius: 12,
                paddingHorizontal: 9,
                paddingVertical: 5,
              }}>
              <Text
                style={{
                  color: meta.color,
                  fontSize: 11,
                  fontWeight: '900',
                }}>
                {meta.label}
              </Text>
            </View>
          </View>

          <Text
            numberOfLines={1}
            style={{
              color: '#6B7280',
              fontSize: 13,
              fontWeight: '700',
              marginTop: 5,
            }}>
            {item.categoryName || 'Directory listing'}
          </Text>

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: 9,
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
                fontWeight: '800',
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
                fontWeight: '700',
                marginLeft: 8,
              }}>
              {item.reviewCount || 0} reviews
            </Text>
          </View>

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: 9,
            }}>
            <Ionicons
              color="#6B7280"
              name="location-outline"
              size={14}
            />
            <Text
              numberOfLines={1}
              style={{
                color: '#6B7280',
                flex: 1,
                fontSize: 12,
                fontWeight: '700',
                marginLeft: 5,
              }}>
              {formatLocation(item)}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          marginTop: 16,
        }}>
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() =>
            router.push({
              pathname: '/directory/business-details',
              params: {
                id: item.id,
              },
            })
          }
          style={{
            alignItems: 'center',
            backgroundColor: '#FFF7ED',
            borderRadius: 16,
            flex: 1,
            flexDirection: 'row',
            height: 44,
            justifyContent: 'center',
          }}>
          <Ionicons
            color="#F97316"
            name="eye-outline"
            size={17}
          />
          <Text
            style={{
              color: '#F97316',
              fontSize: 14,
              fontWeight: '900',
              marginLeft: 7,
            }}>
            View
          </Text>
        </TouchableOpacity>

        {isSaved ? (
          <TouchableOpacity
            activeOpacity={0.86}
            disabled={pending}
            onPress={() => onUnsave(item)}
            style={{
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: 16,
              flexDirection: 'row',
              height: 44,
              justifyContent: 'center',
              marginLeft: 10,
              paddingHorizontal: 16,
            }}>
            {pending ? (
              <ActivityIndicator
                color="#64748B"
                size="small"
              />
            ) : (
              <Ionicons
                color="#64748B"
                name="bookmark"
                size={17}
              />
            )}
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              activeOpacity={0.86}
              disabled={item.canEdit === false}
              onPress={() =>
                router.push({
                  pathname: '/directory/create-listing',
                  params: {
                    id: item.id,
                  },
                })
              }
              style={{
                alignItems: 'center',
                backgroundColor:
                  item.canEdit === false
                    ? '#F3F4F6'
                    : '#EFF6FF',
                borderRadius: 16,
                flexDirection: 'row',
                height: 44,
                justifyContent: 'center',
                marginLeft: 10,
                paddingHorizontal: 16,
              }}>
              <Ionicons
                color={
                  item.canEdit === false
                    ? '#9CA3AF'
                    : '#2563EB'
                }
                name="create-outline"
                size={17}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              disabled={pending || item.canDelete === false}
              onPress={() => onDelete(item)}
              style={{
                alignItems: 'center',
                backgroundColor:
                  item.canDelete === false
                    ? '#F3F4F6'
                    : '#FEF2F2',
                borderRadius: 16,
                flexDirection: 'row',
                height: 44,
                justifyContent: 'center',
                marginLeft: 10,
                paddingHorizontal: 16,
              }}>
              {pending ? (
                <ActivityIndicator
                  color="#DC2626"
                  size="small"
                />
              ) : (
                <Ionicons
                  color={
                    item.canDelete === false
                      ? '#9CA3AF'
                      : '#DC2626'
                  }
                  name="trash-outline"
                  size={17}
                />
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function DirectoryListingCollectionScreen({
  mode,
}: {
  mode: CollectionMode;
}) {
  const dispatch = useAppDispatch();
  const isSaved = mode === 'saved';
  const listings = useAppSelector(
    isSaved
      ? selectDirectoryBookmarks
      : selectMyDirectoryListings
  );
  const loading = useAppSelector(
    isSaved
      ? selectDirectoryBookmarksLoading
      : selectMyDirectoryListingsLoading
  );
  const error = useAppSelector(selectDirectoryError);

  const loadListings = useCallback(() => {
    if (isSaved) {
      dispatch(
        fetchDirectoryBookmarksRequest({
          limit: 20,
          offset: 0,
          sort: 'newest',
        })
      );
      return;
    }

    dispatch(
      fetchMyDirectoryListingsRequest({
        limit: 20,
        offset: 0,
        sort: 'newest',
      })
    );
  }, [dispatch, isSaved]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleUnsave = (item: DirectoryListing) => {
    dispatch(unbookmarkDirectoryListingRequest(item.id));
  };

  const handleDelete = (item: DirectoryListing) => {
    Alert.alert(
      'Delete listing?',
      `${item.businessName} will be removed from your directory listings.`,
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          onPress: () =>
            dispatch(deleteDirectoryListingRequest(item.id)),
          style: 'destructive',
          text: 'Delete',
        },
      ]
    );
  };

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
            color="#374151"
            name="arrow-back"
            size={22}
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
            {isSaved ? 'Saved Businesses' : 'My Listings'}
          </Text>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 13,
              fontWeight: '700',
              marginTop: 2,
            }}>
            {listings.length}{' '}
            {listings.length === 1 ? 'listing' : 'listings'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() =>
            router.push(
              isSaved
                ? '/directory/business-search'
                : '/directory/create-listing'
            )
          }
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
            name={isSaved ? 'search' : 'add'}
            size={22}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 34,
          paddingHorizontal: 18,
          paddingTop: 8,
        }}
        refreshControl={
          <RefreshControl
            onRefresh={loadListings}
            refreshing={loading}
            tintColor="#F97316"
          />
        }
        showsVerticalScrollIndicator={false}>
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
              Loading listings...
            </Text>
          </View>
        ) : null}

        {!loading && error && listings.length === 0 ? (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
              borderRadius: 18,
              borderWidth: 1,
              marginTop: 16,
              padding: 16,
            }}>
            <Text
              style={{
                color: '#B91C1C',
                fontSize: 13,
                fontWeight: '800',
                lineHeight: 20,
                textAlign: 'center',
              }}>
              {error}
            </Text>
          </View>
        ) : null}

        {!loading && !error && listings.length === 0 ? (
          <EmptyState mode={mode} />
        ) : null}

        {listings.map((item) => (
          <ListingCard
            item={item}
            key={item.id}
            mode={mode}
            onDelete={handleDelete}
            onUnsave={handleUnsave}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
