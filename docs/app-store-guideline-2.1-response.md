# App Review Guideline 2.1 Response

## October 28, 2026: New Rejection Fixes

Apple reviewed version 1.0.0 (7), submission `a4167f9b-491a-4b04-9ad2-72a3265315c1`, on an iPad Air 11-inch (M3). The new issues are purpose strings (5.1.1(ii)) and blocking/moderation (1.2). A different bundle ID does not fix these issues.

Local implementation:

- `app.json` and the image-picker plugin now explicitly describe selected photos/videos, their upload destinations and a Sai Mandir experience example. Expo introspection confirmed the generated iOS photo purpose string. This is a native change requiring a new binary; an OTA update cannot replace the installed permission string.
- After onboarding, users without an authenticated session must read the community agreement and select its checkbox before login or registration. Terms include zero tolerance for objectionable content/abusive users, report/block instructions, and public Terms/Privacy links. The checkbox is not preselected. Verify the public pages work before review.
- A non-owner experience options menu now contains Report experience and Block devotee. Blocking also remains available from the devotee profile. Successful blocking removes the author's posts/reposts from feed/search/bookmarks and clears their open detail; stale API responses cannot restore those posts during the session. Failure displays an error and does not pretend the block succeeded.
- Backend blocking saves a pending moderation report in the same transaction, and persists staff alerts for active `super_admin` accounts. Reports are visible in `GET /api/admin/sangha/reports`, with target types `user` and `experience`. Staff must monitor and resolve this queue. This implements persistent in-app staff alerts, not email or guaranteed push delivery. Configure at least one active staff account and verify it receives the alert.
- The missing `POST /api/experiences/:id/report` endpoint was added. Feed, search, bookmarks and detail reads exclude authors blocked in either direction. These backend changes require deployment separately from EAS.

Verification performed: mobile TypeScript passed, two reducer tests passed (immediate removal and stale-response/logout isolation), three backend moderation tests passed, five total backend tests passed. No physical-device recording or production two-user smoke test has been completed in this change. The backend full build is blocked by existing nullable event-coordinate errors in event/user/place controllers; resolve these before backend deployment. Do not describe all fixes as deployed or verified in the submitted binary.

Recording required by Apple: capture the actual replacement build on a physical device, beginning with launch. Show the unchecked terms agreement, open the full terms, accept, login/register, report another test user's post, block that user, show their posts disappear without refresh, then refresh/relaunch and show they stay hidden. Use a second account with known posts. Separately verify the staff alert and moderation record. Record the device model, OS and build number. Attach the recording to the App Review message and add its accessible link/details to App Review Information > Notes. No paid feature is involved.

Reply draft, only after deployment and device verification:

> Hello App Review Team. We have updated the photo-library purpose string to explain that selected photos and videos are used for profile pictures and community posts, events and business listings, including a specific Sai Mandir photo example. We have also added an explicit community Terms of Use agreement before login/registration. Users can report a post and block its author directly from the post options menu. Blocking removes that author's posts immediately, and the backend retains the block across sessions, creates a moderation report and alerts our staff accounts. The attached physical-device recording demonstrates terms presentation and acceptance, reporting, blocking and immediate feed removal. Device: [MODEL], OS: [VERSION], replacement build: [NUMBER], recording: [ATTACHMENT OR LINK]. The same recording reference is included in App Review Information > Notes.

Do not send the draft with unresolved placeholders or before backend deployment, a fresh iOS build and real-device validation.

App: Sai ki Family (`com.vpilimited.saifamily`)

Current iPhone QA candidate: iOS build 6, [EAS build details](https://expo.dev/accounts/devesh-rn/projects/sai-family/builds/42e7e569-bec9-4b9b-b60a-bb403666615e). Build finished; it has not been submitted for App Review. The backend changes described below are not deployed by an EAS mobile build.

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

3. The recording demonstrates account registration, sign-in, account deletion, creation and viewing of user content, reporting content, blocking a user, and the main app features. The tested account deletion route is Profile > Account access > Delete Account. A received Sangha chat message can be reported with a long press, and another devotee can be blocked from the devotee profile. The Experience post reporting route is post options > Report experience. [DO NOT SEND THIS ITEM UNTIL BACKEND DEPLOYMENT, EXTERNAL-MEDIA CLEANUP, AND PHYSICAL-DEVICE TESTING ARE COMPLETE.]

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

- The candidate build now exposes Profile > Account access > Delete Account and Experience post options > Report experience. The matching backend routes (`DELETE /api/users/me` and `POST /api/experiences/:id/report`) are local changes only; deploy and test them against production before recording or submitting. The post menu also links to the devotee profile, where blocking is available.
- Account deletion currently removes relational account data, tokens, OTP records, and owned content from PostgreSQL. Verify and implement cleanup of Azure-hosted uploads and any other external copies before describing it to Apple as complete deletion. Audit history is retained; confirm the privacy policy and retention basis. Do not use the deletion demo until this is settled.
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
