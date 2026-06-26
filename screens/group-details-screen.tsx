import React, {useEffect, useState} from "react";
import {
  ActivityIndicator,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createSanghaGroupPostCommentRequest,
  createSanghaGroupPostRequest,
  cancelSanghaGroupEventRsvpRequest,
  fetchSanghaGroupFeedRequest,
  deleteSanghaGroupPostRequest,
  fetchSanghaGroupDetailRequest,
  fetchSanghaGroupEventsRequest,
  fetchSanghaGroupJoinRequestsRequest,
  fetchSanghaGroupMembershipRequest,
  fetchSanghaGroupMembersRequest,
  fetchSanghaGroupPostsRequest,
  fetchSanghaGroupPostCommentsRequest,
  joinSanghaGroupRequest,
  leaveSanghaGroupRequest,
  likeSanghaGroupPostRequest,
  pinSanghaGroupPostRequest,
  rsvpSanghaGroupEventRequest,
  unlikeSanghaGroupPostRequest,
  unpinSanghaGroupPostRequest,
} from "@/store/sangha/actions";
import {
  selectIsSanghaActionPending,
  selectSanghaError,
  selectSanghaGroupDetail,
  selectSanghaGroupDetailLoading,
  selectSanghaGroupEvents,
  selectSanghaGroupEventsLoading,
  selectSanghaGroupFeed,
  selectSanghaGroupFeedLoading,
  selectSanghaGroupJoinRequests,
  selectSanghaGroupMembers,
  selectSanghaGroupMembersLoading,
  selectSanghaGroupMembership,
  selectSanghaGroupPosts,
  selectSanghaGroupPostsLoading,
  selectSanghaGroupPostComments,
  selectSanghaGroupPostCommentsLoading,
} from "@/store/sangha/selectors";
import {
  SanghaGroupDetail,
  SanghaGroupEvent,
  SanghaGroupMember,
  SanghaGroupPost,
} from "@/store/sangha/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

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
  const membership = useAppSelector(selectSanghaGroupMembership);
  const joinRequests = useAppSelector(selectSanghaGroupJoinRequests);
  const members = useAppSelector(selectSanghaGroupMembers);
  const membersLoading = useAppSelector(
    selectSanghaGroupMembersLoading
  );
  const events = useAppSelector(selectSanghaGroupEvents);
  const eventsLoading = useAppSelector(
    selectSanghaGroupEventsLoading
  );
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
          groupId={groupId}
          loading={membersLoading}
          members={members}
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
        canPost={canPost}
        joinRequestCount={joinRequests.length || group?.joinRequestCount || 0}
        loading={feedLoading || postsLoading}
        posts={feed.length ? feed : posts}
      />
    );
  };

  const handleJoinToggle = () => {
    if (!groupId || groupActionPending) {
      return;
    }

    if (group?.membershipStatus === "active") {
      dispatch(leaveSanghaGroupRequest(groupId));
      return;
    }

    dispatch(joinSanghaGroupRequest(groupId));
  };

  if (groupLoading && !group) {
    return (
      <SafeAreaView style={{ alignItems: "center", backgroundColor: "#F8F6F2", flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color="#F97316" />
        <Text style={{ color: "#6B7280", fontSize: 15, fontWeight: "800", marginTop: 12 }}>
          Loading group details
        </Text>
      </SafeAreaView>
    );
  }

  if (!groupLoading && !group && error) {
    return (
      <SafeAreaView style={{ backgroundColor: "#F8F6F2", flex: 1, padding: 22 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={{
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            height: 44,
            justifyContent: "center",
            width: 44,
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#2B1308" />
        </TouchableOpacity>
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, marginTop: 22, padding: 18 }}>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F6F2" }}>
      <StatusBar barStyle="light-content" backgroundColor="#2B1308" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        {/* HERO */}
        <View style={{ height: 345, backgroundColor: "#2B1308" }}>
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
                disabled={groupActionPending}
                onPress={handleJoinToggle}
                style={{
                  width: 88,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#F97316",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#F97316",
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
                    {group?.membershipStatus === "active"
                      ? "Leave"
                      : group?.membershipStatus === "pending"
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
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
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
                borderBottomColor: "#F97316",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: isActive ? "#F97316" : "#6B7280",
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
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        marginTop: 16,
        padding: 18,
      }}
    >
      <Text style={{ color: "#6B7280", fontSize: 15, fontWeight: "700", lineHeight: 23 }}>
        {text}
      </Text>
    </View>
  );
}

function FeedSection({
  canComment,
  canPost,
  groupId,
  joinRequestCount,
  loading,
  posts,
}: {
  canComment: boolean;
  canPost: boolean;
  groupId: string;
  joinRequestCount: number;
  loading: boolean;
  posts: SanghaGroupPost[];
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
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/12.jpg" }}
            style={{ width: 42, height: 42, borderRadius: 21 }}
          />
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

      <MemberRequestCard pendingCount={joinRequestCount} />
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
    </>
  );
}

function MemberRequestCard({
  pendingCount,
}: {
  pendingCount: number;
}) {
  return (
    <View
      style={{
        height: 76,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D6DEE8",
        paddingHorizontal: 20,
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

      <TouchableOpacity
        activeOpacity={0.85}
        style={{
          height: 38,
          borderRadius: 19,
          backgroundColor: "#F3F4F6",
          paddingHorizontal: 18,
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#111827", fontSize: 14, fontWeight: "800" }}>Review</Text>
      </TouchableOpacity>
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
        menu
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
  groupId,
  loading,
  members,
}: {
  groupId: string;
  loading: boolean;
  members: SanghaGroupMember[];
}) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim().toLowerCase();
  const visibleMembers = trimmedQuery
    ? members.filter((member) =>
        [member.name, member.role, member.status]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(trimmedQuery))
      )
    : members;

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
          <ActionPill icon="person-add" label="Invite" onPress={() => setQuery("")} />
          <ActionPill icon="shield-checkmark" label="Admins" onPress={() => setQuery("admin")} />
          <ActionPill icon="funnel" label="Active" onPress={() => setQuery("active")} />
        </View>
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
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="message-circle" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </>
  );
}

function EventsSection({
  canCreateEvent,
  events,
  groupId,
  loading,
}: {
  canCreateEvent: boolean;
  events: SanghaGroupEvent[];
  groupId: string;
  loading: boolean;
}) {
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
        <Text style={{ color: "#FFFFFF", fontSize: 22, fontFamily: "serif", fontWeight: "900" }}>
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
  menu,
}: {
  image: string;
  name: string;
  meta: string;
  menu?: boolean;
}) {
  return (
    <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center" }}>
      <Image source={{ uri: image }} style={{ width: 46, height: 46, borderRadius: 23 }} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, color: "#111827", fontWeight: "900" }}>{name}</Text>
        <Text style={{ marginTop: 2, fontSize: 14, color: "#6B7280" }}>{meta}</Text>
      </View>
      {menu ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F3F4F6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
        </TouchableOpacity>
      ) : null}
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
  const pending = useAppSelector((state) =>
    selectIsSanghaActionPending(state, post.id)
  );
  const toggleLike = () => {
    if (pending) return;

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

  return (
    <>
      <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 18 }} />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity activeOpacity={0.85} onPress={toggleLike} style={{ flexDirection: "row", alignItems: "center" }}>
          <Feather name="heart" size={17} color={post.likedByMe ? "#F97316" : "#6B7280"} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 7, marginRight: 18, color: "#6B7280", fontSize: 14 }}>{likes}</Text>
        <Feather name="message-circle" size={17} color="#6B7280" />
        <Text style={{ marginLeft: 7, color: "#6B7280", fontSize: 14 }}>{comments}</Text>
        {post.canPin || post.isPinned ? (
          <TouchableOpacity activeOpacity={0.85} onPress={togglePin} style={{ marginLeft: 18 }}>
            <Ionicons name={post.isPinned ? "pin" : "pin-outline"} size={17} color="#6B7280" />
          </TouchableOpacity>
        ) : null}
        {post.canDelete ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              dispatch(
                deleteSanghaGroupPostRequest({
                  groupId,
                  postId: post.id,
                })
              )
            }
            style={{ marginLeft: 18 }}
          >
            <Feather name="trash-2" size={17} color="#9A3412" />
          </TouchableOpacity>
        ) : null}
      </View>
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
