import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  blockSanghaDevoteeRequest,
  disconnectSanghaDevoteeRequest,
  fetchSanghaProfileRequest,
  requestSanghaConnectionRequest,
} from '@/store/sangha/actions';
import {
  selectIsSanghaActionPending,
  selectSanghaError,
  selectSanghaProfile,
  selectSanghaProfileLoading,
} from '@/store/sangha/selectors';
import { SanghaDevoteeProfile } from '@/store/sangha/types';
import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

const profileTabs = [
  'About',
  'Experiences',
  'Events',
] as const;

type ProfileTab = (typeof profileTabs)[number];

function getProfileId(profile?: SanghaDevoteeProfile | null) {
  return profile?.userId || profile?.id || '';
}

function getAvatarUri(profile?: SanghaDevoteeProfile | null) {
  const name = profile?.name || 'Sai Family';

  return (
    profile?.avatarUrl ||
    profile?.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=FFF7ED&color=F97316`
  );
}

function getLocationLabel(profile?: SanghaDevoteeProfile | null) {
  const location =
    profile?.approximateLocationLabel ||
    [profile?.city, profile?.state].filter(Boolean).join(', ');

  return location
    ? location.toUpperCase()
    : 'SAI FAMILY DEVOTEE';
}

function getBio(profile?: SanghaDevoteeProfile | null) {
  return (
    profile?.bio ||
    [
      profile?.tradition,
      profile?.city
        ? `based in ${profile.city}`
        : null,
      'walking the Sai path with the community.',
    ]
      .filter(Boolean)
      .join(', ')
  );
}

function getInterests(profile?: SanghaDevoteeProfile | null) {
  return [
    ...(profile?.interests || []),
    ...(profile?.purposeTags || []),
  ].filter(Boolean);
}

function getConnectLabel(
  profile?: SanghaDevoteeProfile | null
) {
  switch (profile?.connectionStatus) {
    case 'connected':
      return 'Connected';
    case 'pending':
      return 'Requested';
    case 'blocked':
      return 'Blocked';
    default:
      return 'Connect';
  }
}

function getConnectIcon(
  profile?: SanghaDevoteeProfile | null
) {
  switch (profile?.connectionStatus) {
    case 'connected':
      return 'checkmark-circle';
    case 'pending':
      return 'time';
    case 'blocked':
      return 'ban';
    default:
      return 'person-add';
  }
}

function formatDateLabel(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimeLabel(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const SanghaProfileScreen = () => {
  const { id } =
    useLocalSearchParams<{
      id?: string;
    }>();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectSanghaProfile);
  const loading = useAppSelector(selectSanghaProfileLoading);
  const error = useAppSelector(selectSanghaError);
  const [activeTab, setActiveTab] =
    useState<ProfileTab>('About');
  const profileId = getProfileId(profile) || id || '';
  const actionPending = useAppSelector((state) =>
    selectIsSanghaActionPending(state, profileId)
  );
  const interests = useMemo(
    () => getInterests(profile),
    [profile]
  );
  const journeyItems = useMemo(
    () =>
      [
        {
          active: true,
          subtitle: profile?.joinedAt
            ? formatDateLabel(profile.joinedAt)
            : profile?.memberId || 'Sai Family member',
          title: 'Joined Sai Family',
        },
        profile?.tradition
          ? {
              subtitle: profile.tradition,
              title: 'Spiritual Tradition',
            }
          : null,
        profile?.purposeTags?.length
          ? {
              subtitle: profile.purposeTags.join(', '),
              title: 'Sangha Purpose',
            }
          : null,
      ].filter(Boolean) as Array<{
        active?: boolean;
        subtitle: string;
        title: string;
      }>,
    [profile]
  );
  const experiences = profile?.experiences || [];
  const events = profile?.events || [];

  useEffect(() => {
    if (id) {
      dispatch(fetchSanghaProfileRequest(id));
    }
  }, [dispatch, id]);

  const handleConnectionPress = () => {
    if (!profileId || actionPending) {
      return;
    }

    if (profile?.connectionStatus === 'connected') {
      dispatch(disconnectSanghaDevoteeRequest(profileId));
      return;
    }

    if (
      profile?.connectionStatus === 'pending' ||
      profile?.connectionStatus === 'blocked'
    ) {
      return;
    }

    dispatch(requestSanghaConnectionRequest(profileId));
  };

  const handleBlock = () => {
    if (!profileId || actionPending) {
      return;
    }

    Alert.alert(
      'Block devotee?',
      'This will stop connection requests and hide this devotee from your Sangha discovery.',
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          onPress: () =>
            dispatch(
              blockSanghaDevoteeRequest({
                id: profileId,
                reason: 'Blocked from mobile profile screen',
              })
            ),
          style: 'destructive',
          text: 'Block',
        },
      ]
    );
  };

  if (loading && !profile) {
    return (
      <SafeAreaView
        style={{
          alignItems: 'center',
          backgroundColor: '#F8F7F5',
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
        <ActivityIndicator color="#D96A3D" />
        <Text
          style={{
            color: '#8B7355',
            fontSize: 15,
            fontWeight: '800',
            marginTop: 14,
          }}>
          Loading devotee profile
        </Text>
      </SafeAreaView>
    );
  }

  if (!loading && !profile && error) {
    return (
      <SafeAreaView
        style={{
          backgroundColor: '#F8F7F5',
          flex: 1,
          padding: 24,
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
            color="#111827"
          />
        </TouchableOpacity>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            marginTop: 28,
            padding: 22,
          }}>
          <Text
            style={{
              color: '#111827',
              fontSize: 20,
              fontWeight: '900',
            }}>
            Profile unavailable
          </Text>
          <Text
            style={{
              color: '#8B7355',
              fontSize: 15,
              fontWeight: '600',
              lineHeight: 24,
              marginTop: 8,
            }}>
            {error}
          </Text>
          {id ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                dispatch(fetchSanghaProfileRequest(id))
              }
              style={{
                alignItems: 'center',
                backgroundColor: '#D96A3D',
                borderRadius: 18,
                height: 48,
                justifyContent: 'center',
                marginTop: 18,
              }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: '900',
                }}>
                Retry
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F8F7F5',
      }}>
      <StatusBar
        backgroundColor="#F8F7F5"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 22,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          {/* Back */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.back()}
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: '#FFFFFF',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="#111827"
            />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={{
              fontSize: 24,
              color: '#111111',
              fontWeight: '600',
              fontStyle: 'italic',
              letterSpacing: -0.4,
              fontFamily: 'serif',
            }}>
            Devotee Profile
          </Text>

          {/* Menu */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleBlock}
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: '#FFFFFF',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <Ionicons
              name="ban-outline"
              size={22}
              color="#111827"
            />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View
          style={{
            marginTop: 34,
            alignItems: 'center',
          }}>
          {/* Avatar */}
          <View>
            <Image
              source={{
                uri: getAvatarUri(profile),
              }}
              style={{
                width: 136,
                height: 136,
                borderRadius: 68,
                borderWidth: 4,
                borderColor: '#FFFFFF',
              }}
            />

            {/* Badge */}
            <View
              style={{
                position: 'absolute',
                right: -2,
                bottom: 4,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }}>
              <Text
                style={{
                  fontSize: 24,
                  color: '#E67E22',
                  fontWeight: '700',
                }}>
                ॐ
              </Text>
            </View>
          </View>

          {/* Name */}
          <Text
            style={{
              marginTop: 34,
              fontSize: 34,
              color: '#111111',
              fontWeight: '700',
              fontFamily: 'serif',
              letterSpacing: -0.8,
            }}>
            {profile?.name || 'Sai Family Devotee'}
          </Text>

          {/* Location */}
          <Text
            style={{
              marginTop: 8,
              fontSize: 16,
              letterSpacing: 2,
              color: '#8B7355',
              fontWeight: '700',
            }}>
            {getLocationLabel(profile)}
          </Text>
        </View>

        {/* Quote Card */}
        <View
          style={{
            marginTop: 28,
            marginHorizontal: 22,
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            paddingHorizontal: 24,
            paddingVertical: 26,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.03,
            shadowRadius: 10,
            elevation: 2,
          }}>
          {/* Quote */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
            <Text
              style={{
                fontSize: 44,
                color: '#F3D5C6',
                fontWeight: '700',
                lineHeight: 48,
                marginRight: 8,
              }}>
              “
            </Text>

            <Text
              style={{
                flex: 1,
                fontSize: 18,
                lineHeight: 42,
                color: '#5B5148',
                fontStyle: 'italic',
                fontFamily: 'serif',
              }}>
              {getBio(profile)}
            </Text>
          </View>
        </View>

        {/* Connect Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          disabled={
            actionPending ||
            profile?.connectionStatus === 'pending' ||
            profile?.connectionStatus === 'blocked'
          }
          onPress={handleConnectionPress}
          style={{
            marginTop: 28,
            marginHorizontal: 50,
            height: 64,
            borderRadius: 32,
            backgroundColor:
              profile?.connectionStatus === 'connected'
                ? '#111111'
                : profile?.connectionStatus === 'pending' ||
                    profile?.connectionStatus === 'blocked'
                  ? '#8B7355'
                  : '#D96A3D',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            shadowColor: '#D96A3D',
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.24,
            shadowRadius: 14,
            elevation: 6,
          }}>
          {actionPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons
              name={getConnectIcon(profile)}
              size={22}
              color="#FFFFFF"
            />
          )}

          <Text
            style={{
              marginLeft: 10,
              fontSize: 22,
              color: '#FFFFFF',
              fontWeight: '700',
            }}>
            {actionPending
              ? 'Please wait'
              : getConnectLabel(profile)}
          </Text>
        </TouchableOpacity>

        {/* Mutual Friends */}
        <View
          style={{
            marginTop: 40,
            marginHorizontal: 22,
            height: 82,
            borderRadius: 41,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#EFEFEF',
            paddingHorizontal: 18,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.02,
            shadowRadius: 8,
            elevation: 1,
          }}>
          {/* Avatars */}
          <View
            style={{
              flexDirection: 'row',
              marginRight: 18,
            }}>
            <Image
              source={{
                uri: 'https://randomuser.me/api/portraits/men/11.jpg',
              }}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                borderWidth: 2,
                borderColor: '#FFFFFF',
              }}
            />

            <Image
              source={{
                uri: 'https://randomuser.me/api/portraits/women/12.jpg',
              }}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                borderWidth: 2,
                borderColor: '#FFFFFF',
                marginLeft: -10,
              }}
            />
          </View>

          {/* Text */}
          <Text
            style={{
              flex: 1,
              fontSize: 16,
              lineHeight: 28,
              color: '#5B5B5B',
              fontWeight: '500',
            }}>
            You and {profile?.name || 'this devotee'} have{' '}
            <Text
              style={{
                color: '#111111',
                fontWeight: '800',
              }}>
              {profile?.mutualConnectionCount || 0}
            </Text>
            {' '}mutual Sangha connections
          </Text>
        </View>

        {/* Tabs */}
        <View
          style={{
            marginTop: 42,
            borderBottomWidth: 1,
            borderBottomColor: '#EAEAEA',
            flexDirection: 'row',
            paddingHorizontal: 24,
          }}>
          {profileTabs.map((tab, index) => {
            const active = activeTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.85}
                onPress={() => setActiveTab(tab)}
                style={{
                  marginRight:
                    index === profileTabs.length - 1
                      ? 0
                      : 34,
                  paddingBottom: 16,
                  borderBottomWidth: active
                    ? 2.5
                    : 0,
                  borderBottomColor: '#D96A3D',
                }}>
                <Text
                  style={{
                    fontSize: 17,
                    color: active
                      ? '#111111'
                      : '#8B7355',
                    fontWeight: active ? '700' : '500',
                  }}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'About' && (
          <>
            {/* Journey Card */}
            <View
              style={{
                marginTop: 28,
                marginHorizontal: 22,
                backgroundColor: '#FFFFFF',
                borderRadius: 34,
                paddingHorizontal: 26,
                paddingVertical: 28,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.03,
                shadowRadius: 10,
                elevation: 2,
              }}>
              {/* Title */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {/* Icon */}
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: '#F8EFE7',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 14,
                  }}>
                  <Ionicons
                    name="leaf"
                    size={18}
                    color="#D96A3D"
                  />
                </View>

                <Text
                  style={{
                    fontSize: 24,
                    color: '#111111',
                    fontWeight: '700',
                    fontFamily: 'serif',
                  }}>
                  Spiritual Journey
                </Text>
              </View>

              {/* Timeline */}
              <View
                style={{
                  marginTop: 28,
                  paddingLeft: 10,
                }}>
                {journeyItems.map((item, index) => (
                  <View
                    key={item.title}
                    style={{
                      flexDirection: 'row',
                      marginBottom:
                        index === journeyItems.length - 1
                          ? 0
                          : 26,
                    }}>
                    <View
                      style={{
                        alignItems: 'center',
                        marginRight: 18,
                      }}>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          borderWidth: 3,
                          borderColor: item.active
                            ? '#E6D6C5'
                            : '#E8DFD5',
                          backgroundColor: '#FFFFFF',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        {item.active && (
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor:
                                '#D96A3D',
                            }}
                          />
                        )}
                      </View>

                      {index !== journeyItems.length - 1 && (
                        <View
                          style={{
                            width: 2,
                            height: 54,
                            backgroundColor:
                              '#EFE6DD',
                          }}
                        />
                      )}
                    </View>

                    <View
                      style={{
                        flex: 1,
                        paddingTop: 2,
                      }}>
                      <Text
                        style={{
                          fontSize: 18,
                          color: '#111111',
                          fontWeight: '700',
                        }}>
                        {item.title}
                      </Text>

                      <Text
                        style={{
                          marginTop: 6,
                          fontSize: 16,
                          color: '#8B7355',
                          fontWeight: '500',
                        }}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Interests */}
            <View
              style={{
                marginTop: 38,
                paddingHorizontal: 24,
              }}>
              <Text
                style={{
                  fontSize: 26,
                  color: '#111111',
                  fontWeight: '700',
                  fontFamily: 'serif',
                }}>
                Practices & Interests
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginTop: 22,
                }}>
                {interests.length === 0 ? (
                  <View
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#F0F0F0',
                      borderRadius: 24,
                      borderWidth: 1,
                      marginTop: 20,
                      padding: 18,
                    }}>
                    <Text
                      style={{
                        color: '#8B7355',
                        fontSize: 15,
                        fontWeight: '700',
                      }}>
                      This devotee has not shared practices yet.
                    </Text>
                  </View>
                ) : null}

                {interests.map((item, index) => (
                  <TouchableOpacity
                    key={`${item}-${index}`}
                    activeOpacity={0.85}
                    style={{
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#F0F0F0',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      marginRight: 12,
                      marginBottom: 14,
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.02,
                      shadowRadius: 4,
                      elevation: 1,
                    }}>
                    <Text
                      style={{
                        fontSize: 17,
                        color: '#444444',
                        fontWeight: '500',
                      }}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {activeTab === 'Experiences' && (
          <View
            style={{
              marginTop: 26,
              paddingHorizontal: 18,
            }}>
            <Text
              style={{
                fontSize: 24,
                color: '#111111',
                fontWeight: '700',
                fontFamily: 'serif',
              }}>
              Shared Experiences
            </Text>

            {experiences.length === 0 ? (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 26,
                  marginTop: 18,
                  padding: 18,
                }}>
                <Text
                  style={{
                    color: '#8B7355',
                    fontSize: 15,
                    fontWeight: '700',
                    lineHeight: 24,
                  }}>
                  No shared experiences are visible yet.
                </Text>
              </View>
            ) : null}

            {experiences.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                activeOpacity={0.9}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 26,
                  marginTop: 18,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  elevation: 2,
                }}>
                {item.image ||
                item.imageUrl ||
                item.thumbnailUrl ||
                item.mediaUrl ? (
                  <Image
                    source={{
                      uri:
                        item.image ||
                        item.imageUrl ||
                        item.thumbnailUrl ||
                        item.mediaUrl,
                    }}
                    style={{
                      height: 150,
                      width: '100%',
                    }}
                  />
                ) : null}
                <View
                  style={{
                    padding: 16,
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}>
                    <Ionicons
                      name="location"
                      size={15}
                      color="#D96A3D"
                    />
                    <Text
                      style={{
                        color: '#8B7355',
                        fontSize: 13,
                        fontWeight: '700',
                        marginLeft: 6,
                      }}>
                      {[
                        item.place ||
                          item.locationName ||
                          item.venueName,
                        item.time ||
                          formatDateLabel(
                            item.createdAt || item.updatedAt
                          ),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: '#3F332B',
                      fontSize: 16,
                      fontWeight: '600',
                      lineHeight: 25,
                      marginTop: 12,
                    }}>
                    {item.content ||
                      item.description ||
                      item.title ||
                      'Shared a Sangha experience.'}
                  </Text>
                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginTop: 14,
                    }}>
                    <Ionicons
                      name="heart"
                      size={18}
                      color="#D96A3D"
                    />
                    <Text
                      style={{
                        color: '#8B7355',
                        fontSize: 14,
                        fontWeight: '700',
                        marginLeft: 7,
                      }}>
                      {item.likes ||
                        item.likeCount ||
                        item.blessingCount ||
                        0}{' '}
                      blessings
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'Events' && (
          <View
            style={{
              marginTop: 26,
              paddingHorizontal: 18,
            }}>
            <Text
              style={{
                fontSize: 24,
                color: '#111111',
                fontWeight: '700',
                fontFamily: 'serif',
              }}>
              Events Joined
            </Text>

            {events.length === 0 ? (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 26,
                  marginTop: 18,
                  padding: 18,
                }}>
                <Text
                  style={{
                    color: '#8B7355',
                    fontSize: 15,
                    fontWeight: '700',
                    lineHeight: 24,
                  }}>
                  No joined events are visible yet.
                </Text>
              </View>
            ) : null}

            {events.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                activeOpacity={0.9}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 26,
                  flexDirection: 'row',
                  marginTop: 18,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  elevation: 2,
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#FFF3E8',
                    borderRadius: 18,
                    height: 72,
                    justifyContent: 'center',
                    width: 72,
                  }}>
                  <Text
                    style={{
                      color: '#D96A3D',
                      fontSize: 18,
                      fontWeight: '900',
                      textAlign: 'center',
                    }}>
                    {item.date ||
                      formatDateLabel(
                        item.startAt || item.createdAt
                      )}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 14,
                  }}>
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: '#F8EFE7',
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}>
                    <Text
                      style={{
                        color: '#D96A3D',
                        fontSize: 12,
                        fontWeight: '800',
                      }}>
                      {item.type || 'Sangha'}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: '#111111',
                      fontSize: 18,
                      fontWeight: '800',
                      marginTop: 9,
                    }}>
                    {item.title || item.name || 'Sangha Event'}
                  </Text>

                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginTop: 8,
                    }}>
                    <Ionicons
                      name="time-outline"
                      size={15}
                      color="#8B7355"
                    />
                    <Text
                      style={{
                        color: '#8B7355',
                        fontSize: 14,
                        fontWeight: '600',
                        marginLeft: 6,
                      }}>
                      {item.time ||
                        formatTimeLabel(item.startAt)}
                    </Text>
                  </View>

                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginTop: 6,
                    }}>
                    <Ionicons
                      name="location-outline"
                      size={15}
                      color="#8B7355"
                    />
                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#8B7355',
                        flex: 1,
                        fontSize: 14,
                        fontWeight: '600',
                        marginLeft: 6,
                      }}>
                      {item.venue ||
                        item.venueName ||
                        item.address ||
                        item.city ||
                        'Location shared in event'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SanghaProfileScreen;
