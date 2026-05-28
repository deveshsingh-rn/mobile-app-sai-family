import React, {useState} from 'react';
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
} from 'react-native';

// import Ionicons from 'react-native-vector-icons/Ionicons';
// import Feather from 'react-native-vector-icons/Feather';

import {
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const nearYou = [
  {
    name: 'Priya Sharma',
    tradition: 'Shirdi Sai Devotee',
    image:
      'https://randomuser.me/api/portraits/women/44.jpg',
    mutual: '3 Mutual\nConnections',
  },
  {
    name: 'Rahul Verma',
    tradition: 'Iskcon Tradition',
    image:
      'https://randomuser.me/api/portraits/men/32.jpg',
    mutual: '1.2 km away',
  },
];

const suggested = [
  {
    name: 'Ananya Desai',
    subtitle: 'Art of Living · Bangalore',
    image:
      'https://randomuser.me/api/portraits/women/68.jpg',
    badge: 'Based on your tradition',
  },
  {
    name: 'Vikram Singh',
    subtitle: 'Vipassana · Pune',
    image:
      'https://randomuser.me/api/portraits/men/75.jpg',
    badge: 'Based on your city',
  },
];

const SanghaScreen = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#FAFAFA',
      }}>
      <StatusBar
        backgroundColor="#FAFAFA"
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
            paddingTop: 24,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: '#111827',
              letterSpacing: -0.4,
            }}>
            Discovery
          </Text>

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
              shadowRadius: 10,
              elevation: 2,
            }}>
            <Ionicons
              name="options-outline"
              size={24}
              color="#111827"
            />
          </TouchableOpacity>
        </View>

        {/* Discovery Card */}
        <View
          style={{
            marginTop: 22,
            marginHorizontal: 16,
            backgroundColor: '#FFFDFC',
            borderRadius: 34,
            borderWidth: 1,
            borderColor: '#F5EFE7',
            paddingHorizontal: 28,
            paddingTop: 34,
            paddingBottom: 28,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 6,
            },
            shadowOpacity: 0.03,
            shadowRadius: 10,
            elevation: 2,
          }}>
          {/* Title */}
          <Text
            style={{
              fontSize: 28,
              lineHeight: 34,
              color: '#111827',
              fontWeight: '800',
              letterSpacing: -0.6,
            }}>
            Find Your Sangha
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              marginTop: 14,
              fontSize: 18,
              lineHeight: 34,
              color: '#6B7280',
              fontWeight: '500',
              paddingRight: 18,
            }}>
            Connect with devotees who share
            your tradition and spiritual
            journey.
          </Text>

          {/* Toggle Row */}
          <View
            style={{
              marginTop: 42,
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
            {/* Icon */}
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#FFF3E8',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons
                name="location"
                size={24}
                color="#EE9B52"
              />
            </View>

            {/* Content */}
            <View
              style={{
                flex: 1,
                marginLeft: 18,
                paddingRight: 10,
              }}>
              {/* Top */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 17,
                    color: '#111827',
                    fontWeight: '700',
                  }}>
                  Near Me Discovery
                </Text>

                <Switch
                  value={enabled}
                  onValueChange={setEnabled}
                  trackColor={{
                    false: '#E5E7EB',
                    true: '#F6C28B',
                  }}
                  thumbColor={
                    enabled ? '#EE9B52' : '#FFFFFF'
                  }
                />
              </View>

              {/* Description */}
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 15,
                  lineHeight: 31,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                Opt-in to see devotees nearby.
                Others will see your
                approximate area (e.g., Andheri
                West), never your exact
                address.
              </Text>
            </View>
          </View>
        </View>

        {/* Near You */}
        <View
          style={{
            marginTop: 42,
            paddingHorizontal: 20,
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
                fontSize: 20,
                color: '#111827',
                fontWeight: '800',
              }}>
              Near You
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: '#F97316',
                fontWeight: '600',
              }}>
              Andheri West, Mumbai
            </Text>
          </View>

          {/* Cards */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 22,
            }}>
            {nearYou.map((item, index) => (
              <View
                key={index}
                style={{
                  width: '48%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 28,
                  borderWidth: 1,
                  borderColor: '#F0F0F0',
                  paddingHorizontal: 16,
                  paddingTop: 22,
                  paddingBottom: 20,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  elevation: 2,
                }}>
                {/* Top Border */}
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    backgroundColor: '#F3C57C',
                  }}
                />

                {/* Avatar */}
                <Image
                  source={{
                    uri: item.image,
                  }}
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 37,
                  }}
                />

                {/* Name */}
                <Text
                  style={{
                    marginTop: 18,
                    fontSize: 17,
                    color: '#111827',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}>
                  {item.name}
                </Text>

                {/* Tradition */}
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: '#6B7280',
                    fontWeight: '500',
                    textAlign: 'center',
                  }}>
                  {item.tradition}
                </Text>

                {/* Mutual */}
                <View
                  style={{
                    marginTop: 16,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#FFF7ED',
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Ionicons
                    name={
                      index === 0
                        ? 'people'
                        : 'location'
                    }
                    size={14}
                    color="#F59E0B"
                  />

                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 12,
                      lineHeight: 16,
                      color: '#6B7280',
                      fontWeight: '500',
                      textAlign: 'center',
                    }}>
                    {item.mutual}
                  </Text>
                </View>

                {/* Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={{
                    marginTop: 18,
                    width: '100%',
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: '#FFF7ED',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#F97316',
                      fontWeight: '600',
                    }}>
                    Connect
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Suggested */}
        <View
          style={{
            marginTop: 42,
            paddingHorizontal: 16,
          }}>
          {/* Title */}
          <Text
            style={{
              fontSize: 20,
              color: '#111827',
              fontWeight: '800',
              marginBottom: 22,
            }}>
            Suggested For You
          </Text>

          {/* Cards */}
          {suggested.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 32,
                borderWidth: 1,
                borderColor: '#F1F1F1',
                padding: 22,
                marginBottom: 22,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.03,
                shadowRadius: 10,
                elevation: 2,
              }}>
              {/* Top */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {/* Avatar */}
                <Image
                  source={{
                    uri: item.image,
                  }}
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                  }}
                />

                {/* Info */}
                <View
                  style={{
                    marginLeft: 18,
                    flex: 1,
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      color: '#111827',
                      fontWeight: '800',
                    }}>
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 16,
                      color: '#6B7280',
                      fontWeight: '500',
                    }}>
                    {item.subtitle}
                  </Text>

                  {/* Badge */}
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 12,
                      backgroundColor: '#FFF7ED',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Ionicons
                      name={
                        index === 0
                          ? 'flame'
                          : 'business'
                      }
                      size={14}
                      color="#F97316"
                    />

                    <Text
                      style={{
                        marginLeft: 6,
                        fontSize: 13,
                        color: '#F97316',
                        fontWeight: '600',
                      }}>
                      {item.badge}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: '#F3F4F6',
                  marginTop: 22,
                }}
              />

              {/* Bottom */}
              <View
                style={{
                  marginTop: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                {/* Mutual */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={{
                      uri: 'https://randomuser.me/api/portraits/men/11.jpg',
                    }}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                    }}
                  />

                  <Image
                    source={{
                      uri: 'https://randomuser.me/api/portraits/women/12.jpg',
                    }}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      marginLeft: -8,
                    }}
                  />

                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#F3F4F6',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: -8,
                    }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#374151',
                        fontWeight: '700',
                      }}>
                      +5
                    </Text>
                  </View>
                </View>

                {/* Connect */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={{
                    width: 108,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor:
                      index === 0
                        ? '#111111'
                        : '#FFF7ED',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color:
                        index === 0
                          ? '#FFFFFF'
                          : '#F97316',
                      fontWeight: '600',
                    }}>
                    Connect
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SanghaScreen;