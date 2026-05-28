import React, { useState } from 'react';
import {
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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const interests = [
  'Bhajans',
  'Meditation',
  'Seva',
  'Reading Texts',
  'Yoga',
];

const profileTabs = [
  'About',
  'Experiences',
  'Events',
] as const;

type ProfileTab = (typeof profileTabs)[number];

const experiences = [
  {
    content:
      'Today morning bhajan at the mandir felt deeply peaceful. Sharing one small moment from aarti that stayed with me.',
    image:
      'https://images.unsplash.com/photo-1609604161777-0c39f681a0ed?q=80&w=900',
    likes: 42,
    place: 'Pune Sai Mandir',
    time: '2h ago',
  },
  {
    content:
      'Seva with the Sunday food distribution group. Grateful to meet devotees walking the same path.',
    image:
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=900',
    likes: 31,
    place: 'Community Kitchen',
    time: '1d ago',
  },
];

const events = [
  {
    date: '15 Jun',
    title: 'Thursday Sai Bhajan',
    time: '7:00 PM',
    venue: 'Sai Mandir Hall, Pune',
    type: 'Bhajan',
  },
  {
    date: '22 Jun',
    title: 'Weekend Seva Drive',
    time: '8:30 AM',
    venue: 'Food Distribution Center',
    type: 'Seva',
  },
];

const SanghaProfileScreen = () => {
  const [activeTab, setActiveTab] =
    useState<ProfileTab>('About');

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
              name="ellipsis-vertical"
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
                uri: 'https://randomuser.me/api/portraits/women/44.jpg',
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
            Priya Sharma
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
            PUNE, MAHARASHTRA
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
              Sai devotee since 2015, based in
              Pune. Bhajan singer, software
              engineer. Finding peace in daily
              seva. Jai Sai Ram! 🙏
            </Text>
          </View>
        </View>

        {/* Connect Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={{
            marginTop: 28,
            marginHorizontal: 50,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#D96A3D',
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
          <Ionicons
            name="person-add"
            size={22}
            color="#FFFFFF"
          />

          <Text
            style={{
              marginLeft: 10,
              fontSize: 22,
              color: '#FFFFFF',
              fontWeight: '700',
            }}>
            Connect
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
            You and Priya both know{' '}
            <Text
              style={{
                color: '#111111',
                fontWeight: '800',
              }}>
              Raj
            </Text>{' '}
            and{' '}
            <Text
              style={{
                color: '#111111',
                fontWeight: '800',
              }}>
              Meera
            </Text>
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
                {[
                  {
                    title: 'Joined Sai Family',
                    subtitle: 'March 2023',
                    active: true,
                  },
                  {
                    title: 'First Shirdi Visit',
                    subtitle: '2015 with family',
                  },
                  {
                    title: 'Active Seva',
                    subtitle:
                      'Weekly food distribution',
                  },
                ].map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      marginBottom:
                        index === 2 ? 0 : 26,
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

                      {index !== 2 && (
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
                {interests.map((item, index) => (
                  <TouchableOpacity
                    key={index}
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

            {experiences.map((item, index) => (
              <TouchableOpacity
                key={index}
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
                <Image
                  source={{ uri: item.image }}
                  style={{
                    height: 150,
                    width: '100%',
                  }}
                />
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
                      {item.place} · {item.time}
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
                    {item.content}
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
                      {item.likes} blessings
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

            {events.map((item, index) => (
              <TouchableOpacity
                key={index}
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
                    {item.date}
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
                      {item.type}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: '#111111',
                      fontSize: 18,
                      fontWeight: '800',
                      marginTop: 9,
                    }}>
                    {item.title}
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
                      {item.time}
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
                      {item.venue}
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
