import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type SanghaPerson = {
  badge: string;
  image: string;
  meta: string;
  name: string;
  subtitle: string;
};

const nearPeople: SanghaPerson[] = [
  {
    badge: '3 Mutual Connections',
    image:
      'https://randomuser.me/api/portraits/women/44.jpg',
    meta: 'Andheri West · 1.1 km',
    name: 'Priya Sharma',
    subtitle: 'Shirdi Sai Devotee',
  },
  {
    badge: 'Nearby',
    image:
      'https://randomuser.me/api/portraits/men/32.jpg',
    meta: 'Versova · 1.2 km',
    name: 'Rahul Verma',
    subtitle: 'Iskcon Tradition',
  },
  {
    badge: 'Seva Group',
    image:
      'https://randomuser.me/api/portraits/women/21.jpg',
    meta: 'Juhu · 2.4 km',
    name: 'Kavita Rao',
    subtitle: 'Sai Seva Volunteer',
  },
  {
    badge: 'Bhajan Circle',
    image:
      'https://randomuser.me/api/portraits/men/64.jpg',
    meta: 'Bandra · 3.8 km',
    name: 'Amit Deshmukh',
    subtitle: 'Bhajan Singer',
  },
];

const suggestedPeople: SanghaPerson[] = [
  {
    badge: 'Based on your tradition',
    image:
      'https://randomuser.me/api/portraits/women/68.jpg',
    meta: 'Art of Living · Bangalore',
    name: 'Ananya Desai',
    subtitle: 'Meditation and seva',
  },
  {
    badge: 'Based on your city',
    image:
      'https://randomuser.me/api/portraits/men/75.jpg',
    meta: 'Vipassana · Pune',
    name: 'Vikram Singh',
    subtitle: 'Weekly satsang host',
  },
  {
    badge: 'Shared interests',
    image:
      'https://randomuser.me/api/portraits/women/52.jpg',
    meta: 'Sai Literature · Delhi',
    name: 'Meera Iyer',
    subtitle: 'Reads and shares Sai texts',
  },
  {
    badge: 'Community match',
    image:
      'https://randomuser.me/api/portraits/men/18.jpg',
    meta: 'Online Global',
    name: 'Nikhil Shah',
    subtitle: 'Digital seva volunteer',
  },
];

function PersonCard({
  item,
}: {
  item: SanghaPerson;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/sangha-profile')}
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#F1F1F1',
        borderRadius: 28,
        borderWidth: 1,
        elevation: 2,
        marginBottom: 18,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Image
          source={{
            uri: item.image,
          }}
          style={{
            borderRadius: 34,
            height: 68,
            width: 68,
          }}
        />

        <View
          style={{
            flex: 1,
            marginLeft: 16,
          }}>
          <Text
            style={{
              color: '#111827',
              fontSize: 19,
              fontWeight: '900',
            }}>
            {item.name}
          </Text>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 14,
              fontWeight: '700',
              marginTop: 4,
            }}>
            {item.subtitle}
          </Text>
          <Text
            style={{
              color: '#9CA3AF',
              fontSize: 13,
              fontWeight: '600',
              marginTop: 4,
            }}>
            {item.meta}
          </Text>
        </View>
      </View>

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 16,
        }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#FFF7ED',
            borderRadius: 14,
            flexDirection: 'row',
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}>
          <Ionicons
            name="sparkles"
            size={14}
            color="#F97316"
          />
          <Text
            style={{
              color: '#F97316',
              fontSize: 12,
              fontWeight: '800',
              marginLeft: 6,
            }}>
            {item.badge}
          </Text>
        </View>

        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#111111',
            borderRadius: 17,
            height: 34,
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: '900',
            }}>
            View
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SanghaListScreen() {
  const { type } =
    useLocalSearchParams<{
      type?: string;
    }>();

  const isSuggested = type === 'suggested';
  const data = isSuggested
    ? suggestedPeople
    : nearPeople;
  const title = isSuggested
    ? 'Suggested For You'
    : 'Near You';

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

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 14,
        }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={{
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 22,
            elevation: 2,
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}>
          <Ionicons
            name="arrow-back"
            size={22}
            color="#111827"
          />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            marginLeft: 14,
          }}>
          <Text
            style={{
              color: '#111827',
              fontSize: 23,
              fontWeight: '900',
            }}>
            {title}
          </Text>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 13,
              fontWeight: '700',
              marginTop: 2,
            }}>
            {data.length} devotees found
          </Text>
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
          <PersonCard
            key={item.name}
            item={item}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
