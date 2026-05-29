import React, {useState} from "react";
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const avatars = [
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
];

const tabs = ["Feed", "Members", "Events", "About"] as const;
type GroupTab = (typeof tabs)[number];

const members = [
  {
    image: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Ravi Sharma",
    role: "Admin",
    status: "Online now",
  },
  {
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Priya Patel",
    role: "Seva Lead",
    status: "Active 1h ago",
  },
  {
    image: "https://randomuser.me/api/portraits/men/21.jpg",
    name: "Amit Desai",
    role: "Member",
    status: "Active today",
  },
  {
    image: "https://randomuser.me/api/portraits/women/41.jpg",
    name: "Neha Kulkarni",
    role: "Member",
    status: "Joined this week",
  },
];

const events = [
  {
    date: "SUN",
    day: "31",
    title: "Weekend Food Drive",
    meta: "8:00 AM · Andheri Community Kitchen",
    going: "46 going",
  },
  {
    date: "THU",
    day: "04",
    title: "Sai Bhajan Evening",
    meta: "7:30 PM · Sai Mandir Hall",
    going: "82 going",
  },
  {
    date: "SAT",
    day: "13",
    title: "New Volunteer Orientation",
    meta: "5:00 PM · Online",
    going: "18 going",
  },
];

export default function GroupDetailsScreen() {
  const [activeTab, setActiveTab] = useState<GroupTab>("Feed");

  const renderTabContent = () => {
    if (activeTab === "Members") {
      return <MembersSection />;
    }

    if (activeTab === "Events") {
      return <EventsSection />;
    }

    if (activeTab === "About") {
      return <AboutSection />;
    }

    return <FeedSection />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F6F2" }}>
      <StatusBar barStyle="light-content" backgroundColor="#2B1308" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        {/* HERO */}
        <View style={{ height: 345, backgroundColor: "#2B1308" }}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?q=80&w=1200",
            }}
            style={{ width: "100%", height: "100%", opacity: 0.72 }}
          />

          <View
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(60,25,5,0.34)",
            }}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.back()}
            style={{
              position: "absolute",
              left: 18,
              top: 18,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#2B1308" />
          </TouchableOpacity>

          <View style={{ position: "absolute", left: 22, right: 22, bottom: 26 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#FFF3E0",
                  borderWidth: 1,
                  borderColor: "#FDBA74",
                  justifyContent: "center",
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: "#C2410C", fontSize: 13, fontWeight: "800" }}>
                  SANGHA
                </Text>
              </View>

              <View
                style={{
                  marginLeft: 10,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "rgba(255,255,255,0.78)",
                  justifyContent: "center",
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: "#7C2D12", fontSize: 13, fontWeight: "800" }}>
                  1.2K MEMBERS
                </Text>
              </View>
            </View>

            <Text
              style={{
                marginTop: 14,
                fontSize: 27,
                lineHeight: 35,
                color: "#FFFFFF",
                fontWeight: "900",
                letterSpacing: -0.4,
              }}
            >
              The Living Community{"\n"}Space
            </Text>

            <Text
              numberOfLines={2}
              style={{
                marginTop: 14,
                fontSize: 16,
                lineHeight: 25,
                color: "rgba(255,255,255,0.86)",
                fontWeight: "500",
              }}
            >
              A dedicated space for daily spiritual practice, bhajan sharing, and community support in the...
            </Text>

            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {avatars.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                      marginLeft: index === 0 ? 0 : -10,
                    }}
                  />
                ))}

                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "#475569",
                    borderWidth: 2,
                    borderColor: "#FFFFFF",
                    marginLeft: -10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>+1k</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={{
                  width: 88,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#F97316",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#F97316",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>
                  Joined
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* TABS */}
        <View
          style={{
            height: 46,
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {tabs.map((item) => {
            const isActive = activeTab === item;

            return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setActiveTab(item)}
              style={{
                flex: 1,
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                borderBottomWidth: isActive ? 3 : 0,
                borderBottomColor: "#F97316",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: isActive ? "#F97316" : "#6B7280",
                  fontWeight: isActive ? "800" : "600",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
            );
          })}
        </View>

        {/* CONTENT */}
        <View style={{ paddingHorizontal: 15, paddingTop: 24 }}>{renderTabContent()}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeedSection() {
  return (
    <>
      <View
        style={{
          borderRadius: 22,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#F1E8DA",
          padding: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/12.jpg" }}
            style={{ width: 42, height: 42, borderRadius: 21 }}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#F8F6F2",
              marginLeft: 12,
              paddingHorizontal: 16,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#8B8177", fontSize: 15, fontWeight: "700" }}>
              Share seva update or bhajan note
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          {[
            { icon: "image", label: "Photo" },
            { icon: "calendar", label: "Event" },
            { icon: "megaphone", label: "Notice" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 15,
                backgroundColor: "#FFF7ED",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={16} color="#F97316" />
              <Text style={{ marginLeft: 6, color: "#9A3412", fontSize: 13, fontWeight: "800" }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <MemberRequestCard />
      <PinnedPostCard />
      <CommunityPostCard />
    </>
  );
}

function MemberRequestCard() {
  return (
    <View
      style={{
        height: 76,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D6DEE8",
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 18,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: "#FFF3E8",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="people" size={21} color="#F97316" />
      </View>

      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ fontSize: 16, color: "#111827", fontWeight: "900" }}>Member Requests</Text>
        <Text style={{ marginTop: 2, fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
          12 pending approvals
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={{
          height: 38,
          borderRadius: 19,
          backgroundColor: "#F3F4F6",
          paddingHorizontal: 18,
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#111827", fontSize: 14, fontWeight: "800" }}>Review</Text>
      </TouchableOpacity>
    </View>
  );
}

function PinnedPostCard() {
  return (
    <View
      style={{
        marginTop: 18,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#FDBA74",
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="pin" size={14} color="#F97316" />
        <Text style={{ marginLeft: 8, color: "#F97316", fontSize: 12, fontWeight: "900" }}>
          ADMIN PINNED
        </Text>
      </View>

      <PostAuthor
        image="https://randomuser.me/api/portraits/men/64.jpg"
        name="Ravi Sharma"
        meta="Admin · 2 hours ago"
      />

      <Text style={postTextStyle}>
        Hari Om family! Weekly gathering this Thursday will be at the community hall instead of
        the temple. Please bring your bhajan books.
      </Text>

      <PostActions likes="24" comments="5" />
    </View>
  );
}

function CommunityPostCard() {
  return (
    <View
      style={{
        marginTop: 18,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        padding: 16,
      }}
    >
      <PostAuthor
        image="https://randomuser.me/api/portraits/women/68.jpg"
        name="Priya Patel"
        meta="4 hours ago"
        menu
      />

      <Text style={postTextStyle}>
        Beautiful morning meditation session today. The energy was incredible. Grateful for this
        sangha. 🙏
      </Text>

      <Image
        source={{ uri: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=1200" }}
        style={{ marginTop: 14, width: "100%", height: 250, borderRadius: 16 }}
      />

      <View
        style={{
          marginTop: 18,
          height: 48,
          borderRadius: 24,
          backgroundColor: "#F9FAFB",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          paddingHorizontal: 18,
          justifyContent: "center",
        }}
      >
        <TextInput
          placeholder="Write a comment..."
          placeholderTextColor="#9CA3AF"
          style={{ fontSize: 15, color: "#111827" }}
        />
      </View>
    </View>
  );
}

function MembersSection() {
  return (
    <>
      <View
        style={{
          borderRadius: 22,
          backgroundColor: "#FFFFFF",
          padding: 16,
          borderWidth: 1,
          borderColor: "#EEE7DD",
        }}
      >
        <View
          style={{
            height: 48,
            borderRadius: 24,
            backgroundColor: "#F8F6F2",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
          }}
        >
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search members"
            placeholderTextColor="#9CA3AF"
            style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#111827", fontWeight: "600" }}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <ActionPill icon="person-add" label="Invite" />
          <ActionPill icon="shield-checkmark" label="Admins" />
          <ActionPill icon="funnel" label="Filter" />
        </View>
      </View>

      <View style={{ marginTop: 18 }}>
        {members.map((member) => (
          <View
            key={member.name}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 22,
              padding: 15,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image source={{ uri: member.image }} style={{ width: 54, height: 54, borderRadius: 27 }} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: "#111827", fontSize: 17, fontWeight: "900" }}>{member.name}</Text>
              <Text style={{ color: "#F97316", fontSize: 13, fontWeight: "800", marginTop: 3 }}>
                {member.role}
              </Text>
              <Text style={{ color: "#6B7280", fontSize: 13, fontWeight: "600", marginTop: 3 }}>
                {member.status}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="message-circle" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </>
  );
}

function EventsSection() {
  return (
    <>
      <View
        style={{
          borderRadius: 24,
          backgroundColor: "#2B1308",
          padding: 20,
          overflow: "hidden",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 22, fontFamily: "serif", fontWeight: "900" }}>
          Group Calendar
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.76)", fontSize: 14, lineHeight: 21, marginTop: 8 }}>
          Keep upcoming seva, bhajan, and member meetups organized in one place.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            alignSelf: "flex-start",
            marginTop: 16,
            height: 42,
            borderRadius: 21,
            backgroundColor: "#F97316",
            paddingHorizontal: 18,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "900" }}>Create Event</Text>
        </TouchableOpacity>
      </View>

      {events.map((event) => (
        <View
          key={event.title}
          style={{
            marginTop: 14,
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 58,
              height: 66,
              borderRadius: 18,
              backgroundColor: "#FFF3E8",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#F97316", fontSize: 12, fontWeight: "900" }}>{event.date}</Text>
            <Text style={{ color: "#111827", fontSize: 22, fontWeight: "900", marginTop: 2 }}>
              {event.day}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: "#111827", fontSize: 17, fontWeight: "900" }}>{event.title}</Text>
            <Text style={{ color: "#6B7280", fontSize: 13, fontWeight: "600", marginTop: 5 }}>
              {event.meta}
            </Text>
            <Text style={{ color: "#F97316", fontSize: 13, fontWeight: "800", marginTop: 7 }}>
              {event.going}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              height: 38,
              borderRadius: 19,
              backgroundColor: "#F3F4F6",
              paddingHorizontal: 14,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#111827", fontSize: 13, fontWeight: "800" }}>RSVP</Text>
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
}

function AboutSection() {
  return (
    <>
      <InfoCard title="Purpose" icon="compass">
        A dedicated space for daily spiritual practice, bhajan sharing, local seva planning, and
        community support for Sai devotees.
      </InfoCard>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <StatCard value="1.2K" label="Members" />
        <StatCard value="38" label="Events" />
        <StatCard value="96%" label="Active" />
      </View>

      <InfoCard title="Guidelines" icon="document-text">
        Keep posts respectful, avoid promotional spam, protect private member details, and use the
        events tab for meetups or seva drives.
      </InfoCard>

      <InfoCard title="Location & Privacy" icon="location">
        Mumbai, Maharashtra · Public group · Posts are visible to joined members.
      </InfoCard>
    </>
  );
}

function PostAuthor({
  image,
  name,
  meta,
  menu,
}: {
  image: string;
  name: string;
  meta: string;
  menu?: boolean;
}) {
  return (
    <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center" }}>
      <Image source={{ uri: image }} style={{ width: 46, height: 46, borderRadius: 23 }} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, color: "#111827", fontWeight: "900" }}>{name}</Text>
        <Text style={{ marginTop: 2, fontSize: 14, color: "#6B7280" }}>{meta}</Text>
      </View>
      {menu ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F3F4F6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function PostActions({likes, comments}: {likes: string; comments: string}) {
  return (
    <>
      <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 18 }} />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Feather name="heart" size={17} color="#6B7280" />
        <Text style={{ marginLeft: 7, marginRight: 18, color: "#6B7280", fontSize: 14 }}>{likes}</Text>
        <Feather name="message-circle" size={17} color="#6B7280" />
        <Text style={{ marginLeft: 7, color: "#6B7280", fontSize: 14 }}>{comments}</Text>
      </View>
    </>
  );
}

function ActionPill({icon, label}: {icon: keyof typeof Ionicons.glyphMap; label: string}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{
        flex: 1,
        height: 42,
        borderRadius: 15,
        backgroundColor: "#FFF7ED",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      <Ionicons name={icon} size={16} color="#F97316" />
      <Text style={{ marginLeft: 6, color: "#9A3412", fontSize: 13, fontWeight: "800" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function InfoCard({
  children,
  icon,
  title,
}: {
  children: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View
      style={{
        marginTop: 14,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: "#EEE7DD",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "#FFF3E8",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name={icon} size={20} color="#F97316" />
        </View>
        <Text style={{ marginLeft: 12, color: "#111827", fontSize: 18, fontWeight: "900" }}>{title}</Text>
      </View>
      <Text style={{ color: "#4B5563", fontSize: 15, lineHeight: 24, fontWeight: "600", marginTop: 14 }}>
        {children}
      </Text>
    </View>
  );
}

function StatCard({value, label}: {value: string; label: string}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EEE7DD",
      }}
    >
      <Text style={{ color: "#111827", fontSize: 20, fontWeight: "900" }}>{value}</Text>
      <Text style={{ color: "#6B7280", fontSize: 12, fontWeight: "800", marginTop: 4 }}>{label}</Text>
    </View>
  );
}

const postTextStyle = {
  marginTop: 18,
  fontSize: 16,
  lineHeight: 26,
  color: "#374151",
  fontWeight: "500" as const,
};
