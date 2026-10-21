# Sai ki Family: Android Release And Closed Testing

App: Sai ki Family. Package: `com.saikifamily.android`.
This is a new Android app identity, not an update to `com.deveshrn.saifamily`.
iOS identifiers are unchanged. Expo ownership and Google Play ownership are separate.

## Release Gates

Configuration is prepared, not a certification of device functionality. No AAB has been uploaded or release published by this change.

- Confirm this package is the intended permanent Play identity before the first upload.
- Complete personal developer identity/contact/device verification requested by Play Console.
- Register this exact Android package in Firebase. Configure its `google-services.json` via Expo `android.googleServicesFile`; it is not currently wired in this repository. Configure the matching FCM v1 credential in EAS for push delivery. Keep service-account private keys out of Git/chat.
- Verify production HTTPS/WSS endpoints and voice provider in the EAS production environment. Do not put backend secrets into EXPO_PUBLIC variables.
- Verify release AAB target SDK against Play requirements (currently API 36 for standard new mobile apps). Check all bundled native libraries for 16 KB page-size support; a passing TypeScript build cannot verify this.
- Configure Android App Links on the share domain using the new package and Play app-signing SHA-256 certificate, not just the upload certificate. Test event, experience and group links from WhatsApp.
- Complete privacy policy, Data safety, app access/demo login, content rating, target audience, ads declaration and account-deletion web URL/in-app flow truthfully.
- Confirm all source/model providers and analytics SDK data practices in disclosures. Never claim untested features work.

## Build And Connect

1. Log in to the intended Expo account: `npx eas-cli@latest login`, then `npx eas-cli@latest whoami`. Existing production EAS project remains `@devesh-rn/sai-family`.
2. Run `npx eas-cli@latest credentials --platform android` to set up/verify the upload keystore for the new package. Preserve a secure backup; do not revoke existing app keys.
3. Build standalone device QA APK: `npx eas-cli@latest build --platform android --profile android-qa`. This does not need Metro and does not start the Google closed-test clock.
4. Fix blockers from physical-device testing, then build Play bundle: `npx eas-cli@latest build --platform android --profile android-store`.
5. In the personal Play Console account, create Sai ki Family, complete required app setup, enroll in Play App Signing and manually upload the first AAB to internal testing. Inspect bundle warnings and pre-launch report.
6. For later automated uploads, grant a dedicated Google service account access to this app and configure EAS Submit. Start with a testing track, not production. FCM credentials and Play submission credentials have different purposes.
7. Promote the verified artifact to a closed-testing track, configure countries and tester email list/Google Group, and send the opt-in URL once the release is available.

## Personal Account Closed Test

The existing closed track is `Closed testing - Alpha`. The uploaded app bundle is version `1.0.0`, versionCode `3`; it can be selected from the bundle library when creating the closed release. Successful EAS submission to the internal draft does not activate this closed track.

Before sending the closed release for review, restore the public privacy-policy page. Google requires an active, publicly accessible policy URL; a down site may block review. Store listing currently references `https://saikifamily.com/privacy-policy/`. Do not claim that this URL is working until it has been checked from a public connection.

Console sequence: Alpha > Countries / regions > choose tester countries > Save; Testers > create/select email list > add the testers' Google-account emails > Save; Releases > Create release > Add from library > versionCode 3 > enter release notes > Preview and resolve actual Console errors > send for review. Complete the dashboard's required app-content and store-listing tasks. After availability is confirmed, copy the Console's actual opt-in URL to testers. Never mark a draft or review-pending release as available.

Suggested release notes: `Initial closed test of Sai ki Family. Please test account access, experiences, events, business listings, Sangha, Ask Sai and Naam Jap, and share feedback.`

Tester instructions: open the opt-in URL using the same Google account included in the list, join the test, install from Google Play, exercise real features and remain opted in for at least 14 continuous days. A Play developer account is not required. If already enrolled in internal testing, leave that test before opting into closed testing. Adding an email alone does not count as a tester opt-in. Do not send invitations automatically without a request to contact the testers.

For personal accounts created after 13 November 2023, Google requires at least 12 testers continuously opted into a closed test for the preceding 14 days before applying for production access. Internal testing and sideloaded APKs do not satisfy this requirement. The Play dashboard is the authority on eligibility; 14 days is not automatic production approval.

Recruit 15-20 genuine testers as a practical buffer, not a Google requirement. Each uses their eligible Google account to opt in and installs through Play. Ask them to remain opted in and exercise real workflows. Do not fabricate feedback or use fake accounts. Record feedback and fixes; after eligibility is reached, apply for production access with honest answers about engagement, issues, fixes and readiness.

## Physical-Device QA Matrix

Record device, Android version, build/versionCode, account, expected/actual result and evidence for each test. Use at least two distinct real test users and more than one device/vendor. All rows start NOT TESTED.

| Area | Required checks | Status |
| --- | --- | --- |
| Authentication | Registration, OTP, incorrect/expired OTP, login/logout, session expiry, account deletion | NOT TESTED |
| Experiences | Feed paging, refresh after post, text/image/video/audio uploads, pending video, playback, comments, like/repost/bookmark, owner edit/delete, report/block | NOT TESTED |
| Ask Sai | English/Hindi, start/end capture, permission denial, real transcript, complete chapter reply, ElevenLabs playback, stop/retry, reconnect, diagnostics/model/version | NOT TESTED |
| Events | Create/draft/edit dates/publish/delete, stale links, full venue/address map, RSVP/calendar/share/bookmark | NOT TESTED |
| Directory | Three-step listing, search/categories, media, details/contact, owner updates | NOT TESTED |
| Sangha | Two-user request/accept/decline, live chat without refresh, reconnect, unread/read, notification navigation, public/private/invite-only groups | NOT TESTED |
| Naam Jap | Tap/swipe, rapid counting, mala rollover, daily/lifetime consistency, persistence and background/resume | NOT TESTED |
| Alarm | Text/voice delivery with app foreground/background/killed, Android notification and battery restrictions; disclose actual limitations | NOT TESTED |
| Platform | Back gesture, keyboard, safe area, large fonts, denied permissions, offline/slow Wi-Fi/mobile data, headphones/Bluetooth, interrupted uploads | NOT TESTED |
| Push/links | Foreground/background/killed delivery, tap routing, new package App Links on Play-signed build | NOT TESTED |

Suggested schedule: days 1-3 authentication/core navigation; 4-6 posting/events/directory; 7-9 two-user chat/voice; 10-12 interruptions/permissions/regression; 13-14 retest fixes and collect final feedback. This is a team test plan, not a mandated Google daily quota. Continue testing if blockers remain.

## Official References

- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/9845334
- https://support.google.com/googleplay/android-developer/answer/11926878
- https://developer.android.com/guide/practices/page-sizes
- https://docs.expo.dev/submit/android/
- https://docs.expo.dev/submit/android-manual/
