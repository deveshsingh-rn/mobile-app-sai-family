import React, {
  useEffect,
  useMemo,
} from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
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

import { fetchSanghaDevoteesRequest } from '@/store/sangha/actions';
import {
  selectSanghaDevotees,
  selectSanghaDevoteesLoading,
  selectSanghaDevoteesPagination,
  selectSanghaError,
} from '@/store/sangha/selectors';
import { SanghaDevoteeSummary } from '@/store/sangha/types';
import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';
import { SanghaScreenHeader } from '@/components/sangha/SanghaScreenHeader';
import { SanghaStateView } from '@/components/sangha/SanghaStateView';
import { SanghaColors, SanghaRadius, SanghaShadow } from '@/constants/sangha-theme';

function getAvatarUri(item: SanghaDevoteeSummary) {
  return (
    item.avatarUrl ||
    item.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      item.name || 'Sai Family'
    )}&background=FFF7ED&color=F97316`
  );
}

function getSubtitle(item: SanghaDevoteeSummary) {
  return (
    item.tradition ||
    item.bio ||
    'Sai Family Devotee'
  );
}

function getMeta(item: SanghaDevoteeSummary) {
  return [
    item.approximateLocationLabel || item.city,
    item.distanceLabel ||
      (typeof item.distanceKm === 'number'
        ? `${item.distanceKm.toFixed(1)} km`
        : null),
  ]
    .filter(Boolean)
    .join(' · ');
}

function getBadge(item: SanghaDevoteeSummary) {
  if (item.mutualConnectionCount) {
    return `${item.mutualConnectionCount} Mutual Connections`;
  }

  return (
    item.recommendationReason ||
    item.purposeTags?.[0] ||
    item.connectionStatus ||
    'Sangha match'
  );
}

function PersonCard({
  item,
}: {
  item: SanghaDevoteeSummary;
}) {
  const id = item.userId || item.id;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        if (id) {
          router.push({
            pathname: '/sangha-profile',
            params: { id },
          });
        }
      }}
      style={{
        backgroundColor: SanghaColors.surface,
        borderColor: SanghaColors.border,
        borderRadius: SanghaRadius.card,
        borderWidth: 1,
        marginBottom: 12,
        padding: 16,
        ...SanghaShadow,
      }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Image
          source={{
            uri: getAvatarUri(item),
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
              color: SanghaColors.ink,
              fontSize: 17,
              fontWeight: '800',
            }}>
            {item.name}
          </Text>
          <Text
            style={{
              color: SanghaColors.inkSecondary,
              fontSize: 14,
              fontWeight: '700',
              marginTop: 4,
            }}>
            {getSubtitle(item)}
          </Text>
          <Text
            style={{
              color: SanghaColors.inkTertiary,
              fontSize: 13,
              fontWeight: '600',
              marginTop: 4,
            }}>
            {getMeta(item)}
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
            backgroundColor: SanghaColors.saffronSoft,
            borderRadius: 14,
            flexDirection: 'row',
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}>
          <Ionicons
            name="sparkles"
            size={14}
            color={SanghaColors.saffron}
          />
          <Text
            style={{
              color: SanghaColors.saffron,
              fontSize: 12,
              fontWeight: '800',
              marginLeft: 6,
            }}>
            {getBadge(item)}
          </Text>
        </View>

        <View
          style={{
            alignItems: 'center',
            backgroundColor: SanghaColors.maroon,
            borderRadius: SanghaRadius.control,
            height: 38,
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
  const {
    distance,
    purpose,
    tradition,
    type,
  } =
    useLocalSearchParams<{
      distance?: string;
      purpose?: string;
      tradition?: string;
      type?: string;
    }>();
  const dispatch = useAppDispatch();
  const devotees = useAppSelector(selectSanghaDevotees);
  const loading = useAppSelector(
    selectSanghaDevoteesLoading
  );
  const pagination = useAppSelector(
    selectSanghaDevoteesPagination
  );
  const error = useAppSelector(selectSanghaError);

  const isSuggested = type === 'suggested';
  const title = isSuggested
    ? 'Suggested For You'
    : 'Near You';
  const baseParams = useMemo(
    () => ({
      distance: distance || 'nearby',
      limit: 20,
      offset: 0,
      purpose: purpose || 'connect',
      tradition: tradition || undefined,
      type: isSuggested ? 'suggested' : 'near',
    }),
    [distance, isSuggested, purpose, tradition]
  );

  useEffect(() => {
    dispatch(fetchSanghaDevoteesRequest(baseParams));
  }, [baseParams, dispatch]);

  const refreshList = () => {
    dispatch(fetchSanghaDevoteesRequest(baseParams));
  };

  const loadMore = () => {
    if (loading || !pagination?.hasMore) {
      return;
    }

    dispatch(
      fetchSanghaDevoteesRequest({
        ...baseParams,
        offset:
          pagination.nextOffset ??
          pagination.offset + pagination.limit,
      })
    );
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

      <SanghaScreenHeader
        onBack={() => router.back()}
        subtitle={`${devotees.length} devotees found`}
        title={title}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && devotees.length > 0}
            onRefresh={refreshList}
            tintColor="#F97316"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: 34,
          paddingTop: 8,
        }}>
        {loading && devotees.length === 0 ? (
          <SanghaStateView loading title="Loading devotees" />
        ) : null}

        {!loading && error ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={refreshList}
            style={{
              backgroundColor: '#FFF7ED',
              borderColor: '#FDE7CF',
              borderRadius: 24,
              borderWidth: 1,
              marginBottom: 16,
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
            <Text
              style={{
                color: '#F97316',
                fontSize: 13,
                fontWeight: '900',
                marginTop: 8,
              }}>
              Tap to retry
            </Text>
          </TouchableOpacity>
        ) : null}

        {!loading && devotees.length === 0 && !error ? (
          <SanghaStateView
            body="Try changing filters from the Sangha discovery screen."
            icon="search-outline"
            title="No devotees found"
          />
        ) : null}

        {devotees.map((item) => (
          <PersonCard
            key={item.userId || item.id || item.name}
            item={item}
          />
        ))}

        {pagination?.hasMore ? (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={loading}
            onPress={loadMore}
            style={{
              alignItems: 'center',
              backgroundColor: SanghaColors.maroon,
              borderRadius: SanghaRadius.control,
              height: 50,
              justifyContent: 'center',
              marginTop: 2,
            }}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: '900',
                }}>
                Load more
              </Text>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
