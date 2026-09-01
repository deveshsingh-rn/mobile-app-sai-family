type NotificationRecord = Record<string, unknown>;

export type SanghaNotificationDestination =
  | {
      pathname: "/sangha-chat";
      params: { conversationId: string };
    }
  | {
      pathname: "/sangha-profile";
      params: { connectionId?: string; id: string };
    }
  | {
      pathname: "/sangha-requests";
      params:
        | { connectionId: string; tab: "received" }
        | { invitationId: string; tab: "invitations" };
    }
  | {
      pathname: "/group-details";
      params: { id: string };
    };

function asRecord(value: unknown): NotificationRecord {
  return value && typeof value === "object"
    ? (value as NotificationRecord)
    : {};
}

function stringValue(...values: unknown[]) {
  return values.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  );
}

export function getSanghaNotificationDestination(
  notification: NotificationRecord
): SanghaNotificationDestination | null {
  const data = asRecord(notification.data);
  const actor = asRecord(notification.actor);
  const group = asRecord(notification.group);
  const type = stringValue(
    notification.type,
    notification.kind,
    data.type,
    data.kind
  );
  const conversationId = stringValue(
    notification.conversationId,
    data.conversationId
  );
  const invitationId = stringValue(
    notification.invitationId,
    data.invitationId
  );
  const connectionId = stringValue(
    notification.connectionId,
    data.connectionId
  );
  const actorUserId = stringValue(
    notification.actorUserId,
    notification.senderUserId,
    data.actorUserId,
    data.senderUserId,
    actor.userId,
    actor.id
  );
  const groupId = stringValue(
    notification.groupId,
    data.groupId,
    group.id
  );

  if (type === "sangha_message" && conversationId) {
    return {
      pathname: "/sangha-chat",
      params: { conversationId },
    };
  }

  if (type === "group_invitation" && invitationId) {
    return {
      pathname: "/sangha-requests",
      params: { invitationId, tab: "invitations" },
    };
  }

  if (type === "connection_request" && connectionId) {
    return {
      pathname: "/sangha-requests",
      params: { connectionId, tab: "received" },
    };
  }

  if (type === "connection_accepted" && actorUserId) {
    return {
      pathname: "/sangha-profile",
      params: { connectionId, id: actorUserId },
    };
  }

  if (
    (type === "group_invitation_accepted" ||
      type === "group_event_created" ||
      type === "event_published_to_group") &&
    groupId
  ) {
    return {
      pathname: "/group-details",
      params: { id: groupId },
    };
  }

  if (conversationId) {
    return {
      pathname: "/sangha-chat",
      params: { conversationId },
    };
  }

  return null;
}
