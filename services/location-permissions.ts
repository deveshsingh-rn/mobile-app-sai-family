import { Alert, Linking } from "react-native";
import * as Location from "expo-location";

type LocationPermissionCopy = {
  message: string;
  settingsMessage?: string;
  title?: string;
};

const DEFAULT_TITLE = "Location permission needed";

export async function requestLocationPermissionWithSettingsFallback({
  message,
  settingsMessage,
  title = DEFAULT_TITLE,
}: LocationPermissionCopy) {
  const current =
    await Location.getForegroundPermissionsAsync();

  if (current.granted) {
    return true;
  }

  if (current.canAskAgain) {
    const next =
      await Location.requestForegroundPermissionsAsync();

    if (next.granted) {
      return true;
    }

    if (next.canAskAgain) {
      Alert.alert(title, message);
      return false;
    }
  }

  Alert.alert(
    title,
    settingsMessage ||
      `${message} Please enable location permission from Settings.`,
    [
      {
        style: "cancel",
        text: "Not now",
      },
      {
        onPress: () => {
          void Linking.openSettings();
        },
        text: "Open Settings",
      },
    ]
  );

  return false;
}
