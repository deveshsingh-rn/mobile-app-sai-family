import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  bookmarkDirectoryListingRequest,
  contactDirectoryListingRequest,
  fetchDirectoryDetailRequest,
  recommendDirectoryListingRequest,
  reportDirectoryListingRequest,
  selectDirectoryDetail,
  selectDirectoryDetailRecentReviews,
  selectDirectoryDetailSimilarListings,
  selectDirectoryDetailReviewSummary,
  selectDirectoryError,
  selectDirectoryListingsLoading,
  selectIsDirectoryContactPending,
  selectIsDirectoryListingActionPending,
  shareDirectoryListingRequest,
  unbookmarkDirectoryListingRequest,
  unrecommendDirectoryListingRequest,
  viewDirectoryListingRequest,
} from '@/store/directory';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type {
  DirectoryContactPayload,
  DirectoryListing,
} from '@/store/directory/types';

type ContactAction = {
  channel: DirectoryContactPayload['channel'];
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const palette = {
  accent: '#F97316',
  amberSoft: '#FFF7ED',
  background: '#F4EFE7',
  border: '#EFE2D0',
  card: '#FFFCF8',
  green: '#16A34A',
  ink: '#111827',
  muted: '#6B7280',
};

const iosShadow = {
  elevation: 4,
  shadowColor: '#7C2D12',
  shadowOffset: {
    height: 10,
    width: 0,
  },
  shadowOpacity: 0.08,
  shadowRadius: 18,
};

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function listingImage(listing?: DirectoryListing | null) {
  return (
    listing?.bannerUrl ||
    listing?.gallery?.[0]?.url ||
    listing?.logoUrl ||
    null
  );
}

function listingLogo(listing?: DirectoryListing | null) {
  return (
    listing?.logoUrl ||
    listing?.owner?.avatarUrl ||
    listing?.owner?.profileImageUrl ||
    listing?.ownerAvatarUrl ||
    listing?.bannerUrl ||
    null
  );
}

function ownerName(listing?: DirectoryListing | null) {
  return (
    listing?.owner?.name ||
    listing?.ownerName ||
    'Sai Devotee'
  );
}

function ownerMemberSince(
  listing?: DirectoryListing | null
) {
  const value =
    listing?.owner?.memberSince || listing?.ownerMemberSince;

  if (!value) {
    return 'Community member';
  }

  const year = new Date(value).getFullYear();

  return Number.isFinite(year)
    ? `Member since ${year}`
    : 'Community member';
}

function formatDisplayDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatStatus(value?: string | null) {
  if (!value) {
    return 'Not available';
  }

  return value
    .split('_')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
}

function joinLocation(listing: DirectoryListing) {
  return [
    listing.address,
    listing.city,
    listing.state,
    listing.country,
    listing.pincode,
  ]
    .filter(Boolean)
    .join(', ');
}

function getOpeningHourRows(
  openingHours?: Record<string, unknown> | null
) {
  if (!openingHours || typeof openingHours !== 'object') {
    return [];
  }

  const dayLabels: Record<string, string> = {
    fri: 'Friday',
    mon: 'Monday',
    sat: 'Saturday',
    sun: 'Sunday',
    thu: 'Thursday',
    tue: 'Tuesday',
    wed: 'Wednesday',
  };

  return Object.entries(dayLabels)
    .map(([key, label]) => {
      const value = openingHours[key];

      if (!value || typeof value !== 'object') {
        return null;
      }

      const day = value as {
        close?: string;
        closed?: boolean;
        open?: string;
      };

      return {
        label,
        value: day.closed
          ? 'Closed'
          : [day.open, day.close].filter(Boolean).join(' - '),
      };
    })
    .filter(
      (item): item is { label: string; value: string } =>
        Boolean(item?.value)
    );
}

function normalizePhone(value?: string | null) {
  const cleaned = value?.replace(/[^\d+]/g, '') || '';

  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  return cleaned;
}

async function openExternalUrl(
  url: string,
  fallbackUrl?: string
) {
  try {
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      return;
    }

    if (fallbackUrl) {
      await Linking.openURL(fallbackUrl);
      return;
    }

    Alert.alert(
      'Cannot open app',
      'Please check that the required app is installed on this phone.'
    );
  } catch {
    Alert.alert(
      'Cannot open app',
      'Please try again, or contact this business another way.'
    );
  }
}

function EmptyDetail({
  message,
}: {
  message: string;
}) {
  return (
    <SafeAreaView
      style={{
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
      }}>
      <MaterialCommunityIcons
        name="store-alert"
        size={42}
        color="#F97316"
      />
      <Text
        style={{
          color: '#111827',
          fontSize: 20,
          fontWeight: '900',
          marginTop: 16,
          textAlign: 'center',
        }}>
        Listing unavailable
      </Text>
      <Text
        style={{
          color: '#6B7280',
          fontSize: 15,
          fontWeight: '600',
          lineHeight: 24,
          marginTop: 8,
          textAlign: 'center',
        }}>
        {message}
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.back()}
        style={{
          alignItems: 'center',
          backgroundColor: '#F97316',
          borderRadius: 18,
          height: 52,
          justifyContent: 'center',
          marginTop: 22,
          paddingHorizontal: 24,
        }}>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '800',
          }}>
          Go Back
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const BusinessDetailsScreen = () => {
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();
  const listingId = getParam(id);
  const listing = useAppSelector(selectDirectoryDetail);
  const reviewSummary = useAppSelector(
    selectDirectoryDetailReviewSummary
  );
  const recentReviews = useAppSelector(
    selectDirectoryDetailRecentReviews
  );
  const similarListings = useAppSelector(
    selectDirectoryDetailSimilarListings
  );
  const loading = useAppSelector(selectDirectoryListingsLoading);
  const error = useAppSelector(selectDirectoryError);
  const actionPending = useAppSelector((state) =>
    selectIsDirectoryListingActionPending(
      state,
      listingId
    )
  );
  const contactPending = useAppSelector((state) =>
    selectIsDirectoryContactPending(state, listingId)
  );
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!listingId) {
      return;
    }

    dispatch(fetchDirectoryDetailRequest(listingId));
    dispatch(viewDirectoryListingRequest(listingId));
  }, [dispatch, listingId]);

  const banner = listingImage(listing);
  const logo = listingLogo(listing);
  const specialties = useMemo(
    () =>
      (
        listing?.specialties?.length
          ? listing.specialties
          : listing?.tags || []
      ).slice(0, 8),
    [listing]
  );
  const gallery = useMemo(
    () =>
      (listing?.gallery || [])
        .filter((item) => item.url)
        .slice(0, 8),
    [listing]
  );
  const subcategories = listing?.subcategories || [];
  const tags = listing?.tags || [];
  const serviceAreas = listing?.serviceAreas || [];
  const openingHourRows = getOpeningHourRows(listing?.openingHours);
  const contactSummary = [
    listing?.phoneNumber ? `Phone: ${listing.phoneNumber}` : null,
    listing?.whatsappNumber
      ? `WhatsApp: ${listing.whatsappNumber}`
      : null,
    listing?.email ? `Email: ${listing.email}` : null,
    listing?.websiteUrl ? `Website: ${listing.websiteUrl}` : null,
  ].filter(Boolean);
  const rating =
    reviewSummary?.averageRating ??
    listing?.averageRating ??
    0;
  const reviewCount =
    reviewSummary?.reviewCount ??
    listing?.reviewCount ??
    0;
  const isVerified =
    listing?.verificationStatus === 'verified';

  const contactActions: ContactAction[] = [
    {
      channel: 'call',
      icon: 'call',
      label: 'Call Now',
    },
    {
      channel: 'whatsapp',
      icon: 'logo-whatsapp',
      label: 'WhatsApp',
    },
    {
      channel: 'in_app',
      icon: 'mail-outline',
      label: 'Enquire',
    },
  ];

  const handleBookmark = () => {
    if (!listingId || actionPending) {
      return;
    }

    dispatch(
      listing?.bookmarkedByMe
        ? unbookmarkDirectoryListingRequest(listingId)
        : bookmarkDirectoryListingRequest(listingId)
    );
  };

  const handleRecommend = () => {
    if (!listingId || actionPending) {
      return;
    }

    dispatch(
      listing?.recommendedByMe
        ? unrecommendDirectoryListingRequest(listingId)
        : recommendDirectoryListingRequest(listingId)
    );
  };

  const handleShare = async () => {
    if (!listingId || !listing) {
      return;
    }

    dispatch(shareDirectoryListingRequest(listingId));

    await Share.share({
      message: `Sai Directory: ${listing.businessName}`,
      title: listing.businessName,
    });
  };

  const handleOpenMap = async () => {
    if (!listing) {
      return;
    }

    const query =
      listing.latitude != null && listing.longitude != null
        ? `${listing.latitude},${listing.longitude}`
        : joinLocation(listing);

    if (!query) {
      Alert.alert(
        'Location unavailable',
        'This listing has not added a map location yet.'
      );
      return;
    }

    await openExternalUrl(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    );
  };

  const handleReport = () => {
    if (!listingId || !listing || actionPending) {
      return;
    }

    Alert.alert(
      'Report listing?',
      'Send this listing to the Sai Family team for review if the details look incorrect or unsafe.',
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          onPress: () =>
            dispatch(
              reportDirectoryListingRequest(listingId, {
                reason: 'incorrect_information',
              })
            ),
          style: 'destructive',
          text: 'Report',
        },
      ]
    );
  };

  const handleContact = async (
    channel: DirectoryContactPayload['channel']
  ) => {
    if (!listingId || !listing) {
      return;
    }

    dispatch(
      contactDirectoryListingRequest(listingId, {
        channel,
      })
    );

    if (channel === 'call') {
      const phone = normalizePhone(listing.phoneNumber);

      if (phone) {
        await openExternalUrl(`tel:${phone}`);
      }
    }

    if (channel === 'whatsapp') {
      const phone = normalizePhone(
        listing.whatsappNumber || listing.phoneNumber
      ).replace(/^\+/, '');

      if (phone) {
        await openExternalUrl(
          `whatsapp://send?phone=${phone}`,
          `https://wa.me/${phone}`
        );
      }
    }

    if (channel === 'in_app' && listing.email) {
      await openExternalUrl(`mailto:${listing.email}`);
    }
  };

  if (!listingId) {
    return (
      <EmptyDetail message="This business card did not include a listing id." />
    );
  }

  if (loading && !listing) {
    return (
      <SafeAreaView
        style={{
          alignItems: 'center',
          backgroundColor: '#F7F7F7',
          flex: 1,
          justifyContent: 'center',
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
          Loading business details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <EmptyDetail
        message={
          error ||
          'The selected business listing could not be loaded.'
        }
      />
    );
  }

  const renderSection = (
    title: string,
    children: React.ReactNode,
    action?: React.ReactNode
  ) => (
    <View
      style={{
        marginTop: 18,
        paddingHorizontal: 16,
      }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
          paddingHorizontal: 2,
        }}>
        <Text
          style={{
            color: palette.ink,
            fontSize: 19,
            fontWeight: '900',
          }}>
          {title}
        </Text>
        {action}
      </View>
      {children}
    </View>
  );

  const renderInfoRow = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    value?: string | number | null,
    onPress?: () => void
  ) => {
    const content = (
      <View
        style={{
          alignItems: 'center',
          borderBottomColor: '#F3E9DC',
          borderBottomWidth: 1,
          flexDirection: 'row',
          paddingVertical: 14,
        }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#FFF2E5',
            borderColor: '#FED7AA',
            borderRadius: 18,
            borderWidth: 1,
            height: 36,
            justifyContent: 'center',
            width: 36,
          }}>
          <Ionicons name={icon} size={18} color={palette.accent} />
        </View>
        <View
          style={{
            flex: 1,
            marginLeft: 12,
          }}>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 11,
              fontWeight: '800',
              textTransform: 'uppercase',
            }}>
            {label}
          </Text>
          <Text
            style={{
              color: value ? palette.ink : '#9CA3AF',
              fontSize: 15,
              fontWeight: '700',
              lineHeight: 21,
              marginTop: 3,
            }}>
            {value || 'Not added'}
          </Text>
        </View>
        {onPress ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#CBD5E1"
          />
        ) : null}
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity activeOpacity={0.82} onPress={onPress}>
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  };

  const renderChipGroup = (
    title: string,
    values: string[],
    fallback?: string
  ) => (
    <View
      style={{
        marginTop: 18,
      }}>
      <Text
        style={{
          color: '#111827',
          fontSize: 14,
          fontWeight: '900',
        }}>
        {title}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 12,
        }}>
        {(values.length ? values : fallback ? [fallback] : []).map((item) => (
          <View
            key={`${title}-${item}`}
            style={{
              backgroundColor: '#FFF9F0',
              borderColor: '#F4DDC3',
              borderRadius: 22,
              borderWidth: 1,
              marginBottom: 9,
              marginRight: 9,
              paddingHorizontal: 14,
              paddingVertical: 9,
            }}>
            <Text
              style={{
                color: '#7C2D12',
                fontSize: 14,
                fontWeight: '800',
              }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={{
        backgroundColor: palette.background,
        flex: 1,
      }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 54,
        }}>
        <View>
          {banner ? (
            <Image
              source={{ uri: banner }}
              style={{
                height: 360,
                width: '100%',
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#F8EFE3',
                height: 360,
                justifyContent: 'center',
                width: '100%',
              }}>
              <MaterialCommunityIcons
                name="storefront"
                size={64}
                color="#F97316"
              />
            </View>
          )}

          <LinearGradient
            colors={[
              'rgba(17,24,39,0.12)',
              'rgba(17,24,39,0.18)',
              'rgba(17,24,39,0.66)',
            ]}
            locations={[0, 0.42, 1]}
            style={{
              height: 360,
              position: 'absolute',
              width: '100%',
            }}
          />

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              left: 18,
              position: 'absolute',
              right: 18,
              top: 18,
            }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={{
                alignItems: 'center',
                borderRadius: 22,
                height: 44,
                overflow: 'hidden',
                justifyContent: 'center',
                width: 44,
              }}>
              <BlurView
                intensity={35}
                tint="light"
                style={{
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'center',
                  width: '100%',
                }}>
              <Ionicons
                name="arrow-back"
                size={22}
                color="#111827"
              />
              </BlurView>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={actionPending}
                onPress={handleBookmark}
                style={{
                  alignItems: 'center',
                  borderRadius: 21,
                  height: 42,
                  justifyContent: 'center',
                  marginRight: 10,
                  overflow: 'hidden',
                  width: 42,
                }}>
                <BlurView
                  intensity={34}
                  tint="light"
                  style={{
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'center',
                    width: '100%',
                  }}>
                <Ionicons
                  name={
                    listing.bookmarkedByMe
                      ? 'bookmark'
                      : 'bookmark-outline'
                  }
                  size={21}
                  color={
                    listing.bookmarkedByMe
                      ? '#F97316'
                      : '#374151'
                  }
                />
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShare}
                style={{
                  alignItems: 'center',
                  borderRadius: 21,
                  height: 42,
                  justifyContent: 'center',
                  overflow: 'hidden',
                  width: 42,
                }}>
                <BlurView
                  intensity={34}
                  tint="light"
                  style={{
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'center',
                    width: '100%',
                  }}>
                <Ionicons
                  name="share-social-outline"
                  size={21}
                  color="#374151"
                />
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={actionPending}
                onPress={handleReport}
                style={{
                  alignItems: 'center',
                  borderRadius: 21,
                  height: 42,
                  justifyContent: 'center',
                  marginLeft: 10,
                  overflow: 'hidden',
                  width: 42,
                }}>
                <BlurView
                  intensity={34}
                  tint="light"
                  style={{
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'center',
                    width: '100%',
                  }}>
                <Ionicons
                  name="flag-outline"
                  size={20}
                  color="#374151"
                />
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(255,255,255,0.78)',
              borderRadius: 28,
              borderWidth: 4,
              bottom: -34,
              elevation: 4,
              height: 86,
              justifyContent: 'center',
              left: 16,
              position: 'absolute',
              shadowColor: '#000',
              shadowOffset: {
                height: 4,
                width: 0,
              },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              width: 86,
            }}>
            {logo ? (
              <Image
                source={{ uri: logo }}
                style={{
                  borderRadius: 22,
                  height: 58,
                  width: 58,
                }}
              />
            ) : (
              <MaterialCommunityIcons
                name="storefront"
                size={36}
                color="#F97316"
              />
            )}
          </View>
        </View>

        <View
          style={{
            backgroundColor: palette.background,
            borderTopLeftRadius: 34,
            borderTopRightRadius: 34,
            marginTop: -26,
            paddingTop: 58,
          }}>
          <View
            style={{
              paddingHorizontal: 18,
            }}>
            <Text
              style={{
                color: palette.ink,
                fontSize: 28,
                fontWeight: '900',
                lineHeight: 34,
              }}>
              {listing.businessName}
            </Text>

            <Text
              style={{
                color: '#6B7280',
                fontSize: 16,
                fontWeight: '700',
                lineHeight: 23,
                marginTop: 6,
              }}>
              {listing.tagline ||
                listing.categoryName ||
                'Trusted community service'}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 14,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: isVerified ? '#ECFDF5' : '#F8FAFC',
                  borderColor: isVerified ? '#BBF7D0' : '#E2E8F0',
                  borderRadius: 999,
                  borderWidth: 1,
                  flexDirection: 'row',
                  marginRight: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}>
                <Ionicons
                  name={isVerified ? 'shield-checkmark' : 'shield-outline'}
                  size={15}
                  color={isVerified ? '#16A34A' : '#64748B'}
                />
                <Text
                  style={{
                    color: isVerified ? '#15803D' : '#64748B',
                    fontSize: 12,
                    fontWeight: '900',
                    marginLeft: 6,
                  }}>
                  {isVerified ? 'Verified' : 'Listed'}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: '#FFF7ED',
                  borderColor: '#FED7AA',
                  borderRadius: 999,
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}>
                <Text
                  style={{
                    color: '#C2410C',
                    fontSize: 12,
                    fontWeight: '900',
                  }}>
                  {listing.categoryName ||
                    listing.category?.name ||
                    'Directory'}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 22,
              paddingHorizontal: 16,
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderRadius: 22,
                borderWidth: 1,
                height: 88,
                justifyContent: 'center',
                ...iosShadow,
                width: '31%',
              }}>
              <Ionicons
                name={
                  isVerified
                    ? 'checkmark-circle'
                    : 'checkmark-circle-outline'
                }
                size={24}
                color={isVerified ? '#22C55E' : '#9CA3AF'}
              />

              <Text
                style={{
                  color: '#1F2937',
                  fontSize: 14,
                  fontWeight: '900',
                  marginTop: 10,
                }}>
                {isVerified ? 'Sai Verified' : 'Listed'}
              </Text>
            </View>

            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#EFF6FF',
                borderColor: '#BFDBFE',
                borderRadius: 22,
                borderWidth: 1,
                height: 88,
                justifyContent: 'center',
                ...iosShadow,
                width: '31%',
              }}>
              <MaterialCommunityIcons
                name="hands-pray"
                size={25}
                color="#2563EB"
              />

              <Text
                style={{
                  color: '#2563EB',
                  fontSize: 14,
                  fontWeight: '800',
                  marginTop: 10,
                }}>
                {listing.recommendationCount || 0} Endorsed
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() =>
                router.push({
                  pathname: '/directory/business-review',
                  params: {
                    id: listing.id,
                  },
                })
              }
              style={{
                alignItems: 'center',
                backgroundColor: '#FFFBEB',
                borderColor: '#FCE7A5',
                borderRadius: 22,
                borderWidth: 1,
                height: 88,
                justifyContent: 'center',
                ...iosShadow,
                width: '31%',
              }}>
              <Text
                style={{
                  color: '#D97706',
                  fontSize: 28,
                  fontWeight: '800',
                }}>
                {rating.toFixed(1)}
                <Text
                  style={{
                    fontSize: 18,
                  }}>
                  ★
                </Text>
              </Text>

              <Text
                style={{
                  color: '#B45309',
                  fontSize: 14,
                  fontWeight: '700',
                  marginTop: 2,
                }}>
                {reviewCount} Reviews
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
              borderRadius: 28,
              borderWidth: 1,
              marginHorizontal: 16,
              marginTop: 24,
              padding: 18,
              ...iosShadow,
            }}>
            <Text
              style={{
                color: palette.ink,
                fontSize: 16,
                fontWeight: '900',
              }}>
              About this business
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 14,
              }}>
              {(specialties.length
                ? specialties
                : [listing.categoryName || 'Community Service']
              ).map((item) => (
                <View
                  key={item}
                  style={{
                    backgroundColor: '#FFF7ED',
                    borderColor: '#FED7AA',
                    borderRadius: 24,
                    borderWidth: 1,
                    marginBottom: 10,
                    marginRight: 10,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}>
                  <Text
                    style={{
                      color: '#9A3412',
                      fontSize: 15,
                      fontWeight: '800',
                    }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              style={{
                color: '#4B5563',
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 26,
                marginTop: 12,
              }}>
              {expanded ||
              (listing.description || '').length <= 140
                ? listing.description ||
                  'This trusted Sai community listing has not added a full description yet.'
                : `${(listing.description || '').slice(
                    0,
                    140
                  )}...`}
            </Text>

            {(listing.description || '').length > 140 ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setExpanded(!expanded)}>
                <Text
                  style={{
                    color: '#F97316',
                    fontSize: 16,
                    fontWeight: '700',
                    marginTop: 12,
                  }}>
                  {expanded ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#EFE2D0',
              borderRadius: 28,
              borderWidth: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 16,
              marginTop: 18,
              padding: 10,
              ...iosShadow,
            }}>
            {contactActions.map((item) => (
              <TouchableOpacity
                key={item.channel}
                activeOpacity={0.85}
                disabled={contactPending}
                onPress={() => handleContact(item.channel)}
                style={{
                  alignItems: 'center',
                  backgroundColor:
                    item.channel === 'whatsapp'
                      ? '#ECFDF5'
                      : item.channel === 'call'
                      ? '#FFF7ED'
                      : '#F8FAFC',
                  borderColor:
                    item.channel === 'whatsapp'
                      ? '#BBF7D0'
                      : item.channel === 'call'
                      ? '#FED7AA'
                      : '#E2E8F0',
                  borderRadius: 21,
                  borderWidth: 1,
                  height: 72,
                  justifyContent: 'center',
                  width: '31%',
                }}>
                <Ionicons
                  name={item.icon}
                  size={21}
                  color={
                    item.channel === 'whatsapp'
                      ? '#16A34A'
                      : item.channel === 'call'
                      ? palette.accent
                      : '#475569'
                  }
                />

                <Text
                  style={{
                    color:
                      item.channel === 'whatsapp'
                        ? '#15803D'
                        : item.channel === 'call'
                        ? '#C2410C'
                        : '#334155',
                    fontSize: 14,
                    fontWeight: '900',
                    marginTop: 8,
                  }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderSection(
            'Business Snapshot',
            <View
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderRadius: 26,
                borderWidth: 1,
                paddingHorizontal: 16,
                ...iosShadow,
              }}>
              {renderInfoRow(
                'albums-outline',
                'Category',
                listing.categoryName ||
                  listing.category?.name ||
                  'Community listing'
              )}
              {renderInfoRow(
                'ribbon-outline',
                'Verification',
                `${formatStatus(listing.verificationStatus)}${
                  listing.verifiedAt
                    ? ` · ${formatDisplayDate(listing.verifiedAt)}`
                    : ''
                }`
              )}
              {renderInfoRow(
                'briefcase-outline',
                'Experience',
                listing.yearsOfExperience != null
                  ? `${listing.yearsOfExperience} years`
                  : null
              )}
              {renderInfoRow(
                'home-outline',
                'Home Service',
                listing.homeServiceAvailable
                  ? 'Available'
                  : 'Not available'
              )}
              {renderInfoRow(
                'time-outline',
                'Response Time',
                listing.responseTimeLabel ||
                  'Usually responds soon'
              )}
              {renderInfoRow(
                'calendar-outline',
                'Published',
                formatDisplayDate(listing.publishedAt)
              )}
            </View>
          )}

          {renderSection(
            'Contact & Web',
            <View
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderRadius: 26,
                borderWidth: 1,
                paddingHorizontal: 16,
                ...iosShadow,
              }}>
              {renderInfoRow(
                'call-outline',
                'Phone',
                listing.phoneNumber,
                listing.phoneNumber
                  ? () => handleContact('call')
                  : undefined
              )}
              {renderInfoRow(
                'logo-whatsapp',
                'WhatsApp',
                listing.whatsappNumber,
                listing.whatsappNumber || listing.phoneNumber
                  ? () => handleContact('whatsapp')
                  : undefined
              )}
              {renderInfoRow(
                'mail-outline',
                'Email',
                listing.email,
                listing.email
                  ? () => handleContact('in_app')
                  : undefined
              )}
              {renderInfoRow(
                'globe-outline',
                'Website',
                listing.websiteUrl,
                listing.websiteUrl
                  ? () => openExternalUrl(listing.websiteUrl || '')
                  : undefined
              )}
              {!contactSummary.length ? (
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontSize: 14,
                    fontWeight: '700',
                    paddingVertical: 16,
                    textAlign: 'center',
                  }}>
                  Contact details are not available yet.
                </Text>
              ) : null}
            </View>
          )}

          {renderSection(
            'Location',
            <View
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderRadius: 26,
                borderWidth: 1,
                paddingHorizontal: 16,
                ...iosShadow,
              }}>
              {renderInfoRow(
                'location-outline',
                'Address',
                joinLocation(listing),
                handleOpenMap
              )}
              {renderInfoRow('business-outline', 'City', listing.city)}
              {renderInfoRow('map-outline', 'State', listing.state)}
              {renderInfoRow('earth-outline', 'Country', listing.country)}
              {renderInfoRow('mail-open-outline', 'Pincode', listing.pincode)}
              {renderInfoRow(
                'navigate-outline',
                'Coordinates',
                listing.latitude != null && listing.longitude != null
                  ? `${listing.latitude}, ${listing.longitude}`
                  : null,
                listing.latitude != null && listing.longitude != null
                  ? handleOpenMap
                  : undefined
              )}
            </View>,
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={handleOpenMap}>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 14,
                  fontWeight: '900',
                }}>
                Open Map
              </Text>
            </TouchableOpacity>
          )}

          {renderSection(
            'Services & Tags',
            <View
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderRadius: 26,
                borderWidth: 1,
                padding: 16,
                ...iosShadow,
              }}>
              {listing.category?.description ? (
                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 15,
                    fontWeight: '600',
                    lineHeight: 23,
                  }}>
                  {listing.category.description}
                </Text>
              ) : null}
              {renderChipGroup(
                'Subcategories',
                subcategories,
                listing.categoryName || undefined
              )}
              {renderChipGroup('Specialties', listing.specialties || [])}
              {renderChipGroup('Service Areas', serviceAreas)}
              {renderChipGroup('Tags', tags)}
            </View>
          )}

          {openingHourRows.length > 0
            ? renderSection(
                'Opening Hours',
                <View
                  style={{
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                    borderRadius: 26,
                    borderWidth: 1,
                    paddingHorizontal: 16,
                    ...iosShadow,
                  }}>
                  {openingHourRows.map((item) =>
                    renderInfoRow(
                      'time-outline',
                      item.label,
                      item.value
                    )
                  )}
                </View>
              )
            : null}

          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 20,
            }}>
            <View
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderRadius: 30,
                borderWidth: 1,
                padding: 18,
                ...iosShadow,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                {listing.owner?.profileImageUrl ||
                listing.owner?.avatarUrl ||
                listing.ownerAvatarUrl ? (
                  <Image
                    source={{
                      uri:
                        listing.owner?.profileImageUrl ||
                        listing.owner?.avatarUrl ||
                        listing.ownerAvatarUrl ||
                        '',
                    }}
                    style={{
                      borderRadius: 31,
                      height: 62,
                      width: 62,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#FFF7ED',
                      borderRadius: 31,
                      height: 62,
                      justifyContent: 'center',
                      width: 62,
                    }}>
                    <Text
                      style={{
                        color: '#F97316',
                        fontSize: 24,
                        fontWeight: '900',
                      }}>
                      ॐ
                    </Text>
                  </View>
                )}

                <View
                  style={{
                    flex: 1,
                    marginLeft: 14,
                  }}>
                  <Text
                    style={{
                      color: '#111827',
                      fontSize: 22,
                      fontWeight: '800',
                    }}>
                    {ownerName(listing)}
                  </Text>

                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginTop: 5,
                    }}>
                    <Text
                      style={{
                        color: '#F97316',
                        fontSize: 15,
                        fontWeight: '700',
                      }}>
                      ॐ
                    </Text>

                    <Text
                      style={{
                        color: '#6B7280',
                        fontSize: 16,
                        fontWeight: '500',
                        marginLeft: 5,
                      }}>
                      {listing.owner?.badge ||
                        listing.ownerDevoteeBadge ||
                        'Sai Family Member'}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: '#9CA3AF',
                      fontSize: 14,
                      fontWeight: '500',
                      marginTop: 5,
                    }}>
                    {ownerMemberSince(listing)}
                  </Text>

                  {listing.owner?.memberId ||
                  listing.ownerMemberId ||
                  listing.owner?.handle ? (
                    <Text
                      style={{
                        color: '#6B7280',
                        fontSize: 13,
                        fontWeight: '700',
                        marginTop: 5,
                      }}>
                      {[
                        listing.owner?.memberId ||
                          listing.ownerMemberId,
                        listing.owner?.handle
                          ? `@${listing.owner.handle}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View
                style={{
                  backgroundColor: '#F1F1F1',
                  height: 1,
                  marginVertical: 18,
                }}
              />

              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 17,
                    fontWeight: '500',
                  }}>
                  Response time
                </Text>

                <Text
                  numberOfLines={1}
                  style={{
                    color: '#1F2937',
                    flex: 1,
                    fontSize: 17,
                    fontWeight: '700',
                    marginLeft: 16,
                    textAlign: 'right',
                  }}>
                  {listing.responseTimeLabel ||
                    'Usually responds soon'}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: '#F1F1F1',
                  height: 1,
                  marginVertical: 18,
                }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}>
                {[
                  ['Views', listing.viewCount || 0],
                  ['Enquiries', listing.enquiryCount || 0],
                  ['Shares', listing.shareCount || 0],
                  ['Bookmarks', listing.bookmarkCount || 0],
                ].map(([label, value]) => (
                  <View
                    key={label}
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#F8FAFC',
                      borderColor: '#E2E8F0',
                      borderRadius: 16,
                      borderWidth: 1,
                      marginTop: 8,
                      paddingVertical: 12,
                      width: '48%',
                    }}>
                    <Text
                      style={{
                        color: '#111827',
                        fontSize: 18,
                        fontWeight: '900',
                      }}>
                      {value}
                    </Text>
                    <Text
                      style={{
                        color: '#6B7280',
                        fontSize: 12,
                        fontWeight: '800',
                        marginTop: 3,
                      }}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

	          {similarListings.length > 0 ? (
	            <View
	              style={{
	                marginTop: 22,
	                paddingHorizontal: 16,
	              }}>
              <Text
                style={{
	                  color: palette.ink,
	                  fontSize: 19,
	                  fontWeight: '900',
	                }}>
                Similar Community Listings
              </Text>

              <ScrollView
                contentContainerStyle={{
                  paddingTop: 16,
                }}
                horizontal
                showsHorizontalScrollIndicator={false}>
                {similarListings.map((item) => {
                  const image = listingLogo(item);

                  return (
                    <TouchableOpacity
                      activeOpacity={0.88}
                      key={item.id}
                      onPress={() =>
                        router.push({
                          pathname:
                            '/directory/business-details',
                          params: {
                            id: item.id,
                          },
                        })
                      }
	                      style={{
	                        backgroundColor: palette.card,
	                        borderColor: palette.border,
	                        borderRadius: 24,
	                        borderWidth: 1,
	                        marginRight: 14,
	                        padding: 14,
	                        ...iosShadow,
	                        width: 220,
	                      }}>
                      <View
                        style={{
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}>
                        {image ? (
                          <Image
                            source={{ uri: image }}
                            style={{
                              borderRadius: 18,
                              height: 52,
                              width: 52,
                            }}
                          />
                        ) : (
                          <View
                            style={{
                              alignItems: 'center',
	                              backgroundColor: '#FFF7ED',
	                              borderColor: '#FED7AA',
	                              borderRadius: 18,
	                              borderWidth: 1,
                              height: 52,
                              justifyContent: 'center',
                              width: 52,
                            }}>
                            <MaterialCommunityIcons
                              color="#F97316"
                              name="storefront"
                              size={25}
                            />
                          </View>
                        )}

                        <View
                          style={{
                            flex: 1,
                            marginLeft: 12,
                          }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: '#111827',
                              fontSize: 15,
                              fontWeight: '900',
                            }}>
                            {item.businessName}
                          </Text>

                          <Text
                            numberOfLines={1}
                            style={{
                              color: '#6B7280',
                              fontSize: 12,
                              fontWeight: '700',
                              marginTop: 5,
                            }}>
                            {item.categoryName ||
                              item.city ||
                              'Community listing'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {renderSection(
            'Reviews & Rating',
	            <View
	              style={{
	                backgroundColor: palette.card,
	                borderColor: palette.border,
	                borderRadius: 28,
	                borderWidth: 1,
	                padding: 16,
	                ...iosShadow,
	              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#FFFBEA',
                    borderColor: '#FDE68A',
                    borderRadius: 20,
                    borderWidth: 1,
                    height: 72,
                    justifyContent: 'center',
                    width: 72,
                  }}>
                  <Text
                    style={{
                      color: '#D97706',
                      fontSize: 25,
                      fontWeight: '900',
                    }}>
                    {rating.toFixed(1)}
                  </Text>
                  <Text
                    style={{
                      color: '#B45309',
                      fontSize: 11,
                      fontWeight: '900',
                    }}>
                    STAR
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 14,
                  }}>
                  <Text
                    style={{
                      color: '#111827',
                      fontSize: 17,
                      fontWeight: '900',
                    }}>
                    {reviewCount} community reviews
                  </Text>
                  <Text
                    style={{
                      color: '#6B7280',
                      fontSize: 13,
                      fontWeight: '600',
                      lineHeight: 20,
                      marginTop: 4,
                    }}>
                    {reviewSummary?.canReview
                      ? 'You can add your experience for this business.'
                      : reviewSummary?.reviewGateReason
                      ? `Review status: ${formatStatus(
                          reviewSummary.reviewGateReason
                        )}`
                      : 'Reviews from devotees will appear here.'}
                  </Text>
                </View>
              </View>

              {reviewSummary?.distribution ? (
                <View
                  style={{
                    marginTop: 18,
                  }}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count =
                      reviewSummary.distribution?.[String(star)] || 0;
                    const maxCount = Math.max(
                      ...Object.values(
                        reviewSummary.distribution || {}
                      ),
                      1
                    );

                    return (
                      <View
                        key={star}
                        style={{
                          alignItems: 'center',
                          flexDirection: 'row',
                          marginTop: 7,
                        }}>
                        <Text
                          style={{
                            color: '#6B7280',
                            fontSize: 12,
                            fontWeight: '900',
                            width: 34,
                          }}>
                          {star}★
                        </Text>
                        <View
                          style={{
                            backgroundColor: '#F3F4F6',
                            borderRadius: 100,
                            flex: 1,
                            height: 8,
                            overflow: 'hidden',
                          }}>
                          <View
                            style={{
                              backgroundColor: '#F59E0B',
                              height: '100%',
                              width: `${(count / maxCount) * 100}%`,
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            color: '#6B7280',
                            fontSize: 12,
                            fontWeight: '800',
                            marginLeft: 8,
                            width: 24,
                          }}>
                          {count}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {recentReviews.length > 0 ? (
                <View
                  style={{
                    marginTop: 18,
                  }}>
                  {recentReviews.slice(0, 3).map((review) => (
                    <View
                      key={review.id}
                      style={{
                        borderTopColor: '#F3F4F6',
                        borderTopWidth: 1,
                        paddingTop: 14,
                        marginTop: 14,
                      }}>
                      <Text
                        style={{
                          color: '#111827',
                          fontSize: 14,
                          fontWeight: '900',
                        }}>
                        {review.reviewerName || 'Sai Devotee'} ·{' '}
                        {review.rating}★
                      </Text>
                      <Text
                        style={{
                          color: '#4B5563',
                          fontSize: 14,
                          fontWeight: '600',
                          lineHeight: 21,
                          marginTop: 6,
                        }}>
                        {review.content}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>,
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() =>
                router.push({
                  pathname: '/directory/business-review',
                  params: {
                    id: listing.id,
                  },
                })
              }>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 14,
                  fontWeight: '900',
                }}>
                Open
              </Text>
            </TouchableOpacity>
          )}

          <View
            style={{
              alignItems: 'center',
              marginTop: 52,
              paddingHorizontal: 18,
            }}>
            <Text
              style={{
                color: '#111827',
                fontSize: 18,
                fontWeight: '800',
              }}>
              Community Trust
            </Text>

            <Text
              style={{
                color: '#6B7280',
                fontSize: 16,
                lineHeight: 25,
                marginTop: 8,
                textAlign: 'center',
              }}>
              Help fellow devotees by sharing your experience
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={
                actionPending ||
                listing.communityRecommendationEnabled === false
              }
              onPress={handleRecommend}
              style={{
                alignItems: 'center',
                backgroundColor: listing.recommendedByMe
                  ? '#ECFDF5'
                  : '#F7FFF9',
                borderColor: '#22C55E',
                borderRadius: 18,
                borderWidth: 2,
                flexDirection: 'row',
                height: 58,
                justifyContent: 'center',
                marginTop: 24,
                opacity:
                  listing.communityRecommendationEnabled === false
                    ? 0.55
                    : 1,
                width: '100%',
              }}>
              <Feather
                name="thumbs-up"
                size={20}
                color="#22C55E"
              />

              <Text
                style={{
                  color: '#22C55E',
                  fontSize: 20,
                  fontWeight: '800',
                  marginLeft: 10,
                }}>
                {listing.recommendedByMe
                  ? 'Recommended'
                  : 'I Recommend This Business'}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: 54,
              paddingHorizontal: 14,
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
                  color: '#111827',
                  fontSize: 22,
                  fontWeight: '800',
                }}>
                Recent Work
              </Text>
            </View>

            {gallery.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}>
                {gallery.map((item) => (
                  <View
                    key={item.id || item.url}
                    style={{
                      marginRight: 14,
                      width: 190,
                    }}>
                    <Image
                      source={{
                        uri: item.url,
                      }}
                      style={{
                        borderRadius: 22,
                        height: 128,
                        width: 190,
                      }}
                    />
                    <View
                      style={{
                        backgroundColor: 'rgba(17,24,39,0.72)',
                        borderRadius: 12,
                        left: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        position: 'absolute',
                        top: 10,
                      }}>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 11,
                          fontWeight: '900',
                          textTransform: 'uppercase',
                        }}>
                        {item.type || 'gallery'}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: '#F8F8F8',
                  borderColor: '#ECECEC',
                  borderRadius: 22,
                  borderWidth: 1,
                  padding: 22,
                }}>
                <Ionicons
                  name="images-outline"
                  size={28}
                  color="#9CA3AF"
                />
                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 14,
                    fontWeight: '600',
                    marginTop: 8,
                  }}>
                  Recent work photos are not available yet.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessDetailsScreen;
