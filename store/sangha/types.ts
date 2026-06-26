export type SanghaPagination = {
  hasMore?: boolean;
  limit: number;
  nextOffset?: number | null;
  offset: number;
  total?: number;
};

export type SanghaDiscoveryDistance =
  | "nearby"
  | "same_city"
  | "online"
  | string;

export type SanghaPurpose =
  | "all"
  | "connect"
  | "bhajan"
  | "seva"
  | "events"
  | "satsang"
  | string;

export type SanghaDevoteeSummary = {
  approximateLocationLabel?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  connectionId?: string | null;
  connectionStatus?: "none" | "pending" | "connected" | string;
  distanceKm?: number | null;
  distanceLabel?: string | null;
  id?: string;
  interests?: string[];
  memberId?: string | null;
  mutualConnectionCount?: number;
  name: string;
  profileImageUrl?: string | null;
  purposeTags?: string[];
  recommendationReason?: string | null;
  state?: string | null;
  tradition?: string | null;
  userId: string;
};

export type SanghaDevoteeProfile = SanghaDevoteeSummary & {
  canConnect?: boolean;
  experiences?: any[];
  events?: any[];
  joinedAt?: string;
  stats?: {
    connections?: number;
    experiences?: number;
    events?: number;
    groups?: number;
  };
};

export type SanghaDiscoverySettingsPayload = {
  bio?: string;
  interests?: string[];
  nearMeEnabled?: boolean;
  purposeTags?: string[];
  tradition?: string;
};

export type SanghaHomeParams = {
  distance?: SanghaDiscoveryDistance;
  lat?: number;
  limit?: number;
  lng?: number;
  purpose?: SanghaPurpose;
  tradition?: string;
};

export type SanghaDevoteeListParams = SanghaHomeParams & {
  offset?: number;
  type?: "near" | "suggested" | string;
};

export type SanghaDevoteeListResult = {
  devotees: SanghaDevoteeSummary[];
  pagination: SanghaPagination | null;
};

export type SanghaGroupListParams = {
  limit?: number;
  offset?: number;
  privacy?: string;
  purpose?: string;
  q?: string;
  type?: string;
};

export type SanghaGroupListResult = {
  groups: SanghaGroupSummary[];
  pagination: SanghaPagination | null;
};

export type SanghaHomeResult = {
  nearMeEnabled?: boolean;
  nearYou?: SanghaDevoteeSummary[];
  suggestedForYou?: SanghaDevoteeSummary[];
  filters?: {
    purposes?: string[];
    traditions?: string[];
  };
  stats?: {
    activeDevotees?: number;
    connections?: number;
    groups?: number;
  };
};

export type SanghaGroupSummary = {
  bannerUrl?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  id: string;
  isOfficial?: boolean;
  memberCount?: number;
  membershipStatus?: "none" | "pending" | "active" | string;
  name: string;
  privacy?: "public" | "private" | string;
  purpose?: string;
  state?: string | null;
};

export type SanghaGroupDetail = SanghaGroupSummary & {
  activePercent?: number;
  canManage?: boolean;
  canPost?: boolean;
  guidelines?: string | null;
  joinRequestCount?: number;
  locationLabel?: string | null;
  postCount?: number;
  purposeText?: string | null;
  stats?: Record<string, number>;
};

export type SanghaGroupPost = {
  authorAvatarUrl?: string | null;
  authorName?: string | null;
  authorRole?: string | null;
  canDelete?: boolean;
  canPin?: boolean;
  commentCount?: number;
  content?: string | null;
  createdAt?: string;
  id: string;
  imageUrl?: string | null;
  isPinned?: boolean;
  likedByMe?: boolean;
  likeCount?: number;
  mediaUrls?: string[];
  type?: string;
};

export type SanghaGroupFeedItem = SanghaGroupPost & {
  author?: {
    avatarUrl?: string | null;
    id?: string;
    name?: string | null;
    role?: string | null;
  };
  sourceId?: string;
  sourceType?: "post" | "experience" | "event" | string;
};

export type SanghaGroupMembership = {
  canComment?: boolean;
  canCreateEvent?: boolean;
  canInvite?: boolean;
  canModerate?: boolean;
  canPost?: boolean;
  groupId?: string;
  membershipStatus?: "none" | "pending" | "active" | "member" | "admin" | "moderator" | string;
  pendingRequestId?: string | null;
  role?: string | null;
};

export type SanghaGroupJoinRequest = {
  canApprove?: boolean;
  canDecline?: boolean;
  id: string;
  note?: string | null;
  requestedAt?: string;
  requester?: SanghaDevoteeSummary;
  requesterId?: string;
  status?: string;
};

export type SanghaConversation = {
  groupId?: string | null;
  id: string;
  participant?: SanghaDevoteeSummary;
  participantUserId?: string;
  type?: "direct" | string;
  unreadCount?: number;
};

export type SanghaConversationMessage = {
  authorAvatarUrl?: string | null;
  authorName?: string | null;
  authorUserId?: string;
  content: string;
  conversationId?: string;
  createdAt?: string;
  id: string;
  isMine?: boolean;
  readAt?: string | null;
  status?: "sending" | "sent" | "delivered" | "read" | string;
};

export type SanghaGroupPostComment = {
  authorAvatarUrl?: string | null;
  authorName?: string | null;
  content: string;
  createdAt?: string;
  id: string;
  postId?: string;
};

export type SanghaGroupMember = {
  avatarUrl?: string | null;
  id: string;
  joinedAt?: string;
  name?: string;
  profileImageUrl?: string | null;
  role?: string;
  status?: string;
  userId?: string;
};

export type SanghaGroupEvent = {
  address?: string | null;
  attendeeCount?: number;
  city?: string | null;
  endAt?: string;
  id: string;
  rsvpedByMe?: boolean;
  rsvpCount?: number;
  startAt?: string;
  title?: string;
  type?: string;
  venueName?: string | null;
};

export type SanghaHubHomeResult = {
  invitations?: SanghaInvitation[];
  myGroups?: SanghaGroupSummary[];
  purposeTiles?: Array<{
    count?: number;
    icon?: string;
    label: string;
    purpose: string;
  }>;
  recommendedGroups?: SanghaGroupSummary[];
  stats?: Record<string, number>;
};

export type SanghaInvitation = {
  createdAt?: string;
  group?: SanghaGroupSummary;
  groupId?: string;
  id: string;
  invitedBy?: SanghaDevoteeSummary;
  message?: string | null;
  status?: "pending" | "accepted" | "declined" | string;
};

export type SanghaRecentSearch = {
  createdAt?: string;
  id?: string;
  query: string;
};

export type SanghaLiveStream = {
  chatEnabled?: boolean;
  description?: string | null;
  group?: SanghaGroupSummary;
  groupId?: string | null;
  id: string;
  playbackUrl?: string | null;
  reactionsEnabled?: boolean;
  recordingUrl?: string | null;
  scheduledAt?: string | null;
  status?: "scheduled" | "live" | "ended" | string;
  thumbnailUrl?: string | null;
  title: string;
  type?: string;
  viewerCount?: number;
  visibility?: string;
};

export type SanghaNotification = {
  body?: string | null;
  createdAt?: string;
  data?: Record<string, any> | null;
  groupId?: string | null;
  id: string;
  isRead?: boolean;
  readAt?: string | null;
  title?: string | null;
  type?: string;
};

export type SanghaState = {
  actionPendingIds: Record<string, boolean>;
  devotees: SanghaDevoteeSummary[];
  devoteesLoading: boolean;
  devoteesPagination: SanghaPagination | null;
  discoverySaving: boolean;
  error: string | null;
  groupsHome: SanghaHubHomeResult | null;
  groupsHomeLoading: boolean;
  groupDetail: SanghaGroupDetail | null;
  groupDetailLoading: boolean;
  groupEvents: SanghaGroupEvent[];
  groupEventsLoading: boolean;
  groupEventsPagination: SanghaPagination | null;
  groupFeed: SanghaGroupFeedItem[];
  groupFeedLoading: boolean;
  groupFeedPagination: SanghaPagination | null;
  groupJoinRequests: SanghaGroupJoinRequest[];
  groupJoinRequestsLoading: boolean;
  groupJoinRequestsPagination: SanghaPagination | null;
  groupMembership: SanghaGroupMembership | null;
  groupMembershipLoading: boolean;
  groupMembers: SanghaGroupMember[];
  groupMembersLoading: boolean;
  groupMembersPagination: SanghaPagination | null;
  groupPostCommentsById: Record<string, SanghaGroupPostComment[]>;
  groupPostCommentsLoadingIds: Record<string, boolean>;
  groupPosts: SanghaGroupPost[];
  groupPostsLoading: boolean;
  groupPostsPagination: SanghaPagination | null;
  groupsList: SanghaGroupSummary[];
  groupsListLoading: boolean;
  groupsListPagination: SanghaPagination | null;
  home: SanghaHomeResult | null;
  homeLoading: boolean;
  profile: SanghaDevoteeProfile | null;
  profileLoading: boolean;
  recentSearches: SanghaRecentSearch[];
  recentSearchesLoading: boolean;
  searchGroups: SanghaGroupSummary[];
  searchGroupsLoading: boolean;
  searchGroupsPagination: SanghaPagination | null;
  userInvitations: SanghaInvitation[];
  userInvitationsLoading: boolean;
  userInvitationsPagination: SanghaPagination | null;
  notifications: SanghaNotification[];
  notificationsLoading: boolean;
  notificationsPagination: SanghaPagination | null;
  activeConversation: SanghaConversation | null;
  conversationMessagesById: Record<string, SanghaConversationMessage[]>;
  conversationMessagesLoadingIds: Record<string, boolean>;
  conversationMessageCursors: Record<string, string | null>;
};

export enum SANGHA_ACTIONS {
  FETCH_HOME_REQUEST = "sangha/FETCH_HOME_REQUEST",
  FETCH_HOME_SUCCESS = "sangha/FETCH_HOME_SUCCESS",
  FETCH_HOME_FAILURE = "sangha/FETCH_HOME_FAILURE",
  FETCH_DEVOTEES_REQUEST = "sangha/FETCH_DEVOTEES_REQUEST",
  FETCH_DEVOTEES_SUCCESS = "sangha/FETCH_DEVOTEES_SUCCESS",
  FETCH_DEVOTEES_FAILURE = "sangha/FETCH_DEVOTEES_FAILURE",
  FETCH_PROFILE_REQUEST = "sangha/FETCH_PROFILE_REQUEST",
  FETCH_PROFILE_SUCCESS = "sangha/FETCH_PROFILE_SUCCESS",
  FETCH_PROFILE_FAILURE = "sangha/FETCH_PROFILE_FAILURE",
  FETCH_GROUPS_HOME_REQUEST = "sangha/FETCH_GROUPS_HOME_REQUEST",
  FETCH_GROUPS_HOME_SUCCESS = "sangha/FETCH_GROUPS_HOME_SUCCESS",
  FETCH_GROUPS_HOME_FAILURE = "sangha/FETCH_GROUPS_HOME_FAILURE",
  SEARCH_GROUPS_REQUEST = "sangha/SEARCH_GROUPS_REQUEST",
  SEARCH_GROUPS_SUCCESS = "sangha/SEARCH_GROUPS_SUCCESS",
  SEARCH_GROUPS_FAILURE = "sangha/SEARCH_GROUPS_FAILURE",
  FETCH_GROUPS_REQUEST = "sangha/FETCH_GROUPS_REQUEST",
  FETCH_GROUPS_SUCCESS = "sangha/FETCH_GROUPS_SUCCESS",
  FETCH_GROUPS_FAILURE = "sangha/FETCH_GROUPS_FAILURE",
  FETCH_GROUP_DETAIL_REQUEST = "sangha/FETCH_GROUP_DETAIL_REQUEST",
  FETCH_GROUP_DETAIL_SUCCESS = "sangha/FETCH_GROUP_DETAIL_SUCCESS",
  FETCH_GROUP_DETAIL_FAILURE = "sangha/FETCH_GROUP_DETAIL_FAILURE",
  FETCH_GROUP_POSTS_REQUEST = "sangha/FETCH_GROUP_POSTS_REQUEST",
  FETCH_GROUP_POSTS_SUCCESS = "sangha/FETCH_GROUP_POSTS_SUCCESS",
  FETCH_GROUP_POSTS_FAILURE = "sangha/FETCH_GROUP_POSTS_FAILURE",
  FETCH_GROUP_FEED_REQUEST = "sangha/FETCH_GROUP_FEED_REQUEST",
  FETCH_GROUP_FEED_SUCCESS = "sangha/FETCH_GROUP_FEED_SUCCESS",
  FETCH_GROUP_FEED_FAILURE = "sangha/FETCH_GROUP_FEED_FAILURE",
  FETCH_GROUP_MEMBERSHIP_REQUEST = "sangha/FETCH_GROUP_MEMBERSHIP_REQUEST",
  FETCH_GROUP_MEMBERSHIP_SUCCESS = "sangha/FETCH_GROUP_MEMBERSHIP_SUCCESS",
  FETCH_GROUP_MEMBERSHIP_FAILURE = "sangha/FETCH_GROUP_MEMBERSHIP_FAILURE",
  FETCH_GROUP_JOIN_REQUESTS_REQUEST = "sangha/FETCH_GROUP_JOIN_REQUESTS_REQUEST",
  FETCH_GROUP_JOIN_REQUESTS_SUCCESS = "sangha/FETCH_GROUP_JOIN_REQUESTS_SUCCESS",
  FETCH_GROUP_JOIN_REQUESTS_FAILURE = "sangha/FETCH_GROUP_JOIN_REQUESTS_FAILURE",
  FETCH_GROUP_MEMBERS_REQUEST = "sangha/FETCH_GROUP_MEMBERS_REQUEST",
  FETCH_GROUP_MEMBERS_SUCCESS = "sangha/FETCH_GROUP_MEMBERS_SUCCESS",
  FETCH_GROUP_MEMBERS_FAILURE = "sangha/FETCH_GROUP_MEMBERS_FAILURE",
  FETCH_GROUP_EVENTS_REQUEST = "sangha/FETCH_GROUP_EVENTS_REQUEST",
  FETCH_GROUP_EVENTS_SUCCESS = "sangha/FETCH_GROUP_EVENTS_SUCCESS",
  FETCH_GROUP_EVENTS_FAILURE = "sangha/FETCH_GROUP_EVENTS_FAILURE",
  JOIN_GROUP_REQUEST = "sangha/JOIN_GROUP_REQUEST",
  JOIN_GROUP_SUCCESS = "sangha/JOIN_GROUP_SUCCESS",
  JOIN_GROUP_FAILURE = "sangha/JOIN_GROUP_FAILURE",
  LEAVE_GROUP_REQUEST = "sangha/LEAVE_GROUP_REQUEST",
  LEAVE_GROUP_SUCCESS = "sangha/LEAVE_GROUP_SUCCESS",
  LEAVE_GROUP_FAILURE = "sangha/LEAVE_GROUP_FAILURE",
  CREATE_GROUP_POST_REQUEST = "sangha/CREATE_GROUP_POST_REQUEST",
  CREATE_GROUP_POST_SUCCESS = "sangha/CREATE_GROUP_POST_SUCCESS",
  CREATE_GROUP_POST_FAILURE = "sangha/CREATE_GROUP_POST_FAILURE",
  LIKE_GROUP_POST_REQUEST = "sangha/LIKE_GROUP_POST_REQUEST",
  LIKE_GROUP_POST_SUCCESS = "sangha/LIKE_GROUP_POST_SUCCESS",
  LIKE_GROUP_POST_FAILURE = "sangha/LIKE_GROUP_POST_FAILURE",
  UNLIKE_GROUP_POST_REQUEST = "sangha/UNLIKE_GROUP_POST_REQUEST",
  UNLIKE_GROUP_POST_SUCCESS = "sangha/UNLIKE_GROUP_POST_SUCCESS",
  UNLIKE_GROUP_POST_FAILURE = "sangha/UNLIKE_GROUP_POST_FAILURE",
  FETCH_GROUP_POST_COMMENTS_REQUEST = "sangha/FETCH_GROUP_POST_COMMENTS_REQUEST",
  FETCH_GROUP_POST_COMMENTS_SUCCESS = "sangha/FETCH_GROUP_POST_COMMENTS_SUCCESS",
  FETCH_GROUP_POST_COMMENTS_FAILURE = "sangha/FETCH_GROUP_POST_COMMENTS_FAILURE",
  CREATE_GROUP_POST_COMMENT_REQUEST = "sangha/CREATE_GROUP_POST_COMMENT_REQUEST",
  CREATE_GROUP_POST_COMMENT_SUCCESS = "sangha/CREATE_GROUP_POST_COMMENT_SUCCESS",
  CREATE_GROUP_POST_COMMENT_FAILURE = "sangha/CREATE_GROUP_POST_COMMENT_FAILURE",
  PIN_GROUP_POST_REQUEST = "sangha/PIN_GROUP_POST_REQUEST",
  PIN_GROUP_POST_SUCCESS = "sangha/PIN_GROUP_POST_SUCCESS",
  PIN_GROUP_POST_FAILURE = "sangha/PIN_GROUP_POST_FAILURE",
  UNPIN_GROUP_POST_REQUEST = "sangha/UNPIN_GROUP_POST_REQUEST",
  UNPIN_GROUP_POST_SUCCESS = "sangha/UNPIN_GROUP_POST_SUCCESS",
  UNPIN_GROUP_POST_FAILURE = "sangha/UNPIN_GROUP_POST_FAILURE",
  DELETE_GROUP_POST_REQUEST = "sangha/DELETE_GROUP_POST_REQUEST",
  DELETE_GROUP_POST_SUCCESS = "sangha/DELETE_GROUP_POST_SUCCESS",
  DELETE_GROUP_POST_FAILURE = "sangha/DELETE_GROUP_POST_FAILURE",
  CREATE_GROUP_EVENT_REQUEST = "sangha/CREATE_GROUP_EVENT_REQUEST",
  CREATE_GROUP_EVENT_SUCCESS = "sangha/CREATE_GROUP_EVENT_SUCCESS",
  CREATE_GROUP_EVENT_FAILURE = "sangha/CREATE_GROUP_EVENT_FAILURE",
  RSVP_GROUP_EVENT_REQUEST = "sangha/RSVP_GROUP_EVENT_REQUEST",
  RSVP_GROUP_EVENT_SUCCESS = "sangha/RSVP_GROUP_EVENT_SUCCESS",
  RSVP_GROUP_EVENT_FAILURE = "sangha/RSVP_GROUP_EVENT_FAILURE",
  CANCEL_GROUP_EVENT_RSVP_REQUEST = "sangha/CANCEL_GROUP_EVENT_RSVP_REQUEST",
  CANCEL_GROUP_EVENT_RSVP_SUCCESS = "sangha/CANCEL_GROUP_EVENT_RSVP_SUCCESS",
  CANCEL_GROUP_EVENT_RSVP_FAILURE = "sangha/CANCEL_GROUP_EVENT_RSVP_FAILURE",
  FETCH_NOTIFICATIONS_REQUEST = "sangha/FETCH_NOTIFICATIONS_REQUEST",
  FETCH_NOTIFICATIONS_SUCCESS = "sangha/FETCH_NOTIFICATIONS_SUCCESS",
  FETCH_NOTIFICATIONS_FAILURE = "sangha/FETCH_NOTIFICATIONS_FAILURE",
  MARK_NOTIFICATIONS_READ_REQUEST = "sangha/MARK_NOTIFICATIONS_READ_REQUEST",
  MARK_NOTIFICATIONS_READ_SUCCESS = "sangha/MARK_NOTIFICATIONS_READ_SUCCESS",
  MARK_NOTIFICATIONS_READ_FAILURE = "sangha/MARK_NOTIFICATIONS_READ_FAILURE",
  FETCH_RECENT_SEARCHES_REQUEST = "sangha/FETCH_RECENT_SEARCHES_REQUEST",
  FETCH_RECENT_SEARCHES_SUCCESS = "sangha/FETCH_RECENT_SEARCHES_SUCCESS",
  FETCH_RECENT_SEARCHES_FAILURE = "sangha/FETCH_RECENT_SEARCHES_FAILURE",
  ADD_RECENT_SEARCH_REQUEST = "sangha/ADD_RECENT_SEARCH_REQUEST",
  ADD_RECENT_SEARCH_SUCCESS = "sangha/ADD_RECENT_SEARCH_SUCCESS",
  ADD_RECENT_SEARCH_FAILURE = "sangha/ADD_RECENT_SEARCH_FAILURE",
  CLEAR_RECENT_SEARCHES_REQUEST = "sangha/CLEAR_RECENT_SEARCHES_REQUEST",
  CLEAR_RECENT_SEARCHES_SUCCESS = "sangha/CLEAR_RECENT_SEARCHES_SUCCESS",
  CLEAR_RECENT_SEARCHES_FAILURE = "sangha/CLEAR_RECENT_SEARCHES_FAILURE",
  FETCH_INVITATIONS_REQUEST = "sangha/FETCH_INVITATIONS_REQUEST",
  FETCH_INVITATIONS_SUCCESS = "sangha/FETCH_INVITATIONS_SUCCESS",
  FETCH_INVITATIONS_FAILURE = "sangha/FETCH_INVITATIONS_FAILURE",
  ACCEPT_INVITATION_REQUEST = "sangha/ACCEPT_INVITATION_REQUEST",
  ACCEPT_INVITATION_SUCCESS = "sangha/ACCEPT_INVITATION_SUCCESS",
  ACCEPT_INVITATION_FAILURE = "sangha/ACCEPT_INVITATION_FAILURE",
  DECLINE_INVITATION_REQUEST = "sangha/DECLINE_INVITATION_REQUEST",
  DECLINE_INVITATION_SUCCESS = "sangha/DECLINE_INVITATION_SUCCESS",
  DECLINE_INVITATION_FAILURE = "sangha/DECLINE_INVITATION_FAILURE",
  REQUEST_CONNECTION_REQUEST = "sangha/REQUEST_CONNECTION_REQUEST",
  REQUEST_CONNECTION_SUCCESS = "sangha/REQUEST_CONNECTION_SUCCESS",
  REQUEST_CONNECTION_FAILURE = "sangha/REQUEST_CONNECTION_FAILURE",
  DISCONNECT_DEVOTEE_REQUEST = "sangha/DISCONNECT_DEVOTEE_REQUEST",
  DISCONNECT_DEVOTEE_SUCCESS = "sangha/DISCONNECT_DEVOTEE_SUCCESS",
  DISCONNECT_DEVOTEE_FAILURE = "sangha/DISCONNECT_DEVOTEE_FAILURE",
  BLOCK_DEVOTEE_REQUEST = "sangha/BLOCK_DEVOTEE_REQUEST",
  BLOCK_DEVOTEE_SUCCESS = "sangha/BLOCK_DEVOTEE_SUCCESS",
  BLOCK_DEVOTEE_FAILURE = "sangha/BLOCK_DEVOTEE_FAILURE",
  UPDATE_DISCOVERY_REQUEST = "sangha/UPDATE_DISCOVERY_REQUEST",
  UPDATE_DISCOVERY_SUCCESS = "sangha/UPDATE_DISCOVERY_SUCCESS",
  UPDATE_DISCOVERY_FAILURE = "sangha/UPDATE_DISCOVERY_FAILURE",
  START_CONVERSATION_REQUEST = "sangha/START_CONVERSATION_REQUEST",
  START_CONVERSATION_SUCCESS = "sangha/START_CONVERSATION_SUCCESS",
  START_CONVERSATION_FAILURE = "sangha/START_CONVERSATION_FAILURE",
  FETCH_CONVERSATION_MESSAGES_REQUEST = "sangha/FETCH_CONVERSATION_MESSAGES_REQUEST",
  FETCH_CONVERSATION_MESSAGES_SUCCESS = "sangha/FETCH_CONVERSATION_MESSAGES_SUCCESS",
  FETCH_CONVERSATION_MESSAGES_FAILURE = "sangha/FETCH_CONVERSATION_MESSAGES_FAILURE",
  SEND_CONVERSATION_MESSAGE_REQUEST = "sangha/SEND_CONVERSATION_MESSAGE_REQUEST",
  SEND_CONVERSATION_MESSAGE_SUCCESS = "sangha/SEND_CONVERSATION_MESSAGE_SUCCESS",
  SEND_CONVERSATION_MESSAGE_FAILURE = "sangha/SEND_CONVERSATION_MESSAGE_FAILURE",
  MARK_CONVERSATION_READ_REQUEST = "sangha/MARK_CONVERSATION_READ_REQUEST",
  MARK_CONVERSATION_READ_SUCCESS = "sangha/MARK_CONVERSATION_READ_SUCCESS",
  MARK_CONVERSATION_READ_FAILURE = "sangha/MARK_CONVERSATION_READ_FAILURE",
}

export type SanghaAction =
  | {
      payload: SanghaHomeParams;
      type: SANGHA_ACTIONS.FETCH_HOME_REQUEST;
    }
  | {
      payload: SanghaHomeResult;
      type: SANGHA_ACTIONS.FETCH_HOME_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.FETCH_HOME_FAILURE;
    }
  | {
      payload: SanghaDevoteeListParams;
      type: SANGHA_ACTIONS.FETCH_DEVOTEES_REQUEST;
    }
  | {
      payload: SanghaDevoteeListResult & {
        append?: boolean;
      };
      type: SANGHA_ACTIONS.FETCH_DEVOTEES_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.FETCH_DEVOTEES_FAILURE;
    }
  | {
      payload: { id: string };
      type: SANGHA_ACTIONS.FETCH_PROFILE_REQUEST;
    }
  | {
      payload: SanghaDevoteeProfile;
      type: SANGHA_ACTIONS.FETCH_PROFILE_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.FETCH_PROFILE_FAILURE;
    }
  | {
      payload: {
        limit?: number;
        privacy?: string;
        purpose?: string;
      };
      type: SANGHA_ACTIONS.FETCH_GROUPS_HOME_REQUEST;
    }
  | {
      payload: SanghaHubHomeResult;
      type: SANGHA_ACTIONS.FETCH_GROUPS_HOME_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.FETCH_GROUPS_HOME_FAILURE;
    }
  | {
      payload: SanghaGroupListParams;
      type:
        | SANGHA_ACTIONS.SEARCH_GROUPS_REQUEST
        | SANGHA_ACTIONS.FETCH_GROUPS_REQUEST;
    }
  | {
      payload: SanghaGroupListResult & { append?: boolean };
      type:
        | SANGHA_ACTIONS.SEARCH_GROUPS_SUCCESS
        | SANGHA_ACTIONS.FETCH_GROUPS_SUCCESS;
    }
  | {
      payload: string;
      type:
        | SANGHA_ACTIONS.SEARCH_GROUPS_FAILURE
        | SANGHA_ACTIONS.FETCH_GROUPS_FAILURE;
    }
  | {
      payload: { id: string };
      type: SANGHA_ACTIONS.FETCH_GROUP_DETAIL_REQUEST;
    }
  | {
      payload: SanghaGroupDetail;
      type: SANGHA_ACTIONS.FETCH_GROUP_DETAIL_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.FETCH_GROUP_DETAIL_FAILURE;
    }
  | {
      payload: {
        groupId: string;
        limit?: number;
        offset?: number;
        pinnedFirst?: boolean;
        role?: string;
        status?: string;
      };
      type:
        | SANGHA_ACTIONS.FETCH_GROUP_POSTS_REQUEST
        | SANGHA_ACTIONS.FETCH_GROUP_MEMBERS_REQUEST
        | SANGHA_ACTIONS.FETCH_GROUP_EVENTS_REQUEST;
    }
  | {
      payload: {
        append?: boolean;
        pagination: SanghaPagination | null;
        posts: SanghaGroupPost[];
      };
      type: SANGHA_ACTIONS.FETCH_GROUP_POSTS_SUCCESS;
    }
  | {
      payload: {
        append?: boolean;
        members: SanghaGroupMember[];
        pagination: SanghaPagination | null;
      };
      type: SANGHA_ACTIONS.FETCH_GROUP_MEMBERS_SUCCESS;
    }
  | {
      payload: {
        append?: boolean;
        events: SanghaGroupEvent[];
        pagination: SanghaPagination | null;
      };
      type: SANGHA_ACTIONS.FETCH_GROUP_EVENTS_SUCCESS;
    }
  | {
      payload: string;
      type:
        | SANGHA_ACTIONS.FETCH_GROUP_POSTS_FAILURE
        | SANGHA_ACTIONS.FETCH_GROUP_MEMBERS_FAILURE
        | SANGHA_ACTIONS.FETCH_GROUP_EVENTS_FAILURE;
    }
  | {
      payload: { groupId: string };
      type:
        | SANGHA_ACTIONS.JOIN_GROUP_REQUEST
        | SANGHA_ACTIONS.LEAVE_GROUP_REQUEST;
    }
  | {
      payload: { groupId: string; response?: any };
      type:
        | SANGHA_ACTIONS.JOIN_GROUP_SUCCESS
        | SANGHA_ACTIONS.LEAVE_GROUP_SUCCESS;
    }
  | {
      payload: { error: string; groupId: string };
      type:
        | SANGHA_ACTIONS.JOIN_GROUP_FAILURE
        | SANGHA_ACTIONS.LEAVE_GROUP_FAILURE;
    }
  | {
      payload: {
        content: string;
        groupId: string;
        mediaUrls?: string[];
        type?: string;
      };
      type: SANGHA_ACTIONS.CREATE_GROUP_POST_REQUEST;
    }
  | {
      payload: { post: SanghaGroupPost; response?: any };
      type: SANGHA_ACTIONS.CREATE_GROUP_POST_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.CREATE_GROUP_POST_FAILURE;
    }
  | {
      payload: { groupId: string; postId: string };
      type:
        | SANGHA_ACTIONS.LIKE_GROUP_POST_REQUEST
        | SANGHA_ACTIONS.UNLIKE_GROUP_POST_REQUEST
        | SANGHA_ACTIONS.PIN_GROUP_POST_REQUEST
        | SANGHA_ACTIONS.UNPIN_GROUP_POST_REQUEST
        | SANGHA_ACTIONS.DELETE_GROUP_POST_REQUEST;
    }
  | {
      payload: { postId: string; response?: any };
      type:
        | SANGHA_ACTIONS.LIKE_GROUP_POST_SUCCESS
        | SANGHA_ACTIONS.UNLIKE_GROUP_POST_SUCCESS
        | SANGHA_ACTIONS.PIN_GROUP_POST_SUCCESS
        | SANGHA_ACTIONS.UNPIN_GROUP_POST_SUCCESS
        | SANGHA_ACTIONS.DELETE_GROUP_POST_SUCCESS;
    }
  | {
      payload: { error: string; postId: string };
      type:
        | SANGHA_ACTIONS.LIKE_GROUP_POST_FAILURE
        | SANGHA_ACTIONS.UNLIKE_GROUP_POST_FAILURE
        | SANGHA_ACTIONS.PIN_GROUP_POST_FAILURE
        | SANGHA_ACTIONS.UNPIN_GROUP_POST_FAILURE
        | SANGHA_ACTIONS.DELETE_GROUP_POST_FAILURE;
    }
  | {
      payload: {
        groupId: string;
        limit?: number;
        offset?: number;
        postId: string;
      };
      type: SANGHA_ACTIONS.FETCH_GROUP_POST_COMMENTS_REQUEST;
    }
  | {
      payload: {
        append?: boolean;
        comments: SanghaGroupPostComment[];
        postId: string;
      };
      type: SANGHA_ACTIONS.FETCH_GROUP_POST_COMMENTS_SUCCESS;
    }
  | {
      payload: { error: string; postId: string };
      type: SANGHA_ACTIONS.FETCH_GROUP_POST_COMMENTS_FAILURE;
    }
  | {
      payload: { content: string; groupId: string; postId: string };
      type: SANGHA_ACTIONS.CREATE_GROUP_POST_COMMENT_REQUEST;
    }
  | {
      payload: { comment: SanghaGroupPostComment; postId: string };
      type: SANGHA_ACTIONS.CREATE_GROUP_POST_COMMENT_SUCCESS;
    }
  | {
      payload: { error: string; postId: string };
      type: SANGHA_ACTIONS.CREATE_GROUP_POST_COMMENT_FAILURE;
    }
  | {
      payload: {
        groupId: string;
        title: string;
        description?: string;
        startAt: string;
        endAt?: string;
        venueName?: string;
      };
      type: SANGHA_ACTIONS.CREATE_GROUP_EVENT_REQUEST;
    }
  | {
      payload: { event: SanghaGroupEvent; response?: any };
      type: SANGHA_ACTIONS.CREATE_GROUP_EVENT_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.CREATE_GROUP_EVENT_FAILURE;
    }
  | {
      payload: { eventId: string; groupId: string };
      type:
        | SANGHA_ACTIONS.RSVP_GROUP_EVENT_REQUEST
        | SANGHA_ACTIONS.CANCEL_GROUP_EVENT_RSVP_REQUEST;
    }
  | {
      payload: { eventId: string; response?: any };
      type:
        | SANGHA_ACTIONS.RSVP_GROUP_EVENT_SUCCESS
        | SANGHA_ACTIONS.CANCEL_GROUP_EVENT_RSVP_SUCCESS;
    }
  | {
      payload: { error: string; eventId: string };
      type:
        | SANGHA_ACTIONS.RSVP_GROUP_EVENT_FAILURE
        | SANGHA_ACTIONS.CANCEL_GROUP_EVENT_RSVP_FAILURE;
    }
  | {
      payload: {
        limit?: number;
        offset?: number;
        unreadOnly?: boolean;
      };
      type: SANGHA_ACTIONS.FETCH_NOTIFICATIONS_REQUEST;
    }
  | {
      payload: {
        append?: boolean;
        notifications: SanghaNotification[];
        pagination: SanghaPagination | null;
      };
      type: SANGHA_ACTIONS.FETCH_NOTIFICATIONS_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.FETCH_NOTIFICATIONS_FAILURE;
    }
  | {
      payload: { notificationIds: string[] };
      type: SANGHA_ACTIONS.MARK_NOTIFICATIONS_READ_REQUEST;
    }
  | {
      payload: { notificationIds: string[]; response?: any };
      type: SANGHA_ACTIONS.MARK_NOTIFICATIONS_READ_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.MARK_NOTIFICATIONS_READ_FAILURE;
    }
  | {
      payload: { limit?: number };
      type: SANGHA_ACTIONS.FETCH_RECENT_SEARCHES_REQUEST;
    }
  | {
      payload: SanghaRecentSearch[];
      type:
        | SANGHA_ACTIONS.FETCH_RECENT_SEARCHES_SUCCESS
        | SANGHA_ACTIONS.ADD_RECENT_SEARCH_SUCCESS;
    }
  | {
      payload: string;
      type:
        | SANGHA_ACTIONS.FETCH_RECENT_SEARCHES_FAILURE
        | SANGHA_ACTIONS.ADD_RECENT_SEARCH_FAILURE
        | SANGHA_ACTIONS.CLEAR_RECENT_SEARCHES_FAILURE;
    }
  | {
      payload: { query: string };
      type: SANGHA_ACTIONS.ADD_RECENT_SEARCH_REQUEST;
    }
  | {
      type: SANGHA_ACTIONS.CLEAR_RECENT_SEARCHES_REQUEST;
    }
  | {
      type: SANGHA_ACTIONS.CLEAR_RECENT_SEARCHES_SUCCESS;
    }
  | {
      payload: {
        limit?: number;
        offset?: number;
        status?: string;
      };
      type: SANGHA_ACTIONS.FETCH_INVITATIONS_REQUEST;
    }
  | {
      payload: {
        append?: boolean;
        invitations: SanghaInvitation[];
        pagination: SanghaPagination | null;
      };
      type: SANGHA_ACTIONS.FETCH_INVITATIONS_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.FETCH_INVITATIONS_FAILURE;
    }
  | {
      payload: { id: string };
      type:
        | SANGHA_ACTIONS.ACCEPT_INVITATION_REQUEST
        | SANGHA_ACTIONS.DECLINE_INVITATION_REQUEST;
    }
  | {
      payload: { id: string; response?: any };
      type:
        | SANGHA_ACTIONS.ACCEPT_INVITATION_SUCCESS
        | SANGHA_ACTIONS.DECLINE_INVITATION_SUCCESS;
    }
  | {
      payload: { error: string; id: string };
      type:
        | SANGHA_ACTIONS.ACCEPT_INVITATION_FAILURE
        | SANGHA_ACTIONS.DECLINE_INVITATION_FAILURE;
    }
  | {
      payload: { id: string };
      type: SANGHA_ACTIONS.REQUEST_CONNECTION_REQUEST;
    }
  | {
      payload: { id: string; response?: any };
      type: SANGHA_ACTIONS.REQUEST_CONNECTION_SUCCESS;
    }
  | {
      payload: { error: string; id: string };
      type: SANGHA_ACTIONS.REQUEST_CONNECTION_FAILURE;
    }
  | {
      payload: { id: string };
      type: SANGHA_ACTIONS.DISCONNECT_DEVOTEE_REQUEST;
    }
  | {
      payload: { id: string; response?: any };
      type: SANGHA_ACTIONS.DISCONNECT_DEVOTEE_SUCCESS;
    }
  | {
      payload: { error: string; id: string };
      type: SANGHA_ACTIONS.DISCONNECT_DEVOTEE_FAILURE;
    }
  | {
      payload: { id: string; reason?: string };
      type: SANGHA_ACTIONS.BLOCK_DEVOTEE_REQUEST;
    }
  | {
      payload: { id: string; response?: any };
      type: SANGHA_ACTIONS.BLOCK_DEVOTEE_SUCCESS;
    }
  | {
      payload: { error: string; id: string };
      type: SANGHA_ACTIONS.BLOCK_DEVOTEE_FAILURE;
    }
  | {
      payload: SanghaDiscoverySettingsPayload;
      type: SANGHA_ACTIONS.UPDATE_DISCOVERY_REQUEST;
    }
  | {
      payload: SanghaDiscoverySettingsPayload & {
        response?: any;
      };
      type: SANGHA_ACTIONS.UPDATE_DISCOVERY_SUCCESS;
    }
  | {
      payload: string;
      type: SANGHA_ACTIONS.UPDATE_DISCOVERY_FAILURE;
    }
  | {
      payload?: any;
      type:
        | SANGHA_ACTIONS.FETCH_GROUP_FEED_REQUEST
        | SANGHA_ACTIONS.FETCH_GROUP_FEED_SUCCESS
        | SANGHA_ACTIONS.FETCH_GROUP_FEED_FAILURE
        | SANGHA_ACTIONS.FETCH_GROUP_MEMBERSHIP_REQUEST
        | SANGHA_ACTIONS.FETCH_GROUP_MEMBERSHIP_SUCCESS
        | SANGHA_ACTIONS.FETCH_GROUP_MEMBERSHIP_FAILURE
        | SANGHA_ACTIONS.FETCH_GROUP_JOIN_REQUESTS_REQUEST
        | SANGHA_ACTIONS.FETCH_GROUP_JOIN_REQUESTS_SUCCESS
        | SANGHA_ACTIONS.FETCH_GROUP_JOIN_REQUESTS_FAILURE
        | SANGHA_ACTIONS.START_CONVERSATION_REQUEST
        | SANGHA_ACTIONS.START_CONVERSATION_SUCCESS
        | SANGHA_ACTIONS.START_CONVERSATION_FAILURE
        | SANGHA_ACTIONS.FETCH_CONVERSATION_MESSAGES_REQUEST
        | SANGHA_ACTIONS.FETCH_CONVERSATION_MESSAGES_SUCCESS
        | SANGHA_ACTIONS.FETCH_CONVERSATION_MESSAGES_FAILURE
        | SANGHA_ACTIONS.SEND_CONVERSATION_MESSAGE_REQUEST
        | SANGHA_ACTIONS.SEND_CONVERSATION_MESSAGE_SUCCESS
        | SANGHA_ACTIONS.SEND_CONVERSATION_MESSAGE_FAILURE
        | SANGHA_ACTIONS.MARK_CONVERSATION_READ_REQUEST
        | SANGHA_ACTIONS.MARK_CONVERSATION_READ_SUCCESS
        | SANGHA_ACTIONS.MARK_CONVERSATION_READ_FAILURE;
    };
