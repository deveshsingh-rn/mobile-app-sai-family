import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ArrowLeft,
  Save,
} from "lucide-react-native";

import {
  createEventRequest,
  fetchEventDetailRequest,
  updateEventRequest,
} from "@/store/events/actions";
import {
  selectEventDetail,
  selectEventsError,
  selectIsCreatingEvent,
} from "@/store/events/selectors";
import {
  CreateEventPayload,
  EventType,
} from "@/store/events/types";
import {
  EVENT_TYPES,
  getFirstValidationError,
  validateCreateEventPayload,
  validateUpdateEventPayload,
} from "@/store/events/validation";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

type EventFormMode = "create" | "edit";

type EventFormState = {
  address: string;
  bannerUrl: string;
  city: string;
  country: string;
  description: string;
  endAt: string;
  latitude: string;
  longitude: string;
  startAt: string;
  state: string;
  timezone: string;
  title: string;
  type: EventType;
  venueName: string;
};

const initialForm: EventFormState = {
  address: "",
  bannerUrl: "",
  city: "",
  country: "India",
  description: "",
  endAt: "",
  latitude: "",
  longitude: "",
  startAt: "",
  state: "",
  timezone: "Asia/Kolkata",
  title: "",
  type: "general",
  venueName: "",
};

const toPayload = (
  form: EventFormState
): CreateEventPayload => ({
  address: form.address.trim(),
  bannerUrl: form.bannerUrl.trim() || undefined,
  city: form.city.trim() || undefined,
  country: form.country.trim() || undefined,
  description: form.description.trim(),
  endAt: form.endAt.trim(),
  latitude: Number(form.latitude),
  longitude: Number(form.longitude),
  startAt: form.startAt.trim(),
  state: form.state.trim() || undefined,
  timezone: form.timezone.trim() || "Asia/Kolkata",
  title: form.title.trim(),
  type: form.type,
  venueName: form.venueName.trim() || undefined,
});

const inputProps = {
  placeholderTextColor: "#a98b54",
};

export default function EventFormScreen({
  mode,
}: {
  mode: EventFormMode;
}) {
  const { id } =
    useLocalSearchParams<{
      id?: string;
    }>();
  const dispatch = useAppDispatch();
  const detail = useAppSelector(
    selectEventDetail
  );
  const saving = useAppSelector(
    selectIsCreatingEvent
  );
  const error = useAppSelector(
    selectEventsError
  );
  const [form, setForm] =
    useState<EventFormState>(
      initialForm
    );
  const [submitted, setSubmitted] =
    useState(false);
  const wasSaving = useRef(false);

  const eventId = Array.isArray(id)
    ? id[0]
    : id;

  useEffect(() => {
    if (mode === "edit" && eventId) {
      dispatch(
        fetchEventDetailRequest(eventId)
      );
    }
  }, [dispatch, eventId, mode]);

  useEffect(() => {
    if (
      mode === "edit" &&
      detail &&
      detail.id === eventId
    ) {
      setForm({
        address: detail.address || "",
        bannerUrl: detail.bannerUrl || "",
        city: detail.city || "",
        country: detail.country || "India",
        description: detail.description || "",
        endAt: detail.endAt || "",
        latitude: String(
          detail.latitude ?? ""
        ),
        longitude: String(
          detail.longitude ?? ""
        ),
        startAt: detail.startAt || "",
        state: detail.state || "",
        timezone:
          detail.timezone || "Asia/Kolkata",
        title: detail.title || "",
        type: detail.type || "general",
        venueName: detail.venueName || "",
      });
    }
  }, [detail, eventId, mode]);

  useEffect(() => {
    if (
      submitted &&
      wasSaving.current &&
      !saving &&
      !error
    ) {
      router.canGoBack()
        ? router.back()
        : router.replace("/(tabs)/events");
    }

    wasSaving.current = saving;
  }, [error, saving, submitted]);

  const setField = useCallback(
    (
      key: keyof EventFormState,
      value: string
    ) => {
      setForm((current) => ({
        ...current,
        [key]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const payload = toPayload(form);

    if (mode === "create") {
      const validation =
        validateCreateEventPayload(
          payload
        );

      if (!validation.isValid) {
        Alert.alert(
          "Event",
          getFirstValidationError(
            validation
          )
        );
        return;
      }

      setSubmitted(true);
      dispatch(
        createEventRequest(payload)
      );
      return;
    }

    if (!eventId) {
      Alert.alert(
        "Event",
        "Event id is missing."
      );
      return;
    }

    const validation =
      validateUpdateEventPayload(
        {
          ...payload,
          id: eventId,
        },
        detail
      );

    if (!validation.isValid) {
      Alert.alert(
        "Event",
        getFirstValidationError(
          validation
        )
      );
      return;
    }

    setSubmitted(true);
    dispatch(
      updateEventRequest({
        ...payload,
        id: eventId,
      })
    );
  }, [
    detail,
    dispatch,
    eventId,
    form,
    mode,
  ]);

  const title =
    mode === "create"
      ? "Create Event"
      : "Edit Event";

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      style={styles.container}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ArrowLeft
            color="#5b3b0b"
            size={22}
          />
        </Pressable>

        <Text style={styles.topTitle}>
          {title}
        </Text>

        <View style={styles.topSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!!error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        <TextInput
          {...inputProps}
          onChangeText={(value) =>
            setField("title", value)
          }
          placeholder="Event title"
          style={styles.input}
          value={form.title}
        />

        <TextInput
          {...inputProps}
          multiline
          onChangeText={(value) =>
            setField(
              "description",
              value
            )
          }
          placeholder="Description"
          style={[
            styles.input,
            styles.textArea,
          ]}
          value={form.description}
        />

        <Text style={styles.label}>
          Event type
        </Text>
        <View style={styles.typeGrid}>
          {EVENT_TYPES.map((type) => {
            const active =
              form.type === type;

            return (
              <Pressable
                key={type}
                onPress={() =>
                  setField("type", type)
                }
                style={[
                  styles.typeChip,
                  active &&
                    styles.typeChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    active &&
                      styles.typeTextActive,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          {...inputProps}
          onChangeText={(value) =>
            setField("startAt", value)
          }
          placeholder="Start ISO time, e.g. 2026-06-15T13:30:00.000Z"
          style={styles.input}
          value={form.startAt}
        />

        <TextInput
          {...inputProps}
          onChangeText={(value) =>
            setField("endAt", value)
          }
          placeholder="End ISO time"
          style={styles.input}
          value={form.endAt}
        />

        <TextInput
          {...inputProps}
          onChangeText={(value) =>
            setField("venueName", value)
          }
          placeholder="Venue name"
          style={styles.input}
          value={form.venueName}
        />

        <TextInput
          {...inputProps}
          multiline
          onChangeText={(value) =>
            setField("address", value)
          }
          placeholder="Full address"
          style={[
            styles.input,
            styles.textAreaSmall,
          ]}
          value={form.address}
        />

        <View style={styles.row}>
          <TextInput
            {...inputProps}
            keyboardType="numeric"
            onChangeText={(value) =>
              setField("latitude", value)
            }
            placeholder="Latitude"
            style={[
              styles.input,
              styles.rowInput,
            ]}
            value={form.latitude}
          />

          <TextInput
            {...inputProps}
            keyboardType="numeric"
            onChangeText={(value) =>
              setField("longitude", value)
            }
            placeholder="Longitude"
            style={[
              styles.input,
              styles.rowInput,
            ]}
            value={form.longitude}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            {...inputProps}
            onChangeText={(value) =>
              setField("city", value)
            }
            placeholder="City"
            style={[
              styles.input,
              styles.rowInput,
            ]}
            value={form.city}
          />

          <TextInput
            {...inputProps}
            onChangeText={(value) =>
              setField("state", value)
            }
            placeholder="State"
            style={[
              styles.input,
              styles.rowInput,
            ]}
            value={form.state}
          />
        </View>

        <TextInput
          {...inputProps}
          onChangeText={(value) =>
            setField("country", value)
          }
          placeholder="Country"
          style={styles.input}
          value={form.country}
        />

        <TextInput
          {...inputProps}
          onChangeText={(value) =>
            setField("timezone", value)
          }
          placeholder="Timezone"
          style={styles.input}
          value={form.timezone}
        />

        <TextInput
          {...inputProps}
          autoCapitalize="none"
          onChangeText={(value) =>
            setField("bannerUrl", value)
          }
          placeholder="Banner URL"
          style={styles.input}
          value={form.bannerUrl}
        />

        <Pressable
          disabled={saving}
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            saving && styles.disabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator
              color="#fffaf0"
            />
          ) : (
            <Save
              color="#fffaf0"
              size={18}
            />
          )}
          <Text style={styles.submitText}>
            {mode === "create"
              ? "Create event"
              : "Save changes"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fffaf0",
    flex: 1,
  },
  topBar: {
    alignItems: "center",
    borderBottomColor:
      "rgba(224,193,138,0.3)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 54,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor:
      "rgba(183,122,24,0.12)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  topTitle: {
    color: "#2f1b03",
    fontSize: 18,
    fontWeight: "900",
  },
  topSpacer: {
    width: 40,
  },
  content: {
    padding: 18,
    paddingBottom: 90,
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fffdf8",
    borderColor: "#dfc684",
    borderRadius: 8,
    borderWidth: 1,
    color: "#2d1b02",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  textArea: {
    minHeight: 112,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  textAreaSmall: {
    minHeight: 82,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  label: {
    color: "#4e3309",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  typeChip: {
    backgroundColor: "#fffdf8",
    borderColor: "#dfc684",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  typeChipActive: {
    backgroundColor: "#b97813",
    borderColor: "#b97813",
  },
  typeText: {
    color: "#73511a",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  typeTextActive: {
    color: "#fffaf0",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#b97813",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 52,
  },
  submitText: {
    color: "#fffaf0",
    fontSize: 15,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.6,
  },
});
