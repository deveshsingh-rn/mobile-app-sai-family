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
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createDirectoryListingRequest,
  fetchDirectoryDetailRequest,
  fetchDirectoryCategoriesRequest,
  selectDirectoryCategories,
  selectDirectoryCategoriesLoading,
  selectDirectoryDetail,
  selectDirectoryError,
  selectDirectoryUploadedMedia,
  selectIsCreatingDirectoryListing,
  selectIsUploadingDirectoryMedia,
  updateDirectoryListingRequest,
  uploadDirectoryMediaRequest,
} from '@/store/directory';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type {
  DirectoryCreateListingPayload,
  DirectoryUploadMediaPayload,
} from '@/store/directory/types';
import { validateDirectoryListingPayload } from '@/store/directory/validation';

const steps = ['Identity', 'Details', 'Contact', 'Media'];

const theme = {
  accent: '#F97316',
  accentDark: '#C2410C',
  background: '#F6F1E8',
  border: '#E7DDCD',
  card: '#FFFFFF',
  muted: '#6B7280',
  text: '#111827',
};

type SelectedImage = {
  mimeType?: string;
  name: string;
  uri: string;
};

const CreateListingScreen = () => {
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();
  const listingId = Array.isArray(id) ? id[0] : id;
  const isEditMode = Boolean(listingId);
  const categories = useAppSelector(selectDirectoryCategories);
  const categoriesLoading = useAppSelector(selectDirectoryCategoriesLoading);
  const detail = useAppSelector(selectDirectoryDetail);
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
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [pendingSubmitPayload, setPendingSubmitPayload] =
    useState<DirectoryCreateListingPayload | null>(null);
  const [submitStartedAt, setSubmitStartedAt] = useState<number | null>(null);
  const [submitObservedBusy, setSubmitObservedBusy] = useState(false);
  const [hydratedListingId, setHydratedListingId] =
    useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDirectoryCategoriesRequest({ includeCounts: true }));
  }, [dispatch]);

  useEffect(() => {
    if (listingId) {
      dispatch(fetchDirectoryDetailRequest(listingId));
    }
  }, [dispatch, listingId]);

  useEffect(() => {
    if (
      !isEditMode ||
      !listingId ||
      !detail ||
      detail.id !== listingId ||
      hydratedListingId === listingId
    ) {
      return;
    }

    setBusinessName(detail.businessName || '');
    setTagline(detail.tagline || '');
    setSelectedCategoryId(detail.categoryId || '');
    setDescription(detail.description || '');
    setExperience(
      detail.yearsOfExperience
        ? String(detail.yearsOfExperience)
        : ''
    );
    setHomeService(Boolean(detail.homeServiceAvailable));
    setPhone(detail.phoneNumber || '');
    setWhatsapp(detail.whatsappNumber || '');
    setAddress(detail.address || '');
    setCity(detail.city || '');
    setRecommended(
      detail.communityRecommendationEnabled !== false
    );
    setHydratedListingId(listingId);
  }, [
    detail,
    hydratedListingId,
    isEditMode,
    listingId,
  ]);

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

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((item) => {
      const searchableText = [
        item.name,
        item.slug,
        item.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [categories, categorySearch]);

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

    const mediaPayload = {
      ...pendingSubmitPayload,
      bannerUrl: urls[0],
      galleryUrls: urls,
      logoUrl: urls[0],
    };

    if (isEditMode && listingId) {
      dispatch(
        updateDirectoryListingRequest(
          listingId,
          mediaPayload
        )
      );
    } else {
      dispatch(createDirectoryListingRequest(mediaPayload));
    }

    setPendingSubmitPayload(null);
  }, [
    dispatch,
    extractUploadedUrls,
    images.length,
    isEditMode,
    listingId,
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
        isEditMode ? 'Listing updated' : 'Listing submitted',
        isEditMode
          ? 'Your listing changes have been saved.'
          : 'Your listing has been submitted for review.',
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
    isEditMode,
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

    if (isEditMode && listingId) {
      dispatch(updateDirectoryListingRequest(listingId, payload));
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

  const renderStepIntro = (
    icon: React.ReactNode,
    title: string,
    subtitle: string
  ) => (
    <View
      style={{
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 4,
      }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#FFF7ED',
          borderColor: '#FED7AA',
          borderRadius: 24,
          borderWidth: 1,
          height: 72,
          justifyContent: 'center',
          width: 72,
        }}>
        {icon}
      </View>

      <Text
        style={{
          color: theme.text,
          fontSize: 24,
          fontWeight: '900',
          letterSpacing: -0.2,
          marginTop: 18,
          textAlign: 'center',
        }}>
        {title}
      </Text>

      <Text
        style={{
          color: theme.muted,
          fontSize: 14,
          fontWeight: '600',
          lineHeight: 21,
          marginTop: 8,
          paddingHorizontal: 8,
          textAlign: 'center',
        }}>
        {subtitle}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View
      style={{
        backgroundColor: theme.accent,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        paddingBottom: 34,
        paddingHorizontal: 22,
        paddingTop: 16,
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
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderColor: 'rgba(255,255,255,0.3)',
            borderRadius: 22,
            borderWidth: 1,
            height: 44,
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            width: 44,
          }}>
          <Ionicons
            name={step === 1 ? 'close' : 'arrow-back'}
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 22,
              fontWeight: '900',
              letterSpacing: -0.2,
              textAlign: 'center',
            }}>
            {isEditMode ? 'Edit Listing' : 'Create Listing here'}
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: 11,
              fontWeight: '800',
              marginTop: 4,
              textAlign: 'center',
            }}>
            {isEditMode
              ? 'Update your community listing'
              : 'Submit once when details are ready'}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 28,
        }}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.35)',
            borderRadius: 100,
            height: 12,
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 100,
              height: '100%',
              width:
                step === 1
                  ? '25%'
                  : step === 2
                  ? '50%'
                  : step === 3
                  ? '75%'
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
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => {
                if (index + 1 <= step) {
                  setStep(index + 1);
                }
              }}
              style={{
                alignItems: 'center',
                flex: 1,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor:
                    step === index + 1
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.2)',
                  borderRadius: 14,
                  height: 28,
                  justifyContent: 'center',
                  width: 28,
                }}>
                <Text
                  style={{
                    color:
                      step === index + 1
                        ? theme.accent
                        : '#FFFFFF',
                    fontSize: 12,
                    fontWeight: '900',
                  }}>
                  {index + 1}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={{
                  color:
                    step === index + 1
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.72)',
                  fontSize: 11,
                  fontWeight:
                    step === index + 1 ? '900' : '700',
                  marginTop: 7,
                }}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
        marginTop: 18,
      }}>
      <Text
        style={{
          color: '#4B5563',
          fontSize: 12,
          fontWeight: '800',
          letterSpacing: 0.6,
          marginBottom: 9,
        }}>
        {label}
      </Text>

      <View
        style={{
          backgroundColor: '#FFFCF8',
          borderColor: validationErrors[field]
            ? '#FCA5A5'
            : theme.border,
          borderRadius: 14,
          borderWidth: 1,
          justifyContent: multiline ? 'flex-start' : 'center',
          minHeight: multiline ? 108 : 52,
          paddingHorizontal: 14,
          paddingTop: multiline ? 12 : 0,
        }}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#C7CBD3"
          multiline={multiline}
          returnKeyType={multiline ? 'default' : 'done'}
          blurOnSubmit={!multiline}
          style={{
            color: '#111827',
            fontSize: 15,
            fontWeight: '600',
            lineHeight: multiline ? 22 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
      </View>
      {renderError(field)}
    </View>
  );

  const renderCategoryPickerModal = () => (
    <Modal
      visible={categoryPickerOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setCategoryPickerOpen(false)}>
      <View
        style={{
          backgroundColor: 'rgba(17,24,39,0.38)',
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setCategoryPickerOpen(false)}
          style={{
            flex: 1,
          }}
        />

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '78%',
            paddingBottom: 18,
            paddingHorizontal: 18,
            paddingTop: 12,
          }}>
          <View
            style={{
              alignSelf: 'center',
              backgroundColor: '#E5E7EB',
              borderRadius: 100,
              height: 5,
              marginBottom: 16,
              width: 48,
            }}
          />

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flex: 1,
                paddingRight: 16,
              }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: '900',
                }}>
                Choose Category
              </Text>
              <Text
                style={{
                  color: theme.muted,
                  fontSize: 13,
                  fontWeight: '600',
                  lineHeight: 19,
                  marginTop: 4,
                }}>
                Select the closest match so devotees can find you faster.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setCategoryPickerOpen(false)}
              style={{
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: 18,
                height: 38,
                justifyContent: 'center',
                width: 38,
              }}>
              <Ionicons name="close" size={21} color="#374151" />
            </TouchableOpacity>
          </View>

          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#FFF7ED',
              borderColor: '#FED7AA',
              borderRadius: 18,
              borderWidth: 1,
              flexDirection: 'row',
              height: 50,
              marginTop: 16,
              paddingHorizontal: 14,
            }}>
            <Ionicons name="search" size={19} color="#9A3412" />
            <TextInput
              value={categorySearch}
              onChangeText={setCategorySearch}
              placeholder="Search category"
              placeholderTextColor="#C7A186"
              returnKeyType="search"
              style={{
                color: theme.text,
                flex: 1,
                fontSize: 15,
                fontWeight: '700',
                marginLeft: 10,
              }}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 14,
            }}>
            {categoriesLoading ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 26,
                }}>
                <ActivityIndicator color={theme.accent} />
                <Text
                  style={{
                    color: theme.muted,
                    fontSize: 13,
                    fontWeight: '700',
                    marginTop: 10,
                  }}>
                  Loading categories
                </Text>
              </View>
            ) : null}

            {!categoriesLoading && !filteredCategories.length ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 26,
                }}>
                <MaterialCommunityIcons
                  name="store-search-outline"
                  size={34}
                  color="#D97706"
                />
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: '900',
                    marginTop: 10,
                  }}>
                  No category found
                </Text>
                <Text
                  style={{
                    color: theme.muted,
                    fontSize: 13,
                    fontWeight: '600',
                    lineHeight: 19,
                    marginTop: 4,
                    textAlign: 'center',
                  }}>
                  Try another word or choose from all categories.
                </Text>
              </View>
            ) : null}

            {filteredCategories.map((item) => {
              const active = selectedCategoryId === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.86}
                  onPress={() => {
                    setSelectedCategoryId(item.id);
                    setCategoryPickerOpen(false);
                    setCategorySearch('');
                    setValidationErrors((current) => {
                      const next = { ...current };
                      delete next.categoryId;
                      return next;
                    });
                  }}
                  style={{
                    alignItems: 'center',
                    backgroundColor: active ? '#FFF7ED' : '#FFFFFF',
                    borderColor: active ? '#FDBA74' : '#E5E7EB',
                    borderRadius: 18,
                    borderWidth: 1,
                    flexDirection: 'row',
                    marginBottom: 10,
                    minHeight: 70,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: active ? theme.accent : '#F3F4F6',
                      borderRadius: 18,
                      height: 40,
                      justifyContent: 'center',
                      width: 40,
                    }}>
                    <MaterialCommunityIcons
                      name="storefront-outline"
                      size={21}
                      color={active ? '#FFFFFF' : '#6B7280'}
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                      marginLeft: 12,
                    }}>
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 15,
                        fontWeight: '900',
                      }}>
                      {item.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: theme.muted,
                        fontSize: 12,
                        fontWeight: '600',
                        marginTop: 3,
                      }}>
                      {item.description ||
                        `${item.listingCount || 0} listings in community`}
                    </Text>
                  </View>

                  {active ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.accent}
                    />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CBD5E1"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderIdentity = () => (
    <>
      {renderStepIntro(
        <MaterialCommunityIcons
          name="storefront-outline"
          size={34}
          color={theme.accent}
        />,
        'Business Identity',
        'Set the name and category devotees will see in Directory.'
      )}

      {renderInput(
        'BUSINESS NAME',
        'e.g. Sai Spiritual Store',
        businessName,
        setBusinessName,
        'businessName'
      )}

      <View
        style={{
          marginTop: 22,
        }}>
        <Text
          style={{
            color: '#4B5563',
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 0.6,
            marginBottom: 10,
          }}>
          CATEGORY
        </Text>

        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() => setCategoryPickerOpen(true)}
          style={{
            alignItems: 'center',
            backgroundColor: '#FFFCF8',
            borderColor: validationErrors.categoryId
              ? '#FCA5A5'
              : '#F3D7B8',
            borderRadius: 18,
            borderWidth: 1,
            flexDirection: 'row',
            minHeight: 68,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: selectedCategory
                ? '#FFF1E6'
                : '#F3F4F6',
              borderRadius: 20,
              height: 42,
              justifyContent: 'center',
              width: 42,
            }}>
            {categoriesLoading ? (
              <ActivityIndicator color={theme.accent} size="small" />
            ) : (
              <MaterialCommunityIcons
                name="shape-outline"
                size={22}
                color={selectedCategory ? theme.accent : '#9CA3AF'}
              />
            )}
          </View>

          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}>
            <Text
              style={{
                color: selectedCategory ? theme.text : '#9CA3AF',
                fontSize: 16,
                fontWeight: '900',
              }}>
              {selectedCategory?.name ||
                (categoriesLoading
                  ? 'Loading categories'
                  : 'Select business category')}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: theme.muted,
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4,
              }}>
              {selectedCategory?.description ||
                'This controls where your listing appears'}
            </Text>
          </View>

          <Ionicons
            name="chevron-down"
            size={22}
            color="#9CA3AF"
          />
        </TouchableOpacity>
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
      {renderStepIntro(
        <Feather
          name="file-text"
          size={31}
          color="#2563EB"
        />,
        'Business Details',
        'Describe your services, experience, and what makes your work trustworthy.'
      )}

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
          borderWidth: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 24,
          minHeight: 62,
          paddingHorizontal: 16,
        }}>
        <View>
          <Text
            style={{
              color: '#111827',
              fontSize: 16,
              fontWeight: '800',
            }}>
            Home Service Available
          </Text>

          <Text
            style={{
              color: '#6B7280',
              fontSize: 12,
              fontWeight: '600',
              marginTop: 5,
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
          thumbColor={homeService ? theme.accent : '#FFFFFF'}
        />
      </View>
    </>
  );

  const renderContact = () => (
    <>
      {renderStepIntro(
        <Ionicons name="call-outline" size={32} color="#16A34A" />,
        'Contact Details',
        'Add the best ways for devotees to reach your business.'
      )}

      {renderInput('PHONE NUMBER', '+91 9876543210', phone, setPhone, 'phoneNumber')}
      {renderInput('WHATSAPP NUMBER', '+91 9876543210', whatsapp, setWhatsapp, 'whatsappNumber')}
      {renderInput('ADDRESS', 'Enter your business address', address, setAddress, 'address')}
      {renderInput('CITY', 'e.g. Delhi', city, setCity, 'city')}
    </>
  );

  const renderMedia = () => (
    <>
      {renderStepIntro(
        <Ionicons name="images-outline" size={32} color="#9333EA" />,
        'Add Media',
        'Upload photos that help devotees recognize your work and quality.'
      )}

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginTop: 26,
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
                borderRadius: 20,
                borderStyle: image ? 'solid' : 'dashed',
                borderWidth: 1.5,
                height: 142,
                justifyContent: 'center',
                marginBottom: 12,
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
                  <Ionicons
                    name="cloud-upload-outline"
                    size={32}
                    color="#9CA3AF"
                  />
                  <Text
                    style={{
                      color: '#4B5563',
                      fontSize: 13,
                      fontWeight: '800',
                      marginTop: 8,
                    }}>
                    Add Photo
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
          borderWidth: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
          minHeight: 68,
          paddingHorizontal: 16,
        }}>
        <View
          style={{
            flex: 1,
            paddingRight: 20,
          }}>
          <Text
            style={{
              color: '#111827',
              fontSize: 16,
              fontWeight: '800',
            }}>
            Enable Community Recommendation
          </Text>

          <Text
            style={{
              color: '#6B7280',
              fontSize: 12,
              fontWeight: '600',
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
        backgroundColor: theme.background,
        flex: 1,
      }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.accent}
      />

      {renderHeader()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={{
          flex: 1,
        }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 30,
            paddingHorizontal: 16,
            paddingTop: 18,
          }}>
          <View
            style={{
              backgroundColor: theme.card,
              borderColor: '#EFE4D3',
              borderRadius: 24,
              borderWidth: 1,
              elevation: 2,
              paddingBottom: 22,
              paddingHorizontal: 18,
              paddingTop: 20,
              shadowColor: '#000',
              shadowOffset: {
                height: 4,
                width: 0,
              },
              shadowOpacity: 0.04,
              shadowRadius: 10,
            }}>
            {step === 1 && renderIdentity()}
            {step === 2 && renderDetails()}
            {step === 3 && renderContact()}
            {step === 4 && renderMedia()}
          </View>

          {error ? (
            <View
              style={{
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
                borderRadius: 16,
                borderWidth: 1,
                marginTop: 22,
                padding: 14,
              }}>
              <Text
                style={{
                  color: '#DC2626',
                  fontSize: 13,
                  fontWeight: '800',
                  lineHeight: 20,
                  textAlign: 'center',
                }}>
                {error}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={busy}
            onPress={nextStep}
            style={{
              alignItems: 'center',
              backgroundColor: busy ? '#FDBA74' : theme.accent,
              borderRadius: 20,
              elevation: 5,
              flexDirection: 'row',
              height: 58,
              justifyContent: 'center',
              marginTop: 20,
              shadowColor: theme.accentDark,
              shadowOffset: {
                height: 7,
                width: 0,
              },
              shadowOpacity: 0.22,
              shadowRadius: 10,
            }}>
            {busy ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : null}
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 17,
                fontWeight: '900',
                marginLeft: busy ? 10 : 0,
              }}>
              {step === 4
                ? uploadingMedia
                  ? 'Uploading Media'
                  : creating
                  ? 'Submitting'
                  : isEditMode
                  ? 'Save Listing'
                  : 'Submit Listing'
                : 'Continue'}
            </Text>

            {!busy ? (
              <Ionicons
                name={step === 4 ? 'checkmark' : 'arrow-forward'}
                size={21}
                color="#FFFFFF"
                style={{
                  marginLeft: 8,
                }}
              />
            ) : null}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderCategoryPickerModal()}
    </SafeAreaView>
  );
};

export default CreateListingScreen;
