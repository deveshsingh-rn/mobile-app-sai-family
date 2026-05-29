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
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  Heart,
  ImagePlus,
  Languages,
  LocateFixed,
  Mail,
  Minus,
  MoreVertical,
  Music,
  Phone,
  Plus,
  Repeat2,
  Search,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Utensils,
  WandSparkles,
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
  getFirstValidationError,
  validateCreateEventPayload,
  validateEventMediaFiles,
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
  type: "bhajan",
  venueName: "",
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

const typeOptions: {
  icon: React.ComponentType<{color?: string; size?: number}>;
  label: string;
  value: EventType;
}[] = [
  {icon: Music, label: "Bhajan", value: "bhajan"},
  {icon: BookOpen, label: "Satsang", value: "satsang"},
  {icon: Heart, label: "Puja", value: "pooja"},
  {icon: Utensils, label: "Prasadam", value: "general"},
  {icon: Users, label: "Seva", value: "seva"},
  {icon: Heart, label: "Other", value: "general"},
];

const countryOptions = Country.getAllCountries();

type PickerTarget = {
  field: "endAt" | "startAt";
  mode: "date" | "time";
} | null;

type SelectionKind = "city" | "country" | "state" | "timezone";

const toPayload = (form: EventFormState): CreateEventPayload => ({
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

const getInitialDate = () => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return date;
};

const parseDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? getInitialDate() : parsed;
};

const formatDate = (value: string) => {
  if (!value) {
    return "Select date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Select date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  });
};

const formatTime = (value: string) => {
  if (!value) {
    return "Select time";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Select time";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function EventFormScreen({
  mode,
}: {
  mode: EventFormMode;
}) {
  const {id} = useLocalSearchParams<{id?: string}>();
  const dispatch = useAppDispatch();
  const detail = useAppSelector(selectEventDetail);
  const saving = useAppSelector(selectIsCreatingEvent);
  const error = useAppSelector(selectEventsError);
  const uploadingMedia = useAppSelector(selectIsUploadingEventMedia);
  const uploadedMedia = useAppSelector(selectUploadedEventMedia);
  const [form, setForm] = useState<EventFormState>(initialForm);
  const [localBannerUri, setLocalBannerUri] = useState<string | null>(null);
  const [waitingForBannerUpload, setWaitingForBannerUpload] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [selectionKind, setSelectionKind] = useState<SelectionKind | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const wasSaving = useRef(false);

  const eventId = Array.isArray(id) ? id[0] : id;

  const setField = useCallback((key: keyof EventFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const selectedCountry =
    countryOptions.find((country) => country.name === form.country) ||
    countryOptions.find((country) => country.isoCode === "IN");

  const stateOptions = selectedCountry
    ? State.getStatesOfCountry(selectedCountry.isoCode)
    : [];
  const selectedState =
    stateOptions.find((state) => state.name === form.state) || null;
  const cityOptions =
    selectedCountry && selectedState
      ? City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
      : [];

  useEffect(() => {
    if (mode === "edit" && eventId) {
      dispatch(fetchEventDetailRequest(eventId));
    }
  }, [dispatch, eventId, mode]);

  useEffect(() => {
    if (mode === "edit" && detail && detail.id === eventId) {
      setForm({
        address: detail.address || "",
        bannerUrl: detail.bannerUrl || "",
        city: detail.city || "",
        country: detail.country || "India",
        description: detail.description || "",
        endAt: detail.endAt || "",
        latitude: String(detail.latitude ?? ""),
        longitude: String(detail.longitude ?? ""),
        startAt: detail.startAt || "",
        state: detail.state || "",
        timezone: detail.timezone || "Asia/Kolkata",
        title: detail.title || "",
        type: detail.type || "general",
        venueName: detail.venueName || "",
      });
    }
  }, [detail, eventId, mode]);

  useEffect(() => {
    if (waitingForBannerUpload && uploadedMedia?.url) {
      setField("bannerUrl", uploadedMedia.url);
      setWaitingForBannerUpload(false);
    }
  }, [setField, uploadedMedia?.url, waitingForBannerUpload]);

  useEffect(() => {
    if (submitted && wasSaving.current && !saving && !error) {
      router.canGoBack() ? router.back() : router.replace("/(tabs)/events");
    }

    wasSaving.current = saving;
  }, [error, saving, submitted]);

  const handlePickBanner = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to upload an event banner."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      mediaTypes: ["images"],
      quality: 0.86,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const file = {
      fileSize: asset.fileSize,
      mimeType: asset.mimeType || "image/jpeg",
      name: asset.fileName || `event-banner-${Date.now()}.jpg`,
      uri: asset.uri,
    };

    const validation = validateEventMediaFiles([file]);

    if (!validation.isValid) {
      Alert.alert("Banner", getFirstValidationError(validation));
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
    dispatch(uploadEventMediaRequest({files: [file], formData}));
  }, [dispatch]);

  const openDatePicker = useCallback(
    (field: "endAt" | "startAt", pickerMode: "date" | "time") => {
      setPickerTarget({field, mode: pickerMode});
    },
    []
  );

  const handleDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS !== "ios" || event.type === "dismissed") {
        setPickerTarget(null);
      }

      if (!pickerTarget || !selectedDate) {
        return;
      }

      const current = parseDate(form[pickerTarget.field]);
      const next = new Date(current);

      if (pickerTarget.mode === "date") {
        next.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
      } else {
        next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      }

      setField(pickerTarget.field, next.toISOString());

      if (pickerTarget.field === "startAt" && !form.endAt) {
        const end = new Date(next);
        end.setHours(end.getHours() + 1);
        setField("endAt", end.toISOString());
      }
    },
    [form, pickerTarget, setField]
  );

  const handleUseCurrentLocation = useCallback(async () => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Location needed",
        "Please allow location access to fill event coordinates."
      );
      return;
    }

    setLoadingLocation(true);

    try {
      const current = await Location.getCurrentPositionAsync({});
      const reverse = await Location.reverseGeocodeAsync({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
      const place = reverse[0];

      setField("latitude", current.coords.latitude.toFixed(6));
      setField("longitude", current.coords.longitude.toFixed(6));

      if (place?.city) {
        setField("city", place.city);
      }
      if (place?.region) {
        setField("state", place.region);
      }
      if (place?.country) {
        setField("country", place.country);
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) {
        setField("timezone", timezone);
      }
    } catch {
      Alert.alert("Location", "Could not read your current location. Please try again.");
    } finally {
      setLoadingLocation(false);
    }
  }, [setField]);

  const handleSelection = useCallback(
    (value: string) => {
      if (selectionKind === "country") {
        setForm((current) => ({
          ...current,
          city: "",
          country: value,
          state: "",
        }));
        setSelectionKind(null);
        return;
      }

      if (selectionKind === "state") {
        setForm((current) => ({
          ...current,
          city: "",
          state: value,
        }));
        setSelectionKind(null);
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
    [selectionKind, setField]
  );

  const handleSubmit = useCallback(() => {
    const payload = toPayload(form);

    if (mode === "create") {
      const validation = validateCreateEventPayload(payload);

      if (!validation.isValid) {
        Alert.alert("Event", getFirstValidationError(validation));
        return;
      }

      setSubmitted(true);
      dispatch(createEventRequest(payload));
      return;
    }

    if (!eventId) {
      Alert.alert("Event", "Event id is missing.");
      return;
    }

    const validation = validateUpdateEventPayload(
      {
        ...payload,
        id: eventId,
      },
      detail
    );

    if (!validation.isValid) {
      Alert.alert("Event", getFirstValidationError(validation));
      return;
    }

    setSubmitted(true);
    dispatch(
      updateEventRequest({
        ...payload,
        id: eventId,
      })
    );
  }, [detail, dispatch, eventId, form, mode]);

  const selectionOptions =
    selectionKind === "country"
      ? countryOptions.map((country) => country.name)
      : selectionKind === "state"
        ? stateOptions.map((state) => state.name)
        : selectionKind === "city"
          ? cityOptions.map((city) => city.name)
          : TIMEZONE_OPTIONS;

  const selectionTitle =
    selectionKind === "country"
      ? "Choose country"
      : selectionKind === "state"
        ? "Choose state"
        : selectionKind === "city"
          ? "Choose city"
          : "Choose timezone";

  const bannerUri = localBannerUri || form.bannerUrl;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerIcon}>
            <ArrowLeft color="#1F2937" size={21} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {mode === "create" ? "Create Sacred Gathering" : "Edit Sacred Gathering"}
          </Text>
          <Pressable style={styles.headerIcon}>
            <MoreVertical color="#1F2937" size={20} />
          </Pressable>
        </View>

        <View style={styles.progressRow}>
          {[0, 1, 2, 3].map((item) => (
            <View key={item} style={[styles.progressTrack, item === 0 && styles.progressActive]} />
          ))}
        </View>
        <View style={styles.progressMeta}>
          <Text style={styles.progressText}>Step 1 of 4</Text>
          <Text style={styles.progressMuted}>Draft saved 2m ago</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <FormSection
          prominent
          subtitle="Choose an image that captures the spirit of your gathering"
          title="Set the Sacred Atmosphere"
        >
          <Pressable onPress={handlePickBanner} style={styles.bannerBox}>
            {bannerUri ? (
              <Image source={{uri: bannerUri}} style={styles.bannerPreview} />
            ) : (
              <View style={styles.bannerEmpty}>
                <View style={styles.bannerIcon}>
                  <ImagePlus color="#9CA3AF" size={28} />
                </View>
                <Text style={styles.bannerTitle}>Add Event Banner</Text>
                <Text style={styles.bannerHint}>JPG, PNG up to 10MB</Text>
                <View style={styles.chooseButton}>
                  <Text style={styles.chooseText}>Choose Image</Text>
                </View>
              </View>
            )}
            {uploadingMedia ? (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.uploadText}>Uploading banner...</Text>
              </View>
            ) : null}
          </Pressable>
          <View style={styles.tipRow}>
            <Sparkles color="#9CA3AF" size={13} />
            <Text style={styles.tipText}>Tip: devotional images create deeper connection</Text>
          </View>
        </FormSection>

        <FormSection
          subtitle="This is the first thing devotees will see"
          title="What is the name of your gathering?"
        >
          <View style={styles.inputWrap}>
            <TextInput
              onChangeText={(value) => setField("title", value)}
              placeholder="e.g., Thursday Evening Bhajan Sandhya"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={form.title}
            />
            <Text style={styles.counter}>{form.title.length}/80</Text>
          </View>
          <View style={styles.aiBox}>
            <Sparkles color="#6B7280" size={15} />
            <View style={styles.aiContent}>
              <Text style={styles.aiTitle}>AI Suggestions</Text>
              <View style={styles.suggestionRow}>
                {["Sai Bhajan Evening", "Community Satsang", "Sacred Gathering"].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setField("title", item)}
                    style={styles.suggestionChip}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </FormSection>

        <FormSection
          subtitle="Help devotees understand the nature of your event"
          title="What kind of gathering is this?"
        >
          <View style={styles.typeGrid}>
            {typeOptions.map((item) => {
              const active = form.type === item.value;
              const Icon = item.icon;

              return (
                <Pressable
                  key={item.label}
                  onPress={() => setField("type", item.value)}
                  style={[styles.typeCard, active && styles.typeCardActive]}
                >
                  <View style={[styles.typeIcon, active && styles.typeIconActive]}>
                    <Icon color={active ? "#FFFFFF" : "#6B7280"} size={22} />
                  </View>
                  <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FormSection>

        <FormSection
          subtitle="Choose the date and time for your sacred event"
          title="When will devotees gather?"
        >
          <DateField
            icon={<CalendarDays color="#9CA3AF" size={18} />}
            label="Event Date"
            onPress={() => openDatePicker("startAt", "date")}
            value={formatDate(form.startAt)}
          />
          <View style={styles.twoColumns}>
            <DateField
              icon={<Clock3 color="#9CA3AF" size={17} />}
              label="Start Time"
              onPress={() => openDatePicker("startAt", "time")}
              value={formatTime(form.startAt)}
            />
            <DateField
              icon={<Clock3 color="#9CA3AF" size={17} />}
              label="End Time"
              onPress={() => openDatePicker("endAt", "time")}
              value={formatTime(form.endAt)}
            />
          </View>
          <InfoCallout
            icon={<Repeat2 color="#6B7280" size={15} />}
            title="Recurring Event"
            text="Make this a regular gathering"
            action="Set Recurrence"
          />
        </FormSection>

        <FormSection
          subtitle="Where will the gathering take place?"
          title="Venue / Sacred Space"
        >
          <IconInput
            icon={<Search color="#9CA3AF" size={17} />}
            onChangeText={(value) => setField("venueName", value)}
            placeholder="Search for a location..."
            value={form.venueName}
          />
          <View style={styles.selectedLocation}>
            <View style={styles.locationIcon}>
              <LocateFixed color="#6B7280" size={18} />
            </View>
            <View style={styles.locationCopy}>
              <Text style={styles.locationTitle}>{form.venueName || "Sai Mandir Community Hall"}</Text>
              <Text style={styles.locationText}>
                {form.address || "123 Temple Road, Mumbai, Maharashtra 400001"}
              </Text>
            </View>
            <Pressable style={styles.clearCircle}>
              <X color="#6B7280" size={16} />
            </Pressable>
          </View>
          <Pressable
            disabled={loadingLocation}
            onPress={handleUseCurrentLocation}
            style={[styles.currentLocationButton, loadingLocation && styles.disabled]}
          >
            {loadingLocation ? (
              <ActivityIndicator color="#6B7280" />
            ) : (
              <LocateFixed color="#6B7280" size={17} />
            )}
            <Text style={styles.currentLocationText}>Use Current Location</Text>
          </Pressable>
          <TextInput
            multiline
            onChangeText={(value) => setField("address", value)}
            placeholder="Additional directions or full address..."
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.smallArea]}
            value={form.address}
          />
          <View style={styles.twoColumns}>
            <SelectButton label="Country" onPress={() => setSelectionKind("country")} value={form.country} />
            <SelectButton label="State" onPress={() => setSelectionKind("state")} value={form.state || "Choose state"} />
          </View>
          <View style={styles.twoColumns}>
            <SelectButton label="City" onPress={() => setSelectionKind("city")} value={form.city || "Choose city"} />
            <SelectButton label="Timezone" onPress={() => setSelectionKind("timezone")} value={form.timezone} />
          </View>
          <View style={styles.twoColumns}>
            <TextInput
              keyboardType="numeric"
              onChangeText={(value) => setField("latitude", value)}
              placeholder="Latitude"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={form.latitude}
            />
            <TextInput
              keyboardType="numeric"
              onChangeText={(value) => setField("longitude", value)}
              placeholder="Longitude"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={form.longitude}
            />
          </View>
        </FormSection>

        <FormSection
          subtitle="Share what devotees can expect from this gathering"
          title="Describe the Experience"
        >
          <View style={styles.descriptionWrap}>
            <TextInput
              multiline
              onChangeText={(value) => setField("description", value)}
              placeholder="Describe the experience devotees will have..."
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.descriptionInput]}
              value={form.description}
            />
            <Text style={styles.descriptionCounter}>{form.description.length}/500</Text>
          </View>
          <View style={styles.twoColumns}>
            <SoftAction icon={<WandSparkles color="#6B7280" size={15} />} label="Enhance with AI" />
            <SoftAction icon={<Languages color="#6B7280" size={15} />} label="Translate" />
          </View>
        </FormSection>

        <AdditionalDetails />
        <OrganizerContact />
        <TagsSection />
        <VisibilitySection />
        <MediaGallery />
        <CoOrganizers />
        <SpecialInstructions />
        <PreviewSection />

        <View style={styles.actionSection}>
          <Pressable
            disabled={saving || uploadingMedia}
            onPress={handleSubmit}
            style={[styles.submitButton, (saving || uploadingMedia) && styles.disabled]}
          >
            {saving ? <ActivityIndicator color="#FFFFFF" /> : null}
            <Text style={styles.submitText}>
              {mode === "create" ? "Continue to Step 2" : "Save Changes"}
            </Text>
          </Pressable>
          <Pressable style={styles.draftButton}>
            <Text style={styles.draftText}>Save as Draft</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.discardButton}>
            <Text style={styles.discardText}>Discard Changes</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.autosave}>
        <View style={styles.autosaveDot} />
        <Text style={styles.autosaveText}>Draft saved automatically</Text>
      </View>

      {pickerTarget && (
        <DateTimePicker
          display={Platform.OS === "ios" ? "spinner" : "default"}
          mode={pickerTarget.mode}
          onChange={handleDateChange}
          value={parseDate(form[pickerTarget.field])}
        />
      )}

      <Modal
        animationType="slide"
        onRequestClose={() => setSelectionKind(null)}
        transparent
        visible={!!selectionKind}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.selectionSheet}>
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionTitle}>{selectionTitle}</Text>
              <Pressable onPress={() => setSelectionKind(null)} style={styles.selectionClose}>
                <X color="#1F2937" size={19} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator>
              {selectionOptions.length ? (
                selectionOptions.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => handleSelection(option)}
                    style={styles.optionRow}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.optionEmpty}>Select the previous location field first.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function FormSection({
  children,
  prominent,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  prominent?: boolean;
  subtitle?: string;
  title: string;
}) {
  return (
    <View style={styles.formSection}>
      <Text style={prominent ? styles.sectionTitleProminent : styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function DateField({
  icon,
  label,
  onPress,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  value: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.dateField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.dateValueRow}>
        {icon}
        <Text numberOfLines={1} style={styles.dateValue}>{value}</Text>
      </View>
    </Pressable>
  );
}

function IconInput({
  icon,
  onChangeText,
  placeholder,
  value,
}: {
  icon: React.ReactNode;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.iconInput}>
      {icon}
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={styles.iconInputText}
        value={value}
      />
    </View>
  );
}

function SelectButton({
  label,
  onPress,
  value,
}: {
  label: string;
  onPress: () => void;
  value: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.selectButton}>
      <View style={styles.selectCopy}>
        <Text style={styles.selectLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.selectValue}>{value}</Text>
      </View>
      <ChevronDown color="#6B7280" size={16} />
    </Pressable>
  );
}

function InfoCallout({
  action,
  icon,
  text,
  title,
}: {
  action: string;
  icon: React.ReactNode;
  text: string;
  title: string;
}) {
  return (
    <View style={styles.callout}>
      <View style={styles.calloutIcon}>{icon}</View>
      <View style={styles.calloutCopy}>
        <Text style={styles.calloutTitle}>{title}</Text>
        <Text style={styles.calloutText}>{text}</Text>
        <Text style={styles.calloutAction}>{action}</Text>
      </View>
    </View>
  );
}

function SoftAction({icon, label}: {icon: React.ReactNode; label: string}) {
  return (
    <Pressable style={styles.softAction}>
      {icon}
      <Text style={styles.softActionText}>{label}</Text>
    </Pressable>
  );
}

function AdditionalDetails() {
  return (
    <FormSection
      subtitle="Help devotees prepare for the gathering"
      title="Additional Details"
    >
      <Text style={styles.fieldLabel}>Expected Attendance</Text>
      <View style={styles.capacityRow}>
        <RoundButton icon={<Minus color="#6B7280" size={17} />} />
        <View style={styles.capacityBox}>
          <Text style={styles.capacityNumber}>50</Text>
          <Text style={styles.capacityUnit}>devotees</Text>
        </View>
        <RoundButton icon={<Plus color="#6B7280" size={17} />} />
      </View>
      <ChecklistGroup
        items={["Free Entry", "RSVP Required", "Contribution Welcome"]}
        selected={[1]}
        title="Entry Requirements"
      />
      <Text style={styles.fieldLabel}>What Should Devotees Bring?</Text>
      {["Prayer mat or cushion", "Water bottle"].map((item) => (
        <View key={item} style={styles.removableRow}>
          <Text style={styles.removableText}>{item}</Text>
          <RoundButton icon={<X color="#6B7280" size={15} />} small />
        </View>
      ))}
      <Pressable style={styles.dashedButton}>
        <Plus color="#9CA3AF" size={16} />
        <Text style={styles.dashedText}>Add Item</Text>
      </Pressable>
      <Text style={styles.fieldLabel}>Dress Code (Optional)</Text>
      <View style={styles.segmentRow}>
        {["Traditional", "Casual", "Formal"].map((item, index) => (
          <View key={item} style={[styles.segment, index === 0 && styles.segmentActive]}>
            <Text style={[styles.segmentText, index === 0 && styles.segmentTextActive]}>{item}</Text>
          </View>
        ))}
      </View>
    </FormSection>
  );
}

function ChecklistGroup({
  items,
  selected,
  title,
}: {
  items: string[];
  selected: number[];
  title: string;
}) {
  return (
    <View style={styles.checkGroup}>
      <Text style={styles.fieldLabel}>{title}</Text>
      {items.map((item, index) => (
        <View key={item} style={styles.checkItem}>
          <View style={[styles.checkbox, selected.includes(index) && styles.checkboxActive]}>
            {selected.includes(index) ? <Check color="#FFFFFF" size={13} /> : null}
          </View>
          <Text style={styles.checkLabel}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function RoundButton({icon, small}: {icon: React.ReactNode; small?: boolean}) {
  return <Pressable style={[styles.roundButton, small && styles.roundButtonSmall]}>{icon}</Pressable>;
}

function OrganizerContact() {
  return (
    <FormSection
      subtitle="How can devotees reach you with questions?"
      title="Organizer Contact"
    >
      <View style={styles.organizerCard}>
        <View style={styles.organizerTop}>
          <Image
            source={{uri: "https://api.dicebear.com/7.x/notionists/png?scale=200&seed=12345"}}
            style={styles.organizerAvatar}
          />
          <View style={styles.organizerCopy}>
            <Text style={styles.organizerName}>Rajesh Kumar</Text>
            <Text style={styles.organizerRole}>Community Organizer</Text>
          </View>
          <View style={styles.editPill}>
            <Text style={styles.editPillText}>Edit</Text>
          </View>
        </View>
        <InfoLine icon={<Phone color="#9CA3AF" size={15} />} text="+91 98765 43210" />
        <InfoLine icon={<Mail color="#9CA3AF" size={15} />} text="rajesh@saifamily.com" />
      </View>
      <View style={styles.checkItem}>
        <View style={styles.checkboxActive}>
          <Check color="#FFFFFF" size={13} />
        </View>
        <Text style={styles.checkLabel}>Allow devotees to contact me directly</Text>
      </View>
    </FormSection>
  );
}

function InfoLine({icon, text}: {icon: React.ReactNode; text: string}) {
  return (
    <View style={styles.infoLine}>
      {icon}
      <Text style={styles.infoLineText}>{text}</Text>
    </View>
  );
}

function TagsSection() {
  return (
    <FormSection subtitle="Help devotees discover your event" title="Event Tags">
      <View style={styles.tagsRow}>
        {["Bhajan", "Evening", "Community"].map((tag) => (
          <View key={tag} style={styles.activeTag}>
            <Text style={styles.activeTagText}>{tag}</Text>
            <View style={styles.tagClose}>
              <X color="#FFFFFF" size={10} />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.addTagWrap}>
        <TextInput
          placeholder="Add tags..."
          placeholderTextColor="#9CA3AF"
          style={styles.addTagInput}
        />
        <View style={styles.addTagButton}>
          <Plus color="#FFFFFF" size={14} />
        </View>
      </View>
      <Text style={styles.suggestedTitle}>Suggested Tags</Text>
      <View style={styles.suggestionRow}>
        {["Devotional", "Music", "Spiritual", "Family Friendly", "Youth"].map((item) => (
          <View key={item} style={styles.suggestionChip}>
            <Text style={styles.suggestionText}>{item}</Text>
          </View>
        ))}
      </View>
    </FormSection>
  );
}

function VisibilitySection() {
  return (
    <FormSection
      subtitle="Who can see and join this gathering?"
      title="Event Visibility"
    >
      {[
        ["Public Event", "Anyone can discover and join this gathering"],
        ["Community Only", "Only Sai Family members can see this event"],
        ["Private Event", "Only people with invitation link can join"],
      ].map(([title, text], index) => (
        <View key={title} style={[styles.visibilityCard, index === 0 && styles.visibilityActive]}>
          <View style={[styles.radio, index === 0 && styles.radioActive]} />
          <View style={styles.visibilityCopy}>
            <Text style={[styles.visibilityTitle, index === 0 && styles.visibilityTitleActive]}>{title}</Text>
            <Text style={[styles.visibilityText, index === 0 && styles.visibilityTextActive]}>{text}</Text>
          </View>
        </View>
      ))}
    </FormSection>
  );
}

function MediaGallery() {
  return (
    <FormSection
      subtitle="Add photos from previous gatherings to inspire devotees"
      title="Event Gallery (Optional)"
    >
      <View style={styles.galleryGrid}>
        <View style={styles.galleryItem}>
          <ImagePlus color="#9CA3AF" size={20} />
        </View>
        <View style={styles.galleryItem}>
          <ImagePlus color="#9CA3AF" size={20} />
        </View>
        <View style={[styles.galleryItem, styles.galleryAdd]}>
          <Plus color="#9CA3AF" size={18} />
          <Text style={styles.galleryAddText}>Add Photo</Text>
        </View>
      </View>
    </FormSection>
  );
}

function CoOrganizers() {
  return (
    <FormSection
      subtitle="Invite others to help manage this event"
      title="Co-Organizers (Optional)"
    >
      <View style={styles.coOrganizerRow}>
        <Image
          source={{uri: "https://api.dicebear.com/7.x/notionists/png?scale=200&seed=67890"}}
          style={styles.coAvatar}
        />
        <View style={styles.organizerCopy}>
          <Text style={styles.organizerName}>Priya Sharma</Text>
          <Text style={styles.organizerRole}>Can edit event details</Text>
        </View>
        <RoundButton icon={<X color="#6B7280" size={15} />} small />
      </View>
      <Pressable style={styles.dashedButton}>
        <UserPlus color="#9CA3AF" size={16} />
        <Text style={styles.dashedText}>Add Co-Organizer</Text>
      </Pressable>
    </FormSection>
  );
}

function SpecialInstructions() {
  return (
    <FormSection
      subtitle="Any important guidelines or notes for attendees?"
      title="Special Instructions"
    >
      <ChecklistGroup
        items={["Photography allowed", "Children welcome", "Parking available", "Wheelchair accessible"]}
        selected={[0, 1]}
        title=""
      />
      <TextInput
        multiline
        placeholder="Add any other special notes or instructions..."
        placeholderTextColor="#9CA3AF"
        style={[styles.input, styles.smallArea]}
      />
    </FormSection>
  );
}

function PreviewSection() {
  return (
    <View style={styles.previewSection}>
      <View style={styles.previewCard}>
        <View style={styles.previewTop}>
          <View style={styles.previewIcon}>
            <Eye color="#6B7280" size={18} />
          </View>
          <View style={styles.organizerCopy}>
            <Text style={styles.previewTitle}>Preview Your Event</Text>
            <Text style={styles.previewText}>See how devotees will experience your gathering before publishing</Text>
          </View>
        </View>
        <Pressable style={styles.previewButton}>
          <Text style={styles.previewButtonText}>View Preview</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionSection: {
    gap: 12,
    paddingBottom: 40,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  activeTag: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 18,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeTagText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  addTagButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  addTagInput: {
    color: "#1F2937",
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  addTagWrap: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  aiBox: {
    alignItems: "flex-start",
    backgroundColor: "#FAFAF9",
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    padding: 12,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
  },
  autosave: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#F97316",
    borderRadius: 18,
    bottom: 24,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    position: "absolute",
  },
  autosaveDot: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  autosaveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  bannerBox: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#F1E8DA",
    borderRadius: 24,
    borderStyle: "dashed",
    borderWidth: 2,
    height: 192,
    justifyContent: "center",
    overflow: "hidden",
  },
  bannerEmpty: {
    alignItems: "center",
  },
  bannerHint: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  bannerIcon: {
    alignItems: "center",
    backgroundColor: "#F6EFD9",
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    marginBottom: 12,
    width: 64,
  },
  bannerPreview: {
    height: "100%",
    width: "100%",
  },
  bannerTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  callout: {
    alignItems: "flex-start",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    padding: 12,
  },
  calloutAction: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 7,
    textDecorationLine: "underline",
  },
  calloutCopy: {
    flex: 1,
  },
  calloutIcon: {
    alignItems: "center",
    backgroundColor: "#F6EFD9",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  calloutText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  calloutTitle: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
  },
  capacityBox: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 48,
  },
  capacityNumber: {
    color: "#1F2937",
    fontSize: 19,
    fontWeight: "900",
  },
  capacityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  capacityUnit: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },
  checkGroup: {
    marginBottom: 16,
  },
  checkItem: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
    padding: 12,
  },
  checkLabel: {
    color: "#1F2937",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  checkbox: {
    alignItems: "center",
    borderColor: "#F1E8DA",
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  checkboxActive: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderColor: "#F97316",
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  chooseButton: {
    backgroundColor: "#F97316",
    borderRadius: 18,
    marginTop: 14,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  chooseText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  clearCircle: {
    alignItems: "center",
    backgroundColor: "#F6EFD9",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  coAvatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  coOrganizerRow: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  container: {
    backgroundColor: "#FAFAF9",
    flex: 1,
  },
  content: {
    paddingBottom: 96,
  },
  counter: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
    position: "absolute",
    right: 14,
    top: 17,
  },
  currentLocationButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 48,
  },
  currentLocationText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "800",
  },
  dashedButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F1E8DA",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 2,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
  },
  dashedText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "800",
  },
  dateField: {
    flex: 1,
    marginBottom: 12,
  },
  dateValue: {
    color: "#1F2937",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  dateValueRow: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  descriptionCounter: {
    bottom: 13,
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
    position: "absolute",
    right: 14,
  },
  descriptionInput: {
    minHeight: 138,
    paddingBottom: 30,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  descriptionWrap: {
    position: "relative",
  },
  disabled: {
    opacity: 0.58,
  },
  discardButton: {
    alignItems: "center",
    minHeight: 42,
    justifyContent: "center",
  },
  discardText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "800",
  },
  draftButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 48,
    justifyContent: "center",
  },
  draftText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  editPill: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F1E8DA",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editPillText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "800",
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  fieldLabel: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },
  formSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  galleryAdd: {
    borderColor: "#F1E8DA",
    borderStyle: "dashed",
    borderWidth: 2,
  },
  galleryAddText: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
  galleryGrid: {
    flexDirection: "row",
    gap: 8,
  },
  galleryItem: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
  },
  header: {
    backgroundColor: "rgba(250,250,249,0.96)",
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  headerIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#1F2937",
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  iconInput: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    minHeight: 50,
    paddingHorizontal: 13,
  },
  iconInputText: {
    color: "#1F2937",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  infoLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 8,
  },
  infoLineText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    color: "#1F2937",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    minHeight: 50,
    paddingHorizontal: 14,
    paddingRight: 44,
  },
  inputWrap: {
    position: "relative",
  },
  locationCopy: {
    flex: 1,
  },
  locationIcon: {
    alignItems: "center",
    backgroundColor: "#F6EFD9",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  locationText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: 3,
  },
  locationTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  modalBackdrop: {
    backgroundColor: "rgba(23,23,23,0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  optionEmpty: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
    padding: 18,
    textAlign: "center",
  },
  optionRow: {
    borderBottomColor: "#FFF7ED",
    borderBottomWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  optionText: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "800",
  },
  organizerAvatar: {
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  organizerCard: {
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 10,
    padding: 14,
  },
  organizerCopy: {
    flex: 1,
  },
  organizerName: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  organizerRole: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  organizerTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  previewButton: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#F1E8DA",
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 46,
  },
  previewButtonText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
  },
  previewIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  previewSection: {
    backgroundColor: "#FAFAF9",
    padding: 16,
  },
  previewText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 3,
  },
  previewTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  previewTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  progressActive: {
    backgroundColor: "#F97316",
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressMuted: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  progressText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    backgroundColor: "#F6EFD9",
    borderRadius: 2,
    flex: 1,
    height: 4,
  },
  radio: {
    borderColor: "#F1E8DA",
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    marginTop: 2,
    width: 20,
  },
  radioActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  removableRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  removableText: {
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    color: "#1F2937",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  roundButton: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  roundButtonSmall: {
    height: 36,
    width: 36,
  },
  sectionBody: {
    marginTop: 12,
  },
  sectionSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 5,
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "800",
  },
  sectionTitleProminent: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "900",
  },
  segment: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    paddingVertical: 12,
  },
  segmentActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segmentText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  selectButton: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    flex: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 12,
  },
  selectCopy: {
    flex: 1,
  },
  selectLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "800",
  },
  selectionClose: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  selectionHeader: {
    alignItems: "center",
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  selectionSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "76%",
    paddingBottom: 22,
  },
  selectionTitle: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "900",
  },
  selectValue: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },
  selectedLocation: {
    alignItems: "flex-start",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    padding: 14,
  },
  smallArea: {
    minHeight: 74,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  softAction: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 42,
  },
  softActionText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "800",
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    minHeight: 54,
    justifyContent: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  suggestedTitle: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 12,
  },
  suggestionChip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "700",
  },
  tagClose: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 8,
    height: 16,
    justifyContent: "center",
    width: 16,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tipRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 10,
  },
  tipText: {
    color: "#6B7280",
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  twoColumns: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  typeCard: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 18,
    borderWidth: 2,
    flex: 1,
    minWidth: "47%",
    padding: 14,
  },
  typeCardActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeIcon: {
    alignItems: "center",
    backgroundColor: "#F6EFD9",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  typeIconActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  typeLabel: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 9,
  },
  typeLabelActive: {
    color: "#FFFFFF",
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(23,23,23,0.55)",
    gap: 8,
    justifyContent: "center",
  },
  uploadText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  visibilityActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  visibilityCard: {
    alignItems: "flex-start",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    marginBottom: 9,
    padding: 14,
  },
  visibilityCopy: {
    flex: 1,
  },
  visibilityText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 3,
  },
  visibilityTextActive: {
    color: "#F1E8DA",
  },
  visibilityTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  visibilityTitleActive: {
    color: "#FFFFFF",
  },
});
