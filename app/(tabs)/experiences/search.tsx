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
        <View style={styles.stateBox}>
          <ActivityIndicator
            color="#b97813"
            size="large"
          />
        </View>
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
          <UserCircle2
            size={32}
            color="#8e5d10"
            strokeWidth={1.5}
          />

          <Text style={styles.headerTitle}>
            Leela Search
          </Text>

          <Sparkles
            size={24}
            color="#8e5d10"
            strokeWidth={1.5}
          />
        </View>

        <ExperienceTopTabs activeTab="search" />

        <View style={styles.searchWrap}>
          <View style={styles.inputBox}>
            <Search
              size={19}
              color="#9a762e"
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
    backgroundColor: "#fffaf0",
  },

  fixedTop: {
    backgroundColor:
      "rgba(255,250,240,0.97)",
    borderBottomColor:
      "rgba(224,193,138,0.24)",
    borderBottomWidth: 1,
    paddingTop: 54,
    zIndex: 10,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },

  headerTitle: {
    color: "#4e3309",
    fontSize: 20,
    fontWeight: "800",
  },

  searchWrap: {
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  inputBox: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#dfc684",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 14,
  },

  input: {
    color: "#3f2b0c",
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
    minHeight: 50,
    paddingVertical: 0,
  },

  clearButton: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  micButton: {
    alignItems: "center",
    backgroundColor:
      "rgba(180,126,28,0.12)",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    marginLeft: 6,
    width: 34,
  },

  micButtonActive: {
    backgroundColor: "#b97813",
  },

  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },

  listeningText: {
    color: "#8e5d10",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 8,
  },

  listContent: {
    paddingBottom: 120,
    paddingTop: 14,
  },

  stateBox: {
    alignItems: "center",
    marginTop: 90,
    paddingHorizontal: 28,
  },

  stateTitle: {
    color: "#4e3309",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  stateText: {
    color: "#79571b",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },

  footer: {
    paddingVertical: 24,
  },
});
