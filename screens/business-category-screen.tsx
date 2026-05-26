import React, { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type BusinessCard = {
  category: string;
  distance: string;
  image: string;
  name: string;
  rating: string;
  tags: string[];
  title: string;
  verified?: boolean;
};

const businesses: BusinessCard[] = [
  {
    category: 'Healthcare',
    distance: '2.4 km away',
    image:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=900',
    name: 'Dr. Ramesh Kumar',
    rating: '4.9',
    tags: ['Pediatrics', 'General Medicine'],
    title: 'Sai Sanjeevani Clinic',
    verified: true,
  },
  {
    category: 'Food',
    distance: '1.2 km away',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900',
    name: 'Anjali Mehta',
    rating: '4.8',
    tags: ['Pure Veg', 'Sweets'],
    title: "Anjali's Pure Veg Kitchen",
    verified: true,
  },
  {
    category: 'Education',
    distance: '3.1 km away',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=900',
    name: 'Meera Joshi',
    rating: '4.7',
    tags: ['Tutoring', 'Sanskrit'],
    title: 'Sai Learning Classes',
  },
  {
    category: 'Technology',
    distance: 'Online',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900',
    name: 'Arjun Patel',
    rating: '4.9',
    tags: ['Web Apps', 'Support'],
    title: 'Sai Digital Services',
    verified: true,
  },
  {
    category: 'Retail',
    distance: '4.5 km away',
    image:
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=900',
    name: 'Kavita Shah',
    rating: '4.6',
    tags: ['Gifts', 'Daily Needs'],
    title: 'Sai Community Store',
  },
  {
    category: 'Services',
    distance: '2.8 km away',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=900',
    name: 'Suresh Nair',
    rating: '4.8',
    tags: ['Event Help', 'Repairs'],
    title: 'Sai Seva Services',
    verified: true,
  },
  {
    category: 'Spiritual Goods',
    distance: '1.9 km away',
    image:
      'https://images.unsplash.com/photo-1609604161777-0c39f681a0ed?q=80&w=900',
    name: 'Nisha Verma',
    rating: '4.9',
    tags: ['Puja Items', 'Books'],
    title: 'Shirdi Sai Spiritual Goods',
    verified: true,
  },
  {
    category: 'Real Estate',
    distance: '5.6 km away',
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=900',
    name: 'Vikram Rao',
    rating: '4.5',
    tags: ['Rentals', 'Consulting'],
    title: 'Sai Property Guidance',
  },
];

function FeaturedBusinessCard({
  item,
}: {
  item: BusinessCard;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push('/directory/business-details')
      }
      style={{
        backgroundColor: '#F8EFE3',
        borderRadius: 26,
        marginBottom: 18,
        overflow: 'hidden',
        padding: 18,
      }}>
      <View
        style={{
          position: 'absolute',
          right: -28,
          top: -34,
          width: 168,
          height: 168,
          borderRadius: 84,
          backgroundColor: '#F6E5C6',
        }}
      />

      {item.verified && (
        <View
          style={{
            position: 'absolute',
            right: 18,
            top: 18,
            backgroundColor: '#FFF8ED',
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 7,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Ionicons
            name="sparkles"
            size={13}
            color="#F97316"
          />
          <Text
            style={{
              marginLeft: 5,
              fontSize: 12,
              color: '#111827',
              fontWeight: '800',
            }}>
            Verified
          </Text>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: item.verified ? 100 : 0,
        }}>
        <Image
          source={{
            uri: item.image,
          }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 22,
            borderWidth: 3,
            borderColor: '#FFFFFF',
          }}
        />

        <View
          style={{
            flex: 1,
            marginLeft: 14,
          }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 17,
              color: '#111111',
              fontWeight: '900',
            }}>
            {item.name}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              marginTop: 4,
              fontSize: 14,
              color: '#6B7280',
              fontWeight: '700',
            }}>
            {item.title}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 18,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name="star"
            size={15}
            color="#FBBF24"
            style={{
              marginRight: 2,
            }}
          />
        ))}

        <Text
          style={{
            marginLeft: 8,
            fontSize: 16,
            fontWeight: '900',
            color: '#111827',
          }}>
          {item.rating}
        </Text>

        <Text
          style={{
            marginLeft: 10,
            fontSize: 13,
            color: '#6B7280',
            fontWeight: '700',
          }}>
          {item.distance}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 16,
        }}>
        {item.tags.map((tag) => (
          <View
            key={tag}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              marginRight: 10,
              marginTop: 8,
              paddingHorizontal: 13,
              paddingVertical: 8,
            }}>
            <Text
              style={{
                fontSize: 13,
                color: '#4B5563',
                fontWeight: '700',
              }}>
              {tag}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function BusinessCategoryScreen() {
  const { category } =
    useLocalSearchParams<{
      category?: string;
    }>();
  const categoryName = Array.isArray(category)
    ? category[0]
    : category || 'Businesses';

  const filteredBusinesses = useMemo(() => {
    const normalized = categoryName
      .replace(/\n/g, ' ')
      .trim();

    return businesses.filter(
      (business) =>
        business.category === normalized
    );
  }, [categoryName]);

  const data = filteredBusinesses.length
    ? filteredBusinesses
    : businesses;

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

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: 16,
        }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={{
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 22,
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}>
          <Ionicons
            name="arrow-back"
            size={22}
            color="#374151"
          />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            marginHorizontal: 14,
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: '#111111',
              fontSize: 22,
              fontWeight: '900',
            }}>
            {categoryName}
          </Text>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 13,
              fontWeight: '700',
              marginTop: 2,
            }}>
            {data.length} trusted listings
          </Text>
        </View>

        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#FFF7ED',
            borderRadius: 22,
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}>
          <MaterialCommunityIcons
            name="storefront"
            size={22}
            color="#F97316"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: 34,
          paddingTop: 8,
        }}>
        {data.map((item) => (
          <FeaturedBusinessCard
            key={`${item.category}-${item.title}`}
            item={item}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
