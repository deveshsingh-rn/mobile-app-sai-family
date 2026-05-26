import React, {useState} from 'react';
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Switch,
} from 'react-native';


import {
  Ionicons,
  MaterialCommunityIcons,Feather
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const steps = ['Identity', 'Details', 'Contact', 'Media'];

const categories = [
  'Healthcare',
  'Education',
  'Technology',
  'Retail',
  'Food',
  'Services',
];

const CreateListingScreen = () => {
  const [step, setStep] = useState(1);

  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Food');

  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [homeService, setHomeService] = useState(true);

  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  const [recommended, setRecommended] = useState(true);

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderHeader = () => {
    return (
      <View
        style={{
          backgroundColor: '#FF9A2F',
          paddingTop: 18,
          paddingHorizontal: 22,
          paddingBottom: 42,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          overflow: 'hidden',
        }}>
        {/* Top */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={prevStep}
            style={{
              position: 'absolute',
              left: 0,
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: 'rgba(255,255,255,0.22)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons
              name={step === 1 ? 'close' : 'arrow-back'}
              size={30}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 24,
              color: '#FFFFFF',
              fontWeight: '800',
            }}>
            Create Listing
          </Text>
        </View>

        {/* Progress */}
        <View
          style={{
            marginTop: 34,
          }}>
          <View
            style={{
              height: 20,
              borderRadius: 100,
              backgroundColor: 'rgba(255,255,255,0.35)',
              overflow: 'hidden',
              paddingHorizontal: 4,
              justifyContent: 'center',
            }}>
            <View
              style={{
                width:
                  step === 1
                    ? '24%'
                    : step === 2
                    ? '49%'
                    : step === 3
                    ? '74%'
                    : '100%',
                height: 12,
                borderRadius: 100,
                backgroundColor: '#FFFFFF',
              }}
            />
          </View>

          {/* Step Names */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 16,
            }}>
            {steps.map((item, index) => (
              <Text
                key={index}
                style={{
                  fontSize: 15,
                  fontWeight:
                    step === index + 1 ? '700' : '500',
                  color:
                    step === index + 1
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.72)',
                }}>
                {item}
              </Text>
            ))}
          </View>
        </View>

        {/* Bottom Curve */}
        <View
          style={{
            position: 'absolute',
            bottom: -18,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          {Array.from({length: 15}).map((_, index) => (
            <View
              key={index}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: '#F7F7F7',
              }}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderInput = (
    label: string,
    placeholder: string,
    value: string,
    setValue: any,
    multiline = false,
  ) => {
    return (
      <View
        style={{
          marginTop: 30,
        }}>
        <Text
          style={{
            fontSize: 14,
            letterSpacing: 0.8,
            color: '#374151',
            fontWeight: '800',
            marginBottom: 14,
          }}>
          {label}
        </Text>

        <View
          style={{
            minHeight: multiline ? 150 : 82,
            borderRadius: 22,
            borderWidth: 1.5,
            borderColor: '#E5E7EB',
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 24,
            paddingTop: multiline ? 24 : 0,
            justifyContent: multiline
              ? 'flex-start'
              : 'center',
          }}>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#C7CBD3"
            multiline={multiline}
            style={{
              fontSize: 18,
              color: '#111827',
              fontWeight: '500',
              textAlignVertical: multiline
                ? 'top'
                : 'center',
            }}
          />
        </View>
      </View>
    );
  };

  const renderIdentity = () => {
    return (
      <>
        {/* Icon */}
        <View
          style={{
            alignItems: 'center',
            marginTop: 10,
          }}>
          <View
            style={{
              width: 106,
              height: 106,
              borderRadius: 30,
              backgroundColor: '#FFF5EB',
              borderWidth: 1.5,
              borderColor: '#FFD7B0',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <MaterialCommunityIcons
              name="storefront"
              size={46}
              color="#FF9A2F"
            />
          </View>
        </View>

        <Text
          style={{
            marginTop: 28,
            textAlign: 'center',
            fontSize: 26,
            fontWeight: '800',
            color: '#111827',
          }}>
          Who are you?
        </Text>

        <Text
          style={{
            marginTop: 14,
            textAlign: 'center',
            fontSize: 17,
            lineHeight: 31,
            color: '#6B7280',
            fontWeight: '500',
            paddingHorizontal: 20,
          }}>
          Introduce your business to the Sai
          family community.
        </Text>

        {renderInput(
          'BUSINESS NAME',
          'e.g. Sai Spiritual Store',
          businessName,
          setBusinessName,
        )}

        {/* Category */}
        <View
          style={{
            marginTop: 30,
          }}>
          <Text
            style={{
              fontSize: 14,
              letterSpacing: 0.8,
              color: '#374151',
              fontWeight: '800',
              marginBottom: 14,
            }}>
            CATEGORY
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}>
            {categories.map((item, index) => {
              const active =
                selectedCategory === item;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  onPress={() =>
                    setSelectedCategory(item)
                  }
                  style={{
                    paddingHorizontal: 22,
                    height: 46,
                    borderRadius: 18,
                    backgroundColor: active
                      ? '#FF9A2F'
                      : '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: active
                      ? '#FF9A2F'
                      : '#E5E7EB',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: active
                        ? '#FFFFFF'
                        : '#374151',
                    }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {renderInput(
          'TAGLINE (OPTIONAL)',
          'Your short, catchy motto',
          tagline,
          setTagline,
        )}
      </>
    );
  };

  const renderDetails = () => {
    return (
      <>
        <View
          style={{
            alignItems: 'center',
            marginTop: 10,
          }}>
          <View
            style={{
              width: 106,
              height: 106,
              borderRadius: 30,
              backgroundColor: '#EEF4FF',
              borderWidth: 1.5,
              borderColor: '#CFE0FF',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Feather
              name="file-text"
              size={42}
              color="#2563EB"
            />
          </View>
        </View>

        <Text
          style={{
            marginTop: 28,
            textAlign: 'center',
            fontSize: 26,
            fontWeight: '800',
            color: '#111827',
          }}>
          Business Details
        </Text>

        <Text
          style={{
            marginTop: 14,
            textAlign: 'center',
            fontSize: 17,
            lineHeight: 31,
            color: '#6B7280',
            fontWeight: '500',
            paddingHorizontal: 20,
          }}>
          Tell devotees more about your
          services and experience.
        </Text>

        {renderInput(
          'DESCRIPTION',
          'Write about your services...',
          description,
          setDescription,
          true,
        )}

        {renderInput(
          'YEARS OF EXPERIENCE',
          'e.g. 12 Years',
          experience,
          setExperience,
        )}

        {/* Home Service */}
        <View
          style={{
            marginTop: 32,
            height: 82,
            borderRadius: 22,
            borderWidth: 1.5,
            borderColor: '#E5E7EB',
            backgroundColor: '#FFFFFF',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}>
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#111827',
              }}>
              Home Service Available
            </Text>

            <Text
              style={{
                marginTop: 6,
                fontSize: 14,
                color: '#6B7280',
                fontWeight: '500',
              }}>
              Offer service at customer location
            </Text>
          </View>

          <Switch
            value={homeService}
            onValueChange={setHomeService}
            trackColor={{
              false: '#D1D5DB',
              true: '#FDBA74',
            }}
            thumbColor={
              homeService ? '#FF9A2F' : '#FFFFFF'
            }
          />
        </View>
      </>
    );
  };

  const renderContact = () => {
    return (
      <>
        <View
          style={{
            alignItems: 'center',
            marginTop: 10,
          }}>
          <View
            style={{
              width: 106,
              height: 106,
              borderRadius: 30,
              backgroundColor: '#ECFDF5',
              borderWidth: 1.5,
              borderColor: '#BBF7D0',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons
              name="call"
              size={42}
              color="#22C55E"
            />
          </View>
        </View>

        <Text
          style={{
            marginTop: 28,
            textAlign: 'center',
            fontSize: 26,
            fontWeight: '800',
            color: '#111827',
          }}>
          Contact Details
        </Text>

        <Text
          style={{
            marginTop: 14,
            textAlign: 'center',
            fontSize: 17,
            lineHeight: 31,
            color: '#6B7280',
            fontWeight: '500',
            paddingHorizontal: 20,
          }}>
          Help devotees connect with your
          business easily.
        </Text>

        {renderInput(
          'PHONE NUMBER',
          '+91 9876543210',
          phone,
          setPhone,
        )}

        {renderInput(
          'WHATSAPP NUMBER',
          '+91 9876543210',
          whatsapp,
          setWhatsapp,
        )}

        {renderInput(
          'ADDRESS',
          'Enter your business address',
          address,
          setAddress,
        )}

        {renderInput(
          'CITY',
          'e.g. Delhi',
          city,
          setCity,
        )}
      </>
    );
  };

  const renderMedia = () => {
    return (
      <>
        <View
          style={{
            alignItems: 'center',
            marginTop: 10,
          }}>
          <View
            style={{
              width: 106,
              height: 106,
              borderRadius: 30,
              backgroundColor: '#F3E8FF',
              borderWidth: 1.5,
              borderColor: '#E9D5FF',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons
              name="images"
              size={42}
              color="#9333EA"
            />
          </View>
        </View>

        <Text
          style={{
            marginTop: 28,
            textAlign: 'center',
            fontSize: 26,
            fontWeight: '800',
            color: '#111827',
          }}>
          Add Media
        </Text>

        <Text
          style={{
            marginTop: 14,
            textAlign: 'center',
            fontSize: 17,
            lineHeight: 31,
            color: '#6B7280',
            fontWeight: '500',
            paddingHorizontal: 20,
          }}>
          Upload photos to build trust and
          showcase your work.
        </Text>

        {/* Upload Boxes */}
        <View
          style={{
            marginTop: 40,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
          {[1, 2, 3, 4].map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              style={{
                width: '48%',
                height: 170,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: '#E5E7EB',
                borderStyle: 'dashed',
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}>
              <Ionicons
                name="cloud-upload-outline"
                size={40}
                color="#9CA3AF"
              />

              <Text
                style={{
                  marginTop: 12,
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#4B5563',
                }}>
                Upload Image
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommend */}
        <View
          style={{
            marginTop: 10,
            height: 88,
            borderRadius: 22,
            backgroundColor: '#FFFFFF',
            borderWidth: 1.5,
            borderColor: '#E5E7EB',
            paddingHorizontal: 24,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              flex: 1,
              paddingRight: 20,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#111827',
              }}>
              Enable Community Recommendation
            </Text>

            <Text
              style={{
                marginTop: 6,
                fontSize: 14,
                color: '#6B7280',
                fontWeight: '500',
              }}>
              Allow devotees to recommend your
              business publicly
            </Text>
          </View>

          <Switch
            value={recommended}
            onValueChange={setRecommended}
            trackColor={{
              false: '#D1D5DB',
              true: '#86EFAC',
            }}
            thumbColor={
              recommended ? '#22C55E' : '#FFFFFF'
            }
          />
        </View>
      </>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F7F7',
      }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#FF9A2F"
      />

      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: 40,
          paddingTop: 24,
        }}>
        {/* STEP 1 */}
        {step === 1 && renderIdentity()}

        {/* STEP 2 */}
        {step === 2 && renderDetails()}

        {/* STEP 3 */}
        {step === 3 && renderContact()}

        {/* STEP 4 */}
        {step === 4 && renderMedia()}

        {/* Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={nextStep}
          style={{
            marginTop: 42,
            height: 78,
            borderRadius: 24,
            backgroundColor: '#FF9A2F',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            shadowColor: '#E85D04',
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.32,
            shadowRadius: 12,
            elevation: 8,
          }}>
          <Text
            style={{
              fontSize: 22,
              color: '#FFFFFF',
              fontWeight: '800',
            }}>
            {step === 4
              ? 'Submit Listing'
              : 'Continue'}
          </Text>

          <Ionicons
            name={
              step === 4
                ? 'checkmark'
                : 'arrow-forward'
            }
            size={28}
            color="#FFFFFF"
            style={{
              marginLeft: 10,
            }}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateListingScreen;