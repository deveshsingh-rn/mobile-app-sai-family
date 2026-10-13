# App Store Page Publishing Checklist

Publish the four page files as separate, public HTTPS pages:

1. `privacy-policy.md` -> App Store Connect Privacy Policy URL (required).
2. `user-privacy-choices.md` -> User Privacy Choices URL (optional).
3. `marketing.md` -> Marketing URL (optional).
4. `support.md` -> Support URL (required for the version page).

The supplied operator and support contact have been inserted into the page
drafts. The account owner should confirm that VPI Limited is the correct legal
operator and that vikasahuja1971@gmail.com is the intended public support
address. The supplied URLs could not be verified by the browser fetch used in
this audit; open all four over HTTPS on a device outside the developer network.

Before App Review, verify the policy against the deployed backend, vendor
agreements, retention and backup practices, and actual in-app controls.
In particular, verify whether media is hosted on YouTube, how Ask Sai data is
retained, and whether additional analytics or diagnostics SDKs are enabled.

The current mobile profile shows Log Out but no complete account deletion
action, and a matching backend endpoint was not found in the inspected routes.
Apple requires apps with account creation to let users initiate account
deletion inside the app. Add and test that flow, and then include its exact
path in the support and privacy choices pages before submitting for review.

The privacy policy URL should also be reachable from inside the app. Review
the App Store privacy data-type answers separately; a public page alone does
not complete App Store Connect's privacy questionnaire.

Apple references:

- https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- https://developer.apple.com/support/offering-account-deletion-in-your-app/
