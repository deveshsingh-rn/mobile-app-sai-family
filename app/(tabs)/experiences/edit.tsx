import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
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
  Check,
  MapPin,
} from "lucide-react-native";

import {
  ExperienceEditSkeleton,
} from "@/components/experiences";
import {
  fetchExperienceCategoriesRequest,
  fetchExperienceDetailRequest,
  updateExperienceRequest,
} from "@/store/experiences/actions";
import {
  selectExperienceCategories,
  selectExperienceDetail,
  selectExperienceDetailLoading,
} from "@/store/experiences/selectors";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";
import type {
  ExperienceCategory,
} from "@/store/experiences/types";

const CONTENT_LIMIT = 3000;

export default function EditExperienceScreen() {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();
  const dispatch = useAppDispatch();
  const detail = useAppSelector(
    selectExperienceDetail
  );
  const loading = useAppSelector(
    selectExperienceDetailLoading
  );
  const categories = useAppSelector(
    selectExperienceCategories
  );
  const initializedId = useRef<string | null>(null);

  const experienceId = Array.isArray(id)
    ? id[0]
    : id;

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    dispatch(
      fetchExperienceCategoriesRequest()
    );

    if (
      experienceId &&
      detail?.id !== experienceId
    ) {
      dispatch(
        fetchExperienceDetailRequest(
          experienceId
        )
      );
    }
  }, [detail?.id, dispatch, experienceId]);

  useEffect(() => {
    if (
      !detail ||
      detail.id !== experienceId ||
      initializedId.current === detail.id
    ) {
      return;
    }

    initializedId.current = detail.id;
    setContent(detail.content || "");
    setCategory(detail.category || "");
    setLocation(detail.location || "");
  }, [detail, experienceId]);

  const canSave = useMemo(
    () =>
      Boolean(
        experienceId &&
          content.trim() &&
          category
      ),
    [category, content, experienceId]
  );

  const handleSave = () => {
    if (!canSave || !experienceId) {
      return;
    }

    dispatch(
      updateExperienceRequest({
        category,
        content: content.trim(),
        id: experienceId,
        location: location.trim() || undefined,
      })
    );
    router.back();
  };

  if (
    loading &&
    detail?.id !== experienceId
  ) {
    return <ExperienceEditSkeleton />;
  }

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ArrowLeft
            color="#3F2A16"
            size={23}
          />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            YOUR EXPERIENCE
          </Text>
          <Text style={styles.title}>
            Edit post
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Save changes"
          disabled={!canSave}
          onPress={handleSave}
          style={[
            styles.saveButton,
            !canSave &&
              styles.saveButtonDisabled,
          ]}
        >
          <Check color="#FFFFFF" size={20} />
          <Text style={styles.saveText}>
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Your story
            </Text>
            <Text style={styles.characterCount}>
              {content.length}/{CONTENT_LIMIT}
            </Text>
          </View>

          <TextInput
            maxLength={CONTENT_LIMIT}
            multiline
            onChangeText={setContent}
            placeholder="Share your Sai experience..."
            placeholderTextColor="#A8A29E"
            style={styles.storyInput}
            textAlignVertical="top"
            value={content}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Category
          </Text>
          <Text style={styles.sectionHint}>
            Choose the category that best describes this experience.
          </Text>

          <View style={styles.categoryGrid}>
            {categories.map(
              (item: ExperienceCategory) => {
              const selected =
                item.category === category;

              return (
                <Pressable
                  key={item.category}
                  onPress={() =>
                    setCategory(item.category)
                  }
                  style={[
                    styles.categoryChip,
                    selected &&
                      styles.categoryChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selected &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selected ? (
                    <Check
                      color="#FFFFFF"
                      size={16}
                    />
                  ) : null}
                </Pressable>
              );
              }
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.locationLabel}>
            <MapPin
              color="#F97316"
              size={20}
            />
            <Text style={styles.sectionTitle}>
              Location
            </Text>
          </View>

          <TextInput
            autoCapitalize="words"
            onChangeText={setLocation}
            placeholder="City, state or sacred place"
            placeholderTextColor="#A8A29E"
            returnKeyType="done"
            style={styles.locationInput}
            value={location}
          />
        </View>

        <Text style={styles.mediaNote}>
          Existing photos and videos remain attached. Media replacement can be added in a future update.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFCF7",
    flex: 1,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FFFCF7",
    borderBottomColor: "#E9D8BD",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingBottom: 13,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 20,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12,
  },
  eyebrow: {
    color: "#C2410C",
    fontSize: 11,
    fontWeight: "900",
  },
  title: {
    color: "#292524",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 1,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    height: 44,
    paddingHorizontal: 15,
  },
  saveButtonDisabled: {
    backgroundColor: "#D6D3D1",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  content: {
    padding: 18,
    paddingBottom: 48,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E9D8BD",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 15,
    padding: 16,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#292524",
    fontSize: 17,
    fontWeight: "900",
  },
  sectionHint: {
    color: "#78716C",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  characterCount: {
    color: "#A8A29E",
    fontSize: 12,
    fontWeight: "700",
  },
  storyInput: {
    color: "#292524",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 26,
    minHeight: 180,
    paddingTop: 14,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 15,
  },
  categoryChip: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  categoryChipSelected: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  categoryText: {
    color: "#9A3412",
    fontSize: 14,
    fontWeight: "800",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  locationLabel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  locationInput: {
    backgroundColor: "#FAFAF9",
    borderColor: "#E7E5E4",
    borderRadius: 12,
    borderWidth: 1,
    color: "#292524",
    fontSize: 16,
    fontWeight: "600",
    height: 52,
    marginTop: 13,
    paddingHorizontal: 14,
  },
  mediaNote: {
    color: "#78716C",
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 6,
    textAlign: "center",
  },
});
