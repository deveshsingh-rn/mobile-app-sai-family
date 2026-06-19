import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  addDirectoryRecentSearchRequest,
  clearDirectoryRecentSearchesRequest,
  fetchDirectoryHomeRequest,
  fetchDirectoryRecentSearchesRequest,
  fetchDirectorySuggestionsRequest,
  searchDirectoryRequest,
  selectDirectoryHome,
  selectDirectoryHomeLoading,
  selectDirectoryRecentSearches,
  selectDirectoryRecentSearchesLoading,
  selectDirectorySearchLoading,
  selectDirectorySearchResults,
  selectDirectorySearchSuggestions,
} from '@/store/directory';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type {
  DirectoryCategory,
  DirectoryListing,
  DirectorySearchSuggestion,
} from '@/store/directory/types';

function normalizeKey(value?: string | null) {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function categoryVisual(category: DirectoryCategory) {
  const key = normalizeKey(category.slug || category.name);

  if (key.includes('health')) {
    return {
      bg: '#EEF5FF',
      icon: 'medical',
      iconColor: '#3B82F6',
      iconType: 'Ionicons',
    };
  }

  if (key.includes('organic') || key.includes('food')) {
    return {
      bg: '#ECFDF5',
      icon: 'leaf',
      iconColor: '#22C55E',
      iconType: 'Feather',
    };
  }

  if (key.includes('education')) {
    return {
      bg: '#F5ECFF',
      icon: 'book-open',
      iconColor: '#A855F7',
      iconType: 'Feather',
    };
  }

  if (
    key.includes('temple') ||
    key.includes('spiritual')
  ) {
    return {
      bg: '#FFF1E8',
      icon: 'om',
      iconColor: '#F97316',
      iconType: 'MaterialCommunityIcons',
    };
  }

  return {
    bg: '#FFF7ED',
    icon: 'storefront',
    iconColor: '#F97316',
    iconType: 'MaterialCommunityIcons',
  };
}

function renderCategoryIcon(category: DirectoryCategory) {
  const visual = categoryVisual(category);

  if (visual.iconType === 'Feather') {
    return (
      <Feather
        name={visual.icon as any}
        size={24}
        color={visual.iconColor}
      />
    );
  }

  if (visual.iconType === 'Ionicons') {
    return (
      <Ionicons
        name={visual.icon as any}
        size={24}
        color={visual.iconColor}
      />
    );
  }

  return (
    <MaterialCommunityIcons
      name={visual.icon as any}
      size={27}
      color={visual.iconColor}
    />
  );
}

function listingImage(listing: DirectoryListing) {
  return (
    listing.logoUrl ||
    listing.bannerUrl ||
    listing.gallery?.[0]?.url ||
    listing.owner?.avatarUrl ||
    listing.owner?.profileImageUrl ||
    listing.ownerAvatarUrl ||
    null
  );
}

function listingSubtitle(listing: DirectoryListing) {
  const bits = [
    listing.categoryName,
    listing.city,
    listing.averageRating
      ? `${listing.averageRating.toFixed(1)} rating`
      : null,
  ].filter(Boolean);

  return bits.join(' • ') || 'Trusted community service';
}

function openListing(listing: DirectoryListing) {
  router.push({
    pathname: '/directory/business-details',
    params: {
      id: listing.id,
    },
  });
}

function SearchResultCard({
  item,
}: {
  item: DirectoryListing;
}) {
  const image = listingImage(item);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => openListing(item)}
      style={{
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#ECECEC',
        borderRadius: 18,
        borderWidth: 1,
        elevation: 2,
        flexDirection: 'row',
        marginBottom: 12,
        minHeight: 82,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
          height: 4,
          width: 0,
        },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      }}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={{
            borderRadius: 16,
            height: 56,
            width: 56,
          }}
        />
      ) : (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#FFF7ED',
            borderRadius: 16,
            height: 56,
            justifyContent: 'center',
            width: 56,
          }}>
          <MaterialCommunityIcons
            name="storefront"
            size={24}
            color="#F97316"
          />
        </View>
      )}

      <View
        style={{
          flex: 1,
          marginLeft: 12,
        }}>
        <Text
          numberOfLines={1}
          style={{
            color: '#111827',
            fontSize: 15,
            fontWeight: '800',
          }}>
          {item.businessName}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: '#6B7280',
            fontSize: 12,
            fontWeight: '600',
            marginTop: 6,
          }}>
          {listingSubtitle(item)}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#F97316"
      />
    </TouchableOpacity>
  );
}

function SuggestionChip({
  item,
  onPress,
}: {
  item: DirectorySearchSuggestion;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#ECECEC',
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        height: 40,
        marginBottom: 10,
        marginRight: 10,
        paddingHorizontal: 14,
      }}>
      <Ionicons
        name="search"
        size={15}
        color="#9CA3AF"
      />

      <Text
        numberOfLines={1}
        style={{
          color: '#4B5563',
          fontSize: 13,
          fontWeight: '600',
          marginLeft: 8,
          maxWidth: 190,
        }}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

const SearchScreen = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');

  const home = useAppSelector(selectDirectoryHome);
  const homeLoading = useAppSelector(
    selectDirectoryHomeLoading
  );
  const recentSearches = useAppSelector(
    selectDirectoryRecentSearches
  );
  const recentLoading = useAppSelector(
    selectDirectoryRecentSearchesLoading
  );
  const results = useAppSelector(
    selectDirectorySearchResults
  );
  const searchLoading = useAppSelector(
    selectDirectorySearchLoading
  );
  const suggestions = useAppSelector(
    selectDirectorySearchSuggestions
  );

  const query = search.trim();
  const popularCategories = useMemo(
    () =>
      (
        home?.popularCategories?.length
          ? home.popularCategories
          : home?.categories || []
      ).slice(0, 4),
    [home]
  );
  const trendingListings = useMemo(
    () => (home?.trendingListings || []).slice(0, 5),
    [home]
  );

  useEffect(() => {
    dispatch(fetchDirectoryHomeRequest({ limit: 10 }));
    dispatch(
      fetchDirectoryRecentSearchesRequest({ limit: 10 })
    );
  }, [dispatch]);

  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch(
        fetchDirectorySuggestionsRequest({
          limit: 8,
          q: query,
        })
      );
      dispatch(
        searchDirectoryRequest({
          limit: 20,
          offset: 0,
          q: query,
        })
      );
    }, 350);

    return () => clearTimeout(timer);
  }, [dispatch, query]);

  const submitSearch = useCallback(
    (value = query) => {
      const clean = value.trim();

      if (!clean) {
        return;
      }

      setSearch(clean);
      dispatch(
        addDirectoryRecentSearchRequest({
          query: clean,
        })
      );
      dispatch(
        searchDirectoryRequest({
          limit: 20,
          offset: 0,
          q: clean,
        })
      );
    },
    [dispatch, query]
  );

  const openCategory = (category: DirectoryCategory) => {
    router.push({
      pathname: '/directory/category',
      params: {
        category: category.name,
        categoryId: category.id,
        categorySlug: category.slug,
      },
    });
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: '#FAFAFA',
        flex: 1,
      }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FAFAFA"
      />

      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          elevation: 3,
          paddingBottom: 20,
          paddingHorizontal: 16,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: {
            height: 10,
            width: 0,
          },
          shadowOpacity: 0.04,
          shadowRadius: 16,
        }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.back()}
            style={{
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              borderRadius: 22,
              height: 44,
              justifyContent: 'center',
              width: 56,
            }}>
            <Ionicons
              name="arrow-back"
              size={22}
              color="#374151"
            />
          </TouchableOpacity>

          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#F9FAFB',
              borderColor: '#E5E7EB',
              borderRadius: 24,
              borderWidth: 1.5,
              flex: 1,
              flexDirection: 'row',
              height: 48,
              marginLeft: 12,
              paddingHorizontal: 16,
            }}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => submitSearch()}
              placeholder="Search businesses, categories."
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              style={{
                color: '#111827',
                flex: 1,
                fontSize: 15,
                fontWeight: '500',
                marginLeft: 10,
              }}
            />

            {search ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSearch('')}>
                <Ionicons
                  name="close-circle"
                  size={19}
                  color="#CBD5E1"
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
          paddingHorizontal: 22,
          paddingTop: 20,
        }}>
        {query.length >= 2 ? (
          <View>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: '#111827',
                  fontSize: 17,
                  fontWeight: '800',
                }}>
                Search Results
              </Text>

              {searchLoading ? (
                <ActivityIndicator
                  color="#F97316"
                  size="small"
                />
              ) : null}
            </View>

            {suggestions.length > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginTop: 16,
                }}>
                {suggestions.map((item, index) => (
                  <SuggestionChip
                    key={`${item.type}-${item.id || item.label}-${index}`}
                    item={item}
                    onPress={() => submitSearch(item.label)}
                  />
                ))}
              </View>
            ) : null}

            <View
              style={{
                marginTop: 16,
              }}>
              {results.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                />
              ))}
            </View>

            {!searchLoading && results.length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#ECECEC',
                  borderRadius: 18,
                  borderWidth: 1,
                  marginTop: 18,
                  padding: 22,
                }}>
                <MaterialCommunityIcons
                  name="store-search"
                  size={30}
                  color="#F97316"
                />
                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 14,
                    fontWeight: '600',
                    lineHeight: 22,
                    marginTop: 10,
                    textAlign: 'center',
                  }}>
                  No trusted listings found for "{query}".
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <>
            <View>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    color: '#111827',
                    fontSize: 17,
                    fontWeight: '800',
                  }}>
                  Recent Searches
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={
                    recentLoading ||
                    recentSearches.length === 0
                  }
                  onPress={() =>
                    dispatch(
                      clearDirectoryRecentSearchesRequest()
                    )
                  }>
                  <Text
                    style={{
                      color:
                        recentSearches.length === 0
                          ? '#CBD5E1'
                          : '#F97316',
                      fontSize: 14,
                      fontWeight: '700',
                    }}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginTop: 16,
                }}>
                {recentSearches.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.query}-${item.id || index}`}
                    activeOpacity={0.85}
                    onPress={() => submitSearch(item.query)}
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderColor: '#ECECEC',
                      borderRadius: 14,
                      borderWidth: 1,
                      flexDirection: 'row',
                      height: 40,
                      marginBottom: 10,
                      marginRight: 10,
                      paddingHorizontal: 14,
                    }}>
                    <Ionicons
                      name="time"
                      size={15}
                      color="#9CA3AF"
                    />

                    <Text
                      style={{
                        color: '#4B5563',
                        fontSize: 13,
                        fontWeight: '500',
                        marginLeft: 8,
                      }}>
                      {item.query}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {!recentLoading &&
              recentSearches.length === 0 ? (
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontSize: 13,
                    fontWeight: '600',
                    marginTop: 6,
                  }}>
                  Your recent Directory searches will appear here.
                </Text>
              ) : null}
            </View>

            <View
              style={{
                marginTop: 24,
              }}>
              <Text
                style={{
                  color: '#111827',
                  fontSize: 17,
                  fontWeight: '800',
                }}>
                Popular Categories
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  marginTop: 16,
                }}>
                {popularCategories.map((item) => {
                  const visual = categoryVisual(item);

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.88}
                      onPress={() => openCategory(item)}
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        borderColor: '#ECECEC',
                        borderRadius: 18,
                        borderWidth: 1,
                        elevation: 2,
                        height: 118,
                        justifyContent: 'center',
                        marginBottom: 12,
                        shadowColor: '#000',
                        shadowOffset: {
                          height: 4,
                          width: 0,
                        },
                        shadowOpacity: 0.03,
                        shadowRadius: 10,
                        width: '48%',
                      }}>
                      <View
                        style={{
                          alignItems: 'center',
                          backgroundColor: visual.bg,
                          borderRadius: 25,
                          height: 50,
                          justifyContent: 'center',
                          width: 50,
                        }}>
                        {renderCategoryIcon(item)}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={{
                          color: '#1F2937',
                          fontSize: 14,
                          fontWeight: '700',
                          marginTop: 14,
                          maxWidth: '85%',
                        }}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {!homeLoading &&
              popularCategories.length === 0 ? (
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontSize: 13,
                    fontWeight: '600',
                    marginTop: 6,
                  }}>
                  Popular categories will appear after backend data loads.
                </Text>
              ) : null}
            </View>

            <View
              style={{
                marginTop: 14,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Ionicons
                  name="flame"
                  size={16}
                  color="#F97316"
                />

                <Text
                  style={{
                    color: '#111827',
                    fontSize: 17,
                    fontWeight: '800',
                    marginLeft: 8,
                  }}>
                  Trending This Week
                </Text>
              </View>

              <View
                style={{
                  marginTop: 16,
                }}>
                {trendingListings.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.88}
                    onPress={() => openListing(item)}
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderColor: '#ECECEC',
                      borderRadius: 18,
                      borderWidth: 1,
                      elevation: 2,
                      flexDirection: 'row',
                      minHeight: 78,
                      marginBottom: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      shadowColor: '#000',
                      shadowOffset: {
                        height: 4,
                        width: 0,
                      },
                      shadowOpacity: 0.03,
                      shadowRadius: 10,
                    }}>
                    <View
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#FFF7ED',
                        borderRadius: 21,
                        height: 42,
                        justifyContent: 'center',
                        width: 42,
                      }}>
                      <Text
                        style={{
                          color: '#F97316',
                          fontSize: 17,
                          fontWeight: '800',
                        }}>
                        {index + 1}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        marginLeft: 12,
                      }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: '#111827',
                          fontSize: 15,
                          fontWeight: '700',
                        }}>
                        {item.businessName}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={{
                          color: '#6B7280',
                          fontSize: 12,
                          fontWeight: '500',
                          marginTop: 6,
                        }}>
                        {listingSubtitle(item)}
                      </Text>
                    </View>

                    <Ionicons
                      name="trending-up"
                      size={18}
                      color="#F97316"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {!homeLoading &&
              trendingListings.length === 0 ? (
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontSize: 13,
                    fontWeight: '600',
                    marginTop: 6,
                  }}>
                  Trending businesses will appear as devotees interact with listings.
                </Text>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;
