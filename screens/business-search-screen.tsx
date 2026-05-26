import React, {useState} from 'react';
import {
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
import { SafeAreaView } from 'react-native-safe-area-context';


const recentSearches = [
  'Spiritual Retreats',
  'Organic Food',
  'Yoga Centers',
];

const categories = [
  {
    title: 'Temples',
    icon: 'om',
    iconType: 'MaterialCommunityIcons',
    bg: '#FFF1E8',
    iconColor: '#F97316',
  },
  {
    title: 'Healthcare',
    icon: 'heartbeat',
    iconType: 'FontAwesome',
    bg: '#EEF5FF',
    iconColor: '#3B82F6',
  },
  {
    title: 'Organic',
    icon: 'leaf',
    iconType: 'Feather',
    bg: '#ECFDF5',
    iconColor: '#22C55E',
  },
  {
    title: 'Education',
    icon: 'book-open',
    iconType: 'Feather',
    bg: '#F5ECFF',
    iconColor: '#A855F7',
  },
];

const trending = [
  {
    rank: '1',
    title: 'Sai Baba Temple, Shirdi',
    subtitle: 'Religious Center • 12k views',
  },
  {
    rank: '2',
    title: 'Prasanthi Nilayam',
    subtitle: 'Ashram • 8.5k views',
  },
];

const SearchScreen = () => {
  const [search, setSearch] = useState('');

  const renderCategoryIcon = (item: any) => {
    if (item.iconType === 'Feather') {
      return (
        <Feather
          name={item.icon}
          size={34}
          color={item.iconColor}
        />
      );
    }

    if (
      item.iconType === 'MaterialCommunityIcons'
    ) {
      return (
        <MaterialCommunityIcons
          name={item.icon}
          size={38}
          color={item.iconColor}
        />
      );
    }

    return (
      <Ionicons
        name="medical"
        size={34}
        color={item.iconColor}
      />
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#FAFAFA',
      }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FAFAFA"
      />

      {/* Header */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 22,
          paddingTop: 14,
          paddingBottom: 34,
          borderBottomLeftRadius: 34,
          borderBottomRightRadius: 34,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.04,
          shadowRadius: 16,
          elevation: 3,
        }}>
        {/* Search Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {/* Back */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons
              name="arrow-back"
              size={28}
              color="#374151"
            />
          </TouchableOpacity>

          {/* Search Box */}
          <View
            style={{
              flex: 1,
              marginLeft: 16,
              height: 68,
              borderRadius: 34,
              backgroundColor: '#F9FAFB',
              borderWidth: 1.5,
              borderColor: '#E5E7EB',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 22,
            }}>
            <Ionicons
              name="search"
              size={26}
              color="#9CA3AF"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search businesses, categories."
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                marginLeft: 14,
                fontSize: 18,
                color: '#111827',
                fontWeight: '500',
              }}
            />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: 130,
          paddingTop: 28,
        }}>
        {/* Recent Searches */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: '#111827',
              }}>
              Recent Searches
            </Text>

            <TouchableOpacity activeOpacity={0.8}>
              <Text
                style={{
                  fontSize: 17,
                  color: '#F97316',
                  fontWeight: '700',
                }}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chips */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginTop: 24,
            }}>
            {recentSearches.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.85}
                style={{
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#ECECEC',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  marginRight: 14,
                  marginBottom: 14,
                }}>
                <Ionicons
                  name="time"
                  size={20}
                  color="#9CA3AF"
                />

                <Text
                  style={{
                    marginLeft: 12,
                    fontSize: 17,
                    color: '#4B5563',
                    fontWeight: '500',
                  }}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View
          style={{
            marginTop: 38,
          }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: '#111827',
            }}>
            Popular Categories
          </Text>

          {/* Grid */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: 24,
            }}>
            {categories.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.88}
                style={{
                  width: '48%',
                  height: 170,
                  borderRadius: 28,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#ECECEC',
                  justifyContent: 'center',
                  alignItems: 'center',
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
                {/* Icon Circle */}
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: item.bg,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {renderCategoryIcon(item)}
                </View>

                <Text
                  style={{
                    marginTop: 24,
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#1F2937',
                  }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending */}
        <View
          style={{
            marginTop: 18,
          }}>
          {/* Title */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Ionicons
              name="flame"
              size={20}
              color="#F97316"
            />

            <Text
              style={{
                marginLeft: 10,
                fontSize: 20,
                fontWeight: '800',
                color: '#111827',
              }}>
              Trending This Week
            </Text>
          </View>

          {/* Trending Cards */}
          <View
            style={{
              marginTop: 24,
            }}>
            {trending.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.88}
                style={{
                  height: 108,
                  borderRadius: 28,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#ECECEC',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 18,
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
                {/* Rank */}
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: '#FFF7ED',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: '800',
                      color: '#F97316',
                    }}>
                    {item.rank}
                  </Text>
                </View>

                {/* Content */}
                <View
                  style={{
                    flex: 1,
                    marginLeft: 16,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: '#111827',
                    }}>
                    {item.title}
                  </Text>

                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 16,
                      color: '#6B7280',
                      fontWeight: '500',
                    }}>
                    {item.subtitle}
                  </Text>
                </View>

                {/* Arrow */}
                <Ionicons
                  name="trending-up"
                  size={24}
                  color="#F97316"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Tab */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 104,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#ECECEC',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingBottom: 18,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -6,
          },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 10,
        }}>
        {[
          {
            icon: 'compass-outline',
            label: 'Explore',
          },
          {
            icon: 'radio-button-off-outline',
            label: 'Events',
          },
          {
            icon: 'storefront',
            label: 'Directory',
            active: true,
          },
          {
            icon: 'people-outline',
            label: 'Sangha',
          },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.85}
            style={{
              alignItems: 'center',
            }}>
            {item.active && (
              <View
                style={{
                  position: 'absolute',
                  top: -10,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#F97316',
                }}
              />
            )}

            <Ionicons
              name={item.icon}
              size={28}
              color={
                item.active
                  ? '#F97316'
                  : '#9CA3AF'
              }
            />

            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                fontWeight: item.active
                  ? '700'
                  : '500',
                color: item.active
                  ? '#F97316'
                  : '#9CA3AF',
              }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Profile */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            alignItems: 'center',
          }}>
          <Image
            source={{
              uri: 'https://randomuser.me/api/portraits/women/44.jpg',
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
            }}
          />

          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: '#9CA3AF',
              fontWeight: '500',
            }}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;