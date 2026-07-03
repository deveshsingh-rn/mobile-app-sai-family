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
  ChevronDown,
  Clock3,
  Eye,
  Heart,
  ImagePlus,
  LocateFixed,
  Music,
  Plus,
  Repeat2,
  Search,
  Sparkles,
  Stethoscope,
  Users,
  Utensils,
  X,
} from "lucide-react-native";

import {
  createEventDraftRequest,
  createEventRequest,
  fetchEventPlacesRequest,
  fetchEventDetailRequest,
  fetchEventTitleSuggestionsRequest,
  publishEventDraftRequest,
  updateEventDraftRequest,
  updateEventRequest,
  uploadEventMediaRequest,
} from "@/store/events/actions";
import {
  selectCurrentEventDraft,
  selectEventDetail,
  selectEventPlaces,
  selectEventPlacesLoading,
  selectEventTitleSuggestions,
  selectEventTitleSuggestionsLoading,
  selectEventsError,
  selectIsCreatingEvent,
  selectIsPublishingEventDraft,
  selectIsSavingEventDraft,
  selectIsUploadingEventMedia,
  selectPublishedDraftEvent,
  selectUploadedEventMedia,
} from "@/store/events/selectors";
import {
  CreateEventPayload,
  EventDraftPayload,
  EventPlace,
  EventType,
  EventTitleSuggestion,
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
  faq: {
    answer: string;
    question: string;
  }[];
  guidelines: string[];
  latitude: string;
  longitude: string;
  recurrenceCount: string;
  recurrenceEnabled: boolean;
  recurrenceFrequency: "daily" | "weekly" | "monthly";
  startAt: string;
  state: string;
  tags: string[];
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
  faq: [],
  guidelines: [],
  latitude: "",
  longitude: "",
  recurrenceCount: "3",
  recurrenceEnabled: false,
  recurrenceFrequency: "weekly",
  startAt: "",
  state: "",
  tags: [],
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
  {icon: Heart, label: "Pooja", value: "pooja"},
  {icon: Users, label: "Seva", value: "seva"},
  {icon: Stethoscope, label: "Medical", value: "medical"},
  {icon: BookOpen, label: "Satsang", value: "satsang"},
  {icon: Sparkles, label: "Darshan", value: "darshan"},
  {icon: Utensils, label: "General", value: "general"},
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
  faq: form.faq
    .map((item) => ({
      answer: item.answer.trim(),
      question: item.question.trim(),
    }))
    .filter((item) => item.question && item.answer),
  guidelines: form.guidelines
    .map((item) => item.trim())
    .filter(Boolean),
  latitude: Number(form.latitude),
  longitude: Number(form.longitude),
  recurrence: form.recurrenceEnabled
    ? {
        count: Number(form.recurrenceCount) || 1,
        frequency: form.recurrenceFrequency,
        interval: 1,
      }
    : undefined,
  startAt: form.startAt.trim(),
  state: form.state.trim() || undefined,
  tags: form.tags
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  timezone: form.timezone.trim() || "Asia/Kolkata",
  title: form.title.trim(),
  type: form.type,
  venueName: form.venueName.trim() || undefined,
});

const toDraftPayload = (form: EventFormState): EventDraftPayload => {
  const latitude = form.latitude.trim()
    ? Number(form.latitude)
    : undefined;
  const longitude = form.longitude.trim()
    ? Number(form.longitude)
    : undefined;

  return {
    address: form.address.trim() || undefined,
    bannerUrl: form.bannerUrl.trim() || undefined,
    city: form.city.trim() || undefined,
    country: form.country.trim() || undefined,
    description: form.description.trim() || undefined,
    endAt: form.endAt.trim() || undefined,
    faq: form.faq
      .map((item) => ({
        answer: item.answer.trim(),
        question: item.question.trim(),
      }))
      .filter((item) => item.question && item.answer),
    guidelines: form.guidelines
      .map((item) => item.trim())
      .filter(Boolean),
    latitude:
      latitude != null &&
      Number.isFinite(latitude)
        ? latitude
        : undefined,
    longitude:
      longitude != null &&
      Number.isFinite(longitude)
        ? longitude
        : undefined,
    recurrence: form.recurrenceEnabled
      ? {
          count:
            Number(form.recurrenceCount) || 1,
          frequency: form.recurrenceFrequency,
          interval: 1,
        }
      : undefined,
    startAt: form.startAt.trim() || undefined,
    state: form.state.trim() || undefined,
    tags: form.tags
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
    timezone:
      form.timezone.trim() || "Asia/Kolkata",
    title: form.title.trim() || undefined,
    type: form.type,
    venueName: form.venueName.trim() || undefined,
  };
};

const hasDraftContent = (form: EventFormState) =>
  Boolean(
    form.title.trim() ||
      form.description.trim() ||
      form.venueName.trim() ||
      form.address.trim() ||
      form.bannerUrl.trim()
  );

const isFormCompleteForAutosave = (form: EventFormState) => {
  if (
    !form.title.trim() ||
    !form.description.trim() ||
    !form.address.trim() ||
    !form.startAt.trim() ||
    !form.endAt.trim() ||
    !form.latitude.trim() ||
    !form.longitude.trim()
  ) {
    return false;
  }

  return validateCreateEventPayload(toPayload(form)).isValid;
};

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
  const currentDraft = useAppSelector(selectCurrentEventDraft);
  const draftSaving = useAppSelector(selectIsSavingEventDraft);
  const publishingDraft = useAppSelector(selectIsPublishingEventDraft);
  const publishedDraftEvent = useAppSelector(selectPublishedDraftEvent);
  const places = useAppSelector(selectEventPlaces);
  const placesLoading = useAppSelector(selectEventPlacesLoading);
  const titleSuggestions = useAppSelector(selectEventTitleSuggestions);
  const titleSuggestionsLoading = useAppSelector(selectEventTitleSuggestionsLoading);
  const [form, setForm] = useState<EventFormState>(initialForm);
  const [localBannerUri, setLocalBannerUri] = useState<string | null>(null);
  const [waitingForBannerUpload, setWaitingForBannerUpload] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [selectionKind, setSelectionKind] = useState<SelectionKind | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [guidelineDraft, setGuidelineDraft] = useState("");
  const [faqQuestionDraft, setFaqQuestionDraft] = useState("");
  const [faqAnswerDraft, setFaqAnswerDraft] = useState("");
  const [reviewVisible, setReviewVisible] = useState(false);
  const [draftPublishQueued, setDraftPublishQueued] = useState<string | null>(null);
  const [publishDraftRequested, setPublishDraftRequested] = useState(false);
  const wasSaving = useRef(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const eventId = Array.isArray(id) ? id[0] : id;
  const draftId = currentDraft?.id || null;

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
        faq: detail.faq || [],
        guidelines: detail.guidelines || [],
        latitude: String(detail.latitude ?? ""),
        longitude: String(detail.longitude ?? ""),
        recurrenceCount: String(detail.recurrence?.count || 3),
        recurrenceEnabled: Boolean(detail.recurrence),
        recurrenceFrequency:
          detail.recurrence?.frequency === "daily" ||
          detail.recurrence?.frequency === "monthly" ||
          detail.recurrence?.frequency === "weekly"
            ? detail.recurrence.frequency
            : "weekly",
        startAt: detail.startAt || "",
        state: detail.state || "",
        tags: detail.tags || [],
        timezone: detail.timezone || "Asia/Kolkata",
        title: detail.title || "",
        type: detail.type || "general",
        venueName: detail.venueName || "",
      });
    }
  }, [detail, eventId, mode]);

  const addTag = useCallback(
    (value = tagDraft) => {
      const nextTag = value.trim().toLowerCase();

      if (!nextTag) {
        return;
      }

      setForm((current) => ({
        ...current,
        tags: current.tags.includes(nextTag)
          ? current.tags
          : [...current.tags, nextTag],
      }));
      setTagDraft("");
    },
    [tagDraft]
  );

  const removeTag = useCallback((tag: string) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((item) => item !== tag),
    }));
  }, []);

  const addGuideline = useCallback(() => {
    const nextGuideline = guidelineDraft.trim();

    if (!nextGuideline) {
      return;
    }

    setForm((current) => ({
      ...current,
      guidelines: [...current.guidelines, nextGuideline],
    }));
    setGuidelineDraft("");
  }, [guidelineDraft]);

  const removeGuideline = useCallback((indexToRemove: number) => {
    setForm((current) => ({
      ...current,
      guidelines: current.guidelines.filter((_, index) => index !== indexToRemove),
    }));
  }, []);

  const addFaq = useCallback(() => {
    const question = faqQuestionDraft.trim();
    const answer = faqAnswerDraft.trim();

    if (!question || !answer) {
      Alert.alert("FAQ", "Add both question and answer.");
      return;
    }

    setForm((current) => ({
      ...current,
      faq: [...current.faq, {answer, question}],
    }));
    setFaqQuestionDraft("");
    setFaqAnswerDraft("");
  }, [faqAnswerDraft, faqQuestionDraft]);

  const removeFaq = useCallback((indexToRemove: number) => {
    setForm((current) => ({
      ...current,
      faq: current.faq.filter((_, index) => index !== indexToRemove),
    }));
  }, []);

  const handleFetchTitleSuggestions = useCallback(() => {
    dispatch(
      fetchEventTitleSuggestionsRequest({
        city: form.city || undefined,
        intention: form.description || form.title || undefined,
        type: form.type,
        venueName: form.venueName || undefined,
      })
    );
  }, [dispatch, form.city, form.description, form.title, form.type, form.venueName]);

  const handleApplyTitleSuggestion = useCallback(
    (suggestion: EventTitleSuggestion) => {
      setField("title", suggestion.title);
    },
    [setField]
  );

  const handleSearchPlaces = useCallback(() => {
    const query = form.venueName.trim() || form.city.trim();

    if (query.length < 2) {
      Alert.alert("Venue", "Enter at least two characters to search places.");
      return;
    }

    dispatch(
      fetchEventPlacesRequest({
        city: form.city || undefined,
        limit: 8,
        q: query,
      })
    );
  }, [dispatch, form.city, form.venueName]);

  const handleApplyPlace = useCallback(
    (place: EventPlace) => {
      setForm((current) => ({
        ...current,
        address: place.address || current.address,
        city: place.city || current.city,
        country: place.country || current.country,
        latitude:
          place.latitude != null
            ? String(place.latitude)
            : current.latitude,
        longitude:
          place.longitude != null
            ? String(place.longitude)
            : current.longitude,
        state: place.state || current.state,
        venueName: place.name || current.venueName,
      }));
    },
    []
  );

  useEffect(() => {
    if (waitingForBannerUpload && uploadedMedia?.url) {
      setField("bannerUrl", uploadedMedia.url);
      setWaitingForBannerUpload(false);
    }
  }, [setField, uploadedMedia?.url, waitingForBannerUpload]);

  useEffect(() => {
    if (
      mode !== "create" ||
      !isFormCompleteForAutosave(form) ||
      draftSaving ||
      publishingDraft ||
      uploadingMedia ||
      reviewVisible
    ) {
      return;
    }

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }

    autosaveTimer.current = setTimeout(() => {
      const payload = toDraftPayload(form);

      if (draftId) {
        dispatch(updateEventDraftRequest(draftId, payload));
      } else {
        dispatch(createEventDraftRequest(payload));
      }
    }, 1500);

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, [
    dispatch,
    draftId,
    draftSaving,
    form,
    mode,
    publishingDraft,
    reviewVisible,
    uploadingMedia,
  ]);

  useEffect(() => {
    if (
      publishDraftRequested &&
      !publishingDraft &&
      publishedDraftEvent?.id
    ) {
      setPublishDraftRequested(false);
      router.replace(`/events/${publishedDraftEvent.id}`);
    }
  }, [
    publishDraftRequested,
    publishedDraftEvent?.id,
    publishingDraft,
  ]);

  useEffect(() => {
    if (!draftPublishQueued || draftSaving) {
      return;
    }

    if (error) {
      setDraftPublishQueued(null);
      setPublishDraftRequested(false);
      return;
    }

    setPublishDraftRequested(true);
    dispatch(publishEventDraftRequest(draftPublishQueued));
    setDraftPublishQueued(null);
  }, [dispatch, draftPublishQueued, draftSaving, error]);

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
      setPickerTarget(null);

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

  const handleSaveDraft = useCallback(() => {
    if (!hasDraftContent(form)) {
      Alert.alert("Draft", "Add a title, description, venue, or banner before saving a draft.");
      return;
    }

    const payload = toDraftPayload(form);

    if (draftId) {
      dispatch(updateEventDraftRequest(draftId, payload));
    } else {
      dispatch(createEventDraftRequest(payload));
    }
  }, [dispatch, draftId, form]);

  const handlePublishDraft = useCallback(() => {
    if (!draftId) {
      Alert.alert("Draft", "Save this draft first, then publish it.");
      return;
    }

    const payload = toPayload(form);
    const validation = validateCreateEventPayload(payload);

    if (!validation.isValid) {
      Alert.alert("Event", getFirstValidationError(validation));
      return;
    }

    dispatch(updateEventDraftRequest(draftId, toDraftPayload(form)));
    setDraftPublishQueued(draftId);
  }, [dispatch, draftId, form]);

  const handleSubmit = useCallback(() => {
    const payload = toPayload(form);

    if (mode === "create") {
      const validation = validateCreateEventPayload(payload);

      if (!validation.isValid) {
        Alert.alert("Event", getFirstValidationError(validation));
        return;
      }

      setReviewVisible(true);
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
    dispatch(updateEventRequest({...payload, id: eventId}));
  }, [detail, dispatch, eventId, form, mode]);

  const confirmCreateEvent = useCallback(() => {
    const payload = toPayload(form);
    const validation = validateCreateEventPayload(payload);

    if (!validation.isValid) {
      setReviewVisible(false);
      Alert.alert("Event", getFirstValidationError(validation));
      return;
    }

    setReviewVisible(false);
    setSubmitted(true);
    dispatch(createEventRequest(payload));
  }, [dispatch, form]);

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
          <View style={styles.headerIcon} />
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
          <Pressable
            disabled={titleSuggestionsLoading}
            onPress={handleFetchTitleSuggestions}
            style={[styles.helperAction, titleSuggestionsLoading && styles.disabled]}
          >
            {titleSuggestionsLoading ? (
              <ActivityIndicator color="#6B7280" size="small" />
            ) : (
              <Sparkles color="#6B7280" size={15} />
            )}
            <Text style={styles.helperActionText}>
              {titleSuggestionsLoading ? "Finding titles..." : "Suggest event titles"}
            </Text>
          </Pressable>
          {!!titleSuggestions.length && (
            <View style={styles.suggestionList}>
              {titleSuggestions.slice(0, 4).map((suggestion, index) => (
                <Pressable
                  key={suggestion.id || `${suggestion.title}-${index}`}
                  onPress={() => handleApplyTitleSuggestion(suggestion)}
                  style={styles.suggestionChip}
                >
                  <Text style={styles.suggestionText}>{suggestion.title}</Text>
                </Pressable>
              ))}
            </View>
          )}
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
          <RecurrenceSection
            count={form.recurrenceCount}
            enabled={form.recurrenceEnabled}
            frequency={form.recurrenceFrequency}
            setCount={(value) => setForm((current) => ({...current, recurrenceCount: value}))}
            setEnabled={(value) => setForm((current) => ({...current, recurrenceEnabled: value}))}
            setFrequency={(value) =>
              setForm((current) => ({
                ...current,
                recurrenceFrequency: value,
              }))
            }
          />
        </FormSection>

        <FormSection
          subtitle="Where will the gathering take place?"
          title="Venue / Sacred Space"
        >
          <TextInput
            onChangeText={(value) => setField("venueName", value)}
            placeholder="Venue name, e.g., Sai Mandir Hall"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={form.venueName}
          />
          <Pressable
            disabled={placesLoading}
            onPress={handleSearchPlaces}
            style={[styles.helperAction, placesLoading && styles.disabled]}
          >
            {placesLoading ? (
              <ActivityIndicator color="#6B7280" size="small" />
            ) : (
              <Search color="#6B7280" size={15} />
            )}
            <Text style={styles.helperActionText}>
              {placesLoading ? "Searching venues..." : "Search backend venues"}
            </Text>
          </Pressable>
          {!!places.length && (
            <View style={styles.placeList}>
              {places.slice(0, 5).map((place) => (
                <Pressable
                  key={place.id}
                  onPress={() => handleApplyPlace(place)}
                  style={styles.placeCard}
                >
                  <Text numberOfLines={1} style={styles.placeName}>{place.name}</Text>
                  <Text numberOfLines={2} style={styles.placeAddress}>
                    {place.address || [place.city, place.state].filter(Boolean).join(", ")}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <TextInput
            multiline
            onChangeText={(value) => setField("address", value)}
            placeholder="Full address or directions"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.smallArea]}
            value={form.address}
          />
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
        </FormSection>

        <TagsSection
          addTag={addTag}
          removeTag={removeTag}
          tagDraft={tagDraft}
          tags={form.tags}
          setTagDraft={setTagDraft}
        />
        <GuidelinesSection
          addGuideline={addGuideline}
          guidelineDraft={guidelineDraft}
          guidelines={form.guidelines}
          removeGuideline={removeGuideline}
          setGuidelineDraft={setGuidelineDraft}
        />
        <FaqSection
          addFaq={addFaq}
          answerDraft={faqAnswerDraft}
          faq={form.faq}
          questionDraft={faqQuestionDraft}
          removeFaq={removeFaq}
          setAnswerDraft={setFaqAnswerDraft}
          setQuestionDraft={setFaqQuestionDraft}
        />
        <PreviewSection form={form} />

        {mode === "create" ? (
          <View style={styles.autosaveInline}>
            <View
              style={[
                styles.autosaveInlineDot,
                draftSaving && styles.autosaveInlineDotActive,
              ]}
            />
            <Text style={styles.autosaveInlineText}>
              {draftSaving
                ? "Saving draft..."
                : draftId
                  ? "Draft saved automatically"
                  : isFormCompleteForAutosave(form)
                    ? "Ready to autosave"
                    : "Autosave starts after required details are complete"}
            </Text>
          </View>
        ) : null}

        <View style={styles.actionSection}>
          {mode === "create" ? (
            <Pressable
              disabled={draftSaving || publishingDraft || uploadingMedia}
              onPress={handleSaveDraft}
              style={[
                styles.draftButton,
                (draftSaving || publishingDraft || uploadingMedia) && styles.disabled,
              ]}
            >
              {draftSaving ? <ActivityIndicator color="#1F2937" /> : null}
              <Text style={styles.draftText}>
                {draftId ? "Update Draft" : "Save Draft"}
              </Text>
            </Pressable>
          ) : null}

          {mode === "create" && draftId ? (
            <Pressable
              disabled={draftSaving || publishingDraft || uploadingMedia}
              onPress={handlePublishDraft}
              style={[
                styles.submitButton,
                (draftSaving || publishingDraft || uploadingMedia) && styles.disabled,
              ]}
            >
              {publishingDraft || draftPublishQueued ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : null}
              <Text style={styles.submitText}>
                {publishingDraft || draftPublishQueued
                  ? "Publishing Draft..."
                  : "Publish Saved Draft"}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            disabled={saving || uploadingMedia || publishingDraft}
            onPress={handleSubmit}
            style={[styles.submitButton, (saving || uploadingMedia || publishingDraft) && styles.disabled]}
          >
            {saving ? <ActivityIndicator color="#FFFFFF" /> : null}
            <Text style={styles.submitText}>
              {mode === "create" ? "Review Event" : "Save Changes"}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.discardButton}>
            <Text style={styles.discardText}>Discard Changes</Text>
          </Pressable>
        </View>
      </ScrollView>

      {pickerTarget && (
        <DateTimePicker
          display={Platform.OS === "ios" ? "spinner" : "default"}
          mode={pickerTarget.mode}
          onChange={handleDateChange}
          value={parseDate(form[pickerTarget.field])}
        />
      )}

      <ReviewEventModal
        form={form}
        onClose={() => setReviewVisible(false)}
        onConfirm={confirmCreateEvent}
        saving={saving}
        visible={reviewVisible}
      />

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

function RecurrenceSection({
  count,
  enabled,
  frequency,
  setCount,
  setEnabled,
  setFrequency,
}: {
  count: string;
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  setCount: (value: string) => void;
  setEnabled: (value: boolean) => void;
  setFrequency: (value: "daily" | "weekly" | "monthly") => void;
}) {
  return (
    <View style={styles.recurrenceBox}>
      <Pressable onPress={() => setEnabled(!enabled)} style={styles.recurrenceHeader}>
        <View style={styles.recurrenceIcon}>
          <Repeat2 color="#6B7280" size={16} />
        </View>
        <View style={styles.recurrenceCopy}>
          <Text style={styles.recurrenceTitle}>Recurring Event</Text>
          <Text style={styles.recurrenceText}>
            {enabled ? `Repeats ${frequency} for ${count || "1"} occurrence(s)` : "Make this a regular gathering"}
          </Text>
        </View>
        <View style={[styles.toggleTrack, enabled && styles.toggleTrackActive]}>
          <View style={[styles.toggleThumb, enabled && styles.toggleThumbActive]} />
        </View>
      </Pressable>

      {enabled ? (
        <View style={styles.recurrenceControls}>
          <View style={styles.segmentRow}>
            {(["daily", "weekly", "monthly"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setFrequency(item)}
                style={[styles.segment, frequency === item && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, frequency === item && styles.segmentTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setCount}
            placeholder="Number of occurrences"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={count}
          />
        </View>
      ) : null}
    </View>
  );
}

function ReviewEventModal({
  form,
  onClose,
  onConfirm,
  saving,
  visible,
}: {
  form: EventFormState;
  onClose: () => void;
  onConfirm: () => void;
  saving: boolean;
  visible: boolean;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.reviewSheet}>
          <View style={styles.selectionHeader}>
            <Text style={styles.selectionTitle}>Review Event</Text>
            <Pressable onPress={onClose} style={styles.selectionClose}>
              <X color="#1F2937" size={19} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.reviewTitle}>{form.title || "Untitled event"}</Text>
            <Text style={styles.reviewDescription}>
              {form.description || "No description added yet."}
            </Text>
            <ReviewRow label="Type" value={form.type} />
            <ReviewRow label="Date" value={formatDate(form.startAt)} />
            <ReviewRow label="Time" value={`${formatTime(form.startAt)} - ${formatTime(form.endAt)}`} />
            <ReviewRow label="Venue" value={form.venueName || "Not added"} />
            <ReviewRow label="Address" value={form.address || "Not added"} />
            <ReviewRow label="Location" value={[form.city, form.state, form.country].filter(Boolean).join(", ") || "Not added"} />
            <ReviewRow
              label="Recurrence"
              value={
                form.recurrenceEnabled
                  ? `${form.recurrenceFrequency}, ${form.recurrenceCount || "1"} occurrence(s)`
                  : "One-time event"
              }
            />
            <ReviewRow label="Tags" value={form.tags.length ? form.tags.join(", ") : "None"} />
            <ReviewRow
              label="Guidelines"
              value={form.guidelines.length ? form.guidelines.join("; ") : "None"}
            />
            <ReviewRow label="FAQ" value={form.faq.length ? `${form.faq.length} item(s)` : "None"} />
          </ScrollView>

          <Pressable
            disabled={saving}
            onPress={onConfirm}
            style={[styles.submitButton, saving && styles.disabled]}
          >
            {saving ? <ActivityIndicator color="#FFFFFF" /> : null}
            <Text style={styles.submitText}>Create Event</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ReviewRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

function TagsSection({
  addTag,
  removeTag,
  setTagDraft,
  tagDraft,
  tags,
}: {
  addTag: (value?: string) => void;
  removeTag: (tag: string) => void;
  setTagDraft: (value: string) => void;
  tagDraft: string;
  tags: string[];
}) {
  const suggestedTags = ["devotional", "music", "spiritual", "family", "seva"];

  return (
    <FormSection subtitle="Help devotees discover your event" title="Event Tags">
      <View style={styles.tagsRow}>
        {tags.length ? tags.map((tag) => (
          <View key={tag} style={styles.activeTag}>
            <Text style={styles.activeTagText}>{tag}</Text>
            <Pressable onPress={() => removeTag(tag)} style={styles.tagClose}>
              <X color="#FFFFFF" size={10} />
            </Pressable>
          </View>
        )) : (
          <Text style={styles.optionEmpty}>No tags added yet.</Text>
        )}
      </View>
      <View style={styles.addTagWrap}>
        <TextInput
          onChangeText={setTagDraft}
          onSubmitEditing={() => addTag()}
          placeholder="Add tags..."
          placeholderTextColor="#9CA3AF"
          style={styles.addTagInput}
          value={tagDraft}
        />
        <Pressable onPress={() => addTag()} style={styles.addTagButton}>
          <Plus color="#FFFFFF" size={14} />
        </Pressable>
      </View>
      <Text style={styles.suggestedTitle}>Suggested Tags</Text>
      <View style={styles.suggestionRow}>
        {suggestedTags.map((item) => (
          <Pressable key={item} onPress={() => addTag(item)} style={styles.suggestionChip}>
            <Text style={styles.suggestionText}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </FormSection>
  );
}

function GuidelinesSection({
  addGuideline,
  guidelineDraft,
  guidelines,
  removeGuideline,
  setGuidelineDraft,
}: {
  addGuideline: () => void;
  guidelineDraft: string;
  guidelines: string[];
  removeGuideline: (index: number) => void;
  setGuidelineDraft: (value: string) => void;
}) {
  return (
    <FormSection
      subtitle="These are saved as the event guidelines"
      title="Guidelines for Devotees"
    >
      {guidelines.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.removableRow}>
          <Text style={styles.removableText}>{item}</Text>
          <Pressable onPress={() => removeGuideline(index)} style={styles.roundButtonSmall}>
            <X color="#6B7280" size={15} />
          </Pressable>
        </View>
      ))}
      <View style={styles.addTagWrap}>
        <TextInput
          onChangeText={setGuidelineDraft}
          onSubmitEditing={addGuideline}
          placeholder="e.g., Arrive 10 minutes early"
          placeholderTextColor="#9CA3AF"
          style={styles.addTagInput}
          value={guidelineDraft}
        />
        <Pressable onPress={addGuideline} style={styles.addTagButton}>
          <Plus color="#FFFFFF" size={14} />
        </Pressable>
      </View>
    </FormSection>
  );
}

function FaqSection({
  addFaq,
  answerDraft,
  faq,
  questionDraft,
  removeFaq,
  setAnswerDraft,
  setQuestionDraft,
}: {
  addFaq: () => void;
  answerDraft: string;
  faq: {answer: string; question: string}[];
  questionDraft: string;
  removeFaq: (index: number) => void;
  setAnswerDraft: (value: string) => void;
  setQuestionDraft: (value: string) => void;
}) {
  return (
    <FormSection
      subtitle="Questions and answers are saved with the event detail"
      title="FAQ"
    >
      {faq.map((item, index) => (
        <View key={`${item.question}-${index}`} style={styles.faqCard}>
          <View style={styles.faqCopy}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
          <Pressable onPress={() => removeFaq(index)} style={styles.roundButtonSmall}>
            <X color="#6B7280" size={15} />
          </Pressable>
        </View>
      ))}
      <TextInput
        onChangeText={setQuestionDraft}
        placeholder="Question"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={questionDraft}
      />
      <TextInput
        onChangeText={setAnswerDraft}
        multiline
        placeholder="Answer"
        placeholderTextColor="#9CA3AF"
        style={[styles.input, styles.smallArea]}
        value={answerDraft}
      />
      <Pressable onPress={addFaq} style={styles.dashedButton}>
        <Plus color="#9CA3AF" size={16} />
        <Text style={styles.dashedText}>Add FAQ</Text>
      </Pressable>
    </FormSection>
  );
}

function PreviewSection({form}: {form: EventFormState}) {
  const previewTitle = form.title || "Untitled event";
  const previewLocation = [form.venueName, form.city, form.state]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={styles.previewSection}>
      <View style={styles.previewCard}>
        <View style={styles.previewTop}>
          <View style={styles.previewIcon}>
            <Eye color="#6B7280" size={18} />
          </View>
          <View style={styles.organizerCopy}>
            <Text style={styles.previewTitle}>{previewTitle}</Text>
            <Text style={styles.previewText}>
              {previewLocation || "Location will appear here"} · {formatDate(form.startAt)}
            </Text>
          </View>
        </View>
        <Text numberOfLines={3} style={styles.previewDescription}>
          {form.description || "Description preview will appear here."}
        </Text>
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
  autosaveInline: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  autosaveInlineDot: {
    backgroundColor: "#D1D5DB",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  autosaveInlineDotActive: {
    backgroundColor: "#F97316",
  },
  autosaveInlineText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "800",
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
    flexDirection: "row",
    gap: 8,
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
  faqAnswer: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 4,
  },
  faqCard: {
    alignItems: "flex-start",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  faqCopy: {
    flex: 1,
  },
  faqQuestion: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
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
  helperAction: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 42,
  },
  helperActionText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "900",
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
  placeAddress: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: 4,
  },
  placeCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  placeList: {
    gap: 8,
    marginBottom: 12,
    marginTop: 10,
  },
  placeName: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
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
  previewDescription: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 12,
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
  recurrenceBox: {
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  recurrenceControls: {
    gap: 10,
    marginTop: 12,
  },
  recurrenceCopy: {
    flex: 1,
  },
  recurrenceHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  recurrenceIcon: {
    alignItems: "center",
    backgroundColor: "#F6EFD9",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  recurrenceText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  recurrenceTitle: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "900",
  },
  reviewDescription: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginBottom: 12,
  },
  reviewLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  reviewRow: {
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  reviewSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "86%",
    paddingBottom: 22,
    paddingHorizontal: 16,
  },
  reviewTitle: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 14,
  },
  reviewValue: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
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
  toggleThumb: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    height: 18,
    width: 18,
  },
  toggleThumbActive: {
    transform: [{translateX: 18}],
  },
  toggleTrack: {
    backgroundColor: "#D1D5DB",
    borderRadius: 14,
    padding: 3,
    width: 42,
  },
  toggleTrackActive: {
    backgroundColor: "#F97316",
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
  suggestionList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
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
