import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';


import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  acceptSanghaInvitationRequest,
  declineSanghaInvitationRequest,
  fetchSanghaGroupsHomeRequest,
} from '@/store/sangha/actions';
import {
  selectSanghaError,
  selectSanghaGroupsHomeLoading,
  selectSanghaHubInvitations,
  selectSanghaHubMyGroups,
  selectSanghaHubPurposeTiles,
} from '@/store/sangha/selectors';
import {
  SanghaGroupSummary,
  SanghaInvitation,
} from '@/store/sangha/types';
import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

const purposePresentation: Record<
  string,
  {
    bg: string;
    icon: keyof typeof Ionicons.glyphMap | string;
    iconColor: string;
    subtitle: string;
    useMaterial?: boolean;
  }
> = {
  bhajan: {
    bg: '#E0F2FE',
    icon: 'musical-notes',
    iconColor: '#0284C7',
    subtitle: 'Musical worship',
  },
  city_chapter: {
    bg: '#FFF7D6',
    icon: 'map-marker-radius',
    iconColor: '#F97316',
    subtitle: 'Local connection',
    useMaterial: true,
  },
  seva: {
    bg: '#FCE7F3',
    icon: 'hands-pray',
    iconColor: '#BE185D',
    subtitle: 'Purpose & service',
  },
  online_global: {
    bg: '#DCFCE7',
    icon: 'earth',
    iconColor: '#16A34A',
    subtitle: 'Diaspora network',
  },
};

function normalizePurposeKey(value?: string) {
  return (value || 'sangha')
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function getAvatarUri(invitation: SanghaInvitation) {
  const invitedBy = invitation.invitedBy;
  const name = invitedBy?.name || 'Sai Family';

  return (
    invitedBy?.avatarUrl ||
    invitedBy?.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=FFF7ED&color=F97316`
  );
}

function getBannerUri(group: SanghaGroupSummary) {
  return (
    group.bannerUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      group.name || 'Sangha'
    )}&background=FFF7ED&color=F97316&size=256`
  );
}

function formatShortDate(value?: string) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

const SanghaHubScreen = () => {
  const dispatch = useAppDispatch();
  const invitations = useAppSelector(
    selectSanghaHubInvitations
  );
  const myGroups = useAppSelector(selectSanghaHubMyGroups);
  const purposeTiles = useAppSelector(
    selectSanghaHubPurposeTiles
  );
  const loading = useAppSelector(
    selectSanghaGroupsHomeLoading
  );
  const error = useAppSelector(selectSanghaError);
  const [filterVisible, setFilterVisible] =
    useState(false);
  const [purpose, setPurpose] = useState('All');
  const [activity, setActivity] = useState('Active');
  const [privacy, setPrivacy] = useState('Any');
  const groupsHomeParams = useMemo(
    () => ({
      limit: 10,
      privacy:
        privacy === 'Any'
          ? 'any'
          : privacy === 'Invite Only'
            ? 'private'
            : privacy.toLowerCase(),
      purpose:
        purpose === 'All'
          ? 'all'
          : normalizePurposeKey(purpose),
    }),
    [privacy, purpose]
  );

  useEffect(() => {
    dispatch(fetchSanghaGroupsHomeRequest(groupsHomeParams));
  }, [dispatch, groupsHomeParams]);

  const refreshHub = () => {
    dispatch(fetchSanghaGroupsHomeRequest(groupsHomeParams));
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#FAFAF9',
      }}>
      <StatusBar
        backgroundColor="#FAFAF9"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshHub}
            tintColor="#F97316"
          />
        }
        contentContainerStyle={{
          paddingBottom: 40,
        }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 22,
            paddingTop: 26,
          }}>
          {/* Top */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            {/* Title */}
            <View>
              <Text
                style={{
                  fontSize: 28,
                  color: '#1F2937',
                  fontWeight: '700',
                  fontFamily: 'serif',
                  letterSpacing: -0.4,
                }}>
                Sangha Hub
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  fontSize: 16,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                Your Spiritual Communities
              </Text>
            </View>

            {/* Notification */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: '#FFF7E6',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}>
              <Ionicons
                name="notifications"
                size={22}
                color="#F97316"
              />

              {/* Dot */}
              <View
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 13,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#9F1239',
                }}
              />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/sangha-hub-search')}
            style={{
              marginTop: 22,
              height: 62,
              borderRadius: 31,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#F0F0F0',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 18,
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
              name="search"
              size={24}
              color="#9CA3AF"
            />

            <TextInput
              editable={false}
              placeholder="Discover groups, chapters, bhajans..."
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 18,
                color: '#111827',
                fontWeight: '500',
              }}
            />

            {/* Filter */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setFilterVisible(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#FFF7ED',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons
                name="options-outline"
                size={20}
                color="#F97316"
              />
            </TouchableOpacity>
          </TouchableOpacity>

          {error ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={refreshHub}
              style={{
                backgroundColor: '#FFF7ED',
                borderColor: '#FDE7CF',
                borderRadius: 22,
                borderWidth: 1,
                marginTop: 16,
                padding: 16,
              }}>
              <Text
                style={{
                  color: '#9A3412',
                  fontSize: 14,
                  fontWeight: '900',
                }}>
                {error}
              </Text>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 13,
                  fontWeight: '900',
                  marginTop: 8,
                }}>
                Tap to retry
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Pending Invitations */}
        <View
          style={{
            marginTop: 34,
          }}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 22,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 22,
                color: '#1F2937',
                fontWeight: '700',
                fontFamily: 'serif',
              }}>
              Pending Invitations
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/sangha-hub-list',
                  params: {type: 'pending'},
                })
              }
              style={{
                height: 32,
                borderRadius: 16,
                backgroundColor: '#FFF3D6',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 14,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#F97316',
                  fontWeight: '700',
                }}>
                {invitations.length} New
              </Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: 22,
              paddingTop: 22,
              paddingRight: 10,
            }}>
            {loading && invitations.length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#F6EFD9',
                  borderRadius: 30,
                  borderWidth: 1,
                  marginRight: 18,
                  padding: 24,
                  width: 320,
                }}>
                <ActivityIndicator color="#F97316" />
                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 14,
                    fontWeight: '800',
                    marginTop: 12,
                  }}>
                  Loading invitations
                </Text>
              </View>
            ) : null}

            {!loading && invitations.length === 0 ? (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#F6EFD9',
                  borderRadius: 30,
                  borderWidth: 1,
                  marginRight: 18,
                  padding: 20,
                  width: 320,
                }}>
                <Text
                  style={{
                    color: '#1F2937',
                    fontSize: 17,
                    fontWeight: '900',
                  }}>
                  No pending invitations
                </Text>
                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 14,
                    fontWeight: '600',
                    lineHeight: 22,
                    marginTop: 8,
                  }}>
                  New group invites will appear here.
                </Text>
              </View>
            ) : null}

            {invitations.map((invitation) => {
              const group = invitation.group;

              return (
                <View
                  key={invitation.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#F6EFD9',
                    borderRadius: 30,
                    borderWidth: 1,
                    elevation: 2,
                    marginRight: 18,
                    padding: 18,
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.03,
                    shadowRadius: 8,
                    width: 320,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    <View>
                      <Image
                        source={{
                          uri: getAvatarUri(invitation),
                        }}
                        style={{
                          borderRadius: 29,
                          height: 58,
                          width: 58,
                        }}
                      />

                      <View
                        style={{
                          alignItems: 'center',
                          backgroundColor: '#FFF7ED',
                          borderColor: '#FFFFFF',
                          borderRadius: 9,
                          borderWidth: 2,
                          bottom: -2,
                          height: 18,
                          justifyContent: 'center',
                          position: 'absolute',
                          right: -2,
                          width: 18,
                        }}>
                        <Text
                          style={{
                            color: '#F97316',
                            fontSize: 10,
                            fontWeight: '700',
                          }}>
                          ॐ
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        marginLeft: 14,
                      }}>
                      <Text
                        style={{
                          color: '#6B7280',
                          fontSize: 17,
                          fontWeight: '500',
                        }}>
                        <Text
                          style={{
                            color: '#1F2937',
                            fontWeight: '700',
                          }}>
                          {invitation.invitedBy?.name ||
                            'Sai Family'}
                        </Text>{' '}
                        invited you to
                      </Text>

                      <Text
                        style={{
                          color: '#1F2937',
                          fontSize: 18,
                          fontWeight: '800',
                          marginTop: 2,
                        }}>
                        {group?.name || 'Sangha Group'}
                      </Text>

                      <View
                        style={{
                          alignItems: 'center',
                          flexDirection: 'row',
                          marginTop: 10,
                        }}>
                        <Ionicons
                          name="people"
                          size={14}
                          color="#9CA3AF"
                        />

                        <Text
                          style={{
                            color: '#9CA3AF',
                            fontSize: 14,
                            fontWeight: '500',
                            marginLeft: 5,
                          }}>
                          {group?.memberCount || 0} members
                        </Text>

                        <View
                          style={{
                            backgroundColor: '#D1D5DB',
                            borderRadius: 2,
                            height: 4,
                            marginHorizontal: 10,
                            width: 4,
                          }}
                        />

                        <Text
                          style={{
                            color: '#9CA3AF',
                            fontSize: 14,
                            fontWeight: '500',
                          }}>
                          {formatShortDate(
                            invitation.createdAt
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 24,
                    }}>
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() =>
                        dispatch(
                          acceptSanghaInvitationRequest(
                            invitation.id
                          )
                        )
                      }
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#F97316',
                        borderRadius: 18,
                        height: 50,
                        justifyContent: 'center',
                        width: '47%',
                      }}>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 18,
                          fontWeight: '700',
                        }}>
                        Accept
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() =>
                        dispatch(
                          declineSanghaInvitationRequest(
                            invitation.id
                          )
                        )
                      }
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#F8F8F8',
                        borderColor: '#ECECEC',
                        borderRadius: 18,
                        borderWidth: 1,
                        height: 50,
                        justifyContent: 'center',
                        width: '47%',
                      }}>
                      <Text
                        style={{
                          color: '#6B7280',
                          fontSize: 18,
                          fontWeight: '600',
                        }}>
                        Decline
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Explore by Purpose */}
        <View
          style={{
            marginTop: 42,
            paddingHorizontal: 22,
          }}>
          {/* Title */}
          <Text
            style={{
              fontSize: 22,
              color: '#1F2937',
              fontWeight: '700',
              fontFamily: 'serif',
            }}>
            Explore by Purpose
          </Text>

          {/* Grid */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 24,
            }}>
            {loading && purposeTiles.length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 28,
                  padding: 24,
                  width: '100%',
                }}>
                <ActivityIndicator color="#F97316" />
                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 14,
                    fontWeight: '800',
                    marginTop: 12,
                  }}>
                  Loading purposes
                </Text>
              </View>
            ) : null}

            {!loading && purposeTiles.length === 0 ? (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 28,
                  padding: 20,
                  width: '100%',
                }}>
                <Text
                  style={{
                    color: '#1F2937',
                    fontSize: 17,
                    fontWeight: '900',
                  }}>
                  No purpose groups yet
                </Text>
                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 14,
                    fontWeight: '600',
                    lineHeight: 22,
                    marginTop: 8,
                  }}>
                  Community purposes will appear as groups are created.
                </Text>
              </View>
            ) : null}

            {purposeTiles.map((item) => {
              const purposeKey = normalizePurposeKey(
                item.purpose || item.label
              );
              const presentation =
                purposePresentation[purposeKey] || {
                  bg: '#FFF7D6',
                  icon: 'people',
                  iconColor: '#F97316',
                  subtitle: 'Sangha community',
                };

              return (
                <TouchableOpacity
                  key={item.purpose || item.label}
                  activeOpacity={0.88}
                  onPress={() =>
                    router.push({
                      pathname: '/sangha-hub-list',
                      params: {
                        purpose: item.purpose || item.label,
                        type: 'purpose',
                      },
                    })
                  }
                  style={{
                    alignItems: 'center',
                    backgroundColor: presentation.bg,
                    borderRadius: 28,
                    height: 138,
                    justifyContent: 'center',
                    marginBottom: 18,
                    width: '48%',
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor:
                        'rgba(255,255,255,0.35)',
                      borderRadius: 26,
                      height: 52,
                      justifyContent: 'center',
                      width: 52,
                    }}>
                    {presentation.useMaterial ? (
                      <MaterialCommunityIcons
                        name={
                          presentation.icon as keyof typeof MaterialCommunityIcons.glyphMap
                        }
                        size={28}
                        color={presentation.iconColor}
                      />
                    ) : (
                      <Ionicons
                        name={
                          presentation.icon as keyof typeof Ionicons.glyphMap
                        }
                        size={28}
                        color={presentation.iconColor}
                      />
                    )}
                  </View>

                  <Text
                    style={{
                      color: '#1F2937',
                      fontSize: 20,
                      fontWeight: '700',
                      marginTop: 16,
                    }}>
                    {item.label}
                  </Text>

                  <Text
                    style={{
                      color: '#6B7280',
                      fontSize: 14,
                      fontWeight: '500',
                      marginTop: 4,
                    }}>
                    {item.count
                      ? `${item.count} groups`
                      : presentation.subtitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* My Groups */}
        <View
          style={{
            marginTop: 34,
            paddingHorizontal: 22,
          }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 22,
                color: '#1F2937',
                fontWeight: '700',
                fontFamily: 'serif',
              }}>
              My Groups
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/sangha-hub-list',
                  params: {type: 'groups'},
                })
              }>
              <Text
                style={{
                  fontSize: 18,
                  color: '#F97316',
                  fontWeight: '700',
                }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {loading && myGroups.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 30,
                marginTop: 24,
                padding: 24,
              }}>
              <ActivityIndicator color="#F97316" />
              <Text
                style={{
                  color: '#6B7280',
                  fontSize: 14,
                  fontWeight: '800',
                  marginTop: 12,
                }}>
                Loading your groups
              </Text>
            </View>
          ) : null}

          {!loading && myGroups.length === 0 ? (
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 30,
                marginTop: 24,
                padding: 20,
              }}>
              <Text
                style={{
                  color: '#1F2937',
                  fontSize: 17,
                  fontWeight: '900',
                }}>
                You have not joined a group yet
              </Text>
              <Text
                style={{
                  color: '#6B7280',
                  fontSize: 14,
                  fontWeight: '600',
                  lineHeight: 22,
                  marginTop: 8,
                }}>
                Explore groups by purpose or search for a Sangha community.
              </Text>
            </View>
          ) : null}

          {myGroups.slice(0, 3).map((group) => (
            <TouchableOpacity
              key={group.id}
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: '/group-details',
                  params: { id: group.id },
                })
              }
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 30,
                elevation: 2,
                marginTop: 24,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.03,
                shadowRadius: 8,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    borderRadius: 22,
                    height: 86,
                    overflow: 'hidden',
                    position: 'relative',
                    width: 86,
                  }}>
                  <Image
                    source={{
                      uri: getBannerUri(group),
                    }}
                    style={{
                      height: '100%',
                      width: '100%',
                    }}
                  />

                  <View
                    style={{
                      backgroundColor: '#FFF3D6',
                      borderRadius: 8,
                      bottom: 8,
                      left: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      position: 'absolute',
                    }}>
                    <Text
                      style={{
                        color: '#F97316',
                        fontSize: 10,
                        fontWeight: '800',
                      }}>
                      {(group.purpose || 'SANGHA').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 16,
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
                        color: '#1F2937',
                        flex: 1,
                        fontSize: 18,
                        fontWeight: '800',
                        marginRight: 10,
                      }}>
                      {group.name}
                    </Text>

                    <View
                      style={{
                        backgroundColor: group.isOfficial
                          ? '#16A34A'
                          : '#F97316',
                        borderRadius: 5,
                        height: 10,
                        marginTop: 6,
                        width: 10,
                      }}
                    />
                  </View>

                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#6B7280',
                      fontSize: 16,
                      fontWeight: '500',
                      marginTop: 6,
                    }}>
                    {group.description ||
                      [group.city, group.state]
                        .filter(Boolean)
                        .join(', ') ||
                      group.privacy ||
                      'Sangha community'}
                  </Text>

                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginTop: 16,
                    }}>
                    <Ionicons
                      name="people"
                      size={16}
                      color="#9CA3AF"
                    />
                    <Text
                      style={{
                        color: '#9CA3AF',
                        fontSize: 14,
                        fontWeight: '500',
                        marginLeft: 7,
                      }}>
                      {group.memberCount || 0} members
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
        transparent
        visible={filterVisible}>
        <View
          style={{
            backgroundColor: 'rgba(17,24,39,0.38)',
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              backgroundColor: '#FAFAF9',
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingBottom: 28,
              paddingHorizontal: 22,
              paddingTop: 20,
            }}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: '#1F2937',
                  fontFamily: 'serif',
                  fontSize: 24,
                  fontWeight: '800',
                }}>
                Filter Hub
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setFilterVisible(false)}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  height: 36,
                  justifyContent: 'center',
                  width: 36,
                }}>
                <Ionicons
                  name="close"
                  size={20}
                  color="#1F2937"
                />
              </TouchableOpacity>
            </View>

            {[
              {
                label: 'Purpose',
                options: ['All', 'City Chapter', 'Seva', 'Bhajan', 'Online Global'],
                selected: purpose,
                setSelected: setPurpose,
              },
              {
                label: 'Activity',
                options: ['Active', 'New', 'Popular'],
                selected: activity,
                setSelected: setActivity,
              },
              {
                label: 'Privacy',
                options: ['Any', 'Public', 'Invite Only'],
                selected: privacy,
                setSelected: setPrivacy,
              },
            ].map((group) => (
              <View
                key={group.label}
                style={{
                  marginTop: 22,
                }}>
                <Text
                  style={{
                    color: '#374151',
                    fontSize: 14,
                    fontWeight: '900',
                    marginBottom: 12,
                  }}>
                  {group.label}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}>
                  {group.options.map((option) => {
                    const active =
                      option === group.selected;

                    return (
                      <TouchableOpacity
                        key={option}
                        activeOpacity={0.85}
                        onPress={() =>
                          group.setSelected(option)
                        }
                        style={{
                          backgroundColor: active
                            ? '#F97316'
                            : '#FFFFFF',
                          borderColor: active
                            ? '#F97316'
                            : '#ECECEC',
                          borderRadius: 18,
                          borderWidth: 1,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                        }}>
                        <Text
                          style={{
                            color: active
                              ? '#FFFFFF'
                              : '#4B5563',
                            fontSize: 13,
                            fontWeight: '800',
                          }}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                marginTop: 28,
              }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setPurpose('All');
                  setActivity('Active');
                  setPrivacy('Any');
                }}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#ECECEC',
                  borderRadius: 18,
                  borderWidth: 1,
                  flex: 1,
                  height: 52,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#4B5563',
                    fontSize: 15,
                    fontWeight: '900',
                  }}>
                  Reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setFilterVisible(false)}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#F97316',
                  borderRadius: 18,
                  flex: 1,
                  height: 52,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 15,
                    fontWeight: '900',
                  }}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SanghaHubScreen;
