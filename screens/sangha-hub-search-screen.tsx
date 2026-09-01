import React, {
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
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

import {
  addSanghaRecentSearchRequest,
  clearSanghaRecentSearchesRequest,
  fetchSanghaRecentSearchesRequest,
  searchSanghaGroupsRequest,
} from '@/store/sangha/actions';
import {
  selectSanghaError,
  selectSanghaRecentSearches,
  selectSanghaRecentSearchesLoading,
  selectSanghaSearchGroups,
  selectSanghaSearchGroupsLoading,
} from '@/store/sangha/selectors';
import { SanghaGroupSummary } from '@/store/sangha/types';
import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';
import { SanghaColors, SanghaRadius, SanghaShadow, SanghaType } from '@/constants/sangha-theme';

function groupMeta(group: SanghaGroupSummary) {
  return [
    `${group.memberCount || 0} members`,
    group.privacy || group.city || group.state,
  ]
    .filter(Boolean)
    .join(' · ');
}

export default function SanghaHubSearchScreen() {
  const dispatch = useAppDispatch();
  const recentSearches = useAppSelector(
    selectSanghaRecentSearches
  );
  const recentLoading = useAppSelector(
    selectSanghaRecentSearchesLoading
  );
  const groups = useAppSelector(selectSanghaSearchGroups);
  const groupsLoading = useAppSelector(
    selectSanghaSearchGroupsLoading
  );
  const error = useAppSelector(selectSanghaError);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchSanghaRecentSearchesRequest({ limit: 10 }));
    dispatch(
      searchSanghaGroupsRequest({
        limit: 20,
        offset: 0,
        q: '',
      })
    );
  }, [dispatch]);

  useEffect(() => {
    const handle = setTimeout(() => {
      dispatch(
        searchSanghaGroupsRequest({
          limit: 20,
          offset: 0,
          q: query.trim(),
        })
      );
    }, 350);

    return () => clearTimeout(handle);
  }, [dispatch, query]);

  const openGroup = (group: SanghaGroupSummary) => {
    if (query.trim()) {
      dispatch(
        addSanghaRecentSearchRequest({
          query: query.trim(),
        })
      );
    }

    router.push({
      pathname: '/group-details',
      params: { id: group.id },
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: SanghaColors.background,
      }}>
      <StatusBar
        backgroundColor={SanghaColors.background}
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
            backgroundColor: SanghaColors.surface,
            borderColor: SanghaColors.border,
            borderRadius: SanghaRadius.control,
            borderWidth: 1,
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={SanghaColors.ink}
          />
        </TouchableOpacity>

        <View
          style={{
            alignItems: 'center',
            backgroundColor: SanghaColors.surface,
            borderColor: SanghaColors.border,
            borderRadius: SanghaRadius.control,
            borderWidth: 1,
            flex: 1,
            flexDirection: 'row',
            height: 48,
            marginLeft: 12,
            paddingHorizontal: 15,
            ...SanghaShadow,
          }}>
          <Ionicons
            name="search"
            size={19}
            color={SanghaColors.inkTertiary}
          />
          <TextInput
            autoFocus
            onChangeText={setQuery}
            placeholder="Search sangha groups..."
            placeholderTextColor={SanghaColors.inkTertiary}
            style={{
              color: SanghaColors.ink,
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
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
          }}>
          <Text
            style={{
              color: SanghaColors.ink,
              ...SanghaType.sectionTitle,
            }}>
            Recent Searches
          </Text>
          {recentSearches.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                dispatch(clearSanghaRecentSearchesRequest())
              }>
              <Text
                style={{
                  color: SanghaColors.saffron,
                  fontSize: 13,
                  fontWeight: '900',
                }}>
                Clear
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 14,
          }}>
          {recentLoading ? (
            <ActivityIndicator color={SanghaColors.saffron} />
          ) : null}

          {!recentLoading && recentSearches.length === 0 ? (
            <Text
              style={{
                color: SanghaColors.inkTertiary,
                fontSize: 14,
                fontWeight: '700',
              }}>
              Your Sangha searches will appear here.
            </Text>
          ) : null}

          {recentSearches.map((item) => (
            <TouchableOpacity
              key={item.id || item.query}
              activeOpacity={0.85}
              onPress={() => setQuery(item.query)}
              style={{
                alignItems: 'center',
                backgroundColor: SanghaColors.surface,
                borderColor: SanghaColors.border,
                borderRadius: SanghaRadius.control,
                borderWidth: 1,
                flexDirection: 'row',
                paddingHorizontal: 13,
                paddingVertical: 9,
              }}>
              <Ionicons
                name="time"
                size={14}
                color={SanghaColors.saffron}
              />
              <Text
                style={{
                  color: SanghaColors.inkSecondary,
                  fontSize: 13,
                  fontWeight: '700',
                  marginLeft: 7,
                }}>
                {item.query}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text
          style={{
            color: SanghaColors.ink,
            ...SanghaType.sectionTitle,
            marginTop: 30,
          }}>
          {query.trim() ? 'Search Results' : 'Suggested Groups'}
        </Text>

        {groupsLoading ? (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              marginTop: 14,
              padding: 22,
            }}>
            <ActivityIndicator color="#F97316" />
            <Text
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontWeight: '800',
                marginTop: 10,
              }}>
              Searching groups
            </Text>
          </View>
        ) : null}

        {!groupsLoading && error ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              dispatch(
                searchSanghaGroupsRequest({
                  limit: 20,
                  offset: 0,
                  q: query.trim(),
                })
              )
            }
            style={{
              backgroundColor: '#FFF7ED',
              borderColor: '#FDE7CF',
              borderRadius: 22,
              borderWidth: 1,
              marginTop: 14,
              padding: 16,
            }}>
            <Text
              style={{
                color: '#9A3412',
                fontSize: 14,
                fontWeight: '900',
              }}>
              {error}
            </Text>
          </TouchableOpacity>
        ) : null}

        {!groupsLoading && groups.length === 0 && !error ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              marginTop: 14,
              padding: 18,
            }}>
            <Text
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontWeight: '700',
                lineHeight: 22,
              }}>
              No groups found for this search.
            </Text>
          </View>
        ) : null}

        {groups.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            onPress={() => openGroup(item)}
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
                {(item.purpose || 'Sangha').toUpperCase()}
              </Text>
            </View>
            <Text
              style={{
                color: '#1F2937',
                fontSize: 18,
                fontWeight: '900',
                marginTop: 10,
              }}>
              {item.name}
            </Text>
            <Text
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontWeight: '600',
                marginTop: 5,
              }}>
              {groupMeta(item)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
