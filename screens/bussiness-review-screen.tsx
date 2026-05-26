import React from 'react';
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';



import {
  Ionicons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const ratingData = [
  {
    star: 5,
    count: 28,
    width: '85%',
  },
  {
    star: 4,
    count: 4,
    width: '12%',
  },
  {
    star: 3,
    count: 2,
    width: '3%',
  },
  {
    star: 2,
    count: 0,
    width: '0%',
  },
  {
    star: 1,
    count: 0,
    width: '0%',
  },
] as const;

const ReviewsScreen = () => {
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
            height: 122,
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#F1F1F1',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 30,
          }}>
          {/* Left */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {/* Back */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.back()}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#F7F7F7',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons
                name="arrow-back"
                size={30}
                color="#4B5563"
              />
            </TouchableOpacity>

            {/* Title */}
            <Text
              style={{
                marginLeft: 22,
                fontSize: 26,
                fontWeight: '800',
                color: '#111827',
                letterSpacing: -0.4,
              }}>
              Reviews & Ratings
            </Text>
          </View>

          {/* Menu */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#F7F7F7',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons
              name="ellipsis-vertical"
              size={26}
              color="#4B5563"
            />
          </TouchableOpacity>
        </View>

        {/* Rating Card */}
        <View
          style={{
            marginTop: 42,
            marginHorizontal: 30,
            backgroundColor: '#FFFFFF',
            borderRadius: 34,
            paddingHorizontal: 34,
            paddingTop: 42,
            paddingBottom: 34,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.03,
            shadowRadius: 10,
            elevation: 2,
          }}>
          {/* Rating Number */}
          <Text
            style={{
              textAlign: 'center',
              fontSize: 92,
              lineHeight: 96,
              fontWeight: '900',
              color: '#111111',
              letterSpacing: -2,
            }}>
            4.8
          </Text>

          {/* Stars */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 18,
            }}>
            {[1, 2, 3, 4].map(item => (
              <Ionicons
                key={item}
                name="star"
                size={42}
                color="#FACC15"
                style={{
                  marginHorizontal: 4,
                }}
              />
            ))}

            <Ionicons
              name="star-half-outline"
              size={42}
              color="#FACC15"
              style={{
                marginHorizontal: 4,
              }}
            />
          </View>

          {/* Review Count */}
          <Text
            style={{
              marginTop: 18,
              textAlign: 'center',
              fontSize: 24,
              color: '#475569',
              fontWeight: '600',
            }}>
            Based on 34 reviews
          </Text>

          {/* Rating Bars */}
          <View
            style={{
              marginTop: 42,
            }}>
            {ratingData.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 28,
                }}>
                {/* Number */}
                <Text
                  style={{
                    width: 28,
                    fontSize: 22,
                    color: '#111111',
                    fontWeight: '600',
                  }}>
                  {item.star}
                </Text>

                {/* Bar */}
                <View
                  style={{
                    flex: 1,
                    height: 16,
                    borderRadius: 100,
                    backgroundColor: '#F1F2F4',
                    marginHorizontal: 24,
                    overflow: 'hidden',
                  }}>
                  <View
                    style={{
                      width: item.width,
                      height: '100%',
                      borderRadius: 100,
                      backgroundColor: '#EE9B52',
                    }}
                  />
                </View>

                {/* Count */}
                <Text
                  style={{
                    width: 36,
                    textAlign: 'right',
                    fontSize: 20,
                    color: '#475569',
                    fontWeight: '500',
                  }}>
                  {item.count}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Verified Reviews Card */}
        <View
          style={{
            marginTop: 40,
            marginHorizontal: 30,
            backgroundColor: '#FFF8F1',
            borderRadius: 34,
            borderWidth: 1.5,
            borderColor: '#F8DFC4',
            paddingHorizontal: 34,
            paddingVertical: 40,
          }}>
          {/* Lock Circle */}
          <View
            style={{
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 82,
                height: 82,
                borderRadius: 41,
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
                name="lock-closed"
                size={34}
                color="#EE9B52"
              />
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              marginTop: 34,
              textAlign: 'center',
              fontSize: 28,
              lineHeight: 36,
              color: '#111827',
              fontWeight: '800',
              letterSpacing: -0.4,
            }}>
            Verified Reviews Only
          </Text>

          {/* Description */}
          <Text
            style={{
              marginTop: 24,
              textAlign: 'center',
              fontSize: 22,
              lineHeight: 40,
              color: '#475569',
              fontWeight: '500',
            }}>
            You can review this business after
            sending an enquiry. We ensure all
            reviews are from genuine community
            members.
          </Text>

          {/* Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={{
              marginTop: 38,
              height: 88,
              borderRadius: 26,
              backgroundColor: '#EE9B52',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#EE9B52',
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.24,
              shadowRadius: 14,
              elevation: 6,
            }}>
            <Text
              style={{
                fontSize: 24,
                color: '#FFFFFF',
                fontWeight: '800',
              }}>
              Send an Enquiry First
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reviews Filter */}
<View
  style={{
    marginTop: 42,
  }}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{
      paddingHorizontal: 22,
    }}>
    {/* Active */}
    <TouchableOpacity
      activeOpacity={0.85}
      style={{
        height: 58,
        paddingHorizontal: 28,
        borderRadius: 29,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.14,
        shadowRadius: 12,
        elevation: 6,
      }}>
      <Text
        style={{
          fontSize: 18,
          color: '#FFFFFF',
          fontWeight: '700',
        }}>
        All (34)
      </Text>
    </TouchableOpacity>

    {/* Filter */}
    <TouchableOpacity
      activeOpacity={0.85}
      style={{
        height: 58,
        paddingHorizontal: 28,
        borderRadius: 29,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
      }}>
      <Text
        style={{
          fontSize: 18,
          color: '#111827',
          fontWeight: '500',
        }}>
        Highest Rated
      </Text>
    </TouchableOpacity>

    {/* Filter */}
    <TouchableOpacity
      activeOpacity={0.85}
      style={{
        height: 58,
        paddingHorizontal: 28,
        borderRadius: 29,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text
        style={{
          fontSize: 18,
          color: '#111827',
          fontWeight: '500',
        }}>
        Lowest Rated
      </Text>
    </TouchableOpacity>
  </ScrollView>
</View>

{/* Reviews List */}
<View
  style={{
    marginTop: 34,
    paddingHorizontal: 22,
  }}>
  {/* Review Card 1 */}
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 34,
      borderWidth: 1,
      borderColor: '#F1F1F1',
      padding: 26,
      marginBottom: 28,
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
        justifyContent: 'space-between',
      }}>
      {/* User */}
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
        }}>
        <Image
          source={{
            uri: 'https://randomuser.me/api/portraits/women/44.jpg',
          }}
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
          }}
        />

        <View
          style={{
            marginLeft: 16,
            flex: 1,
          }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: '#111827',
            }}>
            Priya M.
          </Text>

          {/* Badge */}
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: 8,
              backgroundColor: '#FFF3E8',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}>
            <Text
              style={{
                fontSize: 14,
                color: '#E67E22',
                fontWeight: '600',
              }}>
              ॐ Shirdi Sai Devotee
            </Text>
          </View>

          {/* Location */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
            }}>
            <Ionicons
              name="location-sharp"
              size={16}
              color="#475569"
            />

            <Text
              style={{
                marginLeft: 5,
                fontSize: 16,
                color: '#475569',
                fontWeight: '500',
              }}>
              Mumbai
            </Text>
          </View>
        </View>
      </View>

      {/* Time */}
      <Text
        style={{
          fontSize: 16,
          color: '#475569',
          fontWeight: '500',
        }}>
        2 days ago
      </Text>
    </View>

    {/* Stars */}
    <View
      style={{
        flexDirection: 'row',
        marginTop: 26,
      }}>
      {[1, 2, 3, 4, 5].map(item => (
        <Ionicons
          key={item}
          name="star"
          size={28}
          color="#FACC15"
          style={{
            marginRight: 6,
          }}
        />
      ))}
    </View>

    {/* Review */}
    <Text
      style={{
        marginTop: 22,
        fontSize: 18,
        lineHeight: 38,
        color: '#475569',
        fontWeight: '500',
      }}>
      Exceptional service and deep
      understanding of our spiritual
      needs. The arrangement was flawless,
      and the entire team handled
      everything with utmost devotion and
      care. Highly recommended for any
      community event.
    </Text>

    {/* Divider */}
    <View
      style={{
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 26,
      }}
    />

    {/* Bottom */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <Text
        style={{
          fontSize: 16,
          color: '#475569',
          fontWeight: '700',
        }}>
        Was this helpful?
      </Text>

      <View
        style={{
          flexDirection: 'row',
        }}>
        {/* Like */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            height: 42,
            paddingHorizontal: 18,
            borderRadius: 21,
            backgroundColor: '#F8FAFC',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 12,
          }}>
          <Ionicons
            name="thumbs-up-outline"
            size={18}
            color="#475569"
          />

          <Text
            style={{
              marginLeft: 8,
              fontSize: 17,
              color: '#475569',
              fontWeight: '500',
            }}>
            12
          </Text>
        </TouchableOpacity>

        {/* Dislike */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: '#F8FAFC',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Ionicons
            name="thumbs-down-outline"
            size={18}
            color="#475569"
          />
        </TouchableOpacity>
      </View>
    </View>
  </View>

  {/* Review Card 2 */}
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 34,
      borderWidth: 1,
      borderColor: '#F1F1F1',
      padding: 26,
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
        justifyContent: 'space-between',
      }}>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
        }}>
        <Image
          source={{
            uri: 'https://randomuser.me/api/portraits/men/32.jpg',
          }}
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
          }}
        />

        <View
          style={{
            marginLeft: 16,
            flex: 1,
          }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: '#111827',
            }}>
            Rahul Sharma
          </Text>

          {/* Badge */}
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: 8,
              backgroundColor: '#F3F4F6',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Ionicons
              name="people"
              size={14}
              color="#475569"
            />

            <Text
              style={{
                marginLeft: 6,
                fontSize: 14,
                color: '#475569',
                fontWeight: '600',
              }}>
              Member since '22
            </Text>
          </View>

          {/* Location */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
            }}>
            <Ionicons
              name="location-sharp"
              size={16}
              color="#475569"
            />

            <Text
              style={{
                marginLeft: 5,
                fontSize: 16,
                color: '#475569',
                fontWeight: '500',
              }}>
              Delhi
            </Text>
          </View>
        </View>
      </View>

      {/* Time */}
      <Text
        style={{
          fontSize: 16,
          color: '#475569',
          fontWeight: '500',
        }}>
        1 week ago
      </Text>
    </View>

    {/* Stars */}
    <View
      style={{
        flexDirection: 'row',
        marginTop: 26,
      }}>
      {[1, 2, 3, 4].map(item => (
        <Ionicons
          key={item}
          name="star"
          size={28}
          color="#FACC15"
          style={{
            marginRight: 6,
          }}
        />
      ))}

      <Ionicons
        name="star-outline"
        size={28}
        color="#D1D5DB"
      />
    </View>

    {/* Review */}
    <Text
      style={{
        marginTop: 22,
        fontSize: 18,
        lineHeight: 38,
        color: '#475569',
        fontWeight: '500',
      }}>
      Very professional approach. The
      quality of materials provided for the
      puja was authentic and pure. Only
      giving 4 stars because delivery was
      slightly delayed, but otherwise a
      great experience.
    </Text>

    {/* Divider */}
    <View
      style={{
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 26,
      }}
    />

    {/* Bottom */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <Text
        style={{
          fontSize: 16,
          color: '#475569',
          fontWeight: '700',
        }}>
        Was this helpful?
      </Text>

      <View
        style={{
          flexDirection: 'row',
        }}>
        {/* Like */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            height: 42,
            paddingHorizontal: 18,
            borderRadius: 21,
            backgroundColor: '#FFF3E8',
            borderWidth: 1,
            borderColor: '#FED7AA',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 12,
          }}>
          <Ionicons
            name="thumbs-up"
            size={18}
            color="#F59E0B"
          />

          <Text
            style={{
              marginLeft: 8,
              fontSize: 17,
              color: '#F59E0B',
              fontWeight: '700',
            }}>
            8
          </Text>
        </TouchableOpacity>

        {/* Dislike */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            height: 42,
            paddingHorizontal: 16,
            borderRadius: 21,
            backgroundColor: '#F8FAFC',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Ionicons
            name="thumbs-down-outline"
            size={18}
            color="#475569"
          />

          <Text
            style={{
              marginLeft: 8,
              fontSize: 17,
              color: '#475569',
              fontWeight: '500',
            }}>
            1
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>

  {/* Loader */}
  <View
    style={{
      alignItems: 'center',
      marginTop: 44,
      marginBottom: 10,
    }}>
    <Ionicons
      name="reload"
      size={34}
      color="#EE9B52"
    />
  </View>
</View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewsScreen;
