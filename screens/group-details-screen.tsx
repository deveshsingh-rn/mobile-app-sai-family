import React, {useEffect, useState} from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Share,
  TextInput,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createSanghaGroupPostCommentRequest,
  createSanghaGroupPostRequest,
  approveSanghaGroupJoinRequestRequest,
  cancelSanghaGroupEventRsvpRequest,
  declineSanghaGroupJoinRequestRequest,
  fetchSanghaGroupFeedRequest,
  deleteSanghaGroupPostRequest,
  fetchSanghaGroupDetailRequest,
  fetchSanghaGroupEventsRequest,
  fetchSanghaDevoteesRequest,
  fetchSanghaGroupJoinRequestsRequest,
  fetchSanghaGroupMembershipRequest,
  fetchSanghaGroupMembersRequest,
  fetchSanghaGroupPostsRequest,
  fetchSanghaGroupPostCommentsRequest,
  joinSanghaGroupRequest,
  leaveSanghaGroupRequest,
  likeSanghaGroupPostRequest,
  inviteSanghaGroupMemberRequest,
  pinSanghaGroupPostRequest,
  removeSanghaGroupMemberRequest,
  rsvpSanghaGroupEventRequest,
  unlikeSanghaGroupPostRequest,
  unpinSanghaGroupPostRequest,
  updateSanghaGroupMemberRequest,
  updateSanghaGroupPostRequest,
} from "@/store/sangha/actions";
import {
  selectIsSanghaActionPending,
  selectSanghaDevotees,
  selectSanghaDevoteesLoading,
  selectSanghaError,
  selectSanghaGroupDetail,
  selectSanghaGroupDetailLoading,
  selectSanghaGroupEvents,
  selectSanghaGroupEventsLoading,
  selectSanghaGroupEventsPagination,
  selectSanghaGroupFeed,
  selectSanghaGroupFeedLoading,
  selectSanghaGroupFeedPagination,
  selectSanghaGroupJoinRequests,
  selectSanghaGroupJoinRequestsLoading,
  selectSanghaGroupJoinRequestsPagination,
  selectSanghaGroupMembers,
  selectSanghaGroupMembersLoading,
  selectSanghaGroupMembersPagination,
  selectSanghaGroupMembership,
  selectSanghaGroupPosts,
  selectSanghaGroupPostsLoading,
  selectSanghaGroupPostsPagination,
  selectSanghaGroupPostComments,
  selectSanghaGroupPostCommentsLoading,
} from "@/store/sangha/selectors";
import {
  SanghaGroupDetail,
  SanghaGroupEvent,
  SanghaGroupJoinRequest,
  SanghaGroupMember,
  SanghaGroupPost,
  SanghaPagination,
  SanghaDevoteeSummary,
} from "@/store/sangha/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";
import { SanghaStateView } from "@/components/sangha/SanghaStateView";
import { SanghaColors, SanghaRadius, SanghaShadow } from "@/constants/sangha-theme";

const tabs = ["Feed", "Members", "Events", "About"] as const;
type GroupTab = (typeof tabs)[number];

function imageForName(name?: string | null) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Sai Family"
  )}&background=FFF7ED&color=F97316`;
}

function groupBanner(group?: SanghaGroupDetail | null) {
  return (
    group?.bannerUrl ||
    imageForName(group?.name || "Sangha Group")
  );
}

function memberAvatar(member: SanghaGroupMember) {
  return (
    member.avatarUrl ||
    member.profileImageUrl ||
    imageForName(member.name)
  );
}

function postAuthorAvatar(post: SanghaGroupPost) {
  return post.authorAvatarUrl || imageForName(post.authorName);
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const group = useAppSelector(selectSanghaGroupDetail);
  const groupLoading = useAppSelector(
    selectSanghaGroupDetailLoading
  );
  const posts = useAppSelector(selectSanghaGroupPosts);
  const feed = useAppSelector(selectSanghaGroupFeed);
  const postsLoading = useAppSelector(
    selectSanghaGroupPostsLoading
  );
  const feedLoading = useAppSelector(
    selectSanghaGroupFeedLoading
  );
  const feedPagination = useAppSelector(selectSanghaGroupFeedPagination);
  const postsPagination = useAppSelector(selectSanghaGroupPostsPagination);
  const membership = useAppSelector(selectSanghaGroupMembership);
  const joinRequests = useAppSelector(selectSanghaGroupJoinRequests);
  const joinRequestsLoading = useAppSelector(selectSanghaGroupJoinRequestsLoading);
  const joinRequestsPagination = useAppSelector(selectSanghaGroupJoinRequestsPagination);
  const members = useAppSelector(selectSanghaGroupMembers);
  const membersLoading = useAppSelector(
    selectSanghaGroupMembersLoading
  );
  const membersPagination = useAppSelector(selectSanghaGroupMembersPagination);
  const events = useAppSelector(selectSanghaGroupEvents);
  const eventsLoading = useAppSelector(
    selectSanghaGroupEventsLoading
  );
  const eventsPagination = useAppSelector(selectSanghaGroupEventsPagination);
  const error = useAppSelector(selectSanghaError);
  const [activeTab, setActiveTab] = useState<GroupTab>("Feed");
  const groupId = id || group?.id || "";
  const groupActionPending = useAppSelector((state) =>
    selectIsSanghaActionPending(state, groupId)
  );
  const membershipStatus =
    membership?.membershipStatus || group?.membershipStatus;
  const isActiveMember =
    membershipStatus === "active" ||
    membershipStatus === "member" ||
    membershipStatus === "admin" ||
    membershipStatus === "moderator";
  const canPost =
    membership?.canPost ?? group?.canPost ?? isActiveMember;
  const canComment =
    membership?.canComment ?? canPost;
  const canCreateEvent =
    membership?.canCreateEvent ?? isActiveMember;
  const canManageGroup =
    membership?.canModerate ?? group?.canManage ?? false;
  const canInvite = membership?.canInvite ?? canManageGroup;

  useEffect(() => {
    if (!groupId) {
      return;
    }

    dispatch(fetchSanghaGroupDetailRequest(groupId));
    dispatch(fetchSanghaGroupMembershipRequest(groupId));
    dispatch(
      fetchSanghaGroupFeedRequest({
        groupId,
        limit: 20,
        offset: 0,
        pinnedFirst: true,
        types: "post,experience,event",
      })
    );
    dispatch(
      fetchSanghaGroupJoinRequestsRequest({
        groupId,
        limit: 20,
        offset: 0,
      })
    );
    dispatch(
      fetchSanghaGroupPostsRequest({
        groupId,
        limit: 20,
        offset: 0,
        pinnedFirst: true,
      })
    );
    dispatch(
      fetchSanghaGroupMembersRequest({
        groupId,
        limit: 20,
        offset: 0,
        role: "all",
        status: "active",
      })
    );
    dispatch(
      fetchSanghaGroupEventsRequest({
        groupId,
        limit: 20,
        offset: 0,
        status: "upcoming",
      })
    );
  }, [dispatch, groupId]);

  const renderTabContent = () => {
    if (activeTab === "Members") {
      return (
        <MembersSection
          canManageGroup={canManageGroup}
          canInvite={canInvite}
          groupId={groupId}
          loading={membersLoading}
          members={members}
          pagination={membersPagination}
        />
      );
    }

    if (activeTab === "Events") {
      return (
        <EventsSection
          events={events}
          canCreateEvent={canCreateEvent}
          groupId={groupId}
          loading={eventsLoading}
          pagination={eventsPagination}
        />
      );
    }

    if (activeTab === "About") {
      return <AboutSection group={group} />;
    }

    return (
      <FeedSection
        groupId={groupId}
        canComment={canComment}
        canManageGroup={canManageGroup}
        canPost={canPost}
        joinRequests={joinRequests}
        joinRequestsLoading={joinRequestsLoading}
        joinRequestsPagination={joinRequestsPagination}
        joinRequestCount={joinRequests.length || group?.joinRequestCount || 0}
        loading={feedLoading || postsLoading}
        posts={feed.length ? feed : posts}
        pagination={feed.length ? feedPagination : postsPagination}
        usingUnifiedFeed={feed.length > 0}
      />
    );
  };

  const handleJoinToggle = () => {
    if (!groupId || groupActionPending) {
      return;
    }

    if (isActiveMember) {
      dispatch(leaveSanghaGroupRequest(groupId));
      return;
    }

    if (membershipStatus === "pending") {
      return;
    }

    dispatch(joinSanghaGroupRequest(groupId));
  };

  const shareGroup = async () => {
    if (!groupId) return;

    const deepLink = `saifamily://group-details?id=${encodeURIComponent(groupId)}`;
    try {
      await Share.share({
        message: `Join ${group?.name || "our Sai Family Sangha"}\n\n${
          group?.description || "Connect, serve, and grow with Sai devotees."
        }\n\nOpen in Sai Family: ${deepLink}`,
        title: group?.name || "Sai Family Sangha",
        url: deepLink,
      });
    } catch {
      Alert.alert("Unable to share", "Please try sharing this Sangha again.");
    }
  };

  if (groupLoading && !group) {
    return (
      <SafeAreaView style={{ alignItems: "center", backgroundColor: SanghaColors.background, flex: 1, justifyContent: "center", padding: 22 }}>
        <SanghaStateView loading title="Loading group details" />
      </SafeAreaView>
    );
  }

  if (!groupLoading && !group && error) {
    return (
      <SafeAreaView style={{ backgroundColor: SanghaColors.background, flex: 1, padding: 22 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={{
            alignItems: "center",
            backgroundColor: SanghaColors.surface,
            borderColor: SanghaColors.border,
            borderRadius: SanghaRadius.control,
            borderWidth: 1,
            height: 44,
            justifyContent: "center",
            width: 44,
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#2B1308" />
        </TouchableOpacity>
        <View style={{ backgroundColor: SanghaColors.surface, borderColor: SanghaColors.border, borderRadius: SanghaRadius.card, borderWidth: 1, marginTop: 22, padding: 18, ...SanghaShadow }}>
          <Text style={{ color: "#111827", fontSize: 19, fontWeight: "900" }}>
            Group unavailable
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 14, fontWeight: "600", lineHeight: 22, marginTop: 8 }}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SanghaColors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="#2B1308" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        {/* HERO */}
        <View style={{ height: 320, backgroundColor: SanghaColors.maroon }}>
          <Image
            source={{
              uri: groupBanner(group),
            }}
            style={{ width: "100%", height: "100%", opacity: 0.72 }}
          />

          <View
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(60,25,5,0.34)",
            }}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.back()}
            style={{
              position: "absolute",
              left: 18,
              top: 18,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#2B1308" />
          </TouchableOpacity>

          {canManageGroup ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/sangha-edit-group",
                  params: { id: groupId },
                })
              }
              style={{
                position: "absolute",
                right: 18,
                top: 18,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.9)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="settings-outline" size={21} color="#2B1308" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            accessibilityLabel="Share Sangha"
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={shareGroup}
            style={{
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 22,
              height: 44,
              justifyContent: "center",
              position: "absolute",
              right: canManageGroup ? 70 : 18,
              top: 18,
              width: 44,
            }}
          >
            <Ionicons name="share-social-outline" size={21} color="#2B1308" />
          </TouchableOpacity>

          <View style={{ position: "absolute", left: 22, right: 22, bottom: 26 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#FFF3E0",
                  borderWidth: 1,
                  borderColor: "#FDBA74",
                  justifyContent: "center",
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: "#C2410C", fontSize: 13, fontWeight: "800" }}>
                  {(group?.purpose || "SANGHA").toUpperCase()}
                </Text>
              </View>

              <View
                style={{
                  marginLeft: 10,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "rgba(255,255,255,0.78)",
                  justifyContent: "center",
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: "#7C2D12", fontSize: 13, fontWeight: "800" }}>
                  {group?.memberCount || 0} MEMBERS
                </Text>
              </View>
            </View>

            <Text
              style={{
                marginTop: 14,
                fontSize: 27,
                lineHeight: 35,
                color: "#FFFFFF",
                fontWeight: "900",
                letterSpacing: -0.4,
              }}
            >
              {group?.name || "Sangha Group"}
            </Text>

            <Text
              numberOfLines={2}
              style={{
                marginTop: 14,
                fontSize: 16,
                lineHeight: 25,
                color: "rgba(255,255,255,0.86)",
                fontWeight: "500",
              }}
            >
              {group?.description ||
                group?.purposeText ||
                "A dedicated space for spiritual practice, seva, bhajan sharing, and community support."}
            </Text>

            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {members.slice(0, 3).map((member, index) => (
                  <Image
                    key={member.id || index}
                    source={{ uri: memberAvatar(member) }}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                      marginLeft: index === 0 ? 0 : -10,
                    }}
                  />
                ))}

                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "#475569",
                    borderWidth: 2,
                    borderColor: "#FFFFFF",
                    marginLeft: -10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>
                    +{Math.max((group?.memberCount || 0) - 3, 0)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={groupActionPending || membershipStatus === "pending"}
                onPress={handleJoinToggle}
                style={{
                  width: 88,
                  height: 48,
                  borderRadius: 24,
              backgroundColor: SanghaColors.saffron,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: SanghaColors.saffron,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                {groupActionPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>
                    {isActiveMember
                      ? "Leave"
                      : membershipStatus === "pending"
                        ? "Pending"
                        : "Join"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* TABS */}
        <View
          style={{
            height: 46,
            backgroundColor: SanghaColors.surface,
            borderBottomWidth: 1,
            borderBottomColor: SanghaColors.border,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {tabs.map((item) => {
            const isActive = activeTab === item;

            return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setActiveTab(item)}
              style={{
                flex: 1,
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                borderBottomWidth: isActive ? 3 : 0,
                borderBottomColor: SanghaColors.saffron,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: isActive ? SanghaColors.saffron : SanghaColors.inkSecondary,
                  fontWeight: isActive ? "800" : "600",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
            );
          })}
        </View>

        {/* CONTENT */}
        <View style={{ paddingHorizontal: 15, paddingTop: 24 }}>{renderTabContent()}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: SanghaColors.surface,
        borderColor: SanghaColors.border,
        borderRadius: SanghaRadius.card,
        borderWidth: 1,
        marginTop: 16,
        padding: 18,
      }}
    >
      <Text style={{ color: SanghaColors.inkSecondary, fontSize: 15, fontWeight: "700", lineHeight: 23 }}>
        {text}
      </Text>
    </View>
  );
}

function getNextOffset(pagination: SanghaPagination) {
  return pagination.nextOffset ?? pagination.offset + pagination.limit;
}

function PaginationButton({
  loading,
  onPress,
  pagination,
}: {
  loading: boolean;
  onPress: () => void;
  pagination: SanghaPagination | null;
}) {
  if (!pagination?.hasMore) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={loading}
      onPress={onPress}
      style={{
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#FFF7ED",
        borderColor: "#FED7AA",
        borderRadius: 18,
        borderWidth: 1,
        minWidth: 150,
        paddingHorizontal: 18,
        paddingVertical: 12,
        marginTop: 14,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#F97316" size="small" />
      ) : (
        <Text style={{ color: "#9A3412", fontSize: 14, fontWeight: "900" }}>
          Load more
        </Text>
      )}
    </TouchableOpacity>
  );
}

function FeedSection({
  canComment,
  canManageGroup,
  canPost,
  groupId,
  joinRequests,
  joinRequestsLoading,
  joinRequestsPagination,
  joinRequestCount,
  loading,
  posts,
  pagination,
  usingUnifiedFeed,
}: {
  canComment: boolean;
  canManageGroup: boolean;
  canPost: boolean;
  groupId: string;
  joinRequests: SanghaGroupJoinRequest[];
  joinRequestsLoading: boolean;
  joinRequestsPagination: SanghaPagination | null;
  joinRequestCount: number;
  loading: boolean;
  posts: SanghaGroupPost[];
  pagination: SanghaPagination | null;
  usingUnifiedFeed: boolean;
}) {
  const dispatch = useAppDispatch();
  const [content, setContent] = useState("");
  const pinned = posts.find((post) => post.isPinned);
  const regularPosts = posts.filter((post) => !post.isPinned);
  const submitPost = () => {
    const trimmed = content.trim();

    if (!trimmed || !groupId || !canPost) {
      return;
    }

    dispatch(
      createSanghaGroupPostRequest({
        content: trimmed,
        groupId,
        mediaUrls: [],
        type: "text",
      })
    );
    setContent("");
  };

  return (
    <>
      <View
        style={{
          borderRadius: 22,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#F1E8DA",
          padding: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: "#FFF7ED",
              borderRadius: 21,
              height: 42,
              justifyContent: "center",
              width: 42,
            }}
          >
            <Ionicons name="person" size={19} color="#F97316" />
          </View>
          <TextInput
            editable={canPost}
            onChangeText={setContent}
            onSubmitEditing={submitPost}
            placeholder={canPost ? "Share seva update or bhajan note" : "Join this community to post"}
            placeholderTextColor="#8B8177"
            style={{
              flex: 1,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#F8F6F2",
              marginLeft: 12,
              paddingHorizontal: 16,
              color: "#111827",
              fontSize: 15,
              fontWeight: "700",
            }}
            value={content}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!canPost}
            onPress={submitPost}
            style={{
              alignItems: "center",
              backgroundColor: canPost ? "#F97316" : "#D1D5DB",
              borderRadius: 18,
              height: 38,
              justifyContent: "center",
              marginLeft: 8,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "900" }}>Post</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          {[
            {
              icon: "image",
              label: "Photo",
              onPress: () =>
                router.push({
                  pathname: "/(tabs)/experiences/post",
                  params: { groupId, source: "sangha" },
                }),
            },
            {
              icon: "calendar",
              label: "Event",
              onPress: () =>
                router.push({
                  pathname: "/events/create",
                  params: { groupId, source: "sangha" },
                }),
            },
            {
              icon: "megaphone",
              label: "Notice",
              onPress: () => setContent((current) => current || "[Notice] "),
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.85}
              disabled={!canPost}
              onPress={item.onPress}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 15,
                backgroundColor: canPost ? "#FFF7ED" : "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={16} color={canPost ? "#F97316" : "#9CA3AF"} />
              <Text style={{ marginLeft: 6, color: canPost ? "#9A3412" : "#6B7280", fontSize: 13, fontWeight: "800" }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {canManageGroup ? (
        <MemberRequestCard
          groupId={groupId}
          joinRequests={joinRequests}
          loading={joinRequestsLoading}
          pagination={joinRequestsPagination}
          pendingCount={joinRequestCount}
        />
      ) : null}
      {loading ? (
        <EmptyCard text="Loading group posts..." />
      ) : null}
      {!loading && posts.length === 0 ? (
        <EmptyCard text="No posts have been shared in this group yet." />
      ) : null}
      {pinned ? <PinnedPostCard groupId={groupId} post={pinned} /> : null}
      {regularPosts.map((post) => (
        <CommunityPostCard
          key={post.id}
          canComment={canComment}
          groupId={groupId}
          post={post}
        />
      ))}
      <PaginationButton
        loading={loading}
        onPress={() => {
          if (!pagination?.hasMore) return;
          const offset = getNextOffset(pagination);

          dispatch(
            usingUnifiedFeed
              ? fetchSanghaGroupFeedRequest({
                  groupId,
                  limit: pagination.limit,
                  offset,
                  pinnedFirst: true,
                  types: "post,experience,event",
                })
              : fetchSanghaGroupPostsRequest({
                  groupId,
                  limit: pagination.limit,
                  offset,
                  pinnedFirst: true,
                })
          );
        }}
        pagination={pagination}
      />
    </>
  );
}

function MemberRequestCard({
  groupId,
  joinRequests,
  loading,
  pagination,
  pendingCount,
}: {
  groupId: string;
  joinRequests: SanghaGroupJoinRequest[];
  loading: boolean;
  pagination: SanghaPagination | null;
  pendingCount: number;
}) {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const visibleRequests = expanded ? joinRequests : joinRequests.slice(0, 3);

  return (
    <View>
      <View
        style={{
          borderRadius: 18,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#D6DEE8",
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          marginTop: 18,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "#FFF3E8",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="people" size={21} color="#F97316" />
        </View>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontSize: 16, color: "#111827", fontWeight: "900" }}>Member Requests</Text>
          <Text style={{ marginTop: 2, fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
            {pendingCount} pending approval{pendingCount === 1 ? "" : "s"}
          </Text>
        </View>
      </View>

      {visibleRequests.map((request) => {
        const requesterName =
          request.requester?.name || request.requesterId || "Sai Family";

        return (
          <View
            key={request.id}
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EEE7DD",
              borderRadius: 18,
              borderWidth: 1,
              marginTop: 10,
              padding: 14,
            }}
          >
            <Text style={{ color: "#111827", fontSize: 15, fontWeight: "900" }}>
              {requesterName}
            </Text>
            {request.note ? (
              <Text style={{ color: "#6B7280", fontSize: 13, fontWeight: "600", lineHeight: 20, marginTop: 4 }}>
                {request.note}
              </Text>
            ) : null}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  dispatch(
                    approveSanghaGroupJoinRequestRequest({
                      groupId,
                      requestId: request.id,
                    })
                  )
                }
                style={{
                  alignItems: "center",
                  backgroundColor: "#F97316",
                  borderRadius: 15,
                  flex: 1,
                  height: 38,
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "900" }}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  dispatch(
                    declineSanghaGroupJoinRequestRequest({
                      groupId,
                      requestId: request.id,
                    })
                  )
                }
                style={{
                  alignItems: "center",
                  backgroundColor: "#F3F4F6",
                  borderRadius: 15,
                  flex: 1,
                  height: 38,
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#111827", fontSize: 13, fontWeight: "900" }}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      {joinRequests.length > 3 && !expanded ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setExpanded(true)}
          style={{ alignItems: "center", marginTop: 12, paddingVertical: 10 }}
        >
          <Text style={{ color: "#F97316", fontSize: 13, fontWeight: "900" }}>
            Review all loaded requests
          </Text>
        </TouchableOpacity>
      ) : null}
      {expanded ? (
        <PaginationButton
          loading={loading}
          onPress={() => {
            if (!pagination?.hasMore) return;
            dispatch(
              fetchSanghaGroupJoinRequestsRequest({
                groupId,
                limit: pagination.limit,
                offset: getNextOffset(pagination),
              })
            );
          }}
          pagination={pagination}
        />
      ) : null}
    </View>
  );
}

function PinnedPostCard({
  groupId,
  post,
}: {
  groupId: string;
  post: SanghaGroupPost;
}) {
  return (
    <View
      style={{
        marginTop: 18,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#FDBA74",
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="pin" size={14} color="#F97316" />
        <Text style={{ marginLeft: 8, color: "#F97316", fontSize: 12, fontWeight: "900" }}>
          ADMIN PINNED
        </Text>
      </View>

      <PostAuthor
        image={postAuthorAvatar(post)}
        name={post.authorName || "Sai Family"}
        meta={`${post.authorRole || "Member"} · ${formatDate(post.createdAt)}`}
      />

      <Text style={postTextStyle}>
        {post.content || "Shared a group update."}
      </Text>

      <PostActions
        groupId={groupId}
        likes={`${post.likeCount || 0}`}
        comments={`${post.commentCount || 0}`}
        post={post}
      />
    </View>
  );
}

function CommunityPostCard({
  canComment,
  groupId,
  post,
}: {
  canComment: boolean;
  groupId: string;
  post: SanghaGroupPost;
}) {
  const dispatch = useAppDispatch();
  const comments = useAppSelector((state) =>
    selectSanghaGroupPostComments(state, post.id)
  );
  const commentsLoading = useAppSelector((state) =>
    selectSanghaGroupPostCommentsLoading(state, post.id)
  );
  const [comment, setComment] = useState("");
  const imageUrl =
    post.imageUrl ||
    post.mediaUrls?.find((url) => Boolean(url));
  const submitComment = () => {
    const trimmed = comment.trim();

    if (!trimmed || !canComment) {
      return;
    }

    dispatch(
      createSanghaGroupPostCommentRequest({
        content: trimmed,
        groupId,
        postId: post.id,
      })
    );
    setComment("");
  };

  return (
    <View
      style={{
        marginTop: 18,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        padding: 16,
      }}
    >
      <PostAuthor
        image={postAuthorAvatar(post)}
        name={post.authorName || "Sai Family"}
        meta={formatDate(post.createdAt)}
      />

      <Text style={postTextStyle}>
        {post.content || "Shared a group update."}
      </Text>

      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ marginTop: 14, width: "100%", height: 250, borderRadius: 16 }}
        />
      ) : null}

      <PostActions
        groupId={groupId}
        likes={`${post.likeCount || 0}`}
        comments={`${post.commentCount || 0}`}
        post={post}
      />

      {comments.length === 0 && post.commentCount ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            dispatch(
              fetchSanghaGroupPostCommentsRequest({
                groupId,
                limit: 20,
                offset: 0,
                postId: post.id,
              })
            )
          }
          style={{
            marginTop: 14,
          }}
        >
          <Text style={{ color: "#F97316", fontSize: 13, fontWeight: "900" }}>
            {commentsLoading ? "Loading comments..." : "View comments"}
          </Text>
        </TouchableOpacity>
      ) : null}

      {comments.map((item) => (
        <View
          key={item.id}
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 16,
            marginTop: 10,
            padding: 12,
          }}
        >
          <Text style={{ color: "#111827", fontSize: 13, fontWeight: "900" }}>
            {item.authorName || "Sai Family"}
          </Text>
          <Text style={{ color: "#4B5563", fontSize: 13, fontWeight: "600", lineHeight: 20, marginTop: 4 }}>
            {item.content}
          </Text>
        </View>
      ))}

      <View
        style={{
          marginTop: 18,
          height: 48,
          borderRadius: 24,
          backgroundColor: "#F9FAFB",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          paddingHorizontal: 18,
          justifyContent: "center",
        }}
      >
        <TextInput
          onChangeText={setComment}
          editable={canComment}
          onSubmitEditing={submitComment}
          placeholder={canComment ? "Write a comment..." : "Join to comment"}
          placeholderTextColor="#9CA3AF"
          style={{ fontSize: 15, color: "#111827" }}
          value={comment}
        />
      </View>
      {comment.trim() ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={submitComment}
          style={{
            alignItems: "center",
            alignSelf: "flex-end",
            backgroundColor: "#F97316",
            borderRadius: 16,
            height: 36,
            justifyContent: "center",
            marginTop: 8,
            paddingHorizontal: 14,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "900" }}>Send</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function MembersSection({
  canInvite,
  canManageGroup,
  groupId,
  loading,
  members,
  pagination,
}: {
  canInvite: boolean;
  canManageGroup: boolean;
  groupId: string;
  loading: boolean;
  members: SanghaGroupMember[];
  pagination: SanghaPagination | null;
}) {
  const dispatch = useAppDispatch();
  const devotees = useAppSelector(selectSanghaDevotees);
  const devoteesLoading = useAppSelector(selectSanghaDevoteesLoading);
  const pendingInviteIds = useAppSelector(
    (state) => state.sangha.actionPendingIds
  );
  const invitedGroupUserIds = useAppSelector(
    (state) => state.sangha.invitedGroupUserIds
  );
  const [query, setQuery] = useState("");
  const [inviteQuery, setInviteQuery] = useState("");
  const [inviteMessage, setInviteMessage] = useState("Join our Sai Family Sangha.");
  const [showInvite, setShowInvite] = useState(false);
  const trimmedQuery = query.trim().toLowerCase();
  const visibleMembers = trimmedQuery
    ? members.filter((member) =>
        [member.name, member.role, member.status]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(trimmedQuery))
      )
    : members;
  const memberUserIds = new Set(
    members.map((member) => member.userId || member.id)
  );
  const normalizedInviteQuery = inviteQuery.trim().toLowerCase();
  const inviteCandidates = devotees
    .filter((devotee) => !memberUserIds.has(devotee.userId))
    .filter((devotee) => {
      if (!normalizedInviteQuery) return true;
      return [
        devotee.name,
        devotee.memberId,
        devotee.city,
        devotee.state,
        devotee.approximateLocationLabel,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedInviteQuery));
    })
    .slice(0, 20);

  useEffect(() => {
    if (!showInvite || !canInvite) return;
    dispatch(
      fetchSanghaDevoteesRequest({
        distance: "online",
        limit: 50,
        offset: 0,
        type: "suggested",
      })
    );
  }, [canInvite, dispatch, showInvite]);

  const sendInvite = (devotee: SanghaDevoteeSummary) => {
    if (!devotee.userId || !canInvite) {
      return;
    }

    dispatch(
      inviteSanghaGroupMemberRequest({
        groupId,
        message: inviteMessage.trim() || undefined,
        userId: devotee.userId,
      })
    );
  };

  return (
    <>
      <View
        style={{
          borderRadius: 22,
          backgroundColor: "#FFFFFF",
          padding: 16,
          borderWidth: 1,
          borderColor: "#EEE7DD",
        }}
      >
        <View
          style={{
            height: 48,
            borderRadius: 24,
            backgroundColor: "#F8F6F2",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
          }}
        >
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            onChangeText={setQuery}
            placeholder="Search members"
            placeholderTextColor="#9CA3AF"
            style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#111827", fontWeight: "600" }}
            value={query}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          {canInvite ? (
            <ActionPill
              icon="person-add"
              label="Invite"
              onPress={() => setShowInvite((current) => !current)}
            />
          ) : null}
          <ActionPill icon="shield-checkmark" label="Admins" onPress={() => setQuery("admin")} />
          <ActionPill icon="funnel" label="Active" onPress={() => setQuery("active")} />
        </View>
        {showInvite && canInvite ? (
          <View
            style={{
              backgroundColor: SanghaColors.saffronSoft,
              borderColor: SanghaColors.saffronBorder,
              borderRadius: 18,
              borderWidth: 1,
              marginTop: 14,
              padding: 12,
            }}
          >
            <Text style={{ color: SanghaColors.ink, fontSize: 16, fontWeight: "900" }}>
              Invite a devotee
            </Text>
            <Text style={{ color: SanghaColors.inkTertiary, fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 4 }}>
              Search by name, member ID, city, or state. Private profiles stay hidden.
            </Text>
            <TextInput
              onChangeText={setInviteQuery}
              placeholder="Search devotees"
              placeholderTextColor="#9CA3AF"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                color: "#111827",
                fontSize: 15,
                fontWeight: "700",
                height: 48,
                marginTop: 12,
                paddingHorizontal: 12,
              }}
              value={inviteQuery}
            />
            <TextInput
              onChangeText={setInviteMessage}
              placeholder="Invite message"
              placeholderTextColor="#9CA3AF"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                color: "#111827",
                fontSize: 14,
                fontWeight: "700",
                height: 42,
                marginTop: 8,
                paddingHorizontal: 12,
              }}
              value={inviteMessage}
            />
            {devoteesLoading ? (
              <ActivityIndicator color={SanghaColors.saffron} style={{ marginVertical: 22 }} />
            ) : null}
            {!devoteesLoading && inviteCandidates.length === 0 ? (
              <Text style={{ color: SanghaColors.inkTertiary, fontSize: 13, fontWeight: "700", paddingVertical: 18, textAlign: "center" }}>
                No discoverable devotees match this search.
              </Text>
            ) : null}
            {inviteCandidates.map((devotee) => {
              const pending = Boolean(pendingInviteIds[devotee.userId]);
              const invited = Boolean(
                invitedGroupUserIds[`${groupId}:${devotee.userId}`]
              );
              return (
                <View
                  key={devotee.userId}
                  style={{
                    alignItems: "center",
                    backgroundColor: SanghaColors.surface,
                    borderColor: SanghaColors.border,
                    borderRadius: 16,
                    borderWidth: 1,
                    flexDirection: "row",
                    marginTop: 10,
                    padding: 10,
                  }}
                >
                  <Image
                    source={{ uri: devotee.profileImageUrl || devotee.avatarUrl || imageForName(devotee.name) }}
                    style={{ borderRadius: 22, height: 44, width: 44 }}
                  />
                  <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <Text numberOfLines={1} style={{ color: SanghaColors.ink, fontSize: 15, fontWeight: "900" }}>
                      {devotee.name}
                    </Text>
                    <Text numberOfLines={1} style={{ color: SanghaColors.inkTertiary, fontSize: 12, fontWeight: "700", marginTop: 3 }}>
                      {[devotee.memberId, devotee.approximateLocationLabel || devotee.city]
                        .filter(Boolean)
                        .join(" · ") || "Sai Family devotee"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    accessibilityLabel={`Invite ${devotee.name}`}
                    activeOpacity={0.85}
                    disabled={pending || invited}
                    onPress={() => sendInvite(devotee)}
                    style={{
                      alignItems: "center",
                      backgroundColor: invited ? SanghaColors.successSoft : SanghaColors.saffron,
                      borderRadius: 14,
                      height: 40,
                      justifyContent: "center",
                      minWidth: 76,
                      paddingHorizontal: 12,
                    }}
                  >
                    {pending ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={{ color: invited ? SanghaColors.success : "#FFFFFF", fontSize: 13, fontWeight: "900" }}>
                        {invited ? "Sent" : "Invite"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>

      <View style={{ marginTop: 18 }}>
        {loading ? (
          <EmptyCard text="Loading members..." />
        ) : null}
        {!loading && members.length === 0 ? (
          <EmptyCard text="No active members are visible yet." />
        ) : null}
        {!loading && members.length > 0 && visibleMembers.length === 0 ? (
          <EmptyCard text="No members matched your search." />
        ) : null}
        {visibleMembers.map((member) => (
          <View
            key={member.id}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 22,
              padding: 15,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image source={{ uri: memberAvatar(member) }} style={{ width: 54, height: 54, borderRadius: 27 }} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: "#111827", fontSize: 17, fontWeight: "900" }}>{member.name || "Sai Family"}</Text>
              <Text style={{ color: "#F97316", fontSize: 13, fontWeight: "800", marginTop: 3 }}>
                {member.role || "Member"}
              </Text>
              <Text style={{ color: "#6B7280", fontSize: 13, fontWeight: "600", marginTop: 3 }}>
                {member.status || "Active member"}
              </Text>
            </View>
            {member.canMessage !== false ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/sangha-chat",
                    params: {
                      groupId,
                      memberId: member.userId || member.id,
                      memberName: member.name || "Sai Family",
                    },
                  })
                }
                style={{
                  alignItems: "center",
                  backgroundColor: "#F3F4F6",
                  borderRadius: 21,
                  height: 42,
                  justifyContent: "center",
                  width: 42,
                }}
              >
                <Feather name="message-circle" size={18} color="#6B7280" />
              </TouchableOpacity>
            ) : null}
            {canManageGroup && (member.canPromote !== false || member.canRemove !== false) ? (
              <View style={{ gap: 8, marginLeft: 8 }}>
                {member.canPromote !== false ? (
                  <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    dispatch(
                      updateSanghaGroupMemberRequest({
                        groupId,
                        memberId: member.id,
                        role: member.role === "moderator" ? "member" : "moderator",
                      })
                    )
                  }
                  style={{
                    alignItems: "center",
                    backgroundColor: "#FFF7ED",
                    borderRadius: 15,
                    height: 30,
                    justifyContent: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ color: "#9A3412", fontSize: 11, fontWeight: "900" }}>
                    {member.role === "moderator" ? "Member" : "Mod"}
                  </Text>
                  </TouchableOpacity>
                ) : null}
                {member.canRemove !== false ? (
                  <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    Alert.alert(
                      "Remove member",
                      `Remove ${member.name || "this member"} from the group?`,
                      [
                        { style: "cancel", text: "Cancel" },
                        {
                          onPress: () =>
                            dispatch(
                              removeSanghaGroupMemberRequest({
                                groupId,
                                memberId: member.id,
                              })
                            ),
                          style: "destructive",
                          text: "Remove",
                        },
                      ]
                    )
                  }
                  style={{
                    alignItems: "center",
                    backgroundColor: "#FEF2F2",
                    borderRadius: 15,
                    height: 30,
                    justifyContent: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ color: "#9F1239", fontSize: 11, fontWeight: "900" }}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        ))}
        {!trimmedQuery ? (
          <PaginationButton
            loading={loading}
            onPress={() => {
              if (!pagination?.hasMore) return;
              dispatch(
                fetchSanghaGroupMembersRequest({
                  groupId,
                  limit: pagination.limit,
                  offset: getNextOffset(pagination),
                  role: "all",
                  status: "active",
                })
              );
            }}
            pagination={pagination}
          />
        ) : null}
      </View>
    </>
  );
}

function EventsSection({
  canCreateEvent,
  events,
  groupId,
  loading,
  pagination,
}: {
  canCreateEvent: boolean;
  events: SanghaGroupEvent[];
  groupId: string;
  loading: boolean;
  pagination: SanghaPagination | null;
}) {
  const dispatch = useAppDispatch();

  return (
    <>
      <View
        style={{
          borderRadius: 24,
          backgroundColor: "#2B1308",
          padding: 20,
          overflow: "hidden",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "800" }}>
          Group Calendar
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.76)", fontSize: 14, lineHeight: 21, marginTop: 8 }}>
          Keep upcoming seva, bhajan, and member meetups organized in one place.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canCreateEvent}
          onPress={() =>
            router.push({
              pathname: "/events/create",
              params: { groupId, source: "sangha" },
            })
          }
          style={{
            alignSelf: "flex-start",
            marginTop: 16,
            height: 42,
            borderRadius: 21,
            backgroundColor: canCreateEvent ? "#F97316" : "#D1D5DB",
            paddingHorizontal: 18,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "900" }}>
            {canCreateEvent ? "Create Event" : "Join to Create"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <EmptyCard text="Loading group events..." />
      ) : null}
      {!loading && events.length === 0 ? (
        <EmptyCard text="No upcoming group events are visible yet." />
      ) : null}
      {events.map((event) => (
        <GroupEventCard
          key={event.id}
          event={event}
          groupId={groupId}
        />
      ))}
      <PaginationButton
        loading={loading}
        onPress={() => {
          if (!pagination?.hasMore) return;
          dispatch(
            fetchSanghaGroupEventsRequest({
              groupId,
              limit: pagination.limit,
              offset: getNextOffset(pagination),
              status: "upcoming",
            })
          );
        }}
        pagination={pagination}
      />
    </>
  );
}

function GroupEventCard({
  event,
  groupId,
}: {
  event: SanghaGroupEvent;
  groupId: string;
}) {
  const dispatch = useAppDispatch();
  const pending = useAppSelector((state) =>
    selectIsSanghaActionPending(state, event.id)
  );
  const toggleRsvp = () => {
    if (pending) return;

    dispatch(
      event.rsvpedByMe
        ? cancelSanghaGroupEventRsvpRequest({
            eventId: event.id,
            groupId,
          })
        : rsvpSanghaGroupEventRequest({
            eventId: event.id,
            groupId,
          })
    );
  };

  return (
    <View
          key={event.id}
          style={{
            marginTop: 14,
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 58,
              height: 66,
              borderRadius: 18,
              backgroundColor: "#FFF3E8",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#F97316", fontSize: 12, fontWeight: "900" }}>
              {formatDate(event.startAt).split(" ")[0] || "EVENT"}
            </Text>
            <Text style={{ color: "#111827", fontSize: 22, fontWeight: "900", marginTop: 2 }}>
              {formatDate(event.startAt).split(" ")[1] || ""}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: "#111827", fontSize: 17, fontWeight: "900" }}>{event.title || "Sangha Event"}</Text>
            <Text style={{ color: "#6B7280", fontSize: 13, fontWeight: "600", marginTop: 5 }}>
              {[formatTime(event.startAt), event.venueName || event.address || event.city].filter(Boolean).join(" · ")}
            </Text>
            <Text style={{ color: "#F97316", fontSize: 13, fontWeight: "800", marginTop: 7 }}>
              {event.rsvpCount || event.attendeeCount || 0} going
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={pending}
            onPress={toggleRsvp}
            style={{
              height: 38,
              borderRadius: 19,
              backgroundColor: event.rsvpedByMe ? "#FFF7ED" : "#F3F4F6",
              paddingHorizontal: 14,
              justifyContent: "center",
            }}
          >
            {pending ? (
              <ActivityIndicator color="#F97316" />
            ) : (
              <Text style={{ color: event.rsvpedByMe ? "#F97316" : "#111827", fontSize: 13, fontWeight: "800" }}>
                {event.rsvpedByMe ? "Cancel" : "RSVP"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
  );
}

function AboutSection({
  group,
}: {
  group: SanghaGroupDetail | null;
}) {
  return (
    <>
      <InfoCard title="Purpose" icon="compass">
        {group?.purposeText ||
          group?.description ||
          "A dedicated space for daily spiritual practice, bhajan sharing, seva planning, and community support."}
      </InfoCard>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <StatCard value={`${group?.memberCount || 0}`} label="Members" />
        <StatCard value={`${group?.stats?.events || 0}`} label="Events" />
        <StatCard value={`${group?.activePercent || 0}%`} label="Active" />
      </View>

      <InfoCard title="Guidelines" icon="document-text">
        {group?.guidelines ||
          "Keep posts respectful, avoid promotional spam, protect private member details, and use the events tab for meetups or seva drives."}
      </InfoCard>

      <InfoCard title="Location & Privacy" icon="location">
        {[
          group?.locationLabel ||
            [group?.city, group?.state, group?.country]
              .filter(Boolean)
              .join(", "),
          group?.privacy ? `${group.privacy} group` : null,
        ]
          .filter(Boolean)
          .join(" · ") || "Location and privacy details are not shared yet."}
      </InfoCard>
    </>
  );
}

function PostAuthor({
  image,
  name,
  meta,
}: {
  image: string;
  name: string;
  meta: string;
}) {
  return (
    <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center" }}>
      <Image source={{ uri: image }} style={{ width: 46, height: 46, borderRadius: 23 }} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, color: "#111827", fontWeight: "900" }}>{name}</Text>
        <Text style={{ marginTop: 2, fontSize: 14, color: "#6B7280" }}>{meta}</Text>
      </View>
    </View>
  );
}

function PostActions({
  comments,
  groupId,
  likes,
  post,
}: {
  comments: string;
  groupId: string;
  likes: string;
  post: SanghaGroupPost;
}) {
  const dispatch = useAppDispatch();
  const [editContent, setEditContent] = useState(post.content || "");
  const [editVisible, setEditVisible] = useState(false);
  const pending = useAppSelector((state) =>
    selectIsSanghaActionPending(state, post.id)
  );
  const toggleLike = () => {
    if (pending || post.canLike === false) return;

    dispatch(
      post.likedByMe
        ? unlikeSanghaGroupPostRequest({
            groupId,
            postId: post.id,
          })
        : likeSanghaGroupPostRequest({
            groupId,
            postId: post.id,
          })
    );
  };
  const togglePin = () => {
    if (pending) return;

    dispatch(
      post.isPinned
        ? unpinSanghaGroupPostRequest({
            groupId,
            postId: post.id,
          })
        : pinSanghaGroupPostRequest({
            groupId,
            postId: post.id,
          })
    );
  };
  const saveEdit = () => {
    const content = editContent.trim();

    if (!content || pending) return;

    dispatch(
      updateSanghaGroupPostRequest({
        content,
        groupId,
        postId: post.id,
      })
    );
    setEditVisible(false);
  };
  const confirmDelete = () => {
    if (pending) return;

    Alert.alert(
      "Delete post?",
      "This post and its discussion will be removed from the group.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () =>
            dispatch(
              deleteSanghaGroupPostRequest({
                groupId,
                postId: post.id,
              })
            ),
          style: "destructive",
          text: "Delete",
        },
      ]
    );
  };

  return (
    <>
      <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 18 }} />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={post.canLike === false}
          onPress={toggleLike}
          style={{ flexDirection: "row", alignItems: "center", opacity: post.canLike === false ? 0.45 : 1 }}
        >
          <Feather name="heart" size={17} color={post.likedByMe ? "#F97316" : "#6B7280"} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 7, marginRight: 18, color: "#6B7280", fontSize: 14 }}>{likes}</Text>
        <Feather name="message-circle" size={17} color="#6B7280" />
        <Text style={{ marginLeft: 7, color: "#6B7280", fontSize: 14 }}>{comments}</Text>
        {post.canEdit ? (
          <TouchableOpacity
            accessibilityLabel="Edit post"
            activeOpacity={0.85}
            onPress={() => {
              setEditContent(post.content || "");
              setEditVisible(true);
            }}
            style={{ marginLeft: 18 }}
          >
            <Feather name="edit-2" size={17} color="#6B7280" />
          </TouchableOpacity>
        ) : null}
        {post.canPin || post.isPinned ? (
          <TouchableOpacity activeOpacity={0.85} onPress={togglePin} style={{ marginLeft: 18 }}>
            <Ionicons name={post.isPinned ? "pin" : "pin-outline"} size={17} color="#6B7280" />
          </TouchableOpacity>
        ) : null}
        {post.canDelete ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={confirmDelete}
            style={{ marginLeft: 18 }}
          >
            <Feather name="trash-2" size={17} color="#9A3412" />
          </TouchableOpacity>
        ) : null}
      </View>
      <Modal
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
        transparent
        visible={editVisible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            backgroundColor: "rgba(17, 24, 39, 0.42)",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 20,
              paddingBottom: 34,
            }}
          >
            <View style={{ alignItems: "center", flexDirection: "row" }}>
              <Text style={{ color: "#111827", flex: 1, fontSize: 19, fontWeight: "900" }}>
                Edit post
              </Text>
              <TouchableOpacity
                accessibilityLabel="Close edit post"
                onPress={() => setEditVisible(false)}
                style={{ alignItems: "center", height: 40, justifyContent: "center", width: 40 }}
              >
                <Ionicons name="close" size={23} color="#57534E" />
              </TouchableOpacity>
            </View>
            <TextInput
              autoFocus
              maxLength={2000}
              multiline
              onChangeText={setEditContent}
              placeholder="Share an update with your Sangha"
              placeholderTextColor="#A8A29E"
              style={{
                backgroundColor: "#F8F6F2",
                borderColor: "#E7E1DA",
                borderRadius: 18,
                borderWidth: 1,
                color: "#111827",
                fontSize: 16,
                lineHeight: 24,
                marginTop: 14,
                minHeight: 130,
                padding: 16,
                textAlignVertical: "top",
              }}
              value={editContent}
            />
            <TouchableOpacity
              activeOpacity={0.86}
              disabled={!editContent.trim() || pending}
              onPress={saveEdit}
              style={{
                alignItems: "center",
                backgroundColor: editContent.trim() ? "#F97316" : "#D6D3D1",
                borderRadius: 17,
                height: 52,
                justifyContent: "center",
                marginTop: 14,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "900" }}>
                Save changes
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function ActionPill({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        height: 42,
        borderRadius: 15,
        backgroundColor: "#FFF7ED",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      <Ionicons name={icon} size={16} color="#F97316" />
      <Text style={{ marginLeft: 6, color: "#9A3412", fontSize: 13, fontWeight: "800" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function InfoCard({
  children,
  icon,
  title,
}: {
  children: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View
      style={{
        marginTop: 14,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: "#EEE7DD",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "#FFF3E8",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name={icon} size={20} color="#F97316" />
        </View>
        <Text style={{ marginLeft: 12, color: "#111827", fontSize: 18, fontWeight: "900" }}>{title}</Text>
      </View>
      <Text style={{ color: "#4B5563", fontSize: 15, lineHeight: 24, fontWeight: "600", marginTop: 14 }}>
        {children}
      </Text>
    </View>
  );
}

function StatCard({value, label}: {value: string; label: string}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EEE7DD",
      }}
    >
      <Text style={{ color: "#111827", fontSize: 20, fontWeight: "900" }}>{value}</Text>
      <Text style={{ color: "#6B7280", fontSize: 12, fontWeight: "800", marginTop: 4 }}>{label}</Text>
    </View>
  );
}

const postTextStyle = {
  marginTop: 18,
  fontSize: 16,
  lineHeight: 26,
  color: "#374151",
  fontWeight: "500" as const,
};
