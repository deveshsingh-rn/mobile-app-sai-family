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
import { SanghaScreenHeader } from '@/components/sangha/SanghaScreenHeader';
import { SanghaStateView } from '@/components/sangha/SanghaStateView';
import { SanghaColors, SanghaRadius } from '@/constants/sangha-theme';

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
  focused,
  item,
}: {
  focused?: boolean;
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
        borderColor: focused ? '#F97316' : '#F6EFD9',
        borderRadius: 28,
        borderWidth: focused ? 2 : 1,
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
      {focused ? (
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: '#FFF4E8',
            borderRadius: 10,
            marginTop: 14,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}>
          <Text
            style={{
              color: '#9A3412',
              fontSize: 12,
              fontWeight: '900',
            }}>
            Opened from notification
          </Text>
        </View>
      ) : null}
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
  const {invitationId, type, purpose} =
    useLocalSearchParams<{
      invitationId?: string;
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
  const focusedInvitationId = Array.isArray(invitationId)
    ? invitationId[0]
    : invitationId;
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
  const displayedInvitations = useMemo(() => {
    if (!focusedInvitationId) {
      return invitations;
    }

    return [...invitations].sort((left, right) => {
      if (left.id === focusedInvitationId) return -1;
      if (right.id === focusedInvitationId) return 1;
      return 0;
    });
  }, [focusedInvitationId, invitations]);

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
        backgroundColor: SanghaColors.background,
      }}>
      <StatusBar
        backgroundColor={SanghaColors.background}
        barStyle="dark-content"
      />
      <SanghaScreenHeader
        onBack={() => router.back()}
        subtitle={`${itemCount} ${isPending ? 'invitations' : 'groups'}`}
        title={title}
      />
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
          <SanghaStateView loading title="Loading Sangha data" />
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
          <SanghaStateView
            body={isPending ? 'Pending group invitations will appear here.' : 'Matching Sangha groups will appear here.'}
            icon={isPending ? 'mail-unread-outline' : 'people-outline'}
            title="Nothing here yet"
          />
        ) : null}

        {isPending
          ? displayedInvitations.map((item) => (
              <InvitationCard
                focused={item.id === focusedInvitationId}
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
              backgroundColor: SanghaColors.maroon,
              borderRadius: SanghaRadius.control,
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
