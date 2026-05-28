import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const nearYou = [
  {
    image:
      'https://randomuser.me/api/portraits/women/44.jpg',
    mutual: '3 Mutual\nConnections',
    name: 'Priya Sharma',
    tradition: 'Shirdi Sai Devotee',
  },
  {
    image:
      'https://randomuser.me/api/portraits/men/32.jpg',
    mutual: '1.2 km away',
    name: 'Rahul Verma',
    tradition: 'Iskcon Tradition',
  },
];

const suggested = [
  {
    badge: 'Based on your tradition',
    image:
      'https://randomuser.me/api/portraits/women/68.jpg',
    name: 'Ananya Desai',
    subtitle: 'Art of Living · Bangalore',
  },
  {
    badge: 'Based on your city',
    image:
      'https://randomuser.me/api/portraits/men/75.jpg',
    name: 'Vikram Singh',
    subtitle: 'Vipassana · Pune',
  },
];

const filters = {
  distance: ['Nearby', 'Same City', 'Online'],
  tradition: [
    'All',
    'Shirdi Sai',
    'Iskcon',
    'Art of Living',
    'Vipassana',
  ],
  purpose: ['Connect', 'Bhajan', 'Seva', 'Events'],
};

export default function SanghaScreen() {
  const [enabled, setEnabled] = useState(false);
  const [filterVisible, setFilterVisible] =
    useState(false);
  const [selectedDistance, setSelectedDistance] =
    useState('Nearby');
  const [selectedTradition, setSelectedTradition] =
    useState('All');
  const [selectedPurpose, setSelectedPurpose] =
    useState('Connect');

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#FAFAFA',
      }}>
      <StatusBar
        backgroundColor="#FAFAFA"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 22,
            paddingTop: 24,
          }}>
          <Text
            style={{
              color: '#111827',
              fontSize: 24,
              fontWeight: '800',
              letterSpacing: -0.4,
            }}>
            Discovery
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFilterVisible(true)}
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 27,
              elevation: 2,
              height: 54,
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.03,
              shadowRadius: 10,
              width: 54,
            }}>
            <Ionicons
              name="options-outline"
              size={24}
              color="#111827"
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            paddingHorizontal: 22,
            paddingTop: 14,
          }}>
          {[
            selectedDistance,
            selectedTradition,
            selectedPurpose,
          ].map((item) => (
            <View
              key={item}
              style={{
                backgroundColor: '#FFF7ED',
                borderColor: '#FDE7CF',
                borderRadius: 14,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 7,
              }}>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 12,
                  fontWeight: '800',
                }}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            backgroundColor: '#FFFDFC',
            borderColor: '#F5EFE7',
            borderRadius: 30,
            borderWidth: 1,
            elevation: 2,
            marginHorizontal: 16,
            marginTop: 22,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 6,
            },
            shadowOpacity: 0.03,
            shadowRadius: 10,
          }}>
          <Text
            style={{
              color: '#111827',
              fontSize: 28,
              fontWeight: '800',
              letterSpacing: -0.6,
              lineHeight: 34,
            }}>
            Find Your Sangha
          </Text>

          <Text
            style={{
              color: '#6B7280',
              fontSize: 17,
              fontWeight: '500',
              lineHeight: 30,
              marginTop: 12,
            }}>
            Connect with devotees who share your tradition and spiritual journey.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/sangha-hub')}
            style={{
              alignItems: 'center',
              backgroundColor: '#111111',
              borderRadius: 22,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 26,
              padding: 18,
            }}>
            <View
              style={{
                flex: 1,
              }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontWeight: '900',
                }}>
                Sangha Hub
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.72)',
                  fontSize: 14,
                  fontWeight: '600',
                  lineHeight: 21,
                  marginTop: 5,
                }}>
                Groups, invitations, chapters, seva and bhajan communities
              </Text>
            </View>

            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#FFF7ED',
                borderRadius: 22,
                height: 44,
                justifyContent: 'center',
                marginLeft: 14,
                width: 44,
              }}>
              <Ionicons
                name="arrow-forward"
                size={22}
                color="#F97316"
              />
            </View>
          </TouchableOpacity>

          <View
            style={{
              alignItems: 'flex-start',
              flexDirection: 'row',
              marginTop: 28,
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#FFF3E8',
                borderRadius: 28,
                height: 56,
                justifyContent: 'center',
                width: 56,
              }}>
              <Ionicons
                name="location"
                size={24}
                color="#EE9B52"
              />
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: 16,
              }}>
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
                    fontWeight: '700',
                  }}>
                  Near Me Discovery
                </Text>

                <Switch
                  value={enabled}
                  onValueChange={setEnabled}
                  trackColor={{
                    false: '#E5E7EB',
                    true: '#F6C28B',
                  }}
                  thumbColor={enabled ? '#EE9B52' : '#FFFFFF'}
                />
              </View>

              <Text
                style={{
                  color: '#6B7280',
                  fontSize: 14,
                  fontWeight: '500',
                  lineHeight: 25,
                  marginTop: 8,
                }}>
                Opt-in to see devotees nearby. Others will see only your
                approximate area.
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: 36,
            paddingHorizontal: 20,
          }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: '#111827',
                fontSize: 20,
                fontWeight: '800',
              }}>
              Near You
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/sangha-list',
                  params: {
                    type: 'near',
                  },
                })
              }>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 15,
                  fontWeight: '700',
                }}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 18,
            }}>
            {nearYou.map((item, index) => (
              <TouchableOpacity
                key={item.name}
                activeOpacity={0.9}
                onPress={() => router.push('/sangha-profile')}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#F0F0F0',
                  borderRadius: 26,
                  borderWidth: 1,
                  elevation: 2,
                  paddingBottom: 18,
                  paddingHorizontal: 14,
                  paddingTop: 20,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  width: '48%',
                }}>
                <Image
                  source={{ uri: item.image }}
                  style={{
                    borderRadius: 36,
                    height: 72,
                    width: 72,
                  }}
                />

                <Text
                  style={{
                    color: '#111827',
                    fontSize: 16,
                    fontWeight: '800',
                    marginTop: 16,
                    textAlign: 'center',
                  }}>
                  {item.name}
                </Text>

                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 13,
                    fontWeight: '600',
                    marginTop: 6,
                    textAlign: 'center',
                  }}>
                  {item.tradition}
                </Text>

                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#FFF7ED',
                    borderRadius: 18,
                    flexDirection: 'row',
                    height: 36,
                    justifyContent: 'center',
                    marginTop: 14,
                    paddingHorizontal: 12,
                  }}>
                  <Ionicons
                    name={index === 0 ? 'people' : 'location'}
                    size={13}
                    color="#F97316"
                  />
                  <Text
                    style={{
                      color: '#6B7280',
                      fontSize: 11,
                      fontWeight: '600',
                      lineHeight: 15,
                      marginLeft: 5,
                      textAlign: 'center',
                    }}>
                    {item.mutual}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View
          style={{
            marginTop: 36,
            paddingHorizontal: 16,
          }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}>
            <Text
              style={{
                color: '#111827',
                fontSize: 20,
                fontWeight: '800',
              }}>
              Suggested For You
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/sangha-list',
                  params: {
                    type: 'suggested',
                  },
                })
              }>
              <Text
                style={{
                  color: '#F97316',
                  fontSize: 15,
                  fontWeight: '700',
                }}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {suggested.map((item, index) => (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.9}
              onPress={() => router.push('/sangha-profile')}
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#F1F1F1',
                borderRadius: 28,
                borderWidth: 1,
                elevation: 2,
                marginBottom: 18,
                padding: 18,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.03,
                shadowRadius: 10,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Image
                  source={{ uri: item.image }}
                  style={{
                    borderRadius: 30,
                    height: 60,
                    width: 60,
                  }}
                />

                <View
                  style={{
                    flex: 1,
                    marginLeft: 16,
                  }}>
                  <Text
                    style={{
                      color: '#111827',
                      fontSize: 18,
                      fontWeight: '800',
                    }}>
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      color: '#6B7280',
                      fontSize: 14,
                      fontWeight: '600',
                      marginTop: 4,
                    }}>
                    {item.subtitle}
                  </Text>

                  <View
                    style={{
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      backgroundColor: '#FFF7ED',
                      borderRadius: 10,
                      flexDirection: 'row',
                      marginTop: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}>
                    <Ionicons
                      name={index === 0 ? 'flame' : 'business'}
                      size={13}
                      color="#F97316"
                    />
                    <Text
                      style={{
                        color: '#F97316',
                        fontSize: 12,
                        fontWeight: '700',
                        marginLeft: 5,
                      }}>
                      {item.badge}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
        transparent
        visible={filterVisible}>
        <View
          style={{
            backgroundColor: 'rgba(17,24,39,0.38)',
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              backgroundColor: '#FAFAFA',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingBottom: 28,
              paddingHorizontal: 20,
              paddingTop: 18,
            }}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: '#111827',
                  fontSize: 22,
                  fontWeight: '900',
                }}>
                Filter Sangha
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setFilterVisible(false)}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  height: 36,
                  justifyContent: 'center',
                  width: 36,
                }}>
                <Ionicons
                  name="close"
                  size={20}
                  color="#111827"
                />
              </TouchableOpacity>
            </View>

            {[
              {
                label: 'Distance',
                options: filters.distance,
                selected: selectedDistance,
                setSelected: setSelectedDistance,
              },
              {
                label: 'Tradition',
                options: filters.tradition,
                selected: selectedTradition,
                setSelected: setSelectedTradition,
              },
              {
                label: 'Purpose',
                options: filters.purpose,
                selected: selectedPurpose,
                setSelected: setSelectedPurpose,
              },
            ].map((group) => (
              <View
                key={group.label}
                style={{
                  marginTop: 22,
                }}>
                <Text
                  style={{
                    color: '#374151',
                    fontSize: 14,
                    fontWeight: '900',
                    letterSpacing: 0.4,
                    marginBottom: 12,
                  }}>
                  {group.label}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}>
                  {group.options.map((option) => {
                    const active =
                      group.selected === option;

                    return (
                      <TouchableOpacity
                        key={option}
                        activeOpacity={0.85}
                        onPress={() =>
                          group.setSelected(option)
                        }
                        style={{
                          backgroundColor: active
                            ? '#111111'
                            : '#FFFFFF',
                          borderColor: active
                            ? '#111111'
                            : '#EFEFEF',
                          borderRadius: 18,
                          borderWidth: 1,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                        }}>
                        <Text
                          style={{
                            color: active
                              ? '#FFFFFF'
                              : '#4B5563',
                            fontSize: 13,
                            fontWeight: '800',
                          }}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                marginTop: 28,
              }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedDistance('Nearby');
                  setSelectedTradition('All');
                  setSelectedPurpose('Connect');
                }}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#EFEFEF',
                  borderRadius: 18,
                  borderWidth: 1,
                  flex: 1,
                  height: 52,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#4B5563',
                    fontSize: 15,
                    fontWeight: '900',
                  }}>
                  Reset
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setFilterVisible(false)}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#F97316',
                  borderRadius: 18,
                  flex: 1,
                  height: 52,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 15,
                    fontWeight: '900',
                  }}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
