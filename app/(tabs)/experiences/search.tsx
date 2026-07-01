import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { FlashList } from "@shopify/flash-list";

import {
  Mic,
  Search,
  Sparkles,
  UserCircle2,
  X,
} from "lucide-react-native";

import {
  ExperienceCard,
  ExperienceCardSkeleton,
  ExperienceTopTabs,
} from "@/components/experiences";

import {
  clearExperienceSearch,
  searchExperiencesRequest,
  toggleBookmarkRequest,
  toggleLikeRequest,
  toggleRepostRequest,
} from "@/store/experiences/actions";

import {
  selectExperienceSearchError,
  selectExperienceSearchHasMore,
  selectExperienceSearchLoading,
  selectExperienceSearchResults,
} from "@/store/experiences/selectors";

import { selectDevoteeAccount } from "@/store/devotee-account/selectors";

import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

const LIMIT = 20;
const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 450;

export default function SearchExperiencesScreen() {
  const dispatch = useAppDispatch();

  const account = useAppSelector(
    selectDevoteeAccount
  );

  const results = useAppSelector(
    selectExperienceSearchResults
  );

  const loading = useAppSelector(
    selectExperienceSearchLoading
  );

  const hasMore = useAppSelector(
    selectExperienceSearchHasMore
  );

  const error = useAppSelector(
    selectExperienceSearchError
  );

  const [query, setQuery] =
    useState("");

  const [offset, setOffset] =
    useState(0);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [voiceError, setVoiceError] =
    useState<string | null>(null);

  const debounceRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const normalizedQuery =
    useMemo(
      () => query.trim(),
      [query]
    );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(
        debounceRef.current
      );
    }

    if (
      normalizedQuery.length <
      MIN_QUERY_LENGTH
    ) {
      setOffset(0);
      dispatch(
        clearExperienceSearch()
      );
      return;
    }

    debounceRef.current =
      setTimeout(() => {
        setOffset(0);

        dispatch(
          searchExperiencesRequest({
            limit: LIMIT,
            offset: 0,
            q: normalizedQuery,
          })
        );
      }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(
          debounceRef.current
        );
      }
    };
  }, [dispatch, normalizedQuery]);

  const handleClear = useCallback(() => {
    setQuery("");
    setOffset(0);
    setVoiceError(null);
    dispatch(
      clearExperienceSearch()
    );
  }, [dispatch]);

  const handleVoiceSearch =
    useCallback(() => {
      setListening(false);
      setVoiceError(
        "Voice search needs a custom development build. Please use text search for now."
      );
    }, []);

  const handleLoadMore =
    useCallback(() => {
      if (
        loading ||
        loadingMore ||
        normalizedQuery.length <
          MIN_QUERY_LENGTH ||
        !hasMore
      ) {
        return;
      }

      const nextOffset =
        offset + LIMIT;

      setLoadingMore(true);
      setOffset(nextOffset);

      dispatch(
        searchExperiencesRequest({
          limit: LIMIT,
          offset: nextOffset,
          q: normalizedQuery,
        })
      );

      setTimeout(() => {
        setLoadingMore(false);
      }, 600);
    }, [
      dispatch,
      loading,
      loadingMore,
      hasMore,
      normalizedQuery,
      offset,
    ]);

  const handleLike = useCallback(
    (experienceId: string) => {
      if (!account?.id) {
        return;
      }

      dispatch(
        toggleLikeRequest(
          experienceId,
          account.id
        )
      );
    },
    [account?.id, dispatch]
  );

  const handleBookmark = useCallback(
    (experienceId: string) => {
      if (!account?.id) {
        return;
      }

      dispatch(
        toggleBookmarkRequest(
          experienceId,
          account.id
        )
      );
    },
    [account?.id, dispatch]
  );

  const handleRepost = useCallback(
    (experienceId: string) => {
      if (!account?.id) {
        return;
      }

      dispatch(
        toggleRepostRequest(
          experienceId,
          account.id
        )
      );
    },
    [account?.id, dispatch]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <ExperienceCard
        item={item}
        onLike={() =>
          handleLike(item.id)
        }
        onBookmark={() =>
          handleBookmark(item.id)
        }
        onRepost={() =>
          handleRepost(item.id)
        }
      />
    ),
    [
      handleBookmark,
      handleLike,
      handleRepost,
    ]
  );

  const renderEmpty = () => {
    if (
      loading &&
      normalizedQuery.length >=
        MIN_QUERY_LENGTH
    ) {
      return (
        <ExperienceCardSkeleton count={2} />
      );
    }

    if (
      normalizedQuery.length <
      MIN_QUERY_LENGTH
    ) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>
            Search divine experiences
          </Text>
          <Text style={styles.stateText}>
            Type at least 2 letters to find posts by content, category, or devotee.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.stateBox}>
        <Text style={styles.stateTitle}>
          No results found
        </Text>
        <Text style={styles.stateText}>
          Try a different word or a broader search.
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <ActivityIndicator
          color="#b97813"
          size="small"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <UserCircle2
                size={23}
                color="#1F2937"
                strokeWidth={1.8}
              />
            </View>

            <View>
              <Text style={styles.eyebrow}>Discover</Text>
              <Text style={styles.headerTitle}>
                Search
              </Text>
            </View>
          </View>

          <View style={styles.primaryAction}>
            <Sparkles
              size={17}
              color="#FFFFFF"
              strokeWidth={2}
            />
          </View>
        </View>

        <ExperienceTopTabs activeTab="search" />

        <View style={styles.searchWrap}>
          <View style={styles.inputBox}>
            <Search
              size={19}
              color="#6B7280"
            />

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="never"
              onChangeText={setQuery}
              placeholder="Search miracles, prayers, dreams..."
              placeholderTextColor="#a98b54"
              returnKeyType="search"
              style={styles.input}
              value={query}
            />

            {!!query.length && (
              <Pressable
                hitSlop={10}
                onPress={handleClear}
                style={styles.clearButton}
              >
                <X
                  size={18}
                  color="#7a5311"
                />
              </Pressable>
            )}

            <Pressable
              accessibilityLabel={
                listening
                  ? "Stop voice search"
                  : "Start voice search"
              }
              hitSlop={10}
              onPress={handleVoiceSearch}
              style={[
                styles.micButton,
                listening &&
                  styles.micButtonActive,
              ]}
            >
              <Mic
                size={18}
                color={
                  listening
                    ? "#fffaf0"
                    : "#7a5311"
                }
              />
            </Pressable>
          </View>

          {!!(error || voiceError) && (
            <Text style={styles.errorText}>
              {voiceError || error}
            </Text>
          )}

          {listening && (
            <Text style={styles.listeningText}>
              Listening...
            </Text>
          )}
        </View>
      </View>

      <FlashList
        contentContainerStyle={
          styles.listContent
        }
        data={results}
        keyExtractor={(item) =>
          item.id
        }
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          renderEmpty
        }
        ListFooterComponent={
          renderFooter
        }
        onEndReached={
          handleLoadMore
        }
        onEndReachedThreshold={0.4}
        renderItem={renderItem}
        showsVerticalScrollIndicator={
          false
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },

  fixedTop: {
    backgroundColor: "#FFFCF7",
    borderBottomColor: "#E9D8BD",
    borderBottomWidth: 1,
    paddingTop: 54,
    zIndex: 10,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingHorizontal: 16,
  },

  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },

  headerIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  eyebrow: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "900",
  },

  headerTitle: {
    color: "#1F2937",
    fontSize: 24,
    fontWeight: "900",
  },

  primaryAction: {
    alignItems: "center",
    backgroundColor: "#23201D",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  searchWrap: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  inputBox: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: 15,
  },

  input: {
    color: "#1F2937",
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
    minHeight: 54,
    paddingVertical: 0,
  },

  clearButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  micButton: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 19,
    height: 38,
    justifyContent: "center",
    marginLeft: 6,
    width: 38,
  },

  micButtonActive: {
    backgroundColor: "#F97316",
  },

  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },

  listeningText: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 8,
  },

  listContent: {
    paddingBottom: 120,
    paddingTop: 16,
  },

  stateBox: {
    alignItems: "center",
    marginTop: 90,
    paddingHorizontal: 28,
  },

  stateTitle: {
    color: "#1F2937",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },

  stateText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },

  footer: {
    paddingVertical: 24,
  },
});
