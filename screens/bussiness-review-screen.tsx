import React from 'react';
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
          paddingBottom: 28,
        }}>
        {/* Header */}
        <View
          style={{
            height: 82,
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#F1F1F1',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
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
                height: 44,
                borderRadius: 22,
                backgroundColor: '#F7F7F7',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons
                name="arrow-back"
                size={22}
                color="#4B5563"
              />
            </TouchableOpacity>

            {/* Title */}
            <Text
              style={{
                marginLeft: 14,
                fontSize: 20,
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
              height: 44,
              borderRadius: 22,
              backgroundColor: '#F7F7F7',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color="#4B5563"
            />
          </TouchableOpacity>
        </View>

        {/* Rating Card */}
        <View
          style={{
            marginTop: 22,
            marginHorizontal: 18,
            backgroundColor: '#FFFFFF',
            borderRadius: 22,
            paddingHorizontal: 22,
            paddingTop: 24,
            paddingBottom: 20,
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
              fontSize: 54,
              lineHeight: 58,
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
              marginTop: 10,
            }}>
            {[1, 2, 3, 4].map(item => (
              <Ionicons
                key={item}
                name="star"
                size={25}
                color="#FACC15"
                style={{
                  marginHorizontal: 2,
                }}
              />
            ))}

            <Ionicons
              name="star-half-outline"
              size={25}
              color="#FACC15"
              style={{
                marginHorizontal: 2,
              }}
            />
          </View>

          {/* Review Count */}
          <Text
            style={{
              marginTop: 10,
              textAlign: 'center',
              fontSize: 15,
              color: '#475569',
              fontWeight: '600',
            }}>
            Based on 34 reviews
          </Text>

          {/* Rating Bars */}
          <View
            style={{
              marginTop: 22,
            }}>
            {ratingData.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 14,
                }}>
                {/* Number */}
                <Text
                  style={{
                    width: 28,
                    fontSize: 14,
                    color: '#111111',
                    fontWeight: '600',
                  }}>
                  {item.star}
                </Text>

                {/* Bar */}
                <View
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 100,
                    backgroundColor: '#F1F2F4',
                    marginHorizontal: 14,
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
                    fontSize: 14,
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
            marginTop: 22,
            marginHorizontal: 18,
            backgroundColor: '#FFF8F1',
            borderRadius: 22,
            borderWidth: 1.5,
            borderColor: '#F8DFC4',
            paddingHorizontal: 22,
            paddingVertical: 24,
          }}>
          {/* Lock Circle */}
          <View
            style={{
              alignItems: 'center',
            }}>
            <View
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
                name="lock-closed"
                size={23}
                color="#EE9B52"
              />
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              marginTop: 18,
              textAlign: 'center',
              fontSize: 20,
              lineHeight: 26,
              color: '#111827',
              fontWeight: '800',
              letterSpacing: -0.4,
            }}>
            Verified Reviews Only
          </Text>

          {/* Description */}
          <Text
            style={{
              marginTop: 12,
              textAlign: 'center',
              fontSize: 15,
              lineHeight: 24,
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
              marginTop: 22,
              height: 54,
              borderRadius: 16,
              backgroundColor: '#EE9B52',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#EE9B52',
              shadowOffset: {
                width: 0,
                height: 6,
              },
              shadowOpacity: 0.24,
              shadowRadius: 14,
              elevation: 6,
            }}>
            <Text
              style={{
                fontSize: 16,
                color: '#FFFFFF',
                fontWeight: '800',
              }}>
              Send an Enquiry First
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===================================================== */}


        {/* Reviews Filter */}
<View
  style={{
    marginTop: 24,
  }}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{
      paddingHorizontal: 18,
    }}>
    {/* Active */}
    <TouchableOpacity
      activeOpacity={0.85}
      style={{
        height: 40,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.14,
        shadowRadius: 12,
        elevation: 6,
      }}>
      <Text
        style={{
          fontSize: 14,
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
        height: 40,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
      }}>
      <Text
        style={{
          fontSize: 14,
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
        height: 40,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text
        style={{
          fontSize: 14,
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
    marginTop: 22,
    paddingHorizontal: 18,
  }}>
  {/* Review Card 1 */}
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      borderWidth: 1,
      borderColor: '#F1F1F1',
      padding: 18,
      marginBottom: 18,
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
            width: 46,
            height: 46,
            borderRadius: 23,
          }}
        />

        <View
          style={{
            marginLeft: 12,
            flex: 1,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '800',
              color: '#111827',
            }}>
            Priya M.
          </Text>

          {/* Badge */}
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: 5,
              backgroundColor: '#FFF3E8',
              borderRadius: 10,
              paddingHorizontal: 9,
              paddingVertical: 4,
            }}>
            <Text
              style={{
                fontSize: 11,
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
              marginTop: 7,
            }}>
            <Ionicons
              name="location-sharp"
              size={13}
              color="#475569"
            />

            <Text
              style={{
                marginLeft: 5,
                fontSize: 13,
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
          fontSize: 12,
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
        marginTop: 18,
      }}>
      {[1, 2, 3, 4, 5].map(item => (
        <Ionicons
          key={item}
          name="star"
          size={18}
          color="#FACC15"
          style={{
            marginRight: 4,
          }}
        />
      ))}
    </View>

    {/* Review */}
    <Text
      style={{
        marginTop: 14,
        fontSize: 14,
        lineHeight: 23,
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
        marginVertical: 18,
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
          fontSize: 13,
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
            height: 34,
            paddingHorizontal: 13,
            borderRadius: 17,
            backgroundColor: '#F8FAFC',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 12,
          }}>
          <Ionicons
            name="thumbs-up-outline"
            size={15}
            color="#475569"
          />

          <Text
            style={{
              marginLeft: 8,
              fontSize: 13,
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
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: '#F8FAFC',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Ionicons
            name="thumbs-down-outline"
            size={15}
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
      borderRadius: 22,
      borderWidth: 1,
      borderColor: '#F1F1F1',
      padding: 18,
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
            width: 46,
            height: 46,
            borderRadius: 23,
          }}
        />

        <View
          style={{
            marginLeft: 12,
            flex: 1,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '800',
              color: '#111827',
            }}>
            Rahul Sharma
          </Text>

          {/* Badge */}
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: 5,
              backgroundColor: '#F3F4F6',
              borderRadius: 10,
              paddingHorizontal: 9,
              paddingVertical: 4,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Ionicons
              name="people"
              size={12}
              color="#475569"
            />

            <Text
              style={{
                marginLeft: 6,
                fontSize: 11,
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
              marginTop: 7,
            }}>
            <Ionicons
              name="location-sharp"
              size={13}
              color="#475569"
            />

            <Text
              style={{
                marginLeft: 5,
                fontSize: 13,
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
          fontSize: 12,
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
        marginTop: 18,
      }}>
      {[1, 2, 3, 4].map(item => (
        <Ionicons
          key={item}
          name="star"
          size={18}
          color="#FACC15"
          style={{
            marginRight: 4,
          }}
        />
      ))}

      <Ionicons
        name="star-outline"
        size={18}
        color="#D1D5DB"
      />
    </View>

    {/* Review */}
    <Text
      style={{
        marginTop: 14,
        fontSize: 14,
        lineHeight: 23,
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
        marginVertical: 18,
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
          fontSize: 13,
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
            height: 34,
            paddingHorizontal: 13,
            borderRadius: 17,
            backgroundColor: '#FFF3E8',
            borderWidth: 1,
            borderColor: '#FED7AA',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 12,
          }}>
          <Ionicons
            name="thumbs-up"
            size={15}
            color="#F59E0B"
          />

          <Text
            style={{
              marginLeft: 8,
              fontSize: 13,
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
            height: 34,
            paddingHorizontal: 13,
            borderRadius: 17,
            backgroundColor: '#F8FAFC',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Ionicons
            name="thumbs-down-outline"
            size={15}
            color="#475569"
          />

          <Text
            style={{
              marginLeft: 8,
              fontSize: 13,
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
      marginTop: 28,
      marginBottom: 10,
    }}>
    <Ionicons
      name="reload"
      size={24}
      color="#EE9B52"
    />
  </View>
</View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewsScreen;
