import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  fetchDirectoryReviewsRequest,
  submitDirectoryReviewRequest,
  voteDirectoryReviewRequest,
} from '@/store/directory/actions';
import {
  selectDirectoryError,
  selectDirectoryReviews,
  selectDirectoryReviewsLoading,
} from '@/store/directory/selectors';
import {
  DirectoryReview,
  DirectoryReviewSummary,
} from '@/store/directory/types';
import { validateDirectoryReviewPayload } from '@/store/directory/validation';
import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

type ReviewSort = 'newest' | 'highest' | 'lowest';

const filters: Array<{
  label: string;
  sort: ReviewSort;
}> = [
  {
    label: 'All',
    sort: 'newest',
  },
  {
    label: 'Highest Rated',
    sort: 'highest',
  },
  {
    label: 'Lowest Rated',
    sort: 'lowest',
  },
];

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value?: string) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function initials(name?: string | null) {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'SD'
  );
}

function averageRating(summary?: DirectoryReviewSummary | null) {
  return Number(summary?.averageRating || 0);
}

function reviewCount(summary?: DirectoryReviewSummary | null) {
  return Number(summary?.reviewCount || 0);
}

function distributionCount(
  summary: DirectoryReviewSummary | null | undefined,
  star: number
) {
  return Number(
    summary?.distribution?.[String(star)] || 0
  );
}

function RatingStars({
  rating,
  size = 18,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          color={star <= rating ? '#FACC15' : '#D1D5DB'}
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          style={{ marginRight: 4 }}
        />
      ))}
    </View>
  );
}

function RatingSummaryCard({
  loading,
  summary,
}: {
  loading: boolean;
  summary?: DirectoryReviewSummary | null;
}) {
  const total = reviewCount(summary);
  const maxBar = Math.max(
    1,
    ...[5, 4, 3, 2, 1].map((star) =>
      distributionCount(summary, star)
    )
  );
  const average = averageRating(summary);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        elevation: 2,
        marginHorizontal: 18,
        marginTop: 22,
        paddingBottom: 20,
        paddingHorizontal: 22,
        paddingTop: 24,
        shadowColor: '#000',
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      }}>
      <Text
        style={{
          color: '#111111',
          fontSize: 54,
          fontWeight: '900',
          letterSpacing: -2,
          lineHeight: 58,
          textAlign: 'center',
        }}>
        {loading && !total ? '--' : average.toFixed(1)}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 10,
        }}>
        <RatingStars
          rating={Math.round(average)}
          size={25}
        />
      </View>

      <Text
        style={{
          color: '#475569',
          fontSize: 15,
          fontWeight: '600',
          marginTop: 10,
          textAlign: 'center',
        }}>
        Based on {total} {total === 1 ? 'review' : 'reviews'}
      </Text>

      <View style={{ marginTop: 22 }}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distributionCount(summary, star);
          const width = `${Math.round(
            (count / maxBar) * 100
          )}%` as `${number}%`;

          return (
            <View
              key={star}
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                marginBottom: 14,
              }}>
              <Text
                style={{
                  color: '#111111',
                  fontSize: 14,
                  fontWeight: '600',
                  width: 28,
                }}>
                {star}
              </Text>

              <View
                style={{
                  backgroundColor: '#F1F2F4',
                  borderRadius: 100,
                  flex: 1,
                  height: 8,
                  marginHorizontal: 14,
                  overflow: 'hidden',
                }}>
                <View
                  style={{
                    backgroundColor: '#EE9B52',
                    borderRadius: 100,
                    height: '100%',
                    width,
                  }}
                />
              </View>

              <Text
                style={{
                  color: '#475569',
                  fontSize: 14,
                  fontWeight: '500',
                  textAlign: 'right',
                  width: 36,
                }}>
                {count}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ReviewGateCard({
  canReview,
  content,
  error,
  loading,
  onChangeContent,
  onChangeRating,
  onSubmit,
  rating,
  reason,
}: {
  canReview: boolean;
  content: string;
  error?: string;
  loading: boolean;
  onChangeContent: (value: string) => void;
  onChangeRating: (value: number) => void;
  onSubmit: () => void;
  rating: number;
  reason?: string | null;
}) {
  if (!canReview) {
    return (
      <View
        style={{
          backgroundColor: '#FFF8F1',
          borderColor: '#F8DFC4',
          borderRadius: 22,
          borderWidth: 1.5,
          marginHorizontal: 18,
          marginTop: 22,
          paddingHorizontal: 22,
          paddingVertical: 24,
        }}>
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 27,
              elevation: 2,
              height: 54,
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { height: 4, width: 0 },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              width: 54,
            }}>
            <Ionicons
              color="#EE9B52"
              name="lock-closed"
              size={23}
            />
          </View>
        </View>

        <Text
          style={{
            color: '#111827',
            fontSize: 20,
            fontWeight: '800',
            letterSpacing: -0.4,
            lineHeight: 26,
            marginTop: 18,
            textAlign: 'center',
          }}>
          Verified Reviews Only
        </Text>

        <Text
          style={{
            color: '#475569',
            fontSize: 15,
            fontWeight: '500',
            lineHeight: 24,
            marginTop: 12,
            textAlign: 'center',
          }}>
          {reason ||
            'You can review this business after a verified community interaction.'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.back()}
          style={{
            alignItems: 'center',
            backgroundColor: '#EE9B52',
            borderRadius: 16,
            elevation: 6,
            height: 54,
            justifyContent: 'center',
            marginTop: 22,
            shadowColor: '#EE9B52',
            shadowOffset: { height: 6, width: 0 },
            shadowOpacity: 0.24,
            shadowRadius: 14,
          }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '800',
            }}>
            View Business Details
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: '#FFF8F1',
        borderColor: '#F8DFC4',
        borderRadius: 22,
        borderWidth: 1.5,
        marginHorizontal: 18,
        marginTop: 22,
        padding: 18,
      }}>
      <Text
        style={{
          color: '#111827',
          fontSize: 18,
          fontWeight: '900',
        }}>
        Share Your Experience
      </Text>
      <Text
        style={{
          color: '#64748B',
          fontSize: 13,
          fontWeight: '600',
          lineHeight: 20,
          marginTop: 6,
        }}>
        Help other devotees choose with confidence.
      </Text>

      <View
        style={{
          flexDirection: 'row',
          marginTop: 16,
        }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            activeOpacity={0.8}
            key={star}
            onPress={() => onChangeRating(star)}
            style={{
              marginRight: 8,
              padding: 2,
            }}>
            <Ionicons
              color={star <= rating ? '#FACC15' : '#CBD5E1'}
              name={star <= rating ? 'star' : 'star-outline'}
              size={30}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        multiline
        onChangeText={onChangeContent}
        placeholder="Write what went well, service quality, communication, and community trust..."
        placeholderTextColor="#94A3B8"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: error ? '#FCA5A5' : '#FED7AA',
          borderRadius: 16,
          borderWidth: 1,
          color: '#111827',
          fontSize: 14,
          fontWeight: '600',
          lineHeight: 21,
          marginTop: 16,
          minHeight: 108,
          paddingHorizontal: 14,
          paddingTop: 12,
          textAlignVertical: 'top',
        }}
        value={content}
      />

      {error ? (
        <Text
          style={{
            color: '#DC2626',
            fontSize: 12,
            fontWeight: '700',
            marginTop: 8,
          }}>
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.88}
        disabled={loading}
        onPress={onSubmit}
        style={{
          alignItems: 'center',
          backgroundColor: loading ? '#FDBA74' : '#EE9B52',
          borderRadius: 16,
          flexDirection: 'row',
          height: 52,
          justifyContent: 'center',
          marginTop: 16,
        }}>
        {loading ? (
          <ActivityIndicator
            color="#FFFFFF"
            size="small"
          />
        ) : (
          <Ionicons
            color="#FFFFFF"
            name="send"
            size={17}
          />
        )}
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: '900',
            marginLeft: 8,
          }}>
          {loading ? 'Submitting Review' : 'Submit Review'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ReviewCard({
  onVote,
  review,
}: {
  onVote: (
    reviewId: string,
    vote: 'helpful' | 'not_helpful'
  ) => void;
  review: DirectoryReview;
}) {
  const name = review.reviewerName || 'Sai Devotee';
  const badge =
    review.reviewerBadge ||
    review.reviewerMemberSince ||
    (review.verifiedInteraction
      ? 'Verified community member'
      : null);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#F1F1F1',
        borderRadius: 22,
        borderWidth: 1,
        elevation: 2,
        marginBottom: 18,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}>
          {review.reviewerAvatarUrl ? (
            <Image
              source={{ uri: review.reviewerAvatarUrl }}
              style={{
                borderRadius: 23,
                height: 46,
                width: 46,
              }}
            />
          ) : (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#FFF3E8',
                borderRadius: 23,
                height: 46,
                justifyContent: 'center',
                width: 46,
              }}>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 14,
                  fontWeight: '900',
                }}>
                {initials(name)}
              </Text>
            </View>
          )}

          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}>
            <Text
              style={{
                color: '#111827',
                fontSize: 16,
                fontWeight: '800',
              }}>
              {name}
            </Text>

            {badge ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#FFF3E8',
                  borderRadius: 10,
                  marginTop: 5,
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                }}>
                <Text
                  style={{
                    color: '#E67E22',
                    fontSize: 11,
                    fontWeight: '700',
                  }}>
                  {badge}
                </Text>
              </View>
            ) : null}

            {review.reviewerCity ? (
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginTop: 7,
                }}>
                <Ionicons
                  color="#475569"
                  name="location-sharp"
                  size={13}
                />
                <Text
                  style={{
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: '500',
                    marginLeft: 5,
                  }}>
                  {review.reviewerCity}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text
          style={{
            color: '#475569',
            fontSize: 12,
            fontWeight: '500',
          }}>
          {formatDate(review.createdAt)}
        </Text>
      </View>

      <View style={{ marginTop: 18 }}>
        <RatingStars rating={review.rating} />
      </View>

      <Text
        style={{
          color: '#475569',
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 23,
          marginTop: 14,
        }}>
        {review.content}
      </Text>

      <View
        style={{
          backgroundColor: '#F3F4F6',
          height: 1,
          marginVertical: 18,
        }}
      />

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            color: '#475569',
            fontSize: 13,
            fontWeight: '700',
          }}>
          Was this helpful?
        </Text>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onVote(review.id, 'helpful')}
            style={{
              alignItems: 'center',
              backgroundColor:
                review.myVote === 'helpful'
                  ? '#FFF3E8'
                  : '#F8FAFC',
              borderColor:
                review.myVote === 'helpful'
                  ? '#FED7AA'
                  : 'transparent',
              borderRadius: 17,
              borderWidth: 1,
              flexDirection: 'row',
              height: 34,
              marginRight: 12,
              paddingHorizontal: 13,
            }}>
            <Ionicons
              color={
                review.myVote === 'helpful'
                  ? '#F97316'
                  : '#475569'
              }
              name={
                review.myVote === 'helpful'
                  ? 'thumbs-up'
                  : 'thumbs-up-outline'
              }
              size={15}
            />
            <Text
              style={{
                color:
                  review.myVote === 'helpful'
                    ? '#F97316'
                    : '#475569',
                fontSize: 13,
                fontWeight:
                  review.myVote === 'helpful'
                    ? '800'
                    : '500',
                marginLeft: 8,
              }}>
              {review.helpfulCount || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onVote(review.id, 'not_helpful')}
            style={{
              alignItems: 'center',
              backgroundColor:
                review.myVote === 'not_helpful'
                  ? '#FEE2E2'
                  : '#F8FAFC',
              borderColor:
                review.myVote === 'not_helpful'
                  ? '#FECACA'
                  : 'transparent',
              borderRadius: 17,
              borderWidth: 1,
              flexDirection: 'row',
              height: 34,
              paddingHorizontal: 13,
            }}>
            <Ionicons
              color={
                review.myVote === 'not_helpful'
                  ? '#DC2626'
                  : '#475569'
              }
              name={
                review.myVote === 'not_helpful'
                  ? 'thumbs-down'
                  : 'thumbs-down-outline'
              }
              size={15}
            />
            <Text
              style={{
                color:
                  review.myVote === 'not_helpful'
                    ? '#DC2626'
                    : '#475569',
                fontSize: 13,
                fontWeight:
                  review.myVote === 'not_helpful'
                    ? '800'
                    : '500',
                marginLeft: 8,
              }}>
              {review.notHelpfulCount || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const ReviewsScreen = () => {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();
  const listingId = getParam(params.id);
  const [sort, setSort] = useState<ReviewSort>('newest');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const submittedRef = useRef(false);

  const reviewsResult = useAppSelector((state) =>
    selectDirectoryReviews(state, listingId)
  );
  const loading = useAppSelector((state) =>
    selectDirectoryReviewsLoading(state, listingId)
  );
  const requestError = useAppSelector(selectDirectoryError);

  const summary = reviewsResult?.summary || null;
  const reviews = useMemo(
    () => reviewsResult?.reviews || [],
    [reviewsResult?.reviews]
  );
  const canReview = summary?.canReview ?? true;
  const totalReviews =
    reviewCount(summary) || reviews.length || 0;

  useEffect(() => {
    if (!listingId) {
      return;
    }

    dispatch(
      fetchDirectoryReviewsRequest(listingId, {
        limit: 20,
        offset: 0,
        sort,
      })
    );
  }, [dispatch, listingId, sort]);

  useEffect(() => {
    if (!submittedRef.current || loading) {
      return;
    }

    if (requestError) {
      Alert.alert('Review not submitted', requestError);
      submittedRef.current = false;
      return;
    }

    setContent('');
    setRating(5);
    setFormError('');
    submittedRef.current = false;
  }, [loading, requestError]);

  const handleRefresh = () => {
    if (!listingId) {
      return;
    }

    dispatch(
      fetchDirectoryReviewsRequest(listingId, {
        limit: 20,
        offset: 0,
        sort,
      })
    );
  };

  const handleSubmit = () => {
    if (!listingId) {
      return;
    }

    const validation = validateDirectoryReviewPayload({
      content,
      rating,
    });

    if (!validation.isValid) {
      setFormError(
        validation.errors.content ||
          validation.errors.rating ||
          'Please check your review.'
      );
      return;
    }

    setFormError('');
    submittedRef.current = true;
    dispatch(
      submitDirectoryReviewRequest(listingId, {
        content: content.trim(),
        rating,
      })
    );
  };

  const handleVote = (
    reviewId: string,
    vote: 'helpful' | 'not_helpful'
  ) => {
    if (!listingId) {
      return;
    }

    dispatch(
      voteDirectoryReviewRequest(reviewId, { vote }, listingId)
    );
  };

  if (!listingId) {
    return (
      <SafeAreaView
        style={{
          alignItems: 'center',
          backgroundColor: '#FAFAFA',
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
        <Text
          style={{
            color: '#111827',
            fontSize: 20,
            fontWeight: '900',
            textAlign: 'center',
          }}>
          Business review not found
        </Text>
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() => router.back()}
          style={{
            alignItems: 'center',
            backgroundColor: '#EE9B52',
            borderRadius: 16,
            height: 50,
            justifyContent: 'center',
            marginTop: 18,
            paddingHorizontal: 22,
          }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: '900',
            }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: '#FAFAFA',
        flex: 1,
      }}>
      <StatusBar
        backgroundColor="#FAFAFA"
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            tintColor="#EE9B52"
            onRefresh={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderBottomColor: '#F1F1F1',
            borderBottomWidth: 1,
            flexDirection: 'row',
            height: 82,
            justifyContent: 'space-between',
            paddingHorizontal: 18,
          }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              flex: 1,
            }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.back()}
              style={{
                alignItems: 'center',
                backgroundColor: '#F7F7F7',
                borderRadius: 22,
                height: 44,
                justifyContent: 'center',
                width: 54,
              }}>
              <Ionicons
                color="#4B5563"
                name="arrow-back"
                size={22}
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              style={{
                color: '#111827',
                flex: 1,
                fontSize: 20,
                fontWeight: '800',
                letterSpacing: -0.4,
                marginLeft: 14,
              }}>
              Reviews & Ratings
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleRefresh}
            style={{
              alignItems: 'center',
              backgroundColor: '#F7F7F7',
              borderRadius: 22,
              height: 44,
              justifyContent: 'center',
              width: 54,
            }}>
            {loading ? (
              <ActivityIndicator
                color="#EE9B52"
                size="small"
              />
            ) : (
              <Ionicons
                color="#4B5563"
                name="refresh"
                size={20}
              />
            )}
          </TouchableOpacity>
        </View>

        <RatingSummaryCard
          loading={loading}
          summary={summary}
        />

        <ReviewGateCard
          canReview={canReview}
          content={content}
          error={formError}
          loading={loading && submittedRef.current}
          onChangeContent={setContent}
          onChangeRating={setRating}
          onSubmit={handleSubmit}
          rating={rating}
          reason={summary?.reviewGateReason}
        />

        <View style={{ marginTop: 24 }}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 18 }}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => {
              const active = sort === filter.sort;
              const label =
                filter.sort === 'newest'
                  ? `${filter.label} (${totalReviews})`
                  : filter.label;

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  key={filter.sort}
                  onPress={() => setSort(filter.sort)}
                  style={{
                    alignItems: 'center',
                    backgroundColor: active
                      ? '#111111'
                      : '#FFFFFF',
                    borderColor: active
                      ? '#111111'
                      : '#E5E7EB',
                    borderRadius: 20,
                    borderWidth: active ? 0 : 1.5,
                    elevation: active ? 6 : 0,
                    height: 40,
                    justifyContent: 'center',
                    marginRight: 12,
                    paddingHorizontal: 18,
                    shadowColor: '#000',
                    shadowOffset: { height: 5, width: 0 },
                    shadowOpacity: active ? 0.14 : 0,
                    shadowRadius: 12,
                  }}>
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : '#111827',
                      fontSize: 14,
                      fontWeight: active ? '800' : '600',
                    }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View
          style={{
            marginTop: 22,
            paddingHorizontal: 18,
          }}>
          {loading && !reviews.length ? (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                paddingVertical: 34,
              }}>
              <ActivityIndicator
                color="#EE9B52"
                size="small"
              />
              <Text
                style={{
                  color: '#64748B',
                  fontSize: 13,
                  fontWeight: '700',
                  marginTop: 10,
                }}>
                Loading community reviews
              </Text>
            </View>
          ) : null}

          {!loading && requestError ? (
            <View
              style={{
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
                borderRadius: 18,
                borderWidth: 1,
                marginBottom: 18,
                padding: 16,
              }}>
              <Text
                style={{
                  color: '#B91C1C',
                  fontSize: 13,
                  fontWeight: '800',
                  lineHeight: 20,
                }}>
                {requestError}
              </Text>
            </View>
          ) : null}

          {!loading && !reviews.length ? (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderColor: '#F1F5F9',
                borderRadius: 22,
                borderWidth: 1,
                paddingHorizontal: 22,
                paddingVertical: 34,
              }}>
              <Ionicons
                color="#EE9B52"
                name="chatbubbles-outline"
                size={30}
              />
              <Text
                style={{
                  color: '#111827',
                  fontSize: 17,
                  fontWeight: '900',
                  marginTop: 12,
                  textAlign: 'center',
                }}>
                No reviews yet
              </Text>
              <Text
                style={{
                  color: '#64748B',
                  fontSize: 13,
                  fontWeight: '600',
                  lineHeight: 20,
                  marginTop: 6,
                  textAlign: 'center',
                }}>
                The first verified review will appear here.
              </Text>
            </View>
          ) : null}

          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              onVote={handleVote}
              review={review}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewsScreen;
