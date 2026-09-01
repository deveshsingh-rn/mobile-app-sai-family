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
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { City, Country, State } from "country-state-city";

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
import { SanghaScreenHeader } from "@/components/sangha/SanghaScreenHeader";
import { SanghaLocationSelect } from "@/components/sangha/SanghaLocationSelect";
import { SanghaColors, SanghaRadius, SanghaShadow } from "@/constants/sangha-theme";

const purposes = [
  { label: "Seva", value: "seva" },
  { label: "Bhajan", value: "bhajan" },
  { label: "Satsang", value: "satsang" },
  { label: "City Chapter", value: "city_chapter" },
  { label: "Study", value: "study" },
  { label: "Online Global", value: "online_global" },
  { label: "General", value: "general" },
];

const privacyOptions = [
  { label: "Public", value: "public", helper: "Anyone can discover and join." },
  { label: "Private", value: "private", helper: "People request access; admins approve." },
  { label: "Invite Only", value: "invite_only", helper: "Only invited devotees can join." },
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
  const [countryCode, setCountryCode] = useState("IN");
  const [stateCode, setStateCode] = useState("");
  const countryOptions = useMemo(
    () =>
      Country.getAllCountries()
        .map((item) => ({ label: item.name, value: item.isoCode }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );
  const stateOptions = useMemo(
    () =>
      State.getStatesOfCountry(countryCode)
        .map((item) => ({ label: item.name, value: item.isoCode }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [countryCode]
  );
  const cityOptions = useMemo(
    () =>
      City.getCitiesOfState(countryCode, stateCode)
        .map((item, index) => ({
          label: item.name,
          value: `${item.name}-${item.latitude || index}-${item.longitude || index}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [countryCode, stateCode]
  );
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
    const matchedCountry = Country.getAllCountries().find(
      (item) => item.name.toLowerCase() === (group.country || "India").toLowerCase()
    );
    const nextCountryCode = matchedCountry?.isoCode || "IN";
    const matchedState = State.getStatesOfCountry(nextCountryCode).find(
      (item) => item.name.toLowerCase() === (group.state || "").toLowerCase()
    );
    setCountryCode(nextCountryCode);
    setStateCode(matchedState?.isoCode || "");
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
      ...(mode === "edit" && group?.bannerUrl
        ? { bannerUrl: group.bannerUrl }
        : {}),
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
    <SafeAreaView style={{ backgroundColor: SanghaColors.background, flex: 1 }}>
      <StatusBar backgroundColor={SanghaColors.background} barStyle="dark-content" />
      <SanghaScreenHeader
        onBack={() => router.back()}
        subtitle={mode === "edit" ? "Update community details" : "Build a focused community space"}
        title={mode === "edit" ? "Edit Sangha" : "Create Sangha"}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
      >
        <View
          style={{
            backgroundColor: SanghaColors.surface,
            borderColor: SanghaColors.border,
            borderRadius: SanghaRadius.card,
            borderWidth: 1,
            marginTop: 8,
            padding: 18,
            ...SanghaShadow,
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
          <Text
            style={{
              color: SanghaColors.inkTertiary,
              fontSize: 13,
              fontWeight: "700",
              lineHeight: 19,
              marginBottom: 18,
              marginTop: 9,
            }}
          >
            {privacyOptions.find((item) => item.value === privacy)?.helper}
          </Text>

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
          <Text
            style={{
              color: SanghaColors.ink,
              fontSize: 17,
              fontWeight: "900",
              marginBottom: 4,
              marginTop: 2,
            }}
          >
            Community location
          </Text>
          <Text
            style={{
              color: SanghaColors.inkTertiary,
              fontSize: 13,
              fontWeight: "700",
              lineHeight: 19,
              marginBottom: 14,
            }}
          >
            This helps nearby devotees discover the right community. Exact address is not shared.
          </Text>
          <SanghaLocationSelect
            label="Country"
            onSelect={(option) => {
              setCountry(option.label);
              setCountryCode(option.value);
              setStateName("");
              setStateCode("");
              setCity("");
            }}
            options={countryOptions}
            placeholder="Select country"
            value={country}
          />
          <SanghaLocationSelect
            disabled={!countryCode || stateOptions.length === 0}
            label="State"
            onSelect={(option) => {
              setStateName(option.label);
              setStateCode(option.value);
              setCity("");
            }}
            options={stateOptions}
            placeholder={stateOptions.length ? "Select state" : "No states available"}
            value={stateName}
          />
          <SanghaLocationSelect
            disabled={!stateCode || cityOptions.length === 0}
            label="City"
            onSelect={(option) => setCity(option.label)}
            options={cityOptions}
            placeholder={cityOptions.length ? "Select city" : "Select state first"}
            value={city}
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
              backgroundColor: canSubmit ? SanghaColors.saffron : SanghaColors.border,
              borderRadius: SanghaRadius.control,
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
        backgroundColor: active ? SanghaColors.saffron : SanghaColors.saffronSoft,
        borderColor: active ? SanghaColors.saffron : SanghaColors.saffronBorder,
        borderRadius: SanghaRadius.control,
        borderWidth: 1,
        paddingHorizontal: 13,
        paddingVertical: 9,
      }}
    >
      <Text style={{ color: active ? SanghaColors.surface : SanghaColors.saffronPressed, fontSize: 13, fontWeight: "800" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const labelStyle = {
  color: SanghaColors.inkSecondary,
  fontSize: 13,
  fontWeight: "900" as const,
  marginBottom: 8,
};

const inputStyle = {
  backgroundColor: SanghaColors.surfaceMuted,
  borderColor: SanghaColors.border,
  borderRadius: SanghaRadius.control,
  borderWidth: 1,
  color: SanghaColors.ink,
  fontSize: 15,
  fontWeight: "700" as const,
  height: 48,
  paddingHorizontal: 14,
};
