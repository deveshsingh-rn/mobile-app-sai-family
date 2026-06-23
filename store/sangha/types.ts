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

export type SanghaState = {
  discoverySaving: boolean;
  error: string | null;
  home: SanghaHomeResult | null;
  homeLoading: boolean;
};

export enum SANGHA_ACTIONS {
  FETCH_HOME_REQUEST = "sangha/FETCH_HOME_REQUEST",
  FETCH_HOME_SUCCESS = "sangha/FETCH_HOME_SUCCESS",
  FETCH_HOME_FAILURE = "sangha/FETCH_HOME_FAILURE",
  UPDATE_DISCOVERY_REQUEST = "sangha/UPDATE_DISCOVERY_REQUEST",
  UPDATE_DISCOVERY_SUCCESS = "sangha/UPDATE_DISCOVERY_SUCCESS",
  UPDATE_DISCOVERY_FAILURE = "sangha/UPDATE_DISCOVERY_FAILURE",
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
    };
