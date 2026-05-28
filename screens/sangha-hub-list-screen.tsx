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

const invitations = [
  {
    by: 'Rahul M.',
    image:
      'https://randomuser.me/api/portraits/men/32.jpg',
    meta: '142 members · Invited 2d ago',
    title: 'Mumbai Youth Seva',
  },
  {
    by: 'Ananya D.',
    image:
      'https://randomuser.me/api/portraits/women/68.jpg',
    meta: '86 members · Invited today',
    title: 'Thursday Bhajan Circle',
  },
];

const groups = [
  {
    badge: 'SEVA',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200',
    meta: 'Active 2h ago · 142 members',
    title: 'Andheri Weekend Food Drive',
  },
  {
    badge: 'BHAJAN',
    image:
      'https://images.unsplash.com/photo-1609604161777-0c39f681a0ed?q=80&w=1200',
    meta: 'Next meet Thursday · 86 members',
    title: 'Pune Sai Bhajan Circle',
  },
  {
    badge: 'ONLINE',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200',
    meta: 'Daily 8 PM · 320 members',
    title: 'Online Global Satsang',
  },
];

function InvitationCard({
  item,
}: {
  item: (typeof invitations)[number];
}) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#F6EFD9',
        borderRadius: 28,
        borderWidth: 1,
        marginBottom: 16,
        padding: 18,
      }}>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <Image
          source={{uri: item.image}}
          style={{
            borderRadius: 29,
            height: 58,
            width: 58,
          }}
        />
        <View
          style={{
            flex: 1,
            marginLeft: 14,
          }}>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 15,
              fontWeight: '600',
            }}>
            <Text
              style={{
                color: '#1F2937',
                fontWeight: '900',
              }}>
              {item.by}
            </Text>{' '}
            invited you to
          </Text>
          <Text
            style={{
              color: '#1F2937',
              fontSize: 18,
              fontWeight: '900',
              marginTop: 3,
            }}>
            {item.title}
          </Text>
          <Text
            style={{
              color: '#9CA3AF',
              fontSize: 13,
              fontWeight: '600',
              marginTop: 7,
            }}>
            {item.meta}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          marginTop: 18,
        }}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={{
            alignItems: 'center',
            backgroundColor: '#F59E0B',
            borderRadius: 16,
            flex: 1,
            height: 46,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: '900',
            }}>
            Accept
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.88}
          style={{
            alignItems: 'center',
            backgroundColor: '#F8F8F8',
            borderColor: '#ECECEC',
            borderRadius: 16,
            borderWidth: 1,
            flex: 1,
            height: 46,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 15,
              fontWeight: '800',
            }}>
            Decline
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function GroupCard({
  item,
}: {
  item: (typeof groups)[number];
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        marginBottom: 16,
        padding: 16,
      }}>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <View
          style={{
            borderRadius: 22,
            height: 86,
            overflow: 'hidden',
            width: 86,
          }}>
          <Image
            source={{uri: item.image}}
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        </View>
        <View
          style={{
            flex: 1,
            marginLeft: 16,
          }}>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#FFF3D6',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}>
            <Text
              style={{
                color: '#F59E0B',
                fontSize: 10,
                fontWeight: '900',
              }}>
              {item.badge}
            </Text>
          </View>
          <Text
            style={{
              color: '#1F2937',
              fontSize: 18,
              fontWeight: '900',
              marginTop: 8,
            }}>
            {item.title}
          </Text>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 13,
              fontWeight: '600',
              marginTop: 6,
            }}>
            {item.meta}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SanghaHubListScreen() {
  const {type, purpose} =
    useLocalSearchParams<{
      purpose?: string;
      type?: string;
    }>();
  const listType = Array.isArray(type)
    ? type[0]
    : type;
  const purposeName = Array.isArray(purpose)
    ? purpose[0]
    : purpose;
  const isPending = listType === 'pending';
  const title = isPending
    ? 'Pending Invitations'
    : purposeName
      ? `${purposeName} Groups`
      : 'My Groups';

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#FAFAF9',
      }}>
      <StatusBar
        backgroundColor="#FAFAF9"
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
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}>
          <Ionicons
            name="arrow-back"
            size={22}
            color="#1F2937"
          />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            marginLeft: 14,
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: '#1F2937',
              fontFamily: 'serif',
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
            {isPending ? invitations.length : groups.length} items
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
        {isPending
          ? invitations.map((item) => (
              <InvitationCard
                key={item.title}
                item={item}
              />
            ))
          : groups.map((item) => (
              <GroupCard
                key={item.title}
                item={item}
              />
            ))}
      </ScrollView>
    </SafeAreaView>
  );
}
