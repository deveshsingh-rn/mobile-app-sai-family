import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = [
  {
    title: 'Healthcare',
    icon: 'stethoscope',
    iconType: 'FontAwesome6',
    color: '#F97316',
  },
  {
    title: 'Education',
    icon: 'book-open',
    iconType: 'Feather',
    color: '#EAB308',
  },
  {
    title: 'Technology',
    icon: 'laptop-code',
    iconType: 'FontAwesome6',
    color: '#3B82F6',
  },
  {
    title: 'Retail',
    icon: 'storefront-outline',
    iconType: 'Ionicons',
    color: '#10B981',
  },
  {
    title: 'Food',
    icon: 'restaurant-outline',
    iconType: 'Ionicons',
    color: '#EF4444',
  },
  {
    title: 'Services',
    icon: 'tools',
    iconType: 'FontAwesome6',
    color: '#A855F7',
  },
  {
    title: 'Spiritual\nGoods',
    icon: 'om',
    iconType: 'MaterialCommunityIcons',
    color: '#9D174D',
  },
  {
    title: 'Real\nEstate',
    icon: 'building',
    iconType: 'FontAwesome6',
    color: '#14B8A6',
  },
];

const renderIcon = (item: any) => {
  switch (item.iconType) {
    case 'Ionicons':
      return (
        <Ionicons
          name={item.icon}
          size={28}
          color={item.color}
        />
      );

    case 'Feather':
      return (
        <Feather
          name={item.icon}
          size={28}
          color={item.color}
        />
      );

    case 'MaterialCommunityIcons':
      return (
        <MaterialCommunityIcons
          name={item.icon}
          size={28}
          color={item.color}
        />
      );

    default:
      return (
        <FontAwesome6
          name={item.icon}
          size={24}
          color={item.color}
          solid
        />
      );
  }
};

export default function DirectoryScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F5F3EF',
      }}>
      <StatusBar
        backgroundColor="#F5F3EF"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 18,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: '#111111',
                  letterSpacing: -0.5,
                }}>
                Sai Directory
              </Text>

              <Text
                style={{
                  marginTop: 2,
                  fontSize: 15,
                  color: '#6B7280',
                  fontWeight: '500',
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
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#FAF8F6',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
              <Ionicons
                name="add"
                size={24}
                color="#F97316"
              />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View
            style={{
              marginTop: 28,
              width: '100%',
              height: 66,
              borderRadius: 33,
              backgroundColor: '#FFFFFF',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 22,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 5,
              },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}>
            <Ionicons
              name="search"
              size={24}
              color="#E5E7EB"
            />

            <TextInput
              placeholder="Find a devotee's service near you..."
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                marginLeft: 14,
                fontSize: 18,
                color: '#111827',
                fontWeight: '500',
              }}
            />

            <TouchableOpacity
              activeOpacity={0.8}
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
          </View>
        </View>

        {/* Categories */}
        <View
          style={{
            marginTop: 28,
            backgroundColor: '#F8F3E8',
            paddingTop: 30,
            paddingBottom: 22,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
          }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
            }}>
            {categories.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={{
                  width: '22%',
                  alignItems: 'center',
                  marginBottom: 30,
                }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 24,
                    backgroundColor: '#FFFFFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 3,
                    },
                    shadowOpacity: 0.03,
                    shadowRadius: 8,
                    elevation: 1,
                  }}>
                  {renderIcon(item)}
                </View>

                <Text
                  style={{
                    marginTop: 14,
                    fontSize: 14,
                    color: '#374151',
                    textAlign: 'center',
                    fontWeight: '600',
                    lineHeight: 19,
                  }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Featured */}
          <View
            style={{
              marginTop: 4,
              paddingHorizontal: 24,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: '#111111',
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

            <TouchableOpacity activeOpacity={0.8}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#F97316',
                  fontWeight: '700',
                }}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: 24,
              paddingTop: 22,
            }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push('/directory/business-details')
              }
              style={{
                width: 420,
                backgroundColor: '#F8EFE3',
                borderRadius: 30,
                padding: 22,
                overflow: 'hidden',
                marginRight: 18,
              }}>
              {/* Background Circle */}
              <View
                style={{
                  position: 'absolute',
                  right: -20,
                  top: -30,
                  width: 180,
                  height: 180,
                  borderRadius: 90,
                  backgroundColor: '#F6E5C6',
                }}
              />

              {/* Verified */}
              <View
                style={{
                  position: 'absolute',
                  right: 22,
                  top: 24,
                  backgroundColor: '#FFF8ED',
                  borderRadius: 18,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Ionicons
                  name="sparkles"
                  size={14}
                  color="#F97316"
                />

                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 14,
                    color: '#111827',
                    fontWeight: '700',
                  }}>
                  Verified
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Image
                  source={{
                    uri: 'https://randomuser.me/api/portraits/men/32.jpg',
                  }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    borderWidth: 3,
                    borderColor: '#FFFFFF',
                  }}
                />

                <View
                  style={{
                    marginLeft: 16,
                    marginTop: 2,
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#111111',
                      fontWeight: '800',
                      lineHeight: 26,
                    }}>
                    Dr. Ramesh
                  </Text>

                  <Text
                    style={{
                      fontSize: 18,
                      color: '#111111',
                      fontWeight: '800',
                      lineHeight: 26,
                    }}>
                    Kumar
                  </Text>

                  <Text
                    style={{
                      marginTop: 2,
                      fontSize: 16,
                      color: '#6B7280',
                      fontWeight: '500',
                    }}>
                    Sai Sanjeevani Clinic
                  </Text>
                </View>
              </View>

              {/* Rating */}
              <View
                style={{
                  marginTop: 22,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  {[1, 2, 3, 4, 5].map(item => (
                    <Ionicons
                      key={item}
                      name="star"
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
                    marginLeft: 10,
                    fontSize: 18,
                    fontWeight: '800',
                    color: '#111827',
                  }}>
                  4.9
                </Text>

                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 15,
                    color: '#9CA3AF',
                    fontWeight: '500',
                  }}>
                  (124 endorsements)
                </Text>
              </View>

              {/* Tags */}
              <View
                style={{
                  marginTop: 20,
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    marginRight: 12,
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: '#4B5563',
                      fontWeight: '500',
                    }}>
                    Pediatrics
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: '#4B5563',
                      fontWeight: '500',
                    }}>
                    General Medicine
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>

                  {/* Devotees Near You */}
<View
  style={{
    marginTop: 34,
    paddingHorizontal: 24,
  }}>
  {/* Header */}
  <Text
    style={{
      fontSize: 22,
      fontWeight: '800',
      color: '#111111',
      marginBottom: 22,
      letterSpacing: -0.4,
    }}>
    Devotees Near You
  </Text>

  {/* Card 1 */}
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() =>
      router.push('/directory/business-details')
    }
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 30,
      padding: 18,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    }}>
    <View
      style={{
        flexDirection: 'row',
      }}>
      {/* Image */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800',
        }}
        style={{
          width: 96,
          height: 96,
          borderRadius: 26,
        }}
      />

      {/* Online Dot */}
      <View
        style={{
          position: 'absolute',
          left: 84,
          top: 72,
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: '#22C55E',
          borderWidth: 3,
          borderColor: '#FFFFFF',
        }}
      />

      {/* Content */}
      <View
        style={{
          flex: 1,
          marginLeft: 18,
        }}>
        {/* Top Row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: '800',
              color: '#111111',
              marginRight: 10,
            }}>
            Anjali&apos;s Pure Veg ...
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: '#FDE7CF',
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: '#FFF9F2',
            }}>
            <Text
              style={{
                fontSize: 13,
                color: '#F97316',
                fontWeight: '700',
              }}>
              ॐ Sai Devotee
            </Text>

            <Text
              style={{
                marginTop: 3,
                fontSize: 13,
                color: '#6B7280',
                fontWeight: '500',
              }}>
              1.2 km away
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text
          numberOfLines={1}
          style={{
            marginTop: 12,
            fontSize: 16,
            color: '#6B7280',
            fontWeight: '500',
          }}>
          Eggless cakes, traditional sweets, cat...
        </Text>

        {/* Bottom Info */}
        <View
          style={{
            marginTop: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Ionicons
            name="star"
            size={18}
            color="#FBBF24"
          />

          <Text
            style={{
              marginLeft: 6,
              fontSize: 16,
              color: '#4B5563',
              fontWeight: '600',
            }}>
            4.8
          </Text>

          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: '#D1D5DB',
              marginHorizontal: 14,
            }}
          />

          <Ionicons
            name="time-outline"
            size={18}
            color="#6B7280"
          />

          <Text
            style={{
              marginLeft: 6,
              fontSize: 15,
              color: '#6B7280',
              fontWeight: '500',
            }}>
            Open till 9 PM
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>

  {/* Card 2 */}
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() =>
      router.push('/directory/business-details')
    }
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 30,
      padding: 18,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    }}>
    <View
      style={{
        flexDirection: 'row',
      }}>
      {/* Placeholder */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 26,
          backgroundColor: '#F3F4F6',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Ionicons
          name="construct"
          size={34}
          color="#9CA3AF"
        />
      </View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          marginLeft: 18,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: '800',
              color: '#111111',
              marginRight: 10,
            }}>
            Om Sai Auto Wor...
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: '#FDE7CF',
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: '#FFF9F2',
            }}>
            <Text
              style={{
                fontSize: 13,
                color: '#F97316',
                fontWeight: '700',
              }}>
              ॐ Sai Devotee
            </Text>

            <Text
              style={{
                marginTop: 3,
                fontSize: 13,
                color: '#6B7280',
                fontWeight: '500',
              }}>
              2.5 km away
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={1}
          style={{
            marginTop: 12,
            fontSize: 16,
            color: '#6B7280',
            fontWeight: '500',
          }}>
          Two-wheeler repair, servicing, spares
        </Text>

        <View
          style={{
            marginTop: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Ionicons
            name="star"
            size={18}
            color="#FBBF24"
          />

          <Text
            style={{
              marginLeft: 6,
              fontSize: 16,
              color: '#4B5563',
              fontWeight: '600',
            }}>
            4.5
          </Text>

          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: '#D1D5DB',
              marginHorizontal: 14,
            }}
          />

          <Ionicons
            name="call"
            size={16}
            color="#6B7280"
          />

          <Text
            style={{
              marginLeft: 6,
              fontSize: 15,
              color: '#6B7280',
              fontWeight: '500',
            }}>
            Call for pickup
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>

  {/* Card 3 */}
  <TouchableOpacity
    activeOpacity={0.9}
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 30,
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
    <View
      style={{
        flexDirection: 'row',
      }}>
      <Image
        source={{
          uri: 'https://randomuser.me/api/portraits/men/44.jpg',
        }}
        style={{
          width: 96,
          height: 96,
          borderRadius: 26,
        }}
      />

      <View
        style={{
          flex: 1,
          marginLeft: 18,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: '800',
              color: '#111111',
              marginRight: 10,
            }}>
            Vidya Tuitions (M...
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: '#FDE7CF',
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: '#FFF9F2',
            }}>
            <Text
              style={{
                fontSize: 13,
                color: '#F97316',
                fontWeight: '700',
              }}>
              ॐ Sai Devotee
            </Text>

            <Text
              style={{
                marginTop: 3,
                fontSize: 13,
                color: '#6B7280',
                fontWeight: '500',
              }}>
              3.1 km away
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={1}
          style={{
            marginTop: 12,
            fontSize: 16,
            color: '#6B7280',
            fontWeight: '500',
          }}>
          CBSE/ICSE classes 8th to 10th
        </Text>

        <View
          style={{
            marginTop: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Ionicons
            name="star"
            size={18}
            color="#FBBF24"
          />

          <Text
            style={{
              marginLeft: 6,
              fontSize: 16,
              color: '#4B5563',
              fontWeight: '600',
            }}>
            5.0
          </Text>

          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: '#D1D5DB',
              marginHorizontal: 14,
            }}
          />

          <Ionicons
            name="home"
            size={16}
            color="#6B7280"
          />

          <Text
            style={{
              marginLeft: 6,
              fontSize: 15,
              color: '#6B7280',
              fontWeight: '500',
            }}>
            Home visits available
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>

  {/* Load More */}
  <TouchableOpacity
    activeOpacity={0.85}
    style={{
      marginTop: 26,
      height: 68,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    }}>
    <Text
      style={{
        fontSize: 18,
        color: '#4B5563',
        fontWeight: '700',
      }}>
      Load more businesses
    </Text>
  </TouchableOpacity>
</View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
