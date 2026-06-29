# Auth And Onboarding Todo

Source collection: `postman-api-collection.json` > `Auth` > `User Authentication`

## Completed

- [x] Mobile OTP login with `POST /api/auth/user/mobile/send-otp`.
- [x] Mobile OTP verification/login with `POST /api/auth/user/mobile/verify-otp`.
- [x] Email/password login with `POST /api/auth/user/email/login`.
- [x] Persist auth tokens in SecureStore.
- [x] Attach `Authorization: Bearer <accessToken>` globally.
- [x] Keep existing `x-user-id` compatibility header.
- [x] Gate create account submit until mobile OTP is verified.
- [x] Keep user logged in from SecureStore until logout.

## Next Profile Pass

- [ ] Add profile setting for email/password setup.
- [ ] Wire `POST /api/auth/user/email/setup-password`.
- [ ] Add email OTP input.
- [ ] Wire `POST /api/auth/user/email/verify`.
- [ ] Wire `POST /api/auth/user/email/resend-verification`.
- [ ] Show email verified/password login status in profile settings.
