import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Heart, MessageCircle, Repeat2, Share, UserCircle2, Sparkles } from 'lucide-react-native';

import {
  CategoryChips,
  ExperienceTopTabs,
} from '@/components/experiences';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDevoteeAccount } from '@/store/devotee-account/selectors';
import { fetchExperiencesRequest, toggleLikeRequest } from '@/store/experiences/actions';
import { Experience } from '@/store/experiences/types';
import { selectExperiencesFeed, selectExperiencesLoading } from '@/store/experiences/selectors';

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Miracles', value: 'miracles' },
  { label: 'Prayers', value: 'prayers' },
  { label: 'Dreams', value: 'dreams' },
  { label: 'Darshan', value: 'darshan' },
  { label: 'Blessings', value: 'blessings' },
];

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const feed = useAppSelector(selectExperiencesFeed);
  const loading = useAppSelector(selectExperiencesLoading);
  const account = useAppSelector(selectDevoteeAccount);

  useEffect(() => {
    dispatch(fetchExperiencesRequest());
  }, [dispatch]);

  const handleLike = (id: string) => {
    const userId = account?.id;
    if (userId) {
      dispatch(toggleLikeRequest(id, userId));
    } else {
      console.warn("User must be logged in to like a post.");
    }
  };

  console.log("Rendering HomeScreen with feed:", feed);

  return (
    <View style={styles.container}>
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <UserCircle2 size={32} color="#8e5d10" strokeWidth={1.5} />
          <Text style={styles.title}>Leela Feed</Text>
          <Sparkles size={24} color="#8e5d10" strokeWidth={1.5} />
        </View>
        <ExperienceTopTabs activeTab="feed" />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.categoriesWrapper}>
          <CategoryChips activeValue="all" categories={CATEGORIES} />
        </View>
        <View style={styles.divider} />

        {loading && feed.length === 0 ? (
          <ActivityIndicator size="large" color="#8e5d10" style={styles.loader} />
        ) : (
          feed.map((post: Experience) => (
            <FeedPost 
              key={post.id}
              id={post.id}
              authorName={post.authorName || 'Sai Devotee'}
              handle={post.authorHandle || '@devotee'}
              time={post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
              content={post.content}
              likes={post.likes || 0}
              comments={post.comments || 0}
              reposts={post.reposts || 0}
              onLike={() => handleLike(post.id)}
            />
          ))
        )}
        
        {!loading && feed.length === 0 && (
          <Text style={styles.emptyText}>No experiences found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

interface FeedPostProps extends Pick<Experience, 'id' | 'content' | 'likes' | 'comments' | 'reposts'> {
  authorName: string | null;
  handle: string | null;
  time: string;
  onLike: (id: string) => void;
}

function FeedPost(props: FeedPostProps) {
  const { id, authorName, handle, time, content, likes, comments, reposts, onLike } = props;
  const handleLike = () => {
    onLike(id);
  };
  return (
    <View style={styles.postContainer}>
      <View style={styles.avatarPlaceholder}>
        <UserCircle2 size={36} color="#cda869" strokeWidth={1.5} />
      </View>
      
      <View style={styles.postContent}>
        <View style={styles.postHeader}>
          <Text style={styles.authorName} numberOfLines={1}>{authorName}</Text>
          <Text style={styles.authorHandle}>{handle}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        
        <Text style={styles.postText}>{content}</Text>
        
        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton}>
            <MessageCircle size={18} color="#8e5d10" strokeWidth={1.5} />
            {comments > 0 && <Text style={styles.actionText}>{comments}</Text>}
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Repeat2 size={18} color="#8e5d10" strokeWidth={1.5} />
            {reposts > 0 && <Text style={styles.actionText}>{reposts}</Text>}
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleLike}>
            <Heart size={18} color="#8e5d10" strokeWidth={1.5} />
            {likes > 0 && <Text style={styles.actionText}>{likes}</Text>}
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Share size={18} color="#8e5d10" strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeaea',
  },
  fixedTop: {
    backgroundColor: 'rgba(249, 208, 105, 0.22)',
    paddingTop: 54,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    color: '#4e3309',
    fontSize: 20,
    fontWeight: '800',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 120,
    paddingTop: 0,
  },
  categoriesWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5c878',
  },
  loader: {
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#8e5d10',
    fontSize: 15,
  },
  postContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5c878',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff4d5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  postContent: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    fontWeight: '800',
    color: '#4e3309',
    fontSize: 15,
    marginRight: 4,
  },
  authorHandle: {
    color: '#8e5d10',
    fontSize: 14,
  },
  dot: {
    color: '#8e5d10',
    fontSize: 14,
    marginHorizontal: 4,
  },
  time: {
    color: '#8e5d10',
    fontSize: 14,
  },
  postText: {
    color: '#3f2b0c',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#8e5d10',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
});
