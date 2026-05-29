import React from "react";
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

export default function GroupDetailsScreen() {
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
          {["Feed", "Members", "Events", "About"].map((item, index) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              style={{
                flex: 1,
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                borderBottomWidth: index === 0 ? 3 : 0,
                borderBottomColor: "#F97316",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: index === 0 ? "#F97316" : "#6B7280",
                  fontWeight: index === 0 ? "800" : "600",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CONTENT */}
        <View style={{ paddingHorizontal: 15, paddingTop: 28 }}>
          {/* Requests */}
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
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
              <Text style={{ fontSize: 16, color: "#111827", fontWeight: "900" }}>
                Member Requests
              </Text>
              <Text style={{ marginTop: 2, fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
                12 pending approvals
              </Text>
            </View>

            <TouchableOpacity
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

          {/* Pinned */}
          <View
            style={{
              marginTop: 28,
              borderRadius: 24,
              backgroundColor: "#FFFFFF",
              borderWidth: 1.5,
              borderColor: "#FDBA74",
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="pin" size={14} color="#F97316" />
              <Text
                style={{
                  marginLeft: 8,
                  color: "#F97316",
                  fontSize: 12,
                  fontWeight: "900",
                }}
              >
                ADMIN PINNED
              </Text>
            </View>

            <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: "https://randomuser.me/api/portraits/men/64.jpg" }}
                style={{ width: 46, height: 46, borderRadius: 23 }}
              />

              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 16, color: "#111827", fontWeight: "900" }}>
                  Ravi Sharma
                </Text>
                <Text style={{ marginTop: 2, fontSize: 14, color: "#6B7280" }}>
                  Admin • 2 hours ago
                </Text>
              </View>
            </View>

            <Text
              style={{
                marginTop: 18,
                fontSize: 16,
                lineHeight: 26,
                color: "#374151",
                fontWeight: "500",
              }}
            >
              Hari Om family! Just a reminder that our weekly gathering this Thursday will be at the
              community hall instead of the temple. Please bring your bhajan books.
            </Text>

            <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 18 }} />

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="heart" size={17} color="#6B7280" />
              <Text style={{ marginLeft: 7, marginRight: 18, color: "#6B7280", fontSize: 14 }}>
                24
              </Text>
              <Feather name="message-circle" size={17} color="#6B7280" />
              <Text style={{ marginLeft: 7, color: "#6B7280", fontSize: 14 }}>5</Text>
            </View>
          </View>

          {/* Post */}
          <View
            style={{
              marginTop: 18,
              borderRadius: 24,
              backgroundColor: "#FFFFFF",
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: "https://randomuser.me/api/portraits/women/68.jpg" }}
                style={{ width: 46, height: 46, borderRadius: 23 }}
              />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 16, color: "#111827", fontWeight: "900" }}>
                  Priya Patel
                </Text>
                <Text style={{ marginTop: 2, fontSize: 14, color: "#6B7280" }}>4 hours ago</Text>
              </View>

              <TouchableOpacity
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
            </View>

            <Text
              style={{
                marginTop: 18,
                fontSize: 16,
                lineHeight: 26,
                color: "#374151",
                fontWeight: "500",
              }}
            >
              Beautiful morning meditation session today. The energy was incredible. Grateful for this
              sangha. 🙏
            </Text>

            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=1200",
              }}
              style={{
                marginTop: 14,
                width: "100%",
                height: 315,
                borderRadius: 16,
              }}
            />

            <View
              style={{
                marginTop: 26,
                height: 50,
                borderRadius: 25,
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
