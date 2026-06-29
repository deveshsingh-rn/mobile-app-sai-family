import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  archiveSanghaGroupRequest,
  createSanghaGroupRequest,
  fetchSanghaGroupDetailRequest,
  updateSanghaGroupRequest,
} from "@/store/sangha/actions";
import {
  selectCreatedSanghaGroup,
  selectCreatingSanghaGroup,
  selectIsSanghaActionPending,
  selectSanghaError,
  selectSanghaGroupDetail,
  selectUpdatedSanghaGroup,
  selectUpdatingSanghaGroup,
} from "@/store/sangha/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const purposes = [
  { label: "Seva", value: "seva" },
  { label: "Bhajan", value: "bhajan" },
  { label: "Satsang", value: "satsang" },
  { label: "City Chapter", value: "city_chapter" },
  { label: "Study", value: "study" },
  { label: "General", value: "general" },
];

const privacyOptions = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
  { label: "Invite Only", value: "invite_only" },
];

export default function SanghaCreateGroupScreen({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const creating = useAppSelector(selectCreatingSanghaGroup);
  const createdGroup = useAppSelector(selectCreatedSanghaGroup);
  const updating = useAppSelector(selectUpdatingSanghaGroup);
  const updatedGroup = useAppSelector(selectUpdatedSanghaGroup);
  const group = useAppSelector(selectSanghaGroupDetail);
  const error = useAppSelector(selectSanghaError);
  const archiving = useAppSelector((state) =>
    selectIsSanghaActionPending(state, id)
  );
  const submitting = creating || updating || archiving;
  const [submitted, setSubmitted] = useState(false);
  const [archiveSubmitted, setArchiveSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("seva");
  const [privacy, setPrivacy] = useState("public");
  const [description, setDescription] = useState("");
  const [purposeText, setPurposeText] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("India");
  const canSubmit = useMemo(
    () =>
      name.trim().length >= 3 &&
      description.trim().length >= 10 &&
      !submitting,
    [description, name, submitting]
  );

  useEffect(() => {
    if (mode === "edit" && id) {
      dispatch(fetchSanghaGroupDetailRequest(id));
    }
  }, [dispatch, id, mode]);

  useEffect(() => {
    if (mode !== "edit" || hydrated || !group) {
      return;
    }

    setName(group.name || "");
    setPurpose(group.purpose || "seva");
    setPrivacy(group.privacy || "public");
    setDescription(group.description || "");
    setPurposeText(group.purposeText || "");
    setGuidelines(group.guidelines || "");
    setCity(group.city || "");
    setStateName(group.state || "");
    setCountry(group.country || "India");
    setHydrated(true);
  }, [group, hydrated, mode]);

  useEffect(() => {
    if (!submitted) {
      return;
    }

    if (mode === "create" && createdGroup?.id) {
      router.replace({
        pathname: "/group-details",
        params: { id: createdGroup.id },
      });
    }

    if (mode === "edit" && updatedGroup?.id) {
      router.back();
    }
  }, [createdGroup?.id, mode, submitted, updatedGroup?.id]);

  useEffect(() => {
    if (archiveSubmitted && id && !archiving && !error) {
      router.replace("/sangha-hub");
    }
  }, [archiveSubmitted, archiving, error, id]);

  const submit = () => {
    if (!canSubmit) {
      return;
    }

    setSubmitted(true);
    const payload = {
      bannerUrl:
        "https://saifamily21219878.blob.core.windows.net/sai-media/sangha/banner-placeholder.png",
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      description: description.trim(),
      guidelines: guidelines.trim() || undefined,
      name: name.trim(),
      privacy,
      purpose,
      purposeText: purposeText.trim() || undefined,
      state: stateName.trim() || undefined,
    };

    if (mode === "edit" && id) {
      dispatch(updateSanghaGroupRequest({ ...payload, groupId: id }));
      return;
    }

    dispatch(createSanghaGroupRequest(payload));
  };

  const confirmArchive = () => {
    if (!id || archiving) {
      return;
    }

    Alert.alert(
      "Archive group",
      "This will archive the Sangha group for members.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => {
            setArchiveSubmitted(true);
            dispatch(archiveSanghaGroupRequest(id));
          },
          style: "destructive",
          text: "Archive",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#FAFAF9", flex: 1 }}>
      <StatusBar backgroundColor="#FAFAF9" barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: "#111827", fontSize: 27, fontWeight: "900" }}>
              {mode === "edit" ? "Edit Sangha" : "Create Sangha"}
            </Text>
            <Text style={{ color: "#6B7280", fontSize: 14, fontWeight: "700", marginTop: 3 }}>
              {mode === "edit" ? "Update community details" : "Build a focused community space"}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#EEE7DD",
            borderRadius: 26,
            borderWidth: 1,
            marginTop: 22,
            padding: 18,
          }}
        >
          <Field
            label="Group Name"
            onChangeText={setName}
            placeholder="Pune Thursday Seva Circle"
            value={name}
          />
          <MultilineField
            label="Description"
            onChangeText={setDescription}
            placeholder="Weekly seva planning and Sai family support group in Pune."
            value={description}
          />

          <Text style={labelStyle}>Purpose</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9 }}>
            {purposes.map((item) => (
              <ChoiceChip
                active={purpose === item.value}
                key={item.value}
                label={item.label}
                onPress={() => setPurpose(item.value)}
              />
            ))}
          </View>

          <Text style={[labelStyle, { marginTop: 18 }]}>Privacy</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9 }}>
            {privacyOptions.map((item) => (
              <ChoiceChip
                active={privacy === item.value}
                key={item.value}
                label={item.label}
                onPress={() => setPrivacy(item.value)}
              />
            ))}
          </View>

          <MultilineField
            label="Purpose Text"
            onChangeText={setPurposeText}
            placeholder="Local seva coordination for Sai devotees."
            value={purposeText}
          />
          <MultilineField
            label="Guidelines"
            onChangeText={setGuidelines}
            placeholder="Be kind, respectful, and service-minded."
            value={guidelines}
          />
          <Field
            label="City"
            onChangeText={setCity}
            placeholder="Pune"
            value={city}
          />
          <Field
            label="State"
            onChangeText={setStateName}
            placeholder="Maharashtra"
            value={stateName}
          />
          <Field
            label="Country"
            onChangeText={setCountry}
            placeholder="India"
            value={country}
          />

          {error ? (
            <Text style={{ color: "#9F1239", fontSize: 13, fontWeight: "800", lineHeight: 20, marginTop: 12 }}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.88}
            disabled={!canSubmit}
            onPress={submit}
            style={{
              alignItems: "center",
              backgroundColor: canSubmit ? "#F97316" : "#D1D5DB",
              borderRadius: 18,
              height: 52,
              justifyContent: "center",
              marginTop: 18,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "900" }}>
                {mode === "edit" ? "Save Changes" : "Create Group"}
              </Text>
            )}
          </TouchableOpacity>

          {mode === "edit" ? (
            <TouchableOpacity
              activeOpacity={0.88}
              disabled={submitting}
              onPress={confirmArchive}
              style={{
                alignItems: "center",
                borderColor: "#FCA5A5",
                borderRadius: 18,
                borderWidth: 1,
                height: 50,
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <Text style={{ color: "#9F1239", fontSize: 15, fontWeight: "900" }}>
                Archive Group
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  onChangeText,
  placeholder,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={inputStyle}
        value={value}
      />
    </View>
  );
}

function MultilineField(props: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={labelStyle}>{props.label}</Text>
      <TextInput
        multiline
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#9CA3AF"
        style={[inputStyle, { height: 92, paddingTop: 13, textAlignVertical: "top" }]}
        value={props.value}
      />
    </View>
  );
}

function ChoiceChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: active ? "#F97316" : "#FFF7ED",
        borderColor: active ? "#F97316" : "#FED7AA",
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 13,
        paddingVertical: 9,
      }}
    >
      <Text style={{ color: active ? "#FFFFFF" : "#9A3412", fontSize: 13, fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const labelStyle = {
  color: "#374151",
  fontSize: 13,
  fontWeight: "900" as const,
  marginBottom: 8,
};

const inputStyle = {
  backgroundColor: "#F8F6F2",
  borderColor: "#EEE7DD",
  borderRadius: 16,
  borderWidth: 1,
  color: "#111827",
  fontSize: 15,
  fontWeight: "700" as const,
  height: 48,
  paddingHorizontal: 14,
};
