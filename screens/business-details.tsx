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
  const value = listing?.owner?.memberSince;

  if (!value) {
    return 'Community member';
  }

  const year = new Date(value).getFullYear();

  return Number.isFinite(year)
    ? `Member since ${year}`
    : 'Community member';
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

  return (
    <SafeAreaView
      style={{
        backgroundColor: '#F7F7F7',
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
          paddingBottom: 40,
        }}>
        <View>
          {banner ? (
            <Image
              source={{ uri: banner }}
              style={{
                height: 320,
                width: '100%',
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#F8EFE3',
                height: 320,
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

          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.22)',
              height: 320,
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
                backgroundColor: 'rgba(255,255,255,0.92)',
                borderRadius: 21,
                height: 42,
                justifyContent: 'center',
                width: 42,
              }}>
              <Ionicons
                name="arrow-back"
                size={22}
                color="#111827"
              />
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
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  borderRadius: 21,
                  height: 42,
                  justifyContent: 'center',
                  marginRight: 10,
                  width: 42,
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
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShare}
                style={{
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  borderRadius: 21,
                  height: 42,
                  justifyContent: 'center',
                  width: 42,
                }}>
                <Ionicons
                  name="share-social-outline"
                  size={21}
                  color="#374151"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={actionPending}
                onPress={handleReport}
                style={{
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  borderRadius: 21,
                  height: 42,
                  justifyContent: 'center',
                  marginLeft: 10,
                  width: 42,
                }}>
                <Ionicons
                  name="flag-outline"
                  size={20}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 22,
              bottom: -28,
              elevation: 4,
              height: 74,
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
              width: 74,
            }}>
            {logo ? (
              <Image
                source={{ uri: logo }}
                style={{
                  borderRadius: 22,
                  height: 44,
                  width: 44,
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
            backgroundColor: '#FFFFFF',
            marginTop: 0,
            paddingTop: 44,
          }}>
          <View
            style={{
              paddingHorizontal: 16,
            }}>
            <Text
              style={{
                color: '#111827',
                fontSize: 20,
                fontWeight: '800',
              }}>
              {listing.businessName}
            </Text>

            <Text
              style={{
                color: '#6B7280',
                fontSize: 16,
                fontWeight: '500',
                marginTop: 6,
              }}>
              {listing.tagline ||
                listing.categoryName ||
                'Trusted community service'}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 24,
              paddingHorizontal: 14,
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB',
                borderRadius: 18,
                borderWidth: 1,
                height: 82,
                justifyContent: 'center',
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
                  fontWeight: '700',
                  marginTop: 10,
                }}>
                {isVerified ? 'Sai Verified' : 'Listed'}
              </Text>
            </View>

            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#EEF4FF',
                borderColor: '#D7E4FF',
                borderRadius: 18,
                borderWidth: 1,
                height: 82,
                justifyContent: 'center',
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
                backgroundColor: '#FFFBEA',
                borderColor: '#FCE7A5',
                borderRadius: 18,
                borderWidth: 1,
                height: 82,
                justifyContent: 'center',
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
              marginTop: 36,
              paddingHorizontal: 16,
            }}>
            <Text
              style={{
                color: '#111827',
                fontSize: 15,
                fontWeight: '800',
                letterSpacing: 1,
              }}>
              SPECIALTIES
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
                    backgroundColor: '#F8F8F8',
                    borderColor: '#E5E7EB',
                    borderRadius: 24,
                    borderWidth: 1,
                    marginBottom: 10,
                    marginRight: 10,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}>
                  <Text
                    style={{
                      color: '#4B5563',
                      fontSize: 15,
                      fontWeight: '500',
                    }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              style={{
                color: '#4B5563',
                fontSize: 17,
                fontWeight: '400',
                lineHeight: 31,
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
              borderBottomColor: '#F5F5F5',
              borderBottomWidth: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 28,
              paddingBottom: 20,
              paddingHorizontal: 14,
            }}>
            {contactActions.map((item) => (
              <TouchableOpacity
                key={item.channel}
                activeOpacity={0.85}
                disabled={contactPending}
                onPress={() => handleContact(item.channel)}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  borderRadius: 18,
                  borderWidth: 1,
                  elevation: 1,
                  height: 72,
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    height: 3,
                    width: 0,
                  },
                  shadowOpacity: 0.03,
                  shadowRadius: 6,
                  width: '31%',
                }}>
                <Ionicons
                  name={item.icon}
                  size={21}
                  color="#374151"
                />

                <Text
                  style={{
                    color: '#111827',
                    fontSize: 14,
                    fontWeight: '600',
                    marginTop: 8,
                  }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={{
              paddingHorizontal: 14,
              paddingTop: 28,
            }}>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#ECECEC',
                borderRadius: 28,
                borderWidth: 1,
                padding: 18,
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
                        'Shirdi Sai Devotee'}
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
            </View>
          </View>

          {similarListings.length > 0 ? (
            <View
              style={{
                borderTopColor: '#F5F5F5',
                borderTopWidth: 10,
                marginTop: 30,
                paddingHorizontal: 14,
                paddingTop: 26,
              }}>
              <Text
                style={{
                  color: '#111827',
                  fontSize: 20,
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
                        backgroundColor: '#FFF7ED',
                        borderColor: '#FED7AA',
                        borderRadius: 22,
                        borderWidth: 1,
                        marginRight: 14,
                        padding: 14,
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
                              backgroundColor: '#FFFFFF',
                              borderRadius: 18,
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
                  <Image
                    key={item.id || item.url}
                    source={{
                      uri: item.url,
                    }}
                    style={{
                      borderRadius: 22,
                      height: 128,
                      marginRight: 14,
                      width: 190,
                    }}
                  />
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
