# App Review Guideline 2.1 Response

App: Sai ki Family (`com.vpilimited.saifamily`)

This is a draft for the App Store Connect Resolution Center reply and the App Review Information > Notes field. Do not send it until the release checklist below is complete and the bracketed fields are replaced. Do not put a personal Apple ID password in App Review Notes.

## Reply to Apple

Hello App Review Team,

Thank you for reviewing Sai ki Family. We have tested the submitted iPhone build on [PHYSICAL IPHONE MODEL] running [IOS VERSION]. The attached screen recording was captured on that device and begins with a fresh launch: [ATTACH RECORDING TO THE RESOLUTION CENTER OR ENTER ACCESSIBLE RECORDING LINK].

1. Sai ki Family is a community app for Sai devotees, especially adults who want a simple way to share devotional experiences, discover gatherings, connect with other devotees, browse community business listings, practise Naam Jaap, and ask an AI assistant for general spiritual guidance. It brings these activities together in one accessible mobile app.

2. To use the app, open it and register or sign in. An Indian mobile number uses SMS OTP. For supported numbers outside India, the app provides the PIN flow shown on the sign-in screen. Verified email and a configured password provide another login option. After sign-in, use the bottom navigation to open Experiences, Events, Sai Family, and Naam Jaap. In Experiences, use Ask Sai for text or voice questions. Users can join groups and exchange messages after the required connection or group acceptance. No sample files or special hardware are required. Reviewer access: [DEMO ACCOUNT NUMBER OR EMAIL AND WORKING REVIEWER VERIFICATION METHOD IN APP STORE CONNECT SECURE FIELDS].

3. The recording demonstrates account registration, sign-in, account deletion, creation and viewing of user content, reporting content, blocking a user, and the main app features. The account deletion route is [EXACT IN-APP PATH]. A received Sangha chat message can be reported with a long press, and another devotee can be blocked from the devotee profile. Additional content reporting paths shown in the recording are [EXACT PATHS].

4. Core external services include the Sai ki Family backend for accounts and community data; MSG91 for Indian SMS OTP when enabled; Azure infrastructure for data and media storage and Azure AI/Speech for Ask Sai text and speech recognition; ElevenLabs for generated voice replies; Mixpanel for product analytics; Expo/Apple push services for notifications; and YouTube/Google for video hosting where the video feature is used. These services are not direct in-app purchase processors. [CONFIRM ACTUAL PRODUCTION SERVICE CONFIGURATION BEFORE SENDING.]

5. The core community features are intended to work across the app's supported regions. Authentication differs: Indian mobile numbers use SMS OTP, while supported non-Indian numbers use the PIN flow displayed in the app. Nearby results and local events depend on available content and optional location permission. Ask Sai currently supports English and Hindi. [CONFIRM THE ACTUAL COUNTRIES WHERE THE APP IS DISTRIBUTED AND PROVIDER AVAILABILITY.]

6. The app is a devotional community, not a healthcare, banking, or other regulated professional service. Ask Sai is an AI assistant, not Sai Baba, and its replies are general guidance rather than professional advice. For references to Shri Sai Satcharitra and any other third-party book, image, music, or video, [ATTACH RIGHTS/LICENSE DOCUMENTATION OR IDENTIFY THE PUBLIC-DOMAIN SOURCE AND YOUR AUTHORIZED USAGE]. We will not claim rights to material we cannot document.

The app has no paid content or in-app purchases in the submitted build. [VERIFY AGAINST THE EXACT SUBMITTED BINARY AND BACKEND FLAGS.]

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
- Capture and inspect the exact submitted build on a physical iPhone. Record model, iOS version, build number, tests performed, crashes, and API environment.
- Complete App Store metadata, privacy answers, support/privacy URLs, actual app screenshots, and any age-rating questions before resubmission.

Apple references:

- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/support/offering-account-deletion-in-your-app/
- https://developer.apple.com/app-store/review/
