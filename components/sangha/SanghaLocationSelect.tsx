import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SanghaColors,
  SanghaRadius,
  SanghaShadow,
} from "@/constants/sangha-theme";

export type SanghaLocationOption = {
  label: string;
  value: string;
};

type Props = {
  disabled?: boolean;
  label: string;
  onSelect: (option: SanghaLocationOption) => void;
  options: SanghaLocationOption[];
  placeholder: string;
  value?: string;
};

export function SanghaLocationSelect({
  disabled = false,
  label,
  onSelect,
  options,
  placeholder,
  value,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized)
    );
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: SanghaColors.inkSecondary,
          fontSize: 13,
          fontWeight: "900",
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: disabled
            ? SanghaColors.background
            : SanghaColors.surfaceMuted,
          borderColor: value
            ? SanghaColors.saffronBorder
            : SanghaColors.border,
          borderRadius: SanghaRadius.control,
          borderWidth: 1,
          flexDirection: "row",
          height: 50,
          opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
          paddingHorizontal: 14,
        })}
      >
        <Ionicons
          color={value ? SanghaColors.saffron : SanghaColors.inkTertiary}
          name="location-outline"
          size={19}
        />
        <Text
          numberOfLines={1}
          style={{
            color: value ? SanghaColors.ink : SanghaColors.inkTertiary,
            flex: 1,
            fontSize: 15,
            fontWeight: "700",
            marginLeft: 10,
          }}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          color={SanghaColors.inkTertiary}
          name="chevron-down"
          size={18}
        />
      </Pressable>

      <Modal
        animationType="slide"
        onRequestClose={close}
        presentationStyle="pageSheet"
        visible={open}
      >
        <SafeAreaView style={{ backgroundColor: SanghaColors.background, flex: 1 }}>
          <View
            style={{
              alignItems: "center",
              borderBottomColor: SanghaColors.border,
              borderBottomWidth: 1,
              flexDirection: "row",
              minHeight: 62,
              paddingHorizontal: 18,
            }}
          >
            <Text
              style={{
                color: SanghaColors.ink,
                flex: 1,
                fontSize: 20,
                fontWeight: "900",
              }}
            >
              Select {label}
            </Text>
            <Pressable
              accessibilityLabel="Close location picker"
              accessibilityRole="button"
              onPress={close}
              style={{
                alignItems: "center",
                backgroundColor: SanghaColors.surface,
                borderRadius: 22,
                height: 44,
                justifyContent: "center",
                width: 44,
              }}
            >
              <Ionicons color={SanghaColors.ink} name="close" size={22} />
            </Pressable>
          </View>

          <View
            style={{
              alignItems: "center",
              backgroundColor: SanghaColors.surface,
              borderColor: SanghaColors.border,
              borderRadius: SanghaRadius.control,
              borderWidth: 1,
              flexDirection: "row",
              margin: 18,
              paddingHorizontal: 14,
              ...SanghaShadow,
            }}
          >
            <Ionicons color={SanghaColors.inkTertiary} name="search" size={20} />
            <TextInput
              autoFocus
              onChangeText={setQuery}
              placeholder={`Search ${label.toLowerCase()}`}
              placeholderTextColor={SanghaColors.inkTertiary}
              style={{
                color: SanghaColors.ink,
                flex: 1,
                fontSize: 16,
                fontWeight: "700",
                height: 52,
                marginLeft: 10,
              }}
              value={query}
            />
          </View>

          <FlatList
            contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 18 }}
            data={visibleOptions}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item.value}
            ListEmptyComponent={
              <Text
                style={{
                  color: SanghaColors.inkTertiary,
                  fontSize: 15,
                  fontWeight: "700",
                  paddingVertical: 30,
                  textAlign: "center",
                }}
              >
                No matching location found.
              </Text>
            }
            renderItem={({ item }) => {
              const selected = item.label === value;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    close();
                  }}
                  style={({ pressed }) => ({
                    alignItems: "center",
                    backgroundColor: selected
                      ? SanghaColors.saffronSoft
                      : pressed
                        ? SanghaColors.surfaceMuted
                        : SanghaColors.surface,
                    borderBottomColor: SanghaColors.border,
                    borderBottomWidth: 1,
                    flexDirection: "row",
                    minHeight: 54,
                    paddingHorizontal: 14,
                  })}
                >
                  <Text
                    style={{
                      color: selected
                        ? SanghaColors.saffronPressed
                        : SanghaColors.ink,
                      flex: 1,
                      fontSize: 16,
                      fontWeight: selected ? "900" : "700",
                    }}
                  >
                    {item.label}
                  </Text>
                  {selected ? (
                    <Ionicons
                      color={SanghaColors.saffron}
                      name="checkmark-circle"
                      size={22}
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
