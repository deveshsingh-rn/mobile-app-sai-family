import React, {useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type ActionItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const BusinessDetailsScreen = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F7F7',
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
        {/* Banner Section */}
        <View>
          {/* Banner */}
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200',
            }}
            style={{
              width: '100%',
              height: 320,
            }}
            resizeMode="cover"
          />

          {/* Overlay */}
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: 320,
              backgroundColor: 'rgba(0,0,0,0.22)',
            }}
          />

          {/* Header Buttons */}
          <View
            style={{
              position: 'absolute',
              top: 18,
              left: 18,
              right: 18,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: 'rgba(255,255,255,0.92)',
                justifyContent: 'center',
                alignItems: 'center',
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
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                }}>
                <Ionicons
                  name="bookmark-outline"
                  size={21}
                  color="#374151"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Ionicons
                  name="share-social-outline"
                  size={21}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logo */}
          <View
            style={{
              position: 'absolute',
              bottom: -28,
              left: 16,
              width: 74,
              height: 74,
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
              shadowRadius: 10,
              elevation: 4,
            }}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
              }}
            />
          </View>
        </View>

        {/* Main Content */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            marginTop: 0,
            paddingTop: 44,
          }}>
          {/* Business Info */}
          <View
            style={{
              paddingHorizontal: 16,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: '#111827',
              }}>
              Shree Sai Event Planners
            </Text>

            <Text
              style={{
                marginTop: 6,
                fontSize: 16,
                color: '#6B7280',
                fontWeight: '500',
              }}>
              Premium Event Management & Catering
            </Text>
          </View>

          {/* Stats Cards */}
          <View
            style={{
              marginTop: 24,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
            }}>
            {/* Verified */}
            <View
              style={{
                width: '31%',
                height: 82,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
              }}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#22C55E"
              />

              <Text
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  fontWeight: '700',
                  color: '#1F2937',
                }}>
                Sai Verified
              </Text>
            </View>

            {/* Endorsed */}
            <View
              style={{
                width: '31%',
                height: 82,
                borderRadius: 18,
                backgroundColor: '#EEF4FF',
                borderWidth: 1,
                borderColor: '#D7E4FF',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialCommunityIcons
                name="hands-pray"
                size={25}
                color="#2563EB"
              />

              <Text
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  fontWeight: '800',
                  color: '#2563EB',
                }}>
                142 Endorsed
              </Text>
            </View>

            {/* Rating */}
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() =>
                router.push('/directory/business-review')
              }
              style={{
                width: '31%',
                height: 82,
                borderRadius: 18,
                backgroundColor: '#FFFBEA',
                borderWidth: 1,
                borderColor: '#FCE7A5',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: '#D97706',
                }}>
                4.9
                <Text
                  style={{
                    fontSize: 18,
                  }}>
                  ★
                </Text>
              </Text>

              <Text
                style={{
                  marginTop: 2,
                  fontSize: 14,
                  fontWeight: '700',
                  color: '#B45309',
                }}>
                  89 Reviews
                </Text>
            </TouchableOpacity>
          </View>

          {/* Specialities */}
          <View
            style={{
              marginTop: 36,
              paddingHorizontal: 16,
            }}>
            <Text
              style={{
                fontSize: 15,
                letterSpacing: 1,
                color: '#111827',
                fontWeight: '800',
              }}>
              SPECIALTIES
            </Text>

            {/* Tags */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 14,
              }}>
              {[
                'Temple Events',
                'Pure Veg Catering',
                'Floral Decors',
                'Bhajan Setup',
              ].map((item, index) => (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 24,
                    backgroundColor: '#F8F8F8',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    marginRight: 10,
                    marginBottom: 10,
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: '#4B5563',
                      fontWeight: '500',
                    }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            {/* Description */}
            <Text
              style={{
                marginTop: 12,
                fontSize: 17,
                lineHeight: 31,
                color: '#4B5563',
                fontWeight: '400',
              }}>
              {expanded
                ? 'With over 15 years of experience in organizing spiritual gatherings, we specialize in creating serene and divine atmospheres for Sai bhajans, temple functions, catering services, floral arrangements and community events with traditional values and premium hospitality.'
                : 'With over 15 years of experience in organizing spiritual gatherings, we specialize in creating serene and divine atmospheres for Sai bhajans,...'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setExpanded(!expanded)}>
              <Text
                style={{
                  marginTop: 12,
                  color: '#F97316',
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                {expanded ? 'Show less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View
            style={{
              marginTop: 28,
              paddingHorizontal: 14,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 20,
              borderBottomWidth: 10,
              borderBottomColor: '#F5F5F5',
            }}>
            {([
              {
                icon: 'call',
                label: 'Call Now',
              },
              {
                icon: 'logo-whatsapp',
                label: 'WhatsApp',
              },
              {
                icon: 'mail-outline',
                label: 'Enquire',
              },
            ] satisfies ActionItem[]).map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.85}
                style={{
                  width: '31%',
                  height: 72,
                  borderRadius: 18,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.03,
                  shadowRadius: 6,
                  elevation: 1,
                }}>
                <Ionicons
                  name={item.icon}
                  size={21}
                  color="#374151"
                />

                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    color: '#111827',
                    fontWeight: '600',
                  }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Owner Card */}
          <View
            style={{
              paddingHorizontal: 14,
              paddingTop: 28,
            }}>
            <View
              style={{
                borderRadius: 28,
                borderWidth: 1,
                borderColor: '#ECECEC',
                backgroundColor: '#FFFFFF',
                padding: 18,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Image
                  source={{
                    uri: 'https://randomuser.me/api/portraits/men/75.jpg',
                  }}
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                  }}
                />

                <View
                  style={{
                    marginLeft: 14,
                    flex: 1,
                  }}>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: '800',
                      color: '#111827',
                    }}>
                    Anand Sharma
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
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
                        marginLeft: 5,
                        fontSize: 16,
                        color: '#6B7280',
                        fontWeight: '500',
                      }}>
                      Shirdi Sai Devotee
                    </Text>
                  </View>

                  <Text
                    style={{
                      marginTop: 5,
                      fontSize: 14,
                      color: '#9CA3AF',
                      fontWeight: '500',
                    }}>
                    Member since 2023
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: '#F1F1F1',
                  marginVertical: 18,
                }}
              />

              {/* Response */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 17,
                    color: '#6B7280',
                    fontWeight: '500',
                  }}>
                  Response time
                </Text>

                <Text
                  style={{
                    fontSize: 17,
                    color: '#1F2937',
                    fontWeight: '700',
                  }}>
                  Usually within 2 hours
                </Text>
              </View>
            </View>
          </View>

          {/* Community Trust */}
          <View
            style={{
              marginTop: 52,
              alignItems: 'center',
              paddingHorizontal: 18,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#111827',
              }}>
              Community Trust
            </Text>

            <Text
              style={{
                marginTop: 8,
                fontSize: 16,
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: 25,
              }}>
              Help fellow devotees by sharing your experience
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push('/directory/business-review')
              }
              style={{
                marginTop: 24,
                width: '100%',
                height: 58,
                borderRadius: 18,
                borderWidth: 2,
                borderColor: '#22C55E',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                backgroundColor: '#F7FFF9',
              }}>
              <Feather
                name="thumbs-up"
                size={20}
                color="#22C55E"
              />

              <Text
                style={{
                  marginLeft: 10,
                  fontSize: 20,
                  color: '#22C55E',
                  fontWeight: '800',
                }}>
                I Recommend This Business
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Work */}
          <View
            style={{
              marginTop: 54,
              paddingHorizontal: 14,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '800',
                  color: '#111827',
                }}>
                Recent Work
              </Text>

              <TouchableOpacity activeOpacity={0.8}>
                <Text
                  style={{
                    color: '#F59E0B',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                  View all
                </Text>
              </TouchableOpacity>
            </View>

            {/* Gallery */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}>
              {[
                'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200',
                'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200',
                'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200',
              ].map((item, index) => (
                <Image
                  key={index}
                  source={{
                    uri: item,
                  }}
                  style={{
                    width: 190,
                    height: 128,
                    borderRadius: 22,
                    marginRight: 14,
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessDetailsScreen;
