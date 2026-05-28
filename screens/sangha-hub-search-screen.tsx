import React, {useState} from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const searches = [
  'Mumbai Youth Seva',
  'Thursday Bhajan',
  'City Chapter',
  'Online Global',
];

const groups = [
  {
    meta: '142 members · Active today',
    title: 'Mumbai Youth Seva',
    type: 'Seva',
  },
  {
    meta: '86 members · Thursdays',
    title: 'Pune Sai Bhajan Circle',
    type: 'Bhajan',
  },
  {
    meta: '320 members · Public',
    title: 'Online Global Satsang',
    type: 'Online',
  },
];

export default function SanghaHubSearchScreen() {
  const [query, setQuery] = useState('');

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
          paddingHorizontal: 18,
          paddingTop: 16,
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
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderColor: '#F0F0F0',
            borderRadius: 24,
            borderWidth: 1,
            flex: 1,
            flexDirection: 'row',
            height: 48,
            marginLeft: 12,
            paddingHorizontal: 15,
          }}>
          <Ionicons
            name="search"
            size={19}
            color="#9CA3AF"
          />
          <TextInput
            autoFocus
            onChangeText={setQuery}
            placeholder="Search sangha groups..."
            placeholderTextColor="#9CA3AF"
            style={{
              color: '#111827',
              flex: 1,
              fontSize: 15,
              fontWeight: '600',
              marginLeft: 10,
            }}
            value={query}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: 32,
        }}>
        <Text
          style={{
            color: '#1F2937',
            fontFamily: 'serif',
            fontSize: 22,
            fontWeight: '800',
            marginTop: 8,
          }}>
          Recent Searches
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 14,
          }}>
          {searches.map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              onPress={() => setQuery(item)}
              style={{
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                flexDirection: 'row',
                paddingHorizontal: 13,
                paddingVertical: 9,
              }}>
              <Ionicons
                name="time"
                size={14}
                color="#F97316"
              />
              <Text
                style={{
                  color: '#4B5563',
                  fontSize: 13,
                  fontWeight: '700',
                  marginLeft: 7,
                }}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text
          style={{
            color: '#1F2937',
            fontFamily: 'serif',
            fontSize: 22,
            fontWeight: '800',
            marginTop: 30,
          }}>
          Suggested Groups
        </Text>

        {groups.map((item) => (
          <TouchableOpacity
            key={item.title}
            activeOpacity={0.9}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              marginTop: 14,
              padding: 16,
            }}>
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#FFF3D6',
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 12,
                  fontWeight: '900',
                }}>
                {item.type}
              </Text>
            </View>
            <Text
              style={{
                color: '#1F2937',
                fontSize: 18,
                fontWeight: '900',
                marginTop: 10,
              }}>
              {item.title}
            </Text>
            <Text
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontWeight: '600',
                marginTop: 5,
              }}>
              {item.meta}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
