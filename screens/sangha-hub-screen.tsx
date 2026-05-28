import React, {useState} from 'react';
import {
  Modal,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';


import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const purposeData = [
  {
    title: 'City Chapter',
    subtitle: 'Local connection',
    icon: 'map-marker-radius',
    bg: '#FFF7D6',
    iconColor: '#F97316',
  },
  {
    title: 'Seva',
    subtitle: 'Purpose & service',
    icon: 'hands-pray',
    bg: '#FCE7F3',
    iconColor: '#BE185D',
  },
  {
    title: 'Bhajan',
    subtitle: 'Musical worship',
    icon: 'musical-notes',
    bg: '#E0F2FE',
    iconColor: '#0284C7',
  },
  {
    title: 'Online Global',
    subtitle: 'Diaspora network',
    icon: 'earth',
    bg: '#DCFCE7',
    iconColor: '#16A34A',
  },
];

const SanghaHubScreen = () => {
  const [filterVisible, setFilterVisible] =
    useState(false);
  const [purpose, setPurpose] = useState('All');
  const [activity, setActivity] = useState('Active');
  const [privacy, setPrivacy] = useState('Any');

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
                2 New
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
            {/* Card 1 */}
            <View
              style={{
                width: 320,
                backgroundColor: '#FFFFFF',
                borderRadius: 30,
                borderWidth: 1,
                borderColor: '#F6EFD9',
                padding: 18,
                marginRight: 18,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 2,
              }}>
              {/* Top */}
              <View
                style={{
                  flexDirection: 'row',
                }}>
                {/* Avatar */}
                <View>
                  <Image
                    source={{
                      uri: 'https://randomuser.me/api/portraits/men/32.jpg',
                    }}
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 29,
                    }}
                  />

                  {/* Badge */}
                  <View
                    style={{
                      position: 'absolute',
                      right: -2,
                      bottom: -2,
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: '#FFF7ED',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                    }}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: '#F97316',
                        fontWeight: '700',
                      }}>
                      ॐ
                    </Text>
                  </View>
                </View>

                {/* Content */}
                <View
                  style={{
                    flex: 1,
                    marginLeft: 14,
                  }}>
                  <Text
                    style={{
                      fontSize: 17,
                      color: '#6B7280',
                      fontWeight: '500',
                    }}>
                    <Text
                      style={{
                        color: '#1F2937',
                        fontWeight: '700',
                      }}>
                      Rahul M.
                    </Text>{' '}
                    invited you to
                  </Text>

                  <Text
                    style={{
                      marginTop: 2,
                      fontSize: 18,
                      color: '#1F2937',
                      fontWeight: '800',
                    }}>
                    Mumbai Youth Seva
                  </Text>

                  {/* Meta */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                    }}>
                    <Ionicons
                      name="people"
                      size={14}
                      color="#9CA3AF"
                    />

                    <Text
                      style={{
                        marginLeft: 5,
                        fontSize: 14,
                        color: '#9CA3AF',
                        fontWeight: '500',
                      }}>
                      142 members
                    </Text>

                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: '#D1D5DB',
                        marginHorizontal: 10,
                      }}
                    />

                    <Text
                      style={{
                        fontSize: 14,
                        color: '#9CA3AF',
                        fontWeight: '500',
                      }}>
                      Invited 2d ago
                    </Text>
                  </View>
                </View>
              </View>

              {/* Buttons */}
              <View
                style={{
                  marginTop: 24,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                {/* Accept */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={{
                    width: '47%',
                    height: 50,
                    borderRadius: 18,
                    backgroundColor: '#F97316',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#FFFFFF',
                      fontWeight: '700',
                    }}>
                    Accept
                  </Text>
                </TouchableOpacity>

                {/* Decline */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={{
                    width: '47%',
                    height: 50,
                    borderRadius: 18,
                    backgroundColor: '#F8F8F8',
                    borderWidth: 1,
                    borderColor: '#ECECEC',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#6B7280',
                      fontWeight: '600',
                    }}>
                    Decline
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mini Partial Card */}
            <View
              style={{
                width: 120,
                backgroundColor: '#FFFFFF',
                borderRadius: 30,
                borderWidth: 1,
                borderColor: '#F6EFD9',
                padding: 18,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 2,
              }}>
              <Image
                source={{
                  uri: 'https://randomuser.me/api/portraits/women/68.jpg',
                }}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  alignSelf: 'center',
                }}
              />

              <TouchableOpacity
                activeOpacity={0.88}
                style={{
                  marginTop: 24,
                  height: 50,
                  borderRadius: 18,
                  backgroundColor: '#F97316',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    color: '#FFFFFF',
                    fontWeight: '700',
                  }}>
                  Accept
                </Text>
              </TouchableOpacity>
            </View>
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
            {purposeData.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.88}
                onPress={() =>
                  router.push({
                    pathname: '/sangha-hub-list',
                    params: {
                      type: 'purpose',
                      purpose: item.title,
                    },
                  })
                }
                style={{
                  width: '48%',
                  height: 138,
                  borderRadius: 28,
                  backgroundColor: item.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 18,
                }}>
                {/* Icon */}
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: 'rgba(255,255,255,0.35)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {item.title ===
                  'City Chapter' ? (
                    <MaterialCommunityIcons
                      name={
                        item.icon as keyof typeof MaterialCommunityIcons.glyphMap
                      }
                      size={28}
                      color={item.iconColor}
                    />
                  ) : (
                    <Ionicons
                      name={
                        item.icon as keyof typeof Ionicons.glyphMap
                      }
                      size={28}
                      color={item.iconColor}
                    />
                  )}
                </View>

                {/* Title */}
                <Text
                  style={{
                    marginTop: 16,
                    fontSize: 20,
                    color: '#1F2937',
                    fontWeight: '700',
                  }}>
                  {item.title}
                </Text>

                {/* Subtitle */}
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 14,
                    color: '#6B7280',
                    fontWeight: '500',
                  }}>
                  {item.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
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

          {/* Group Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() =>
              router.push({
                pathname: '/sangha-hub-list',
                params: {type: 'groups'},
              })
            }
            style={{
              marginTop: 24,
              backgroundColor: '#FFFFFF',
              borderRadius: 30,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 2,
            }}>
            {/* Top */}
            <View
              style={{
                flexDirection: 'row',
              }}>
              {/* Banner */}
              <View
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 22,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200',
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />

                {/* Badge */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    backgroundColor: '#FFF3D6',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#F97316',
                      fontWeight: '800',
                    }}>
                    SEVA
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View
                style={{
                  flex: 1,
                  marginLeft: 16,
                }}>
                {/* Title */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent:
                      'space-between',
                    alignItems: 'flex-start',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      flex: 1,
                      fontSize: 18,
                      color: '#1F2937',
                      fontWeight: '800',
                      marginRight: 10,
                    }}>
                    Andheri Weekend Food Drive
                  </Text>

                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#F97316',
                      marginTop: 6,
                    }}
                  />
                </View>

                {/* Subtitle */}
                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: 6,
                    fontSize: 16,
                    color: '#6B7280',
                    fontWeight: '500',
                  }}>
                    New opportunity: Sunday
                    breakfast...
                  </Text>

                {/* Bottom */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 16,
                  }}>
                  {/* Avatars */}
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    {[
                      'https://randomuser.me/api/portraits/men/11.jpg',
                      'https://randomuser.me/api/portraits/women/12.jpg',
                      'https://randomuser.me/api/portraits/men/15.jpg',
                    ].map((item, index) => (
                      <Image
                        key={index}
                        source={{
                          uri: item,
                        }}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: '#FFFFFF',
                          marginLeft:
                            index === 0
                              ? 0
                              : -8,
                        }}
                      />
                    ))}
                  </View>

                  {/* Time */}
                  <Text
                    style={{
                      marginLeft: 12,
                      fontSize: 14,
                      color: '#9CA3AF',
                      fontWeight: '500',
                    }}>
                    Active 2h ago
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
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
