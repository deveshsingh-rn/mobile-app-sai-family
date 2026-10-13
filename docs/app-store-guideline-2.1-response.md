# App Review Guideline 2.1 Response

App: Sai ki Family (`com.vpilimited.saifamily`)

This is a draft for the App Store Connect Resolution Center reply and the App Review Information > Notes field. Do not send it until the release checklist below is complete and the bracketed fields are replaced. Do not put a personal Apple ID password in App Review Notes.

## Status reply you can send now

Hello App Review Team,

Thank you for the detailed request. We are preparing physical iPhone testing and a recording that starts with launch and covers the normal user flow. We are also completing and verifying account deletion and user-content safety controls before asking you to continue review. We will provide the recording, reliable demo access, device/OS details, external service list, regional differences, and any relevant content-rights documentation with the updated build. Thank you for your patience.

This short reply does not replace the six requested items. Do not mark the current build ready for review based on this message alone.

## Reply to Apple

Hello App Review Team,

Thank you for reviewing Sai ki Family. Our operator is VPI Limited. We tested build [SUBMITTED BUILD NUMBER] on [PHYSICAL IPHONE MODEL] running [IOS VERSION]. The attached recording was captured on that device, begins with a fresh app launch, and shows the normal user journey: [ATTACH RECORDING TO THE RESOLUTION CENTER OR ENTER ACCESSIBLE RECORDING LINK].

1. Sai ki Family is a community app for Sai devotees, especially adults who want a simple way to share devotional experiences, discover gatherings, connect with other devotees, browse community business listings, practise Naam Jaap, and ask an AI assistant for general spiritual guidance. It brings these activities together in one accessible mobile app.

2. To use the app, open it and register or sign in. An Indian mobile number normally uses SMS OTP. For supported numbers outside India, the app provides the PIN flow shown on the sign-in screen. Verified email and a configured password provide another login option. After sign-in, use the bottom navigation to open Experiences, Events, Sai Family, and Naam Jaap. In Experiences, use Ask Sai for text or voice questions. Users can join groups and exchange messages after the required connection or group acceptance. No sample files or special hardware are required. We have provided a dedicated Indian demo mobile number and a review verification code in App Store Connect's Sign-In Information. This demo login is intended to work without receiving an SMS. [VERIFY THE REVIEW CODE ON THE PRODUCTION BACKEND BEFORE SENDING; DO NOT COMMIT THE CODE TO THIS FILE.]

3. The recording demonstrates account registration, sign-in, account deletion, creation and viewing of user content, reporting content, blocking a user, and the main app features. The tested account deletion route is [EXACT IN-APP PATH]. A received Sangha chat message can be reported with a long press, and another devotee can be blocked from the devotee profile. The tested Experience post reporting route is [EXACT IN-APP PATH]. [THE DELETION AND EXPERIENCE REPORT ROUTES DO NOT EXIST IN THE INSPECTED BUILD. DO NOT SEND THIS ITEM UNTIL A NEW BUILD WITH THOSE ROUTES IS TESTED AND SUBMITTED.]

4. Core external services include the Sai ki Family backend for accounts and community data; MSG91 for Indian SMS OTP when enabled; Azure infrastructure for data and media storage and Azure AI/Speech for Ask Sai text and speech recognition; ElevenLabs for generated voice replies; Mixpanel for product analytics; Expo/Apple push services for notifications; and YouTube/Google for video hosting where the video feature is used. These services are not direct in-app purchase processors. [CONFIRM ACTUAL PRODUCTION SERVICE CONFIGURATION BEFORE SENDING.]

5. The core community features are intended to work across the app's supported regions. Authentication differs: Indian mobile numbers use SMS OTP, while supported non-Indian numbers use the PIN flow displayed in the app. Nearby results and local events depend on available content and optional location permission. Ask Sai currently supports English and Hindi. [CONFIRM THE ACTUAL COUNTRIES WHERE THE APP IS DISTRIBUTED AND PROVIDER AVAILABILITY.]

6. The app is a devotional community, not a healthcare, banking, or other regulated professional service. Ask Sai is an AI assistant, not Sai Baba, and its replies are general guidance rather than professional advice. The app does not distribute a copy of Shri Sai Satcharitra. Where AI processing or app imagery relies on protected third-party material, the relevant rights or authorization evidence is [ATTACH RIGHTS/LICENCE DOCUMENTATION OR IDENTIFY THE PUBLIC-DOMAIN SOURCE AND PERMITTED USE].

The app has no paid content or in-app purchases in the submitted build. [VERIFY AGAINST THE EXACT SUBMITTED BINARY AND BACKEND FLAGS.]

Public support: https://vpilimited.com/support (vikasahuja1971@gmail.com)

Privacy Policy: https://vpilimited.com/PrivacyPolicy

User Privacy Choices: https://vpilimited.com/UserPrivacy

Marketing page: https://vpilimited.com/marketing

Please let us know if any additional information would help your review.

## Physical-device recording plan

Record the exact submitted App Store build, not a development client. Use an iPhone supported by that build with the current iOS version. Make sure the recording shows the device and OS details separately if Apple needs evidence that cannot be seen in the screen capture itself.

1. Start recording before opening Sai ki Family. Show launch, onboarding, sign-up, mobile OTP/PIN verification, and sign-in. Blur an OTP only if the result still lets reviewers understand the flow; provide a stable demo verification method separately.
2. Show Experiences: feed, create a safe sample post, then open it and demonstrate report and block actions. Do not substitute a Sangha-only report for a public feed reporting requirement.
3. Show Events: view an event and RSVP. Show Sai Family: discover a devotee, connection request/acceptance using a second demo account, chat, long-press report of a received message, and block from profile.
4. Show Naam Jaap and Ask Sai text/voice. If voice requires permission, show the prompt and a successful response.
5. Show Profile > account deletion, confirmation, and final signed-out/account-removed state. This route must actually work before recording.
6. Show that paid content is absent. Capture any non-Indian PIN flow only if that region is included in the distribution and a test account is available.

Do not include personal chats, live OTPs, private account details, or unlicensed media in the recording. Provide a reviewer-accessible file or attachment in App Store Connect.

## Release blockers to resolve before replying

- Full account deletion cannot currently be initiated in the inspected mobile profile, and no matching backend endpoint was found in the inspected routes. Build and test this in the app and backend, then update the page text and recording.
- The Experience feed/detail did not expose a report action in the inspected code. Apple requires a reporting mechanism for user-generated content, a way to block abusive users, moderation/filtering, and published contact information. Sangha chat report/profile block and directory reporting do exist, but do not cover every public feed path.
- Verify how objectionable content is filtered before publication and who handles reports. Do not claim automated filtering or a response deadline without production evidence.
- Obtain rights evidence for the Satcharitra PDF/corpus and any other protected media used in the app or submitted screenshots. An online PDF link alone does not prove redistribution or AI-processing rights.
- Confirm that the test account and verification code will work throughout review. A transient SMS OTP must not be described as a permanent reviewer password.
- The supplied review code was not found as an explicit fixed-code path in the inspected backend authentication service. Test it on the deployed backend before promising SMS-free access to App Review. Store the code in App Store Connect reviewer credentials, not in this repository.
- Check that all four provided VPI Limited web pages load publicly over HTTPS on a device outside the developer network. The browser fetch available during this audit could not verify their contents or availability.
- Capture and inspect the exact submitted build on a physical iPhone. Record model, iOS version, build number, tests performed, crashes, and API environment.
- Complete App Store metadata, privacy answers, support/privacy URLs, actual app screenshots, and any age-rating questions before resubmission.

Apple references:

- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/support/offering-account-deletion-in-your-app/
- https://developer.apple.com/app-store/review/
