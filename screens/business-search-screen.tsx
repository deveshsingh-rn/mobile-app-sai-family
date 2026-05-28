import React, {useState} from 'react';
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';



import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
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
          size={24}
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
          size={27}
          color={item.iconColor}
        />
      );
    }

    return (
      <Ionicons
        name="medical"
        size={24}
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
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
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
              onPress={() => router.back()}
              style={{
                width: 56,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons
              name="arrow-back"
              size={22}
              color="#374151"
            />
          </TouchableOpacity>

          {/* Search Box */}
          <View
            style={{
              flex: 1,
              marginLeft: 12,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#F9FAFB',
              borderWidth: 1.5,
              borderColor: '#E5E7EB',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
            }}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search businesses, categories."
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 15,
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
          paddingBottom: 30,
          paddingTop: 20,
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
                fontSize: 17,
                fontWeight: '800',
                color: '#111827',
              }}>
              Recent Searches
            </Text>

            <TouchableOpacity activeOpacity={0.8}>
              <Text
                style={{
                  fontSize: 14,
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
              marginTop: 16,
            }}>
            {recentSearches.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.85}
                style={{
                  height: 40,
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#ECECEC',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  marginRight: 10,
                  marginBottom: 10,
                }}>
                <Ionicons
                  name="time"
                  size={15}
                  color="#9CA3AF"
                />

                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 13,
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
            marginTop: 24,
          }}>
          <Text
            style={{
              fontSize: 17,
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
              marginTop: 16,
            }}>
            {categories.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.88}
                style={{
                  width: '48%',
                  height: 118,
                  borderRadius: 18,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#ECECEC',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
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
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: item.bg,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {renderCategoryIcon(item)}
                </View>

                <Text
                  style={{
                    marginTop: 14,
                    fontSize: 14,
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
            marginTop: 14,
          }}>
          {/* Title */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Ionicons
              name="flame"
              size={16}
              color="#F97316"
            />

            <Text
              style={{
                marginLeft: 8,
                fontSize: 17,
                fontWeight: '800',
                color: '#111827',
              }}>
              Trending This Week
            </Text>
          </View>

          {/* Trending Cards */}
          <View
            style={{
              marginTop: 16,
            }}>
            {trending.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.88}
                style={{
                  height: 78,
                  borderRadius: 18,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#ECECEC',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  marginBottom: 12,
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
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: '#FFF7ED',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 17,
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
                    marginLeft: 12,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#111827',
                    }}>
                    {item.title}
                  </Text>

                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: '#6B7280',
                      fontWeight: '500',
                    }}>
                    {item.subtitle}
                  </Text>
                </View>

                {/* Arrow */}
                <Ionicons
                  name="trending-up"
                  size={18}
                  color="#F97316"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

export default SearchScreen;
