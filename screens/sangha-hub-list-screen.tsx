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

import {
  acceptSanghaInvitationRequest,
  declineSanghaInvitationRequest,
  fetchSanghaGroupsRequest,
  fetchSanghaInvitationsRequest,
} from '@/store/sangha/actions';
import {
  selectIsSanghaActionPending,
  selectSanghaError,
  selectSanghaGroupsList,
  selectSanghaGroupsListLoading,
  selectSanghaGroupsListPagination,
  selectSanghaUserInvitations,
  selectSanghaUserInvitationsLoading,
  selectSanghaUserInvitationsPagination,
} from '@/store/sangha/selectors';
import {
  SanghaGroupSummary,
  SanghaInvitation,
} from '@/store/sangha/types';
import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

function avatarForInvitation(item: SanghaInvitation) {
  const invitedBy = item.invitedBy;
  const name = invitedBy?.name || 'Sai Family';

  return (
    invitedBy?.avatarUrl ||
    invitedBy?.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=FFF7ED&color=F97316`
  );
}

function bannerForGroup(item: SanghaGroupSummary) {
  return (
    item.bannerUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      item.name
    )}&background=FFF7ED&color=F97316&size=256`
  );
}

function normalizePurpose(value?: string) {
  return (value || 'all').toLowerCase().replace(/\s+/g, '_');
}

function groupMeta(item: SanghaGroupSummary) {
  return [
    item.privacy,
    `${item.memberCount || 0} members`,
    item.city || item.state,
  ]
    .filter(Boolean)
    .join(' · ');
}

function InvitationCard({
  item,
}: {
  item: SanghaInvitation;
}) {
  const dispatch = useAppDispatch();
  const pending = useAppSelector((state) =>
    selectIsSanghaActionPending(state, item.id)
  );
  const group = item.group;

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
          source={{uri: avatarForInvitation(item)}}
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
              {item.invitedBy?.name || 'Sai Family'}
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
            {group?.name || 'Sangha Group'}
          </Text>
          <Text
            style={{
              color: '#9CA3AF',
              fontSize: 13,
              fontWeight: '600',
              marginTop: 7,
            }}>
            {group?.memberCount || 0} members
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
          disabled={pending}
          onPress={() =>
            dispatch(acceptSanghaInvitationRequest(item.id))
          }
          style={{
            alignItems: 'center',
            backgroundColor: '#F97316',
            borderRadius: 16,
            flex: 1,
            height: 46,
            justifyContent: 'center',
          }}>
          {pending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: '900',
              }}>
              Accept
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.88}
          disabled={pending}
          onPress={() =>
            dispatch(declineSanghaInvitationRequest(item.id))
          }
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
  item: SanghaGroupSummary;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: '/group-details',
          params: { id: item.id },
        })
      }
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
            source={{uri: bannerForGroup(item)}}
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
                color: '#F97316',
                fontSize: 10,
                fontWeight: '900',
              }}>
              {(item.purpose || 'SANGHA').toUpperCase()}
            </Text>
          </View>
          <Text
            style={{
              color: '#1F2937',
              fontSize: 18,
              fontWeight: '900',
              marginTop: 8,
            }}>
            {item.name}
          </Text>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 13,
              fontWeight: '600',
              marginTop: 6,
            }}>
            {groupMeta(item)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SanghaHubListScreen() {
  const dispatch = useAppDispatch();
  const {type, purpose} =
    useLocalSearchParams<{
      purpose?: string;
      type?: string;
    }>();
  const invitations = useAppSelector(
    selectSanghaUserInvitations
  );
  const invitationsLoading = useAppSelector(
    selectSanghaUserInvitationsLoading
  );
  const invitationsPagination = useAppSelector(
    selectSanghaUserInvitationsPagination
  );
  const groups = useAppSelector(selectSanghaGroupsList);
  const groupsLoading = useAppSelector(
    selectSanghaGroupsListLoading
  );
  const groupsPagination = useAppSelector(
    selectSanghaGroupsListPagination
  );
  const error = useAppSelector(selectSanghaError);
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
  const groupsParams = useMemo(
    () => ({
      limit: 20,
      offset: 0,
      privacy: 'any',
      purpose: purposeName
        ? normalizePurpose(purposeName)
        : 'all',
      type:
        listType === 'groups'
          ? 'mine'
          : purposeName
            ? 'purpose'
            : 'recommended',
    }),
    [listType, purposeName]
  );
  const invitationsParams = useMemo(
    () => ({
      limit: 20,
      offset: 0,
      status: 'pending',
    }),
    []
  );
  const loading = isPending
    ? invitationsLoading
    : groupsLoading;
  const itemCount = isPending
    ? invitations.length
    : groups.length;

  useEffect(() => {
    if (isPending) {
      dispatch(
        fetchSanghaInvitationsRequest(invitationsParams)
      );
      return;
    }

    dispatch(fetchSanghaGroupsRequest(groupsParams));
  }, [
    dispatch,
    groupsParams,
    invitationsParams,
    isPending,
  ]);

  const refresh = () => {
    if (isPending) {
      dispatch(
        fetchSanghaInvitationsRequest(invitationsParams)
      );
      return;
    }

    dispatch(fetchSanghaGroupsRequest(groupsParams));
  };

  const loadMore = () => {
    if (loading) {
      return;
    }

    if (isPending && invitationsPagination?.hasMore) {
      dispatch(
        fetchSanghaInvitationsRequest({
          ...invitationsParams,
          offset:
            invitationsPagination.nextOffset ??
            invitationsPagination.offset +
              invitationsPagination.limit,
        })
      );
      return;
    }

    if (!isPending && groupsPagination?.hasMore) {
      dispatch(
        fetchSanghaGroupsRequest({
          ...groupsParams,
          offset:
            groupsPagination.nextOffset ??
            groupsPagination.offset +
              groupsPagination.limit,
        })
      );
    }
  };

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
            {itemCount} items
          </Text>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && itemCount > 0}
            onRefresh={refresh}
            tintColor="#F97316"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: 34,
          paddingTop: 8,
        }}>
        {loading && itemCount === 0 ? (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 28,
              padding: 24,
            }}>
            <ActivityIndicator color="#F97316" />
            <Text
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontWeight: '800',
                marginTop: 12,
              }}>
              Loading Sangha data
            </Text>
          </View>
        ) : null}

        {!loading && error ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={refresh}
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
          </TouchableOpacity>
        ) : null}

        {!loading && itemCount === 0 && !error ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 28,
              padding: 20,
            }}>
            <Text
              style={{
                color: '#1F2937',
                fontSize: 17,
                fontWeight: '900',
              }}>
              Nothing here yet
            </Text>
            <Text
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontWeight: '600',
                lineHeight: 22,
                marginTop: 8,
              }}>
              {isPending
                ? 'Pending group invitations will appear here.'
                : 'Matching Sangha groups will appear here.'}
            </Text>
          </View>
        ) : null}

        {isPending
          ? invitations.map((item) => (
              <InvitationCard
                key={item.id}
                item={item}
              />
            ))
          : groups.map((item) => (
              <GroupCard
                key={item.id}
                item={item}
              />
            ))}

        {(isPending
          ? invitationsPagination?.hasMore
          : groupsPagination?.hasMore) ? (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={loading}
            onPress={loadMore}
            style={{
              alignItems: 'center',
              backgroundColor: '#1F2937',
              borderRadius: 18,
              height: 50,
              justifyContent: 'center',
              marginTop: 4,
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
