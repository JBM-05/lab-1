# Mobile Agent Guide

This file applies to all work under `apps/mobile`.

## Required documentation

Expo has changed. Before writing mobile code, read the exact versioned Expo
documentation for the version used by this project:

- [Expo SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/)

Before changing native behavior, permissions, privacy declarations, payments,
authentication, background execution, notifications, media, deep links, or release
configuration, also check the current official Apple and Android requirements.
Platform and store policies change; do not rely on remembered requirements or
hard-coded historical API-level deadlines.

## Mandatory platform compliance

The mobile application must comply with all applicable current platform rules:

- Apple App Review Guidelines and Apple Developer Program requirements;
- Apple Human Interface Guidelines and accessibility guidance;
- Apple privacy, data-use, entitlement, and permission requirements;
- Google Play Developer Program Policies;
- Android core and adaptive app-quality guidelines;
- Android privacy, security, permission, background-execution, and target API
  requirements.
- The current
  [OWASP Mobile Application Security Verification Standard (MASVS)](https://mas.owasp.org/MASVS/)
  and applicable OWASP Mobile Application Security Testing Guide requirements.

These are mandatory engineering and release constraints. Apply them during design,
implementation, dependency selection, review, testing, store-metadata preparation,
and submission. The application is responsible for policy violations caused by
third-party SDKs, analytics, advertising, authentication, payment, or content
providers.

## iOS rules

- Follow the current
  [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
  for safety, performance, business, design, privacy, and legal requirements.
- Follow the
  [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
  and use established iOS navigation, gestures, controls, typography, safe areas,
  feedback, and accessibility behavior.
- Request protected resources only when a user invokes a feature that needs them.
  Provide accurate, specific purpose strings and graceful behavior when access is
  denied, restricted, or later revoked.
- Minimize data collection and declare actual collection, sharing, tracking, and
  SDK behavior accurately in App Store Connect. Obtain App Tracking Transparency
  consent before tracking when it applies.
- Use supported Apple APIs and entitlements. Do not use private APIs, misleading
  review behavior, hidden functionality, or dynamically delivered code that changes
  the reviewed purpose of the app.
- Use the platform keychain and protected storage for secrets and credentials.
  Never place secrets in the application bundle, logs, AsyncStorage, source code,
  or client-visible configuration.
- Support Dynamic Type, VoiceOver, sufficient contrast, reduced motion, logical
  focus order, accessible labels, and usable touch targets. Do not encode meaning
  through color alone.
- Test on supported physical devices and current public iOS versions, including
  permission denial, interrupted flows, offline behavior, restoration, different
  text sizes, dark mode, and relevant device sizes.
- Keep App Store metadata, privacy disclosures, age rating, screenshots,
  subscription terms, review notes, and account-deletion behavior accurate and
  consistent with the shipped application.

## Android rules

- Follow the current
  [Google Play Developer Program Policies](https://support.google.com/googleplay/android-developer/answer/17105854)
  and all policies applicable to the app's content, audience, data, SDKs, payments,
  subscriptions, and distribution regions.
- Follow the current
  [Android core app-quality guidelines](https://developer.android.com/docs/quality-guidelines/core-app-quality)
  and adaptive-layout guidance. Use standard Android navigation, system back
  behavior, edge-to-edge layouts, lifecycle handling, and platform conventions.
- Meet the current
  [Google Play target API-level requirement](https://developer.android.com/google/play/requirements/target-sdk)
  at every release. Verify the effective requirement instead of copying an API
  level from this file.
- Declare and request only the minimum permissions needed for the active use case.
  Prefer system pickers and permission-free APIs, request permissions in context,
  explain sensitive access, and preserve useful behavior after denial or revocation.
- Keep exported activities, services, receivers, providers, intents, deep links,
  network security configuration, WebViews, and file sharing explicitly restricted
  to the minimum required surface.
- Store credentials and sensitive keys with Android Keystore-backed facilities.
  Never place secrets in the APK/AAB, resources, logs, AsyncStorage, source code, or
  client-visible configuration.
- Support TalkBack, scalable text, sufficient contrast, logical focus order,
  accessible semantics, reduced animation preferences, and usable touch targets.
  Do not encode meaning through color alone.
- Test on supported physical devices and current public Android versions, including
  different screen sizes, orientations where supported, font/display scaling,
  process death, configuration changes, system back, offline behavior, permission
  denial, dark theme, and low-memory conditions.
- Keep the Play Data safety form, content rating, target audience, store listing,
  subscription terms, account-deletion behavior, and SDK declarations accurate and
  consistent with the shipped application.

## Shared implementation rules

- Preserve native platform conventions. Share business behavior where useful, but
  allow iOS and Android presentation or interaction behavior to differ when their
  official guidance differs.
- Collect the minimum data and permissions required for a user-visible feature.
  Make consent informed and revocable, and ensure denial does not cause crashes or
  deceptive dead ends.
- Treat all client input and device-integrity signals as untrusted. Authorization
  and entitlement decisions remain server-side.
- Use TLS for network communication, validate all remote data, define timeouts and
  cancellation, and avoid logging tokens, credentials, personal data, or protected
  media URLs.
- Review every dependency and Expo config plugin for permissions, native manifest
  changes, data collection, maintenance, security, and store-policy impact.
- Apply OWASP MASVS controls proportionate to the feature and use the OWASP mobile
  testing guidance to verify storage, cryptography, authentication, network,
  platform interaction, code quality, resilience, and privacy protections.
- Provide accessible loading, empty, error, offline, and retry states. Avoid
  platform-specific assumptions in shared code.
- Test behavior on both platforms. Passing on one platform is not evidence that the
  other platform complies or works.

## Definition of done

A mobile change is complete only when:

- it follows the versioned Expo documentation and current official platform rules;
- iOS and Android behavior has been reviewed separately;
- requested permissions, entitlements, manifests, privacy declarations, and SDK
  behavior match the implemented feature;
- accessibility, denial, failure, offline, lifecycle, and recovery paths are tested;
- applicable OWASP MASVS controls and mobile security tests pass;
- affected App Store and Google Play disclosures or metadata are updated;
- lint, type checks, automated tests, and relevant device tests pass.
