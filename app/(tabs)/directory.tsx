import React, {
  useCallback,
  useEffect,
} from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FamilySilhouetteIcon from '@/assets/icons/family-silhouette-svgrepo-com.svg';
import { DirectoryHomeSkeleton } from '@/components/ui/Skeleton';
import {
  fetchDirectoryHomeRequest,
  selectDirectoryError,
  selectDirectoryHome,
  selectDirectoryHomeLoading,
} from '@/store/directory';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDevoteeAccount } from '@/store/devotee-account/selectors';
import type {
  DirectoryCategory,
  DirectoryListing,
} from '@/store/directory/types';
import { EXPERIENCE_THEME } from '@/constants/experience-theme';

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

function getCategoryStyle(item: DirectoryCategory) {
  const key = normalizeKey(item.slug || item.name);
  const backendIcon = item.icon
    ? BACKEND_ICON_MAP[item.icon]
    : null;

  return {
    color:
      item.color ||
      CATEGORY_STYLES[key]?.color ||
      '#F97316',
    icon:
      backendIcon?.icon ||
      CATEGORY_STYLES[key]?.icon ||
      'storefront',
    iconType:
      backendIcon?.iconType ||
      (item.iconFamily &&
      ['Ionicons', 'Feather', 'FontAwesome6', 'MaterialCommunityIcons'].includes(
        item.iconFamily
      )
        ? (item.iconFamily as any)
        : undefined) ||
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
          fontSize: 12,
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
          height: 160,
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

export default function DirectoryScreen() {
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectDevoteeAccount);
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
  const homeCategories = (
    popularCategories.length ? popularCategories : categories
  ).slice(0, 12);
  const profileImageUrl =
    account?.profileImage?.uri ||
    account?.profileImageUrl ||
    account?.profile?.profileImageUrl;
  const profileInitial =
    account?.name?.trim().charAt(0).toUpperCase() || 'S';

  return (
    <SafeAreaView
      style={{
        backgroundColor: '#FFF8EC',
        flex: 1,
      }}>

        {/* devesh */}
      <StatusBar
        backgroundColor='#FFF8EC'
        // backgroundColor='#2f2d29'
        barStyle="dark-content"
      />

      <View style={styles.directoryToolbar}>
        <Pressable
          accessibilityLabel="Create directory listing"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.push('/directory/create-listing')}
          style={({ pressed }) => [
            styles.createListingProfileButton,
            pressed && styles.toolbarButtonPressed,
          ]}>
          <LinearGradient
            colors={['#7C2D12', '#D97706']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.createListingRing}>
            <View style={styles.createListingAvatarInset}>
              {profileImageUrl ? (
                <Image
                  accessibilityLabel={`${account?.name || 'Devotee'} profile photo`}
                  resizeMode="cover"
                  source={{ uri: profileImageUrl }}
                  style={styles.createListingAvatar}
                />
              ) : (
                <View
                  style={[
                    styles.createListingAvatar,
                    styles.createListingAvatarFallback,
                  ]}>
                  <Text style={styles.createListingAvatarText}>
                    {profileInitial}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
          <View style={styles.createListingBadge}>
            <Plus color="#FFFFFF" size={12} strokeWidth={3.4} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Search directory"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => router.push('/directory/business-search')}
          style={({ pressed }) => [
            styles.directoryToolbarIconButton,
            pressed && styles.toolbarButtonPressed,
          ]}>
          <Search  color={EXPERIENCE_THEME.paragraph}
                        size={30}
                        strokeWidth={2.85} />
        </Pressable>
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
          accessible
          accessibilityLabel="Welcome to Sai Ki Family. A trusted global community where Sai devotees empower one another through business, careers, collaboration, mentorship, emergency support, and acts of kindness."
          style={{
            backgroundColor: '#FFF8EC',
            // borderBottomColor: '#F1D9B5',
            // borderBottomWidth: 1,
            borderTopColor: '#F1D9B5',
            // borderTopWidth: 1,
            paddingHorizontal: 24,
            // paddingBottom: 22,
          }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 22,
                height: 44,
                justifyContent: 'center',
                width: 44,
              }}>
              <FamilySilhouetteIcon
                color="#7C2D12"
                fill="#7C2D12"
                height={35}
                width={35}
              />
            </View>

            <Text
              style={{
                color: '#7C2D12',
                flex: 1,
                fontSize: 21,
                fontWeight: '800',
                lineHeight: 28,
                marginLeft: 14,
              }}>
              Welcome to Sai Ki Family
            </Text>
          </View>

          <Text
            style={{
              color: '#4B4037',
              fontSize: 16,
              fontWeight: '700',
              lineHeight: 25,
              marginTop: 5,
            }}>
            Community of Sai Bhakts Working in Different Fields and Always Ready to Support Each Other.
          </Text>
        </View>

          {/* <View
            style={{
              paddingHorizontal: 24,
              // paddingTop: 18,
            }}> */}

          {/* <View
            style={{
              flexDirection: 'row',
              marginTop: 8,
            }}> */}
            {/* <TouchableOpacity
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
            </TouchableOpacity> */}

            {/* <TouchableOpacity
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
            </TouchableOpacity> */}
          {/* </View> */}

          {/* {stats ? (
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
          ) : null} */}
        {/* </View> */}

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
                paddingTop: 4,
              }}>
              <DirectoryHomeSkeleton />
            </View>
          ) : null}

          {error && !home ? (
            <EmptySection message={error} />
          ) : null}

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 18,
              paddingHorizontal: 24,
            }}>
            <Text
              style={{
                color: '#111111',
                fontSize: 20,
                fontWeight: '800',
              }}>
              Popular Categories
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/directory/categories')}>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 15,
                  fontWeight: '900',
                }}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
            }}>
            {homeCategories.map((item) => (
              <CategoryItem
                key={item.id}
                item={item}
              />
            ))}
          </View>

          {!loading && homeCategories.length === 0 ? (
            <EmptySection message="No directory categories are available yet." />
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
                router.push({
                  pathname: '/directory/discovery-list',
                  params: {
                    mode: 'featured',
                  },
                })
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
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                  paddingHorizontal: 24,
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

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: '/directory/discovery-list',
                      params: {
                        mode: 'trending',
                      },
                    })
                  }>
                  <Text
                    style={{
                      color: '#F97316',
                      fontSize: 15,
                      fontWeight: '900',
                    }}>
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingLeft: 24,
                }}>
                {trendingListings.slice(0, 6).map((listing) => (
                  <FeaturedBusinessCard
                    key={`trending-${listing.id}`}
                    listing={listing}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View
            style={{
              marginTop: 34,
              // paddingHorizontal: 24,
            }}>
            {/* <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 22,
              }}> */}
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                  paddingHorizontal: 24,
                }}>
              <Text
                style={{
                  color: '#111111',
                  fontSize: 22,
                  fontWeight: '800',
                  letterSpacing: -0.4,
                }}>
                Devotees Near You
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/directory/discovery-list',
                    params: {
                      mode: 'nearby',
                    },
                  })
                }>
                <Text
                  style={{
                    color: '#F97316',
                    fontSize: 15,
                    fontWeight: '900',
                  }}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            {nearbyListings.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingLeft: 24,
                }}>
                {nearbyListings.map((listing) => (
                  <FeaturedBusinessCard
                    key={listing.id}
                    listing={listing}
                  />
                ))}
              </ScrollView>
            ) : null}

            {!loading && nearbyListings.length === 0 ? (
              <View
                style={{
                  marginHorizontal: 0,
                }}>
                <EmptySection message="Nearby devotee services will appear here when listings are available for your area." />
              </View>
            ) : null}

            {/* {nearbyListings.length > 0 ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: '/directory/discovery-list',
                    params: {
                      mode: 'nearby',
                    },
                  })
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
            ) : null} */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  createListingAvatar: {
    backgroundColor: '#F1D9B5',
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  createListingAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  createListingAvatarInset: {
    alignItems: 'center',
    backgroundColor: '#FFF8EC',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  createListingAvatarText: {
    color: '#7C2D12',
    fontSize: 18,
    fontWeight: '900',
  },
  createListingBadge: {
    alignItems: 'center',
    backgroundColor: '#7C2D12',
    borderColor: '#FFF8EC',
    borderRadius: 10,
    borderWidth: 2,
    bottom: 1,
    height: 21,
    justifyContent: 'center',
    position: 'absolute',
    right: 1,
    shadowColor: '#7C2D12',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: 21,
  },
  createListingProfileButton: {
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    width: 60,
  },
  createListingRing: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  directoryToolbar: {
    alignItems: 'center',
    backgroundColor: '#FFF8EC',
    // borderBottomColor: '#F1D9B5',
    // borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // minHeight: 80,
    paddingHorizontal: 14,
    // paddingVertical: 6,
  },
  directoryToolbarIconButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  toolbarButtonPressed: {
    backgroundColor: '#F1D9B5',
    opacity: 0.76,
    transform: [{ scale: 0.96 }],
  },
});
