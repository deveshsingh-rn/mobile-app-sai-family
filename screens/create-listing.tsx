import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createDirectoryDraftRequest,
  createDirectoryListingRequest,
  fetchDirectoryCategoriesRequest,
  selectCurrentDirectoryDraft,
  selectDirectoryCategories,
  selectDirectoryError,
  selectDirectoryUploadedMedia,
  selectIsCreatingDirectoryListing,
  selectIsSavingDirectoryDraft,
  selectIsUploadingDirectoryMedia,
  updateDirectoryDraftRequest,
  uploadDirectoryMediaRequest,
} from '@/store/directory';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type {
  DirectoryCreateListingPayload,
  DirectoryUploadMediaPayload,
} from '@/store/directory/types';
import { validateDirectoryListingPayload } from '@/store/directory/validation';

const steps = ['Identity', 'Details', 'Contact', 'Media'];

type SelectedImage = {
  mimeType?: string;
  name: string;
  uri: string;
};

const CreateListingScreen = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectDirectoryCategories);
  const draft = useAppSelector(selectCurrentDirectoryDraft);
  const draftSaving = useAppSelector(selectIsSavingDirectoryDraft);
  const creating = useAppSelector(selectIsCreatingDirectoryListing);
  const uploadingMedia = useAppSelector(selectIsUploadingDirectoryMedia);
  const uploadedMedia = useAppSelector(selectDirectoryUploadedMedia);
  const error = useAppSelector(selectDirectoryError);

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [homeService, setHomeService] = useState(true);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [recommended, setRecommended] = useState(true);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [pendingSubmitPayload, setPendingSubmitPayload] =
    useState<DirectoryCreateListingPayload | null>(null);
  const [submitStartedAt, setSubmitStartedAt] = useState<number | null>(null);
  const [submitObservedBusy, setSubmitObservedBusy] = useState(false);

  useEffect(() => {
    dispatch(fetchDirectoryCategoriesRequest({ includeCounts: true }));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedCategoryId && categories.length) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = useMemo(
    () =>
      categories.find((item) => item.id === selectedCategoryId) ||
      null,
    [categories, selectedCategoryId]
  );

  const toPayload = useCallback(
    (includePartial = false): Partial<DirectoryCreateListingPayload> => {
      const yearsOfExperience = Number.parseInt(
        experience.replace(/[^\d]/g, ''),
        10
      );

      const payload: Partial<DirectoryCreateListingPayload> = {
        address: address.trim(),
        businessName: businessName.trim(),
        categoryId: selectedCategoryId,
        city: city.trim(),
        communityRecommendationEnabled: recommended,
        description: description.trim(),
        homeServiceAvailable: homeService,
        phoneNumber: phone.trim(),
        tagline: tagline.trim(),
        whatsappNumber: whatsapp.trim(),
        yearsOfExperience: Number.isFinite(yearsOfExperience)
          ? yearsOfExperience
          : undefined,
      };

      if (includePartial) {
        return Object.fromEntries(
          Object.entries(payload).filter(([, value]) => {
            if (typeof value === 'string') {
              return value.trim().length > 0;
            }

            return value !== undefined && value !== null;
          })
        ) as Partial<DirectoryCreateListingPayload>;
      }

      return payload;
    },
    [
      address,
      businessName,
      city,
      description,
      experience,
      homeService,
      phone,
      recommended,
      selectedCategoryId,
      tagline,
      whatsapp,
    ]
  );

  const saveDraft = useCallback(() => {
    const payload = toPayload(true);

    if (!Object.keys(payload).length || draftSaving) {
      return;
    }

    if (draft?.id) {
      dispatch(updateDirectoryDraftRequest(draft.id, payload));
    } else {
      dispatch(createDirectoryDraftRequest(payload));
    }
  }, [dispatch, draft?.id, draftSaving, toPayload]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        businessName.trim() ||
        description.trim() ||
        phone.trim() ||
        whatsapp.trim() ||
        address.trim()
      ) {
        saveDraft();
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    address,
    businessName,
    description,
    phone,
    saveDraft,
    whatsapp,
  ]);

  const getStepErrors = (targetStep: number) => {
    const payload = toPayload();
    const nextErrors: Record<string, string> = {};

    if (targetStep >= 1) {
      if (!payload.businessName) {
        nextErrors.businessName = 'Business name is required.';
      }

      if (!payload.categoryId) {
        nextErrors.categoryId = 'Category is required.';
      }
    }

    if (targetStep >= 2) {
      if (!payload.description || payload.description.length < 20) {
        nextErrors.description =
          'Description must be at least 20 characters.';
      }
    }

    if (targetStep >= 3) {
      if (!payload.phoneNumber && !payload.whatsappNumber) {
        nextErrors.phoneNumber =
          'Phone or WhatsApp number is required.';
      }

      if (!payload.address || payload.address.length < 5) {
        nextErrors.address =
          'Address must be at least 5 characters.';
      }

      if (!payload.city || payload.city.length < 2) {
        nextErrors.city = 'City is required.';
      }
    }

    return nextErrors;
  };

  const nextStep = () => {
    const nextErrors = getStepErrors(step);

    if (Object.keys(nextErrors).length) {
      setValidationErrors(nextErrors);
      return;
    }

    setValidationErrors({});

    if (step < 4) {
      setStep(step + 1);
      saveDraft();
      return;
    }

    submitListing();
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      return;
    }

    router.back();
  };

  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Media', 'You can add up to 4 images from this form.');
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Please allow photo access to add listing images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    const name =
      asset.fileName ||
      `directory-${Date.now()}.${asset.uri.split('.').pop() || 'jpg'}`;

    setImages((current) => [
      ...current,
      {
        mimeType: asset.mimeType || 'image/jpeg',
        name,
        uri: asset.uri,
      },
    ]);
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, i) => i !== index));
  };

  const extractUploadedUrls = useCallback(() => {
    if (!uploadedMedia) {
      return [];
    }

    const urls = [
      uploadedMedia.url,
      ...(uploadedMedia.urls || []),
      ...(Array.isArray(uploadedMedia.media)
        ? uploadedMedia.media.map((item) => item.url)
        : uploadedMedia.media?.url
        ? [uploadedMedia.media.url]
        : []),
    ].filter(Boolean) as string[];

    return Array.from(new Set(urls));
  }, [uploadedMedia]);

  useEffect(() => {
    if (!pendingSubmitPayload || !submitStartedAt || uploadingMedia) {
      return;
    }

    const urls = extractUploadedUrls();

    if (images.length > 0 && urls.length === 0) {
      return;
    }

    dispatch(
      createDirectoryListingRequest({
        ...pendingSubmitPayload,
        bannerUrl: urls[0],
        galleryUrls: urls,
        logoUrl: urls[0],
      })
    );
    setPendingSubmitPayload(null);
    setSubmitStartedAt(null);
  }, [
    dispatch,
    extractUploadedUrls,
    images.length,
    pendingSubmitPayload,
    submitStartedAt,
    uploadingMedia,
  ]);

  useEffect(() => {
    if (submitStartedAt && (creating || uploadingMedia)) {
      setSubmitObservedBusy(true);
    }
  }, [creating, submitStartedAt, uploadingMedia]);

  useEffect(() => {
    if (creating || uploadingMedia || pendingSubmitPayload || !submitStartedAt) {
      return;
    }

    if (!submitObservedBusy) {
      return;
    }

    if (!error) {
      Alert.alert(
        'Listing submitted',
        'Your listing has been submitted for review.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
      setSubmitObservedBusy(false);
      setSubmitStartedAt(null);
    }
  }, [
    creating,
    error,
    pendingSubmitPayload,
    submitObservedBusy,
    submitStartedAt,
    uploadingMedia,
  ]);

  const submitListing = () => {
    const payload = toPayload() as DirectoryCreateListingPayload;
    const validation = validateDirectoryListingPayload(payload);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      const firstMessage = Object.values(validation.errors)[0];
      Alert.alert('Check listing details', firstMessage);
      return;
    }

    setValidationErrors({});
    setSubmitStartedAt(Date.now());

    if (images.length > 0) {
      const files: NonNullable<DirectoryUploadMediaPayload['files']> =
        images.map((image) => ({
          mimeType: image.mimeType,
          name: image.name,
          type: image.mimeType || 'image/jpeg',
          uri: image.uri,
        }));

      setPendingSubmitPayload(payload);
      dispatch(uploadDirectoryMediaRequest({ files }));
      return;
    }

    dispatch(createDirectoryListingRequest(payload));
  };

  const renderError = (field: string) =>
    validationErrors[field] ? (
      <Text
        style={{
          color: '#DC2626',
          fontSize: 12,
          fontWeight: '700',
          marginTop: 8,
        }}>
        {validationErrors[field]}
      </Text>
    ) : null;

  const renderHeader = () => (
    <View
      style={{
        backgroundColor: '#FF9A2F',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: 'hidden',
        paddingBottom: 42,
        paddingHorizontal: 22,
        paddingTop: 18,
      }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          position: 'relative',
        }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={prevStep}
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.22)',
            borderRadius: 27,
            height: 54,
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            width: 54,
          }}>
          <Ionicons
            name={step === 1 ? 'close' : 'arrow-back'}
            size={30}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 24,
              fontWeight: '800',
              textAlign: 'center',
            }}>
            Create Listing
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: 12,
              fontWeight: '700',
              marginTop: 4,
              textAlign: 'center',
            }}>
            {draftSaving ? 'Saving draft...' : draft?.id ? 'Draft saved' : 'Auto-save enabled'}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 34,
        }}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.35)',
            borderRadius: 100,
            height: 20,
            justifyContent: 'center',
            overflow: 'hidden',
            paddingHorizontal: 4,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 100,
              height: 12,
              width:
                step === 1
                  ? '24%'
                  : step === 2
                  ? '49%'
                  : step === 3
                  ? '74%'
                  : '100%',
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 16,
          }}>
          {steps.map((item, index) => (
            <Text
              key={item}
              style={{
                color:
                  step === index + 1
                    ? '#FFFFFF'
                    : 'rgba(255,255,255,0.72)',
                fontSize: 15,
                fontWeight: step === index + 1 ? '700' : '500',
              }}>
              {item}
            </Text>
          ))}
        </View>
      </View>

      <View
        style={{
          bottom: -18,
          flexDirection: 'row',
          justifyContent: 'space-between',
          left: 0,
          position: 'absolute',
          right: 0,
        }}>
        {Array.from({ length: 15 }).map((_, index) => (
          <View
            key={index}
            style={{
              backgroundColor: '#F7F7F7',
              borderRadius: 17,
              height: 34,
              width: 34,
            }}
          />
        ))}
      </View>
    </View>
  );

  const renderInput = (
    label: string,
    placeholder: string,
    value: string,
    setValue: (value: string) => void,
    field: string,
    multiline = false
  ) => (
    <View
      style={{
        marginTop: 22,
      }}>
      <Text
        style={{
          color: '#374151',
          fontSize: 14,
          fontWeight: '800',
          letterSpacing: 0.8,
          marginBottom: 14,
        }}>
        {label}
      </Text>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: validationErrors[field] ? '#FCA5A5' : '#E5E7EB',
          borderRadius: 16,
          borderWidth: 1.5,
          justifyContent: multiline ? 'flex-start' : 'center',
          minHeight: multiline ? 118 : 58,
          paddingHorizontal: 18,
          paddingTop: multiline ? 16 : 0,
        }}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#C7CBD3"
          multiline={multiline}
          style={{
            color: '#111827',
            fontSize: 16,
            fontWeight: '500',
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
      </View>
      {renderError(field)}
    </View>
  );

  const renderIdentity = () => (
    <>
      <View
        style={{
          alignItems: 'center',
          marginTop: 10,
        }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#FFF5EB',
            borderColor: '#FFD7B0',
            borderRadius: 30,
            borderWidth: 1.5,
            height: 106,
            justifyContent: 'center',
            width: 106,
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
          color: '#111827',
          fontSize: 26,
          fontWeight: '800',
          marginTop: 28,
          textAlign: 'center',
        }}>
        Who are you?
      </Text>

      <Text
        style={{
          color: '#6B7280',
          fontSize: 17,
          fontWeight: '500',
          lineHeight: 31,
          marginTop: 14,
          paddingHorizontal: 20,
          textAlign: 'center',
        }}>
        Introduce your business to the Sai family community.
      </Text>

      {renderInput(
        'BUSINESS NAME',
        'e.g. Sai Spiritual Store',
        businessName,
        setBusinessName,
        'businessName'
      )}

      <View
        style={{
          marginTop: 30,
        }}>
        <Text
          style={{
            color: '#374151',
            fontSize: 14,
            fontWeight: '800',
            letterSpacing: 0.8,
            marginBottom: 14,
          }}>
          CATEGORY
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}>
          {categories.map((item) => {
            const active = selectedCategoryId === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => setSelectedCategoryId(item.id)}
                style={{
                  alignItems: 'center',
                  backgroundColor: active ? '#FF9A2F' : '#FFFFFF',
                  borderColor: active ? '#FF9A2F' : '#E5E7EB',
                  borderRadius: 18,
                  borderWidth: 1.5,
                  height: 46,
                  justifyContent: 'center',
                  marginRight: 12,
                  paddingHorizontal: 22,
                }}>
                <Text
                  style={{
                    color: active ? '#FFFFFF' : '#374151',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {renderError('categoryId')}
        {!categories.length ? (
          <Text
            style={{
              color: '#9CA3AF',
              fontSize: 12,
              fontWeight: '700',
              marginTop: 8,
            }}>
            Categories are loading from Directory API.
          </Text>
        ) : null}
      </View>

      {renderInput(
        'TAGLINE (OPTIONAL)',
        'Your short, catchy motto',
        tagline,
        setTagline,
        'tagline'
      )}
    </>
  );

  const renderDetails = () => (
    <>
      <View
        style={{
          alignItems: 'center',
          marginTop: 10,
        }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#EEF4FF',
            borderColor: '#CFE0FF',
            borderRadius: 30,
            borderWidth: 1.5,
            height: 106,
            justifyContent: 'center',
            width: 106,
          }}>
          <Feather name="file-text" size={42} color="#2563EB" />
        </View>
      </View>

      <Text
        style={{
          color: '#111827',
          fontSize: 26,
          fontWeight: '800',
          marginTop: 28,
          textAlign: 'center',
        }}>
        Business Details
      </Text>

      <Text
        style={{
          color: '#6B7280',
          fontSize: 17,
          fontWeight: '500',
          lineHeight: 31,
          marginTop: 14,
          paddingHorizontal: 20,
          textAlign: 'center',
        }}>
        Tell devotees more about your services and experience.
      </Text>

      {renderInput(
        'DESCRIPTION',
        'Write about your services...',
        description,
        setDescription,
        'description',
        true
      )}

      {renderInput(
        'YEARS OF EXPERIENCE',
        'e.g. 12 Years',
        experience,
        setExperience,
        'yearsOfExperience'
      )}

      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
          borderRadius: 16,
          borderWidth: 1.5,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 32,
          minHeight: 64,
          paddingHorizontal: 18,
        }}>
        <View>
          <Text
            style={{
              color: '#111827',
              fontSize: 18,
              fontWeight: '700',
            }}>
            Home Service Available
          </Text>

          <Text
            style={{
              color: '#6B7280',
              fontSize: 14,
              fontWeight: '500',
              marginTop: 6,
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
          thumbColor={homeService ? '#FF9A2F' : '#FFFFFF'}
        />
      </View>
    </>
  );

  const renderContact = () => (
    <>
      <View
        style={{
          alignItems: 'center',
          marginTop: 10,
        }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#ECFDF5',
            borderColor: '#BBF7D0',
            borderRadius: 30,
            borderWidth: 1.5,
            height: 106,
            justifyContent: 'center',
            width: 106,
          }}>
          <Ionicons name="call" size={42} color="#22C55E" />
        </View>
      </View>

      <Text
        style={{
          color: '#111827',
          fontSize: 26,
          fontWeight: '800',
          marginTop: 28,
          textAlign: 'center',
        }}>
        Contact Details
      </Text>

      <Text
        style={{
          color: '#6B7280',
          fontSize: 17,
          fontWeight: '500',
          lineHeight: 31,
          marginTop: 14,
          paddingHorizontal: 20,
          textAlign: 'center',
        }}>
        Help devotees connect with your business easily.
      </Text>

      {renderInput('PHONE NUMBER', '+91 9876543210', phone, setPhone, 'phoneNumber')}
      {renderInput('WHATSAPP NUMBER', '+91 9876543210', whatsapp, setWhatsapp, 'whatsappNumber')}
      {renderInput('ADDRESS', 'Enter your business address', address, setAddress, 'address')}
      {renderInput('CITY', 'e.g. Delhi', city, setCity, 'city')}
    </>
  );

  const renderMedia = () => (
    <>
      <View
        style={{
          alignItems: 'center',
          marginTop: 10,
        }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#F3E8FF',
            borderColor: '#E9D5FF',
            borderRadius: 30,
            borderWidth: 1.5,
            height: 106,
            justifyContent: 'center',
            width: 106,
          }}>
          <Ionicons name="images" size={42} color="#9333EA" />
        </View>
      </View>

      <Text
        style={{
          color: '#111827',
          fontSize: 26,
          fontWeight: '800',
          marginTop: 28,
          textAlign: 'center',
        }}>
        Add Media
      </Text>

      <Text
        style={{
          color: '#6B7280',
          fontSize: 17,
          fontWeight: '500',
          lineHeight: 31,
          marginTop: 14,
          paddingHorizontal: 20,
          textAlign: 'center',
        }}>
        Upload photos to build trust and showcase your work.
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginTop: 40,
        }}>
        {[0, 1, 2, 3].map((index) => {
          const image = images[index];

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              onPress={image ? () => removeImage(index) : pickImage}
              style={{
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderColor: image ? '#FDBA74' : '#E5E7EB',
                borderRadius: 24,
                borderStyle: image ? 'solid' : 'dashed',
                borderWidth: 2,
                height: 170,
                justifyContent: 'center',
                marginBottom: 16,
                overflow: 'hidden',
                width: '48%',
              }}>
              {image ? (
                <>
                  <Image
                    source={{ uri: image.uri }}
                    style={{
                      height: '100%',
                      width: '100%',
                    }}
                  />
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.42)',
                      bottom: 0,
                      height: 34,
                      justifyContent: 'center',
                      left: 0,
                      position: 'absolute',
                      right: 0,
                    }}>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: '800',
                      }}>
                      Remove
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={40} color="#9CA3AF" />
                  <Text
                    style={{
                      color: '#4B5563',
                      fontSize: 16,
                      fontWeight: '700',
                      marginTop: 12,
                    }}>
                    Upload Image
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
          borderRadius: 16,
          borderWidth: 1.5,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
          minHeight: 68,
          paddingHorizontal: 18,
        }}>
        <View
          style={{
            flex: 1,
            paddingRight: 20,
          }}>
          <Text
            style={{
              color: '#111827',
              fontSize: 18,
              fontWeight: '700',
            }}>
            Enable Community Recommendation
          </Text>

          <Text
            style={{
              color: '#6B7280',
              fontSize: 14,
              fontWeight: '500',
              marginTop: 6,
            }}>
            Allow devotees to recommend your business publicly
          </Text>
        </View>

        <Switch
          value={recommended}
          onValueChange={setRecommended}
          trackColor={{
            false: '#D1D5DB',
            true: '#86EFAC',
          }}
          thumbColor={recommended ? '#22C55E' : '#FFFFFF'}
        />
      </View>
    </>
  );

  const busy = creating || uploadingMedia;

  return (
    <SafeAreaView
      style={{
        backgroundColor: '#F7F7F7',
        flex: 1,
      }}>
      <StatusBar barStyle="light-content" backgroundColor="#FF9A2F" />

      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: 22,
          paddingTop: 24,
        }}>
        {step === 1 && renderIdentity()}
        {step === 2 && renderDetails()}
        {step === 3 && renderContact()}
        {step === 4 && renderMedia()}

        {error ? (
          <Text
            style={{
              color: '#DC2626',
              fontSize: 13,
              fontWeight: '700',
              marginTop: 22,
              textAlign: 'center',
            }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={busy}
          onPress={nextStep}
          style={{
            alignItems: 'center',
            backgroundColor: busy ? '#FDBA74' : '#FF9A2F',
            borderRadius: 24,
            elevation: 8,
            flexDirection: 'row',
            height: 78,
            justifyContent: 'center',
            marginTop: 42,
            shadowColor: '#E85D04',
            shadowOffset: {
              height: 10,
              width: 0,
            },
            shadowOpacity: 0.32,
            shadowRadius: 12,
          }}>
          {busy ? <ActivityIndicator color="#FFFFFF" /> : null}
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 22,
              fontWeight: '800',
              marginLeft: busy ? 10 : 0,
            }}>
            {step === 4
              ? uploadingMedia
                ? 'Uploading Media'
                : creating
                ? 'Submitting'
                : 'Submit Listing'
              : 'Continue'}
          </Text>

          {!busy ? (
            <Ionicons
              name={step === 4 ? 'checkmark' : 'arrow-forward'}
              size={28}
              color="#FFFFFF"
              style={{
                marginLeft: 10,
              }}
            />
          ) : null}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateListingScreen;
