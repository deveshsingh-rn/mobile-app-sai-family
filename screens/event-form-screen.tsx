import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  City,
  Country,
  State,
} from "country-state-city";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  ImagePlus,
  LocateFixed,
  Save,
  X,
} from "lucide-react-native";

import {
  createEventRequest,
  fetchEventDetailRequest,
  updateEventRequest,
  uploadEventMediaRequest,
} from "@/store/events/actions";
import {
  selectEventDetail,
  selectEventsError,
  selectIsCreatingEvent,
  selectIsUploadingEventMedia,
  selectUploadedEventMedia,
} from "@/store/events/selectors";
import {
  CreateEventPayload,
  EventType,
} from "@/store/events/types";
import {
  EVENT_TYPES,
  getFirstValidationError,
  validateEventMediaFiles,
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

const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "UTC",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

const getInitialDate = () => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);

  return date;
};

const parseDate = (value: string) => {
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? getInitialDate()
    : parsed;
};

const formatDateTime = (value: string) => {
  if (!value) {
    return "Select date and time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Select date and time";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const countryOptions = Country.getAllCountries();

type SelectionKind =
  | "city"
  | "country"
  | "state"
  | "timezone";

type PickerTarget = {
  field: "endAt" | "startAt";
  mode: "date" | "time";
} | null;

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
  const uploadingMedia = useAppSelector(
    selectIsUploadingEventMedia
  );
  const uploadedMedia = useAppSelector(
    selectUploadedEventMedia
  );
  const [form, setForm] =
    useState<EventFormState>(
      initialForm
    );
  const [
    localBannerUri,
    setLocalBannerUri,
  ] = useState<string | null>(null);
  const [
    waitingForBannerUpload,
    setWaitingForBannerUpload,
  ] = useState(false);
  const [
    loadingLocation,
    setLoadingLocation,
  ] = useState(false);
  const [
    pickerTarget,
    setPickerTarget,
  ] = useState<PickerTarget>(null);
  const [
    selectionKind,
    setSelectionKind,
  ] = useState<SelectionKind | null>(
    null
  );
  const [submitted, setSubmitted] =
    useState(false);
  const wasSaving = useRef(false);

  const eventId = Array.isArray(id)
    ? id[0]
    : id;

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

  const selectedCountry =
    countryOptions.find(
      (country) =>
        country.name === form.country
    ) || countryOptions.find(
      (country) => country.isoCode === "IN"
    );

  const stateOptions = selectedCountry
    ? State.getStatesOfCountry(
        selectedCountry.isoCode
      )
    : [];

  const selectedState =
    stateOptions.find(
      (state) => state.name === form.state
    ) || null;

  const cityOptions =
    selectedCountry && selectedState
      ? City.getCitiesOfState(
          selectedCountry.isoCode,
          selectedState.isoCode
        )
      : [];

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
      waitingForBannerUpload &&
      uploadedMedia?.url
    ) {
      setField(
        "bannerUrl",
        uploadedMedia.url
      );
      setWaitingForBannerUpload(false);
    }
  }, [
    setField,
    uploadedMedia?.url,
    waitingForBannerUpload,
  ]);

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

  const handlePickBanner =
    useCallback(async () => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow photo access to upload an event banner."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            allowsEditing: true,
            aspect: [16, 9],
            mediaTypes: ["images"],
            quality: 0.86,
          }
        );

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const file = {
        fileSize: asset.fileSize,
        mimeType:
          asset.mimeType || "image/jpeg",
        name:
          asset.fileName ||
          `event-banner-${Date.now()}.jpg`,
        uri: asset.uri,
      };

      const validation =
        validateEventMediaFiles([
          file,
        ]);

      if (!validation.isValid) {
        Alert.alert(
          "Banner",
          getFirstValidationError(
            validation
          )
        );
        return;
      }

      const formData = new FormData();
      formData.append("file", {
        name: file.name,
        type: file.mimeType,
        uri: file.uri,
      } as any);

      setLocalBannerUri(asset.uri);
      setWaitingForBannerUpload(true);

      dispatch(
        uploadEventMediaRequest({
          files: [file],
          formData,
        })
      );
    }, [dispatch]);

  const handleClearBanner =
    useCallback(() => {
      setLocalBannerUri(null);
      setWaitingForBannerUpload(false);
      setField("bannerUrl", "");
    }, [setField]);

  const openDatePicker = useCallback(
    (
      field: "endAt" | "startAt",
      pickerMode: "date" | "time"
    ) => {
      setPickerTarget({
        field,
        mode: pickerMode,
      });
    },
    []
  );

  const handleDateChange = useCallback(
    (
      event: DateTimePickerEvent,
      selectedDate?: Date
    ) => {
      if (
        Platform.OS !== "ios" ||
        event.type === "dismissed"
      ) {
        setPickerTarget(null);
      }

      if (!pickerTarget || !selectedDate) {
        return;
      }

      const current = parseDate(
        form[pickerTarget.field]
      );
      const next = new Date(current);

      if (pickerTarget.mode === "date") {
        next.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
      } else {
        next.setHours(
          selectedDate.getHours(),
          selectedDate.getMinutes(),
          0,
          0
        );
      }

      setField(
        pickerTarget.field,
        next.toISOString()
      );

      if (
        pickerTarget.field === "startAt" &&
        !form.endAt
      ) {
        const end = new Date(next);
        end.setHours(end.getHours() + 1);
        setField("endAt", end.toISOString());
      }
    },
    [form, pickerTarget, setField]
  );

  const handleUseCurrentLocation =
    useCallback(async () => {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Location needed",
          "Please allow location access to fill event coordinates."
        );
        return;
      }

      setLoadingLocation(true);

      try {
        const current =
          await Location.getCurrentPositionAsync(
            {}
          );
        const reverse =
          await Location.reverseGeocodeAsync({
            latitude:
              current.coords.latitude,
            longitude:
              current.coords.longitude,
          });
        const place = reverse[0];

        setField(
          "latitude",
          current.coords.latitude.toFixed(6)
        );
        setField(
          "longitude",
          current.coords.longitude.toFixed(6)
        );

        if (place?.city) {
          setField("city", place.city);
        }

        if (place?.region) {
          setField("state", place.region);
        }

        if (place?.country) {
          setField("country", place.country);
        }

        const timezone =
          Intl.DateTimeFormat()
            .resolvedOptions().timeZone;

        if (timezone) {
          setField("timezone", timezone);
        }
      } catch {
        Alert.alert(
          "Location",
          "Could not read your current location. Please try again."
        );
      } finally {
        setLoadingLocation(false);
      }
    }, [setField]);

  const handleCountrySelect = useCallback(
    (name: string) => {
      setForm((current) => ({
        ...current,
        city: "",
        country: name,
        state: "",
      }));
      setSelectionKind(null);
    },
    []
  );

  const handleStateSelect = useCallback(
    (name: string) => {
      setForm((current) => ({
        ...current,
        city: "",
        state: name,
      }));
      setSelectionKind(null);
    },
    []
  );

  const handleSelection = useCallback(
    (value: string) => {
      if (selectionKind === "country") {
        handleCountrySelect(value);
        return;
      }

      if (selectionKind === "state") {
        handleStateSelect(value);
        return;
      }

      if (selectionKind === "city") {
        setField("city", value);
        setSelectionKind(null);
        return;
      }

      if (selectionKind === "timezone") {
        setField("timezone", value);
        setSelectionKind(null);
      }
    },
    [
      handleCountrySelect,
      handleStateSelect,
      selectionKind,
      setField,
    ]
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
  const selectionOptions =
    selectionKind === "country"
      ? countryOptions.map(
          (country) => country.name
        )
      : selectionKind === "state"
        ? stateOptions.map(
            (state) => state.name
          )
        : selectionKind === "city"
          ? cityOptions.map(
              (city) => city.name
            )
          : TIMEZONE_OPTIONS;

  const selectionTitle =
    selectionKind === "country"
      ? "Choose country"
      : selectionKind === "state"
        ? "Choose state"
        : selectionKind === "city"
          ? "Choose city"
          : "Choose timezone";

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

        <Text style={styles.label}>
          Start date and time
        </Text>
        <View style={styles.dateControl}>
          <CalendarClock
            color="#7a5311"
            size={18}
          />
          <Text style={styles.dateText}>
            {formatDateTime(form.startAt)}
          </Text>
          <View style={styles.dateActions}>
            <Pressable
              onPress={() =>
                openDatePicker(
                  "startAt",
                  "date"
                )
              }
              style={styles.smallButton}
            >
              <Text
                style={styles.smallButtonText}
              >
                Date
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                openDatePicker(
                  "startAt",
                  "time"
                )
              }
              style={styles.smallButton}
            >
              <Text
                style={styles.smallButtonText}
              >
                Time
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.label}>
          End date and time
        </Text>
        <View style={styles.dateControl}>
          <CalendarClock
            color="#7a5311"
            size={18}
          />
          <Text style={styles.dateText}>
            {formatDateTime(form.endAt)}
          </Text>
          <View style={styles.dateActions}>
            <Pressable
              onPress={() =>
                openDatePicker("endAt", "date")
              }
              style={styles.smallButton}
            >
              <Text
                style={styles.smallButtonText}
              >
                Date
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                openDatePicker("endAt", "time")
              }
              style={styles.smallButton}
            >
              <Text
                style={styles.smallButtonText}
              >
                Time
              </Text>
            </Pressable>
          </View>
        </View>

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

        <Pressable
          disabled={loadingLocation}
          onPress={handleUseCurrentLocation}
          style={[
            styles.locationButton,
            loadingLocation &&
              styles.disabled,
          ]}
        >
          {loadingLocation ? (
            <ActivityIndicator color="#7a5311" />
          ) : (
            <LocateFixed
              color="#7a5311"
              size={18}
            />
          )}
          <Text style={styles.locationButtonText}>
            Use my current location
          </Text>
        </Pressable>

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

        <Pressable
          onPress={() =>
            setSelectionKind("country")
          }
          style={styles.selectControl}
        >
          <Text style={styles.selectLabel}>
            Country
          </Text>
          <Text
            numberOfLines={1}
            style={styles.selectValue}
          >
            {form.country || "Choose country"}
          </Text>
          <ChevronDown
            color="#7a5311"
            size={18}
          />
        </Pressable>

        <View style={styles.row}>
          <Pressable
            disabled={!selectedCountry}
            onPress={() =>
              setSelectionKind("state")
            }
            style={[
              styles.selectControl,
              styles.rowInput,
              !selectedCountry &&
                styles.disabled,
            ]}
          >
            <Text style={styles.selectLabel}>
              State
            </Text>
            <Text
              numberOfLines={1}
              style={styles.selectValue}
            >
              {form.state || "Choose state"}
            </Text>
            <ChevronDown
              color="#7a5311"
              size={18}
            />
          </Pressable>

          <Pressable
            disabled={!selectedState}
            onPress={() =>
              setSelectionKind("city")
            }
            style={[
              styles.selectControl,
              styles.rowInput,
              !selectedState &&
                styles.disabled,
            ]}
          >
            <Text style={styles.selectLabel}>
              City
            </Text>
            <Text
              numberOfLines={1}
              style={styles.selectValue}
            >
              {form.city || "Choose city"}
            </Text>
            <ChevronDown
              color="#7a5311"
              size={18}
            />
          </Pressable>
        </View>

        <Pressable
          onPress={() =>
            setSelectionKind("timezone")
          }
          style={styles.selectControl}
        >
          <Text style={styles.selectLabel}>
            Timezone
          </Text>
          <Text
            numberOfLines={1}
            style={styles.selectValue}
          >
            {form.timezone ||
              "Choose timezone"}
          </Text>
          <ChevronDown
            color="#7a5311"
            size={18}
          />
        </Pressable>

        <View style={styles.bannerPicker}>
          {localBannerUri ||
          form.bannerUrl ? (
            <Image
              source={{
                uri:
                  localBannerUri ||
                  form.bannerUrl,
              }}
              style={styles.bannerPreview}
            />
          ) : (
            <View style={styles.bannerEmpty}>
              <ImagePlus
                color="#9a762e"
                size={28}
              />
              <Text style={styles.bannerEmptyText}>
                Event banner
              </Text>
            </View>
          )}

          {uploadingMedia && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator
                color="#fffaf0"
              />
              <Text style={styles.uploadText}>
                Uploading banner...
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bannerActions}>
          <Pressable
            disabled={uploadingMedia}
            onPress={handlePickBanner}
            style={[
              styles.bannerButton,
              uploadingMedia &&
                styles.disabled,
            ]}
          >
            <ImagePlus
              color="#7a5311"
              size={17}
            />
            <Text style={styles.bannerButtonText}>
              Upload banner
            </Text>
          </Pressable>

          {!!(localBannerUri || form.bannerUrl) && (
            <Pressable
              disabled={uploadingMedia}
              onPress={handleClearBanner}
              style={styles.bannerClearButton}
            >
              <X
                color="#b42318"
                size={17}
              />
            </Pressable>
          )}
        </View>

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
          disabled={saving || uploadingMedia}
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            (saving || uploadingMedia) &&
              styles.disabled,
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

      {pickerTarget && (
        <DateTimePicker
          display={
            Platform.OS === "ios"
              ? "spinner"
              : "default"
          }
          mode={pickerTarget.mode}
          onChange={handleDateChange}
          value={parseDate(
            form[pickerTarget.field]
          )}
        />
      )}

      <Modal
        animationType="slide"
        onRequestClose={() =>
          setSelectionKind(null)
        }
        transparent
        visible={!!selectionKind}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.selectionSheet}>
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionTitle}>
                {selectionTitle}
              </Text>
              <Pressable
                onPress={() =>
                  setSelectionKind(null)
                }
                style={styles.selectionClose}
              >
                <X
                  color="#5b3b0b"
                  size={19}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator
            >
              {selectionOptions.length ? (
                selectionOptions.map(
                  (option) => (
                    <Pressable
                      key={option}
                      onPress={() =>
                        handleSelection(option)
                      }
                      style={styles.optionRow}
                    >
                      <Text
                        style={styles.optionText}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  )
                )
              ) : (
                <Text
                  style={styles.optionEmpty}
                >
                  Select the previous location field first.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  dateControl: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#dfc684",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    minHeight: 58,
    paddingHorizontal: 12,
  },
  dateText: {
    color: "#2d1b02",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  dateActions: {
    flexDirection: "row",
    gap: 6,
  },
  smallButton: {
    alignItems: "center",
    backgroundColor:
      "rgba(185,120,19,0.12)",
    borderColor:
      "rgba(185,120,19,0.28)",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  smallButtonText: {
    color: "#7a5311",
    fontSize: 12,
    fontWeight: "900",
  },
  locationButton: {
    alignItems: "center",
    backgroundColor:
      "rgba(185,120,19,0.12)",
    borderColor:
      "rgba(185,120,19,0.28)",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 48,
  },
  locationButtonText: {
    color: "#7a5311",
    fontSize: 14,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  selectControl: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#dfc684",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  selectLabel: {
    color: "#8b641f",
    fontSize: 12,
    fontWeight: "900",
    minWidth: 62,
  },
  selectValue: {
    color: "#2d1b02",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  bannerPicker: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#dfc684",
    borderRadius: 8,
    borderWidth: 1,
    height: 170,
    justifyContent: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  bannerPreview: {
    height: "100%",
    width: "100%",
  },
  bannerEmpty: {
    alignItems: "center",
    gap: 8,
  },
  bannerEmptyText: {
    color: "#79571b",
    fontSize: 14,
    fontWeight: "800",
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor:
      "rgba(63,37,2,0.58)",
    gap: 8,
    justifyContent: "center",
  },
  uploadText: {
    color: "#fffaf0",
    fontSize: 13,
    fontWeight: "900",
  },
  bannerActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  bannerButton: {
    alignItems: "center",
    backgroundColor:
      "rgba(185,120,19,0.12)",
    borderColor:
      "rgba(185,120,19,0.28)",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
  },
  bannerButtonText: {
    color: "#7a5311",
    fontSize: 14,
    fontWeight: "900",
  },
  bannerClearButton: {
    alignItems: "center",
    backgroundColor:
      "rgba(180,35,24,0.1)",
    borderColor:
      "rgba(180,35,24,0.22)",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    width: 48,
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
  modalBackdrop: {
    backgroundColor:
      "rgba(47,27,3,0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  selectionSheet: {
    backgroundColor: "#fffaf0",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "76%",
    paddingBottom: 22,
  },
  selectionHeader: {
    alignItems: "center",
    borderBottomColor:
      "rgba(224,193,138,0.34)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  selectionTitle: {
    color: "#2f1b03",
    fontSize: 17,
    fontWeight: "900",
  },
  selectionClose: {
    alignItems: "center",
    backgroundColor:
      "rgba(183,122,24,0.12)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  optionRow: {
    borderBottomColor:
      "rgba(224,193,138,0.22)",
    borderBottomWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  optionText: {
    color: "#3f2502",
    fontSize: 15,
    fontWeight: "800",
  },
  optionEmpty: {
    color: "#73511a",
    fontSize: 14,
    fontWeight: "700",
    padding: 18,
    textAlign: "center",
  },
});
