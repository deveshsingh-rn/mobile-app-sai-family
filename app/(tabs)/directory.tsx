import React, {
  useCallback,
  useEffect,
} from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
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
  fetchDirectoryHomeRequest,
  selectDirectoryError,
  selectDirectoryHome,
  selectDirectoryHomeLoading,
} from '@/store/directory';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type {
  DirectoryCategory,
  DirectoryListing,
} from '@/store/directory/types';

const CATEGORY_STYLES: Record<
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
    icon: 'book-open',
    iconType: 'Feather',
  },
  food: {
    color: '#EF4444',
    icon: 'restaurant-outline',
    iconType: 'Ionicons',
  },
  healthcare: {
    color: '#F97316',
    icon: 'stethoscope',
    iconType: 'FontAwesome6',
  },
  retail: {
    color: '#10B981',
    icon: 'storefront-outline',
    iconType: 'Ionicons',
  },
  services: {
    color: '#A855F7',
    icon: 'tools',
    iconType: 'FontAwesome6',
  },
  'spiritual-goods': {
    color: '#9D174D',
    icon: 'om',
    iconType: 'MaterialCommunityIcons',
  },
  technology: {
    color: '#3B82F6',
    icon: 'laptop-code',
    iconType: 'FontAwesome6',
  },
  'real-estate': {
    color: '#14B8A6',
    icon: 'building',
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

function getCategoryStyle(item: DirectoryCategory) {
  const key = normalizeKey(item.slug || item.name);

  return {
    color:
      item.color ||
      CATEGORY_STYLES[key]?.color ||
      '#F97316',
    icon:
      item.icon ||
      CATEGORY_STYLES[key]?.icon ||
      'storefront',
    iconType:
      (item.iconFamily as any) ||
      CATEGORY_STYLES[key]?.iconType ||
      'MaterialCommunityIcons',
  };
}

function formatCategoryName(name: string) {
  const words = name.split(' ');

  if (words.length > 1 && name.length > 11) {
    const midpoint = Math.ceil(words.length / 2);

    return `${words
      .slice(0, midpoint)
      .join(' ')}\n${words.slice(midpoint).join(' ')}`;
  }

  return name;
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

function compactNumber(value?: number | null) {
  const count = value || 0;

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }

  return String(count);
}

function listingMeta(listing: DirectoryListing) {
  return [
    listing.categoryName,
    listing.city,
    listing.distanceKm != null
      ? formatDistance(listing.distanceKm)
      : null,
  ]
    .filter(Boolean)
    .join(' • ');
}

function listingTags(listing: DirectoryListing) {
  return [
    ...(listing.specialties || []),
    ...(listing.serviceAreas || []),
    ...(listing.tags || []),
    ...(listing.subcategories || []),
  ].slice(0, 3);
}

function listingImage(listing: DirectoryListing) {
  return (
    listing.logoUrl ||
    listing.bannerUrl ||
    listing.gallery?.[0]?.url ||
    listing.owner?.avatarUrl ||
    listing.owner?.profileImageUrl ||
    listing.ownerAvatarUrl ||
    null
  );
}

function listingOwnerName(listing: DirectoryListing) {
  return (
    listing.owner?.name ||
    listing.ownerName ||
    listing.businessName
  );
}

function TrustPill({
  color,
  icon,
  label,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#F0E7D8',
        borderRadius: 999,
        borderWidth: 1,
        flexDirection: 'row',
        marginRight: 8,
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 7,
      }}>
      <Ionicons name={icon} size={13} color={color} />
      <Text
        style={{
          color,
          fontSize: 12,
          fontWeight: '900',
          marginLeft: 5,
        }}>
        {label}
      </Text>
    </View>
  );
}

function openListing(listing: DirectoryListing) {
  router.push({
    pathname: '/directory/business-details',
    params: {
      id: listing.id,
    },
  });
}

const renderIcon = (
  iconType: string,
  icon: string,
  color: string,
  size = 28
) => {
  switch (iconType) {
    case 'Ionicons':
      return (
        <Ionicons
          name={icon as any}
          size={size}
          color={color}
        />
      );

    case 'Feather':
      return (
        <Feather
          name={icon as any}
          size={size}
          color={color}
        />
      );

    case 'FontAwesome6':
      return (
        <FontAwesome6
          name={icon as any}
          size={size - 4}
          color={color}
          solid
        />
      );

    default:
      return (
        <MaterialCommunityIcons
          name={icon as any}
          size={size}
          color={color}
        />
      );
  }
};

function EmptySection({
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
        borderRadius: 22,
        borderWidth: 1,
        marginHorizontal: 24,
        marginTop: 18,
        padding: 22,
      }}>
      <MaterialCommunityIcons
        name="store-search"
        size={28}
        color="#F97316"
      />
      <Text
        style={{
          color: '#6B7280',
          fontSize: 15,
          fontWeight: '600',
          lineHeight: 22,
          marginTop: 10,
          textAlign: 'center',
        }}>
        {message}
      </Text>
    </View>
  );
}

function CategoryItem({
  item,
}: {
  item: DirectoryCategory;
}) {
  const style = getCategoryStyle(item);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: '/directory/category',
          params: {
            category: item.name,
            categoryId: item.id,
            categorySlug: item.slug,
          },
        })
      }
      style={{
        alignItems: 'center',
        marginBottom: 30,
        width: '22%',
      }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          elevation: 1,
          height: 72,
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: {
            height: 3,
            width: 0,
          },
          shadowOpacity: 0.03,
          shadowRadius: 8,
          width: 72,
        }}>
        {renderIcon(
          style.iconType,
          style.icon,
          style.color
        )}
      </View>

      <Text
        style={{
          color: '#374151',
          fontSize: 14,
          fontWeight: '600',
          lineHeight: 19,
          marginTop: 14,
          textAlign: 'center',
        }}>
        {formatCategoryName(item.name)}
      </Text>
    </TouchableOpacity>
  );
}

function FeaturedBusinessCard({
  listing,
}: {
  listing: DirectoryListing;
}) {
  const image = listingImage(listing);
  const tags = listingTags(listing);
  const verified =
    listing.verificationStatus === 'verified';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => openListing(listing)}
      style={{
        backgroundColor: '#F8EFE3',
        borderRadius: 30,
        borderColor: '#bcb4ac',
        borderWidth: 1,
        marginRight: 18,
        overflow: 'hidden',
        padding: 22,
        width: 420,
      }}>
      <View
        style={{
          backgroundColor: '#F6E5C6',
          borderRadius: 90,
          height: 180,
          position: 'absolute',
          right: -20,
          top: -30,
          width: 180,
        }}
      />

      {verified && (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#FFF8ED',
            borderRadius: 18,
            flexDirection: 'row',
            paddingHorizontal: 14,
            paddingVertical: 8,
            position: 'absolute',
            right: 22,
            top: 24,
          }}>
          <Ionicons
            name="sparkles"
            size={14}
            color="#F97316"
          />

          <Text
            style={{
              color: '#111827',
              fontSize: 14,
              fontWeight: '700',
              marginLeft: 6,
            }}>
            Verified
          </Text>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          paddingRight: verified ? 104 : 0,
        }}>
        {image ? (
          <Image
            source={{
              uri: image,
            }}
            style={{
              borderColor: '#FFFFFF',
              borderRadius: 32,
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
              borderRadius: 32,
              height: 64,
              justifyContent: 'center',
              width: 64,
            }}>
            <MaterialCommunityIcons
              name="storefront"
              size={30}
              color="#F97316"
            />
          </View>
        )}

        <View
          style={{
            flex: 1,
            marginLeft: 16,
            marginTop: 2,
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: '#111111',
              fontSize: 18,
              fontWeight: '800',
              lineHeight: 26,
            }}>
            {listing.businessName}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              color: '#6B7280',
              fontSize: 16,
              fontWeight: '600',
              lineHeight: 22,
              marginTop: 2,
            }}>
            {listing.tagline ||
              listing.description ||
              listingOwnerName(listing)}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={1}
        style={{
          color: '#9A3412',
          fontSize: 13,
          fontWeight: '900',
          marginTop: 16,
        }}>
        {listingMeta(listing) || 'Sai Directory listing'}
      </Text>

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          marginTop: 22,
        }}>
        <View
          style={{
            flexDirection: 'row',
          }}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Ionicons
              key={item}
              name={
                item <= Math.round(listing.averageRating || 0)
                  ? 'star'
                  : 'star-outline'
              }
              size={16}
              color="#FBBF24"
              style={{
                marginRight: 2,
              }}
            />
          ))}
        </View>

        <Text
          style={{
            color: '#111827',
            fontSize: 18,
            fontWeight: '800',
            marginLeft: 10,
          }}>
          {(listing.averageRating || 0).toFixed(1)}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: '#9CA3AF',
            flex: 1,
            fontSize: 15,
            fontWeight: '500',
            marginLeft: 8,
        }}>
          ({listing.recommendationCount || 0} endorsements)
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 4,
        }}>
        <TrustPill
          color="#F97316"
          icon="eye-outline"
          label={`${compactNumber(listing.viewCount)} views`}
        />
        <TrustPill
          color="#2563EB"
          icon="chatbubble-ellipses-outline"
          label={`${compactNumber(listing.enquiryCount)} enquiries`}
        />
        {listing.homeServiceAvailable ? (
          <TrustPill
            color="#16A34A"
            icon="home-outline"
            label="Home service"
          />
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 12,
        }}>
        {tags.slice(0, 2).map((tag) => (
          <View
            key={tag}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              marginRight: 12,
              marginTop: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}>
            <Text
              style={{
                color: '#4B5563',
                fontSize: 15,
                fontWeight: '500',
              }}>
              {tag}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

function NearbyBusinessCard({
  listing,
}: {
  listing: DirectoryListing;
}) {
  const image = listingImage(listing);
  const helperText =
    listing.homeServiceAvailable
      ? 'Home visits available'
      : listing.responseTimeLabel || 'Contact for details';
  const tags = listingTags(listing);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => openListing(listing)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        elevation: 2,
        marginBottom: 24,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: {
          height: 4,
          width: 0,
        },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      }}>
      <View
        style={{
          flexDirection: 'row',
        }}>
        {image ? (
          <Image
            source={{
              uri: image,
            }}
            style={{
              borderRadius: 26,
              height: 96,
              width: 96,
            }}
          />
        ) : (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              borderRadius: 26,
              height: 96,
              justifyContent: 'center',
              width: 96,
            }}>
            <Ionicons
              name="business"
              size={34}
              color="#9CA3AF"
            />
          </View>
        )}

        {listing.verificationStatus === 'verified' && (
          <View
            style={{
              backgroundColor: '#22C55E',
              borderColor: '#FFFFFF',
              borderRadius: 9,
              borderWidth: 3,
              height: 18,
              left: 84,
              position: 'absolute',
              top: 72,
              width: 18,
            }}
          />
        )}

        <View
          style={{
            flex: 1,
            marginLeft: 18,
          }}>
          <View
            style={{
              alignItems: 'flex-start',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text
              numberOfLines={1}
              style={{
                color: '#111111',
                flex: 1,
                fontSize: 18,
                fontWeight: '800',
                marginRight: 10,
              }}>
              {listing.businessName}
            </Text>

            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#FFF9F2',
                borderColor: '#FDE7CF',
                borderRadius: 16,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 13,
                  fontWeight: '700',
                }}>
                ॐ Sai Devotee
              </Text>

              <Text
                style={{
                  color: '#6B7280',
                  fontSize: 13,
                  fontWeight: '500',
                  marginTop: 3,
                }}>
                {formatDistance(listing.distanceKm)}
              </Text>
            </View>
          </View>

          <Text
            numberOfLines={1}
            style={{
              color: '#6B7280',
              fontSize: 16,
              fontWeight: '500',
              marginTop: 12,
            }}>
              {listing.tagline ||
              listing.description ||
              listing.categoryName ||
              'Trusted community service'}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: '#9CA3AF',
              fontSize: 12,
              fontWeight: '800',
              marginTop: 7,
            }}>
            {listing.ownerName ||
              listing.owner?.name ||
              'Sai Family member'}
          </Text>

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: 16,
            }}>
            <Ionicons
              name="star"
              size={18}
              color="#FBBF24"
            />

            <Text
              style={{
                color: '#4B5563',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 6,
              }}>
              {(listing.averageRating || 0).toFixed(1)}
            </Text>

            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 13,
                fontWeight: '700',
                marginLeft: 5,
              }}>
              ({listing.reviewCount || 0})
            </Text>

            <View
              style={{
                backgroundColor: '#D1D5DB',
                borderRadius: 3,
                height: 5,
                marginHorizontal: 14,
                width: 5,
              }}
            />

            <Ionicons
              name={
                listing.homeServiceAvailable
                  ? 'home'
                  : 'call'
              }
              size={16}
              color="#6B7280"
            />

            <Text
              numberOfLines={1}
              style={{
                color: '#6B7280',
                flex: 1,
                fontSize: 15,
                fontWeight: '500',
                marginLeft: 6,
              }}>
              {helperText}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginTop: 10,
            }}>
            {tags.map((tag) => (
              <View
                key={`${listing.id}-${tag}`}
                style={{
                  backgroundColor: '#FFF7ED',
                  borderRadius: 999,
                  marginRight: 6,
                  marginTop: 6,
                  paddingHorizontal: 9,
                  paddingVertical: 5,
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
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DirectoryScreen() {
  const dispatch = useAppDispatch();
  const home = useAppSelector(selectDirectoryHome);
  const loading = useAppSelector(selectDirectoryHomeLoading);
  const error = useAppSelector(selectDirectoryError);

  const loadDirectoryHome = useCallback(() => {
    dispatch(
      fetchDirectoryHomeRequest({
        limit: 10,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    loadDirectoryHome();
  }, [loadDirectoryHome]);

  const categories = home?.categories || [];
  const featuredListings =
    home?.featuredListings || [];
  const nearbyListings = home?.nearbyListings || [];
  const popularCategories = home?.popularCategories || [];
  const trendingListings = home?.trendingListings || [];
  const stats = home?.stats;

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
            paddingHorizontal: 24,
            paddingTop: 18,
          }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View>
              <Text
                style={{
                  color: '#111111',
                  fontSize: 28,
                  fontWeight: '800',
                  letterSpacing: -0.5,
                }}>
                Sai Directory devesh
              </Text>

              <Text
                style={{
                  color: '#6B7280',
                  fontSize: 15,
                  fontWeight: '500',
                  marginTop: 2,
                }}>
                Trusted community services
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push('/directory/create-listing')
              }
              style={{
                alignItems: 'center',
                backgroundColor: '#FAF8F6',
                borderRadius: 28,
                elevation: 2,
                height: 56,
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: {
                  height: 3,
                  width: 0,
                },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                width: 56,
              }}>
              <Ionicons
                name="add"
                size={24}
                color="#F97316"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              router.push('/directory/business-search')
            }
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 33,
              elevation: 2,
              flexDirection: 'row',
              height: 56,
              marginVertical: 8,
              paddingHorizontal: 22,
              shadowColor: '#000',
              shadowOffset: {
                height: 5,
                width: 0,
              },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              width: '100%',
            }}>
            <Ionicons
              name="search"
              size={24}
              color="#E5E7EB"
            />

            <TextInput
              editable={false}
              onPressIn={() =>
                router.push('/directory/business-search')
              }
              placeholder="Find a devotee's service near you..."
              placeholderTextColor="#9CA3AF"
              style={{
                color: '#111827',
                flex: 1,
                fontSize: 18,
                fontWeight: '500',
                marginLeft: 14,
              }}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push('/directory/business-search')
              }
              style={{
                alignItems: 'center',
                backgroundColor: '#FFF7ED',
                borderRadius: 20,
                height: 40,
                justifyContent: 'center',
                width: 40,
              }}>
              <Ionicons
                name="options-outline"
                size={20}
                color="#F97316"
              />
            </TouchableOpacity>
          </TouchableOpacity>
          </View>


      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            tintColor="#F97316"
            onRefresh={loadDirectoryHome}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}>
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 18,
            }}>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 18,
            }}>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() =>
                router.push('/directory/saved-listings')
              }
              style={{
                alignItems: 'center',
                backgroundColor: '#FFF7ED',
                borderColor: '#FED7AA',
                borderRadius: 22,
                borderWidth: 1,
                flex: 1,
                flexDirection: 'row',
                height: 58,
                justifyContent: 'center',
                marginRight: 10,
              }}>
              <Ionicons
                color="#F97316"
                name="bookmark-outline"
                size={20}
              />
              <Text
                style={{
                  color: '#9A3412',
                  fontSize: 15,
                  fontWeight: '900',
                  marginLeft: 8,
                }}>
                Saved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() =>
                router.push('/directory/my-listings')
              }
              style={{
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderColor: '#E7DDCD',
                borderRadius: 22,
                borderWidth: 1,
                flex: 1,
                flexDirection: 'row',
                height: 58,
                justifyContent: 'center',
                marginLeft: 10,
              }}>
              <MaterialCommunityIcons
                color="#F97316"
                name="store-edit-outline"
                size={21}
              />
              <Text
                style={{
                  color: '#374151',
                  fontSize: 15,
                  fontWeight: '900',
                  marginLeft: 8,
                }}>
                My Listings
              </Text>
            </TouchableOpacity>
          </View>

          {stats ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 18,
              }}>
              {[
                {
                  label: 'Listings',
                  value: stats.totalListings || 0,
                },
                {
                  label: 'Verified',
                  value: stats.verifiedListings || 0,
                },
                {
                  label: 'Categories',
                  value:
                    stats.categoryCount ||
                    stats.categories ||
                    categories.length,
                },
              ].map((item) => (
                <View
                  key={item.label}
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E7DDCD',
                    borderRadius: 20,
                    borderWidth: 1,
                    flex: 1,
                    marginHorizontal: 4,
                    paddingVertical: 14,
                  }}>
                  <Text
                    style={{
                      color: '#111827',
                      fontSize: 18,
                      fontWeight: '900',
                    }}>
                    {compactNumber(item.value)}
                  </Text>
                  <Text
                    style={{
                      color: '#6B7280',
                      fontSize: 12,
                      fontWeight: '800',
                      marginTop: 4,
                    }}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View
          style={{
            backgroundColor: '#F8F3E8',
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            marginTop: 28,
            paddingBottom: 22,
            paddingTop: 30,
          }}>
          {loading && !home ? (
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 34,
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

          {error && !home ? (
            <EmptySection message={error} />
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
            }}>
             
            {categories.map((item) => (
              <CategoryItem
                key={item.id}
                item={item}
              />
            ))}
          </View>

          {!loading && categories.length === 0 ? (
            <EmptySection message="No directory categories are available yet." />
          ) : null}

          {popularCategories.length > 0 ? (
            <View
              style={{
                marginBottom: 24,
                paddingHorizontal: 24,
              }}>
              <Text
                style={{
                  color: '#111111',
                  fontSize: 20,
                  fontWeight: '800',
                  marginBottom: 14,
                }}>
                Popular Categories
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}>
                {popularCategories.map((item) => {
                  const style = getCategoryStyle(item);

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.86}
                      onPress={() =>
                        router.push({
                          pathname: '/directory/category',
                          params: {
                            category: item.name,
                            categoryId: item.id,
                            categorySlug: item.slug,
                          },
                        })
                      }
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E7DDCD',
                        borderRadius: 22,
                        borderWidth: 1,
                        flexDirection: 'row',
                        marginRight: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                      }}>
                      {renderIcon(
                        style.iconType,
                        style.icon,
                        style.color,
                        22
                      )}
                      <View
                        style={{
                          marginLeft: 10,
                        }}>
                        <Text
                          style={{
                            color: '#111827',
                            fontSize: 14,
                            fontWeight: '900',
                          }}>
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            color: '#6B7280',
                            fontSize: 12,
                            fontWeight: '700',
                            marginTop: 2,
                          }}>
                          {compactNumber(item.listingCount)} listings
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 4,
              paddingHorizontal: 24,
            }}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <Text
                style={{
                  color: '#111111',
                  fontSize: 20,
                  fontWeight: '800',
                }}>
                Featured Businesses
              </Text>

              <Ionicons
                name="information-circle"
                size={18}
                color="#9CA3AF"
                style={{
                  marginLeft: 6,
                }}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push('/directory/business-search')
              }>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {featuredListings.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 24,
                paddingTop: 22,
              }}>
              {featuredListings.map((listing) => (
                <FeaturedBusinessCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </ScrollView>
          ) : !loading ? (
            <EmptySection message="Featured businesses will appear here after listings are approved." />
          ) : null}

          {trendingListings.length > 0 ? (
            <View
              style={{
                marginTop: 34,
                paddingHorizontal: 24,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                }}>
                <Text
                  style={{
                    color: '#111111',
                    fontSize: 22,
                    fontWeight: '800',
                    letterSpacing: -0.4,
                  }}>
                  Trending This Week
                </Text>

                <Ionicons
                  name="trending-up"
                  size={22}
                  color="#F97316"
                />
              </View>

              {trendingListings.slice(0, 3).map((listing) => (
                <NearbyBusinessCard
                  key={`trending-${listing.id}`}
                  listing={listing}
                />
              ))}
            </View>
          ) : null}

          <View
            style={{
              marginTop: 34,
              paddingHorizontal: 24,
            }}>
            <Text
              style={{
                color: '#111111',
                fontSize: 22,
                fontWeight: '800',
                letterSpacing: -0.4,
                marginBottom: 22,
              }}>
              Devotees Near You
            </Text>

            {nearbyListings.map((listing) => (
              <NearbyBusinessCard
                key={listing.id}
                listing={listing}
              />
            ))}

            {!loading && nearbyListings.length === 0 ? (
              <View
                style={{
                  marginHorizontal: 0,
                }}>
                <EmptySection message="Nearby devotee services will appear here when listings are available for your area." />
              </View>
            ) : null}

            {nearbyListings.length > 0 ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push('/directory/business-search')
                }
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  borderRadius: 22,
                  borderWidth: 1.5,
                  height: 68,
                  justifyContent: 'center',
                  marginTop: 2,
                }}>
                <Text
                  style={{
                    color: '#4B5563',
                    fontSize: 18,
                    fontWeight: '700',
                  }}>
                  Load more businesses
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
