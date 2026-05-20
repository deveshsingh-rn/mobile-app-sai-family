import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { apiClient, getAuthHeaders } from "./api";

export type PushPlatform = "android" | "ios" | "web";

export type PushTokenRegistrationPayload = {
  platform: PushPlatform;
  token: string;
  userId?: string;
};

export type PushTokenRegistrationResponse = {
  message?: string;
  platform?: PushPlatform;
  token?: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getProjectId = () =>
  Constants.expoConfig?.extra?.eas?.projectId ||
  Constants.easConfig?.projectId;

export async function getExpoPushToken() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      importance: Notifications.AndroidImportance.MAX,
      lightColor: "#f6c453",
      name: "Sai Family",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const currentPermissions =
    await Notifications.getPermissionsAsync();

  let finalStatus = currentPermissions.status;

  if (finalStatus !== "granted") {
    const requestedPermissions =
      await Notifications.requestPermissionsAsync();

    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== "granted") {
    throw new Error(
      "Notification permission is required to receive updates."
    );
  }

  const projectId = getProjectId();

  if (!projectId) {
    throw new Error(
      "Expo project id is missing. Add extra.eas.projectId in app.json."
    );
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return token.data;
}

export async function registerExpoPushToken({
  platform,
  token,
  userId,
}: PushTokenRegistrationPayload) {
  const response =
    await apiClient.post<PushTokenRegistrationResponse>(
      "/api/users/me/push-token",
      {
        platform,
        token,
      },
      {
        headers: getAuthHeaders(userId),
      }
    );

  return response.data;
}

export const getPushPlatform = (): PushPlatform => {
  if (Platform.OS === "ios") {
    return "ios";
  }

  if (Platform.OS === "android") {
    return "android";
  }

  return "web";
};
