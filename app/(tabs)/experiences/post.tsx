import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image as ImageIcon, ListTodo, MapPin, Mic, Sparkles, UserCircle2, Video } from 'lucide-react-native';

import { ExperienceTopTabs } from '@/components/experiences';

export default function PostExperienceScreen() {
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <UserCircle2 size={32} color="#8e5d10" strokeWidth={1.5} />
          <Text style={styles.headerTitle}>Leela Feed</Text>
          <Sparkles size={24} color="#8e5d10" strokeWidth={1.5} />
        </View>
        <ExperienceTopTabs activeTab="post" />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <View style={styles.composeRow}>
          <View style={styles.avatarPlaceholder}>
            <UserCircle2 size={40} color="#cda869" strokeWidth={1.5} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Share your leela, audio, or video experience..."
            placeholderTextColor="#a98b54"
            multiline
            autoFocus
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      
      <View style={styles.toolbar}>
        <View style={styles.toolbarIcons}>
          <Pressable hitSlop={8} style={styles.iconButton}>
            <ImageIcon size={22} color="#8e5d10" strokeWidth={2} />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconButton}>
            <Video size={22} color="#8e5d10" strokeWidth={2} />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconButton}>
            <Mic size={22} color="#8e5d10" strokeWidth={2} />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconButton}>
            <ListTodo size={22} color="#8e5d10" strokeWidth={2} />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconButton}>
            <MapPin size={22} color="#8e5d10" strokeWidth={2} />
          </Pressable>
        </View>
        <Pressable style={styles.postButton}>
          <Text style={styles.postButtonText}>Post</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf0',
  },
  fixedTop: {
    backgroundColor: 'rgba(255, 250, 240, 0.94)',
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
  headerTitle: {
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
  composeRow: {
    flexDirection: 'row',
    padding: 16,
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
  input: {
    flex: 1,
    color: '#3f2b0c',
    fontSize: 18,
    lineHeight: 26,
    minHeight: 150,
    paddingTop: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5c878',
    backgroundColor: '#fffaf0',
  },
  toolbarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButton: {
    backgroundColor: '#8e5d10',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#fffaf0',
    fontSize: 15,
    fontWeight: '800',
  },
});
