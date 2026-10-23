import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { City, Country, State } from 'country-state-city';

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

const steps = ['Details', 'Preview'];
const DEFAULT_LISTING_IMAGE = Image.resolveAssetSource(
  require('../assets/images/babasai.png')
);

const theme = {
  accent: '#7C2D12',
  accentDark: '#5C1F0B',
  background: '#FFF8EC',
  border: '#F1D9B5',
  card: '#FFFCF7',
  muted: '#4B4037',
  text: '#7C2D12',
};

const DIRECTORY_IMAGE_MAX_SIZE = 1600;
const DIRECTORY_IMAGE_QUALITY = 0.78;

type SelectedImage = {
  mimeType?: string;
  name: string;
  uri: string;
};

type PickedImageAsset = ImagePicker.ImagePickerAsset;

const trimOrUndefined = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const parseList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const getDirectoryImageResizeAction = (
  width?: number,
  height?: number
) => {
  if (!width || !height) {
    return null;
  }

  const longestSide = Math.max(width, height);

  if (longestSide <= DIRECTORY_IMAGE_MAX_SIZE) {
    return null;
  }

  if (width >= height) {
    return {
      resize: {
        width: DIRECTORY_IMAGE_MAX_SIZE,
      },
    };
  }

  return {
    resize: {
      height: DIRECTORY_IMAGE_MAX_SIZE,
    },
  };
};

const optimizeDirectoryImage = async (
  asset: PickedImageAsset
): Promise<SelectedImage> => {
  const fallbackName =
    asset.fileName ||
    `directory-${Date.now()}.${asset.uri.split('.').pop() || 'jpg'}`;

  try {
    const resizeAction = getDirectoryImageResizeAction(
      asset.width,
      asset.height
    );
    const optimized = await ImageManipulator.manipulateAsync(
      asset.uri,
      resizeAction ? [resizeAction] : [],
      {
        compress: DIRECTORY_IMAGE_QUALITY,
        format: ImageManipulator.SaveFormat.WEBP,
      }
    );

    return {
      mimeType: 'image/webp',
      name: fallbackName.replace(/\.[^.]+$/, '.webp'),
      uri: optimized.uri,
    };
  } catch (error) {
    console.warn('[Directory Image Optimization Failed]', error);

    return {
      mimeType: asset.mimeType || 'image/jpeg',
      name: fallbackName,
      uri: asset.uri,
    };
  }
};

const CreateListingScreen = () => {
  const dispatch = useAppDispatch();
  const formScrollRef = useRef<ScrollView>(null);
  const expectsUploadRef = useRef(false);
  const fieldRefs = useRef<Record<string, View | null>>({});
  const focusedFieldRef = useRef<string | null>(null);
  const scrollOffsetRef = useRef(0);
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
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');
  const [subcategories, setSubcategories] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [tags, setTags] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [locationPicker, setLocationPicker] = useState<
    'country' | 'state' | 'city' | null
  >(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [pendingSubmitPayload, setPendingSubmitPayload] =
    useState<DirectoryCreateListingPayload | null>(null);
  const [submitStartedAt, setSubmitStartedAt] = useState<number | null>(null);
  const [submitObservedBusy, setSubmitObservedBusy] = useState(false);
  const [hydratedListingId, setHydratedListingId] =
    useState<string | null>(null);

  const revealFocusedField = useCallback((field: string) => {
    const node = fieldRefs.current[field];
    const scroll = formScrollRef.current;

    if (!node || !scroll) {
      return;
    }

    node.measureInWindow((_x, fieldY) => {
      (
        scroll as unknown as {
          measureInWindow: (
            callback: (x: number, y: number, width: number, height: number) => void
          ) => void;
        }
      ).measureInWindow((_scrollX, scrollY) => {
        const delta = fieldY - scrollY - 12;

        if (Math.abs(delta) < 8) {
          return;
        }

        scroll.scrollTo({
          animated: true,
          y: Math.max(0, scrollOffsetRef.current + delta),
        });
      });
    });
  }, []);

  useEffect(() => {
    dispatch(fetchDirectoryCategoriesRequest({ includeCounts: true }));
  }, [dispatch]);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      const field = focusedFieldRef.current;

      if (field) {
        revealFocusedField(field);
      }
    });

    return () => subscription.remove();
  }, [revealFocusedField]);

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
    setEmail(detail.email || '');
    setWebsiteUrl(detail.websiteUrl || '');
    setAddress(detail.address || '');
    setCity(detail.city || '');
    setStateName(detail.state || '');
    setCountry(detail.country || 'India');
    setPincode(detail.pincode || '');
    setSubcategories((detail.subcategories || []).join(', '));
    setSpecialties((detail.specialties || []).join(', '));
    setTags((detail.tags || []).join(', '));
    setServiceAreas((detail.serviceAreas || []).join(', '));
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

  const countryOptions = useMemo(() => Country.getAllCountries(), []);
  const selectedCountryOption = useMemo(
    () =>
      countryOptions.find((item) => item.name === country) ||
      countryOptions.find((item) => item.isoCode === 'IN') ||
      null,
    [country, countryOptions]
  );
  const stateOptions = useMemo(
    () =>
      selectedCountryOption
        ? State.getStatesOfCountry(selectedCountryOption.isoCode)
        : [],
    [selectedCountryOption]
  );
  const selectedStateOption = useMemo(
    () => stateOptions.find((item) => item.name === stateName) || null,
    [stateName, stateOptions]
  );
  const cityOptions = useMemo(
    () =>
      selectedCountryOption && selectedStateOption
        ? City.getCitiesOfState(
            selectedCountryOption.isoCode,
            selectedStateOption.isoCode
          )
        : [],
    [selectedCountryOption, selectedStateOption]
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
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedWebsite = normalizeUrl(websiteUrl);
      const subcategoryItems = parseList(subcategories);
      const specialtyItems = parseList(specialties);
      const tagItems = parseList(tags);
      const serviceAreaItems = parseList(serviceAreas);

      const payload: Partial<DirectoryCreateListingPayload> = {
        address: address.trim(),
        businessName: businessName.trim(),
        categoryId: selectedCategoryId,
        city: city.trim(),
        communityRecommendationEnabled: true,
        country: trimOrUndefined(country) || 'India',
        description: description.trim(),
        email: normalizedEmail || undefined,
        homeServiceAvailable: homeService,
        phoneNumber: trimOrUndefined(phone),
        pincode: trimOrUndefined(pincode),
        serviceAreas: serviceAreaItems.length
          ? serviceAreaItems
          : undefined,
        specialties: specialtyItems.length
          ? specialtyItems
          : undefined,
        state: trimOrUndefined(stateName),
        subcategories: subcategoryItems.length
          ? subcategoryItems
          : undefined,
        tagline: trimOrUndefined(tagline),
        tags: tagItems.length ? tagItems : undefined,
        websiteUrl: normalizedWebsite,
        whatsappNumber: trimOrUndefined(phone),
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

            if (Array.isArray(value)) {
              return value.length > 0;
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
      country,
      description,
      email,
      experience,
      homeService,
      phone,
      pincode,
      selectedCategoryId,
      serviceAreas,
      specialties,
      stateName,
      subcategories,
      tagline,
      tags,
      websiteUrl,
    ]
  );

  const getStepErrors = (targetStep: number) => {
    const payload = toPayload();
    const nextErrors: Record<string, string> = {};

    if (targetStep >= 1) {
      if (!payload.businessName) {
        nextErrors.businessName = 'Business name is required.';
      } else if (
        payload.businessName.length < 2 ||
        payload.businessName.length > 120
      ) {
        nextErrors.businessName =
          'Business name must be 2 to 120 characters.';
      }

      if (!payload.categoryId) {
        nextErrors.categoryId = 'Please select a category.';
      }

      if (!payload.description || payload.description.length < 20) {
        nextErrors.description =
          'Description must be at least 20 characters.';
      } else if (payload.description.length > 3000) {
        nextErrors.description =
          'Description can be up to 3000 characters.';
      }

      if (payload.tagline && payload.tagline.length > 160) {
        nextErrors.tagline =
          'Tagline can be up to 160 characters.';
      }
    }

    if (targetStep >= 1) {
      if (
        !payload.phoneNumber ||
        payload.phoneNumber.length < 6 ||
        payload.phoneNumber.length > 30
      ) {
        nextErrors.phoneNumber =
          'Enter a mobile number, 6 to 30 characters.';
      }

      if (
        payload.pincode &&
        !/^\d{4,10}$/.test(payload.pincode)
      ) {
        nextErrors.pincode = 'Pincode must be 4 to 10 digits.';
      }

      if (!address.trim() || address.trim().length < 5) {
        nextErrors.address = 'Enter a street address of at least 5 characters.';
      } else if (address.trim().length > 500) {
        nextErrors.address = 'Address can be up to 500 characters.';
      }

      if (!country.trim()) {
        nextErrors.country = 'Choose a country.';
      }

      if (stateOptions.length && !stateName.trim()) {
        nextErrors.state = 'Choose a state.';
      }

      if (cityOptions.length && !city.trim()) {
        nextErrors.city = 'Choose a city.';
      }

      if (
        payload.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
      ) {
        nextErrors.email = 'Enter a valid email address.';
      }

      if (
        payload.websiteUrl &&
        !/^https?:\/\/.+/i.test(payload.websiteUrl)
      ) {
        nextErrors.websiteUrl =
          'Enter a valid website URL including https://.';
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

    if (step < steps.length) {
      setStep(step + 1);
      formScrollRef.current?.scrollTo({ animated: true, y: 0 });
      return;
    }

    submitListing();
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      formScrollRef.current?.scrollTo({ animated: true, y: 0 });
      return;
    }

    router.back();
  };

  const pickImage = async () => {
    if (images.length >= 10) {
      Alert.alert('Media', 'You can add up to 10 images from this form.');
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
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    const optimizedImage = await optimizeDirectoryImage(asset);

    setImages((current) => [
      ...current,
      optimizedImage,
    ]);
    setValidationErrors((current) => {
      if (!current.images) {
        return current;
      }

      const next = { ...current };
      delete next.images;
      return next;
    });
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

    if (expectsUploadRef.current && urls.length === 0) {
      return;
    }

    expectsUploadRef.current = false;

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
    const stepErrors = getStepErrors(steps.length);

    if (Object.keys(stepErrors).length) {
      setValidationErrors(stepErrors);
      Alert.alert(
        'Check listing details',
        Object.values(stepErrors)[0]
      );
      return;
    }

    const validation = validateDirectoryListingPayload(payload);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      const firstMessage = Object.values(validation.errors)[0];
      Alert.alert('Check listing details', firstMessage);
      return;
    }

    setValidationErrors({});
    setSubmitStartedAt(Date.now());

    const files: NonNullable<DirectoryUploadMediaPayload['files']> =
      images.length > 0
        ? images.map((image) => ({
            mimeType: image.mimeType,
            name: image.name,
            type: image.mimeType || 'image/jpeg',
            uri: image.uri,
          }))
        : isEditMode
        ? []
        : [
            {
              mimeType: 'image/png',
              name: 'babasai.png',
              type: 'image/png',
              uri: DEFAULT_LISTING_IMAGE.uri,
            },
          ];

    if (files.length > 0) {
      expectsUploadRef.current = true;
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
          backgroundColor: '#FFF4E8',
          borderColor: theme.border,
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
        backgroundColor: theme.background,
        borderBottomColor: theme.border,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        borderBottomWidth: 1,
        overflow: 'hidden',
        paddingBottom: 14,
        paddingHorizontal: 16,
        paddingTop: 6,
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
            backgroundColor: '#FFF4E8',
            borderColor: theme.border,
            borderRadius: 19,
            borderWidth: 1,
            height: 38,
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            width: 38,
          }}>
          <Ionicons
            name={step === 1 ? 'close' : 'arrow-back'}
            size={21}
            color={theme.accent}
          />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              color: theme.accent,
              fontSize: 20,
              fontWeight: '900',
              letterSpacing: -0.2,
              textAlign: 'center',
            }}>
            {isEditMode ? 'Edit Business' : 'Create Business Listing'}
          </Text>
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
      ref={(node) => {
        fieldRefs.current[field] = node;
      }}
      style={{
        marginTop: 18,
      }}>
      <Text
        style={{
          color: theme.muted,
          fontSize: 12,
          fontWeight: '800',
          letterSpacing: 0.6,
          marginBottom: 9,
        }}>
        {label}
      </Text>

      <View
        style={{
          backgroundColor: '#FFFFFF',
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
          accessibilityLabel={label}
          autoCapitalize={
            field === 'email' || field === 'websiteUrl'
              ? 'none'
              : 'sentences'
          }
          autoCorrect={field !== 'email' && field !== 'websiteUrl'}
          keyboardType={
            field === 'email'
              ? 'email-address'
              : field === 'websiteUrl'
              ? 'url'
              : field === 'phoneNumber' || field === 'whatsappNumber'
              ? 'phone-pad'
              : field === 'pincode' || field === 'yearsOfExperience'
              ? 'number-pad'
              : 'default'
          }
          maxLength={
            field === 'businessName'
              ? 120
              : field === 'tagline'
              ? 160
              : field === 'description'
              ? 3000
              : undefined
          }
          onBlur={() => {
            if (focusedFieldRef.current === field) {
              focusedFieldRef.current = null;
            }
          }}
          onChangeText={(nextValue) => {
            setValue(nextValue);

            if (validationErrors[field]) {
              setValidationErrors((current) => {
                const next = { ...current };
                delete next[field];
                return next;
              });
            }
          }}
          onFocus={() => {
            focusedFieldRef.current = field;
            setTimeout(() => revealFocusedField(field), 80);
          }}
          placeholder={placeholder}
          placeholderTextColor="#C7CBD3"
          multiline={multiline}
          returnKeyType={multiline ? 'default' : 'done'}
          blurOnSubmit={!multiline}
          style={{
            color: '#2F2925',
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

  const renderSectionHeading = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string
  ) => (
    <View
      style={{
        alignItems: 'center',
        borderTopColor: theme.border,
        borderTopWidth: 1,
        flexDirection: 'row',
        marginTop: 30,
        paddingTop: 24,
      }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#FFF4E8',
          borderColor: theme.border,
          borderRadius: 18,
          borderWidth: 1,
          height: 44,
          justifyContent: 'center',
          width: 44,
        }}>
        {icon}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{
            color: theme.text,
            fontSize: 18,
            fontWeight: '900',
          }}>
          {title}
        </Text>
        <Text
          style={{
            color: theme.muted,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 19,
            marginTop: 3,
          }}>
          {subtitle}
        </Text>
      </View>
    </View>
  );

  const renderCategoryPickerModal = () => (
    <Modal
      visible={categoryPickerOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setCategoryPickerOpen(false)}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{
              flexShrink: 1,
            }}
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
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderLocationPickerModal = () => {
    const source =
      locationPicker === 'country'
        ? countryOptions.map((item) => item.name)
        : locationPicker === 'state'
        ? stateOptions.map((item) => item.name)
        : locationPicker === 'city'
        ? cityOptions.map((item) => item.name)
        : [];
    const query = locationSearch.trim().toLowerCase();
    const matches = query
      ? source.filter((item) => item.toLowerCase().includes(query))
      : source;
    const visibleOptions = matches.slice(0, query ? 80 : 40);
    const title =
      locationPicker === 'country'
        ? 'Choose country'
        : locationPicker === 'state'
        ? 'Choose state'
        : 'Choose city';

    return (
      <Modal
        visible={locationPicker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationPicker(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            backgroundColor: 'rgba(17,24,39,0.38)',
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setLocationPicker(null)}
            style={{ flex: 1 }}
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
            <Text
              style={{
                color: theme.text,
                fontSize: 22,
                fontWeight: '900',
              }}>
              {title}
            </Text>
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
                value={locationSearch}
                onChangeText={setLocationSearch}
                placeholder="Search"
                placeholderTextColor="#C7A186"
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
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ flexShrink: 1, marginTop: 14 }}>
              {!visibleOptions.length ? (
                <Text
                  style={{
                    color: theme.muted,
                    fontSize: 14,
                    fontWeight: '700',
                    paddingVertical: 20,
                    textAlign: 'center',
                  }}>
                  Nothing matches that search.
                </Text>
              ) : null}
              {visibleOptions.map((item, index) => {
                const selected =
                  (locationPicker === 'country' && item === country) ||
                  (locationPicker === 'state' && item === stateName) ||
                  (locationPicker === 'city' && item === city);

                return (
                  <TouchableOpacity
                    key={`${item}-${index}`}
                    activeOpacity={0.86}
                    onPress={() => chooseLocation(item)}
                    style={{
                      alignItems: 'center',
                      backgroundColor: selected ? '#FFF7ED' : '#FFFFFF',
                      borderColor: selected ? '#FDBA74' : '#E5E7EB',
                      borderRadius: 16,
                      borderWidth: 1,
                      flexDirection: 'row',
                      marginBottom: 8,
                      minHeight: 52,
                      paddingHorizontal: 14,
                    }}>
                    <Text
                      style={{
                        color: theme.text,
                        flex: 1,
                        fontSize: 15,
                        fontWeight: '800',
                      }}>
                      {item}
                    </Text>
                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={theme.accent}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
              {matches.length > visibleOptions.length ? (
                <Text
                  style={{
                    color: theme.muted,
                    fontSize: 12,
                    fontWeight: '700',
                    paddingBottom: 12,
                    textAlign: 'center',
                  }}>
                  Search to see more.
                </Text>
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderIdentity = () => (
    <>
      {renderStepIntro(
        <MaterialCommunityIcons
          name="storefront-outline"
          size={34}
          color={theme.accent}
        />,
        'Business',
        'Add the name, category, and description devotees will see.'
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

      {/* {renderInput(
        'TAGLINE (OPTIONAL)',
        'Your short, catchy motto',
        tagline,
        setTagline,
        'tagline'
      )} */}

      {renderInput(
        'DESCRIPTION',
        'Write about your services,...',
        description,
        setDescription,
        'description',
        true
      )}
    </>
  );

  const openLocationPicker = (kind: 'country' | 'state' | 'city') => {
    if (kind === 'state' && !selectedCountryOption) {
      setValidationErrors((current) => ({
        ...current,
        country: 'Choose a country first.',
      }));
      return;
    }

    if (kind === 'city' && !selectedStateOption) {
      setValidationErrors((current) => ({
        ...current,
        state: stateOptions.length
          ? 'Choose a state first.'
          : 'This country has no states to choose from.',
      }));
      return;
    }

    setLocationSearch('');
    setLocationPicker(kind);
  };

  const chooseLocation = (value: string) => {
    if (locationPicker === 'country') {
      setCountry(value);
      setStateName('');
      setCity('');
    } else if (locationPicker === 'state') {
      setStateName(value);
      setCity('');
    } else if (locationPicker === 'city') {
      setCity(value);
    }

    setValidationErrors((current) => {
      const next = { ...current };
      delete next.country;
      delete next.state;
      delete next.city;
      return next;
    });
    setLocationPicker(null);
    setLocationSearch('');
  };

  const renderLocationSelect = (
    label: string,
    value: string,
    placeholder: string,
    field: 'country' | 'state' | 'city'
  ) => (
    <View style={{ marginTop: 18 }}>
      <Text
        style={{
          color: theme.muted,
          fontSize: 12,
          fontWeight: '800',
          letterSpacing: 0.6,
          marginBottom: 9,
        }}>
        {label}
      </Text>
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => openLocationPicker(field)}
        style={{
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderColor: validationErrors[field] ? '#FCA5A5' : theme.border,
          borderRadius: 14,
          borderWidth: 1,
          flexDirection: 'row',
          minHeight: 52,
          paddingHorizontal: 14,
        }}>
        <Text
          numberOfLines={1}
          style={{
            color: value ? '#2F2925' : '#C7CBD3',
            flex: 1,
            fontSize: 15,
            fontWeight: '600',
          }}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>
      {renderError(field)}
    </View>
  );

  const renderLocation = () => (
    <>
      {renderSectionHeading(
        <Ionicons name="location-outline" size={22} color={theme.accent} />,
        'Address',
      )}

      {renderLocationSelect('COUNTRY', country, 'Choose country', 'country')}
      {renderLocationSelect(
        'STATE',
        stateName,
        selectedCountryOption ? 'Choose state' : 'Choose country first',
        'state'
      )}
      {renderLocationSelect(
        'CITY',
        city,
        selectedStateOption ? 'Choose city' : 'Choose state first',
        'city'
      )}
      {renderInput(
        'STREET ADDRESS',
        'Area, street, landmark',
        address,
        setAddress,
        'address'
      )}
      {renderInput(
        'PINCODE (OPTIONAL)',
        'e.g. 411001',
        pincode,
        setPincode,
        'pincode'
      )}
    </>
  );

  const renderContact = () => (
    <>
      {renderSectionHeading(
        <Ionicons name="call-outline" size={22} color={theme.accent} />,
        'Contact'
      )}

      {renderInput('MOBILE NUMBER', '+91 9876543210', phone, setPhone, 'phoneNumber')}
      {renderInput('EMAIL (OPTIONAL)', 'business@example.com', email, setEmail, 'email')}
      {renderInput('WEBSITE (OPTIONAL)', 'https://yourbusiness.com', websiteUrl, setWebsiteUrl, 'websiteUrl')}
    </>
  );

  const renderMedia = () => (
    <>
      {renderSectionHeading(
        <Ionicons name="images-outline" size={22} color={theme.accent} />,
        'Photo',
      )}

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginTop: 26,
        }}>
        {Array.from({ length: Math.min(10, images.length + 1) }).map((_, index) => {
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
      {renderError('images')}
    </>
  );

  const renderReviewRow = (label: string, value?: string | number | null) => (
    <View
      style={{
        borderBottomColor: '#F3E8D8',
        borderBottomWidth: 1,
        paddingVertical: 12,
      }}>
      <Text
        style={{
          color: theme.muted,
          fontSize: 11,
          fontWeight: '900',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}>
        {label}
      </Text>
      <Text
        style={{
          color: value ? theme.text : '#9CA3AF',
          fontSize: 15,
          fontWeight: '800',
          lineHeight: 21,
          marginTop: 5,
        }}>
        {value || 'Not added'}
      </Text>
    </View>
  );

  const renderReview = (compact = false) => {
    const payload = toPayload();

    return (
      <>
        {compact
          ? renderSectionHeading(
              <Ionicons
                name="shield-checkmark-outline"
                size={23}
                color={theme.accent}
              />,
              'Final Check',
              'Review your information before submitting.'
            )
          : renderStepIntro(
              <Ionicons
                name="shield-checkmark-outline"
                size={33}
                color={theme.accent}
              />,
              'Review Listing',
              'Please check everything once before submitting.'
            )}

        <View
          style={{
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0',
            borderRadius: 18,
            borderWidth: 1,
            marginTop: 18,
            paddingHorizontal: 14,
          }}>
          {renderReviewRow('Business', payload.businessName)}
          {renderReviewRow('Category', selectedCategory?.name)}
          {renderReviewRow('Description', payload.description)}
          {renderReviewRow('Mobile', payload.phoneNumber)}
          {renderReviewRow('Email', payload.email)}
          {renderReviewRow('Pincode', payload.pincode)}
          {renderReviewRow('Country', payload.country)}
          {renderReviewRow('State', payload.state)}
          {renderReviewRow('City', payload.city)}
          {renderReviewRow('Address', payload.address)}
          {renderReviewRow('Website', payload.websiteUrl)}
          {renderReviewRow(
            'Photos',
            images.length ? `${images.length} selected` : 'Sai Baba photo'
          )}
        </View>
      </>
    );
  };

  const busy = creating || uploadingMedia;

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.background,
        flex: 1,
      }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.background}
      />

      {renderHeader()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={{
          flex: 1,
        }}>
        <ScrollView
          ref={formScrollRef}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          onScroll={(event) => {
            scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingBottom: 36,
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
            {step === 1 ? (
              <>
                {renderIdentity()}
                {renderLocation()}
                {renderContact()}
                {renderMedia()}
              </>
            ) : (
              renderReview()
            )}
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

        </ScrollView>

        <View
          style={{
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            paddingBottom: 10,
            paddingHorizontal: 16,
            paddingTop: 10,
          }}>
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={busy}
            onPress={() => {
              Keyboard.dismiss();
              nextStep();
            }}
            style={{
              alignItems: 'center',
              backgroundColor: busy ? '#B97861' : theme.accent,
              borderRadius: 16,
              elevation: 5,
              flexDirection: 'row',
              minHeight: 58,
              justifyContent: 'center',
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
              {step === steps.length
                ? uploadingMedia
                  ? 'Uploading Media'
                  : creating
                  ? 'Submitting'
                  : isEditMode
                  ? 'Save Listing'
                  : 'Submit Listing'
                : 'Preview'}
            </Text>

            {!busy ? (
              <Ionicons
                name={step === steps.length ? 'checkmark' : 'arrow-forward'}
                size={21}
                color="#FFFFFF"
                style={{
                  marginLeft: 8,
                }}
              />
            ) : null}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {renderCategoryPickerModal()}
      {renderLocationPickerModal()}
    </SafeAreaView>
  );
};

export default CreateListingScreen;
