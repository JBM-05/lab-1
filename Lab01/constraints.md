# Lifecycle Lab constraints

## Runtime and platform

- The OS controls foreground, background, suspension, and process termination. No JavaScript cleanup or final write is guaranteed. Do not infer process death from a missing callback or a new session.
- AppState is not the native Activity/scene lifecycle. iOS inactive and Android focus/blur differ. A window resize can come from rotation, multi-window, or other layout changes.
- Expo Go observations belong to the host runtime. Web previews and mocked native tests cannot establish Android/iOS behavior. Development reloads also start JavaScript sessions; disable Fast Refresh during experiments.
- The app permits default device orientation. System rotation settings and host runtime configuration can still affect it. Native configuration must be verified in a built app before a future release.

## Persistence and efficiency

- Keep the counter only in memory to demonstrate lifecycle state loss. Keep at most 500 diagnostic events across all sessions in a versioned AsyncStorage record.
- Serialize writes, coalesce obsolete pending snapshots, and order clear operations behind in-flight writes. Pending writes can be lost on abrupt termination. `saved` means the storage API completed, not a guarantee against device/storage failure.
- Validate saved data. Invalid history is not silently trusted or overwritten; Clear Log explicitly replaces it. Read failures preserve live observations until a retry succeeds.
- Use event subscriptions, not timers or background workers. Remove listeners on cleanup and render a virtualized list. Logging does not perform network requests.

## Privacy, security, and accessibility review

- Store timestamps, random session labels, platform, app state, and window size only. No credentials, device identifiers, personal content, or protected URLs. Session labels are diagnostic identifiers, not security tokens.
- AsyncStorage is unencrypted and appropriate only for these non-sensitive diagnostics. Never reuse this adapter for secrets. Review OS backups before any future sensitive-data feature.
- Sharing is initiated by the user and includes a snapshot of retained history. Share-sheet activity may generate additional lifecycle events after that snapshot. Clear Log removes retained diagnostic history, not the counter/session.
- The added AsyncStorage dependency is SDK-compatible; its storage role requires no user-facing permission prompt. No new native config plugins, entitlements, analytics, network services, or sensitive permissions are added by this lab.
- Controls have names and at least 48 dp height, status/error text is readable without relying on color, text scales, screens scroll, and theme colors support light/dark. No decorative motion is used by the active lab screens. Actual TalkBack/VoiceOver and device rendering checks remain required.
- MASVS storage/privacy/code-quality concerns are addressed by bounded data, validation, no secret logging, and explicit recovery. Network/authentication/cryptographic business features are absent. This is not a claim of complete MASVS certification or store readiness.

## Dependency review and release boundary

The initial installation audit reported 11 findings. Aligning the Expo packages with recommended SDK 57 patch versions reduced this to 8 findings (3 moderate, 5 high) in the Expo/tooling dependency chain, including Expo CLI, node-forge, zod, and Router/query-string. No AsyncStorage advisory was reported. Some suggested fixes cross SDK major versions or downgrade Expo; do not apply `npm audit fix --force` blindly. Resolve and retest compatible upstream updates before a production release. This task keeps SDK 57 and adds no store submission or release configuration. React Native Testing Library 13.3.3 and react-test-renderer 19.2.3 are used to match the app's React 19.2.3 runtime; the newer test-renderer dependency required a different React peer version.

## References checked for this implementation

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [AsyncStorage](https://docs.expo.dev/versions/v57.0.0/sdk/async-storage/), and [app configuration](https://docs.expo.dev/versions/v57.0.0/config/app/).
- [React Native 0.86 AppState](https://reactnative.dev/docs/0.86/appstate).
- [Android Activity lifecycle](https://developer.android.com/guide/components/activities/activity-lifecycle) and [core app quality](https://developer.android.com/docs/quality-guidelines/core-app-quality).
- [Apple lifecycle guidance](https://developer.apple.com/documentation/uikit/managing-your-app-s-life-cycle).
- [OWASP MASVS](https://mas.owasp.org/MASVS/).

Before a future standalone release, verify current store policies, target requirements, effective manifests, SDK disclosures, and physical-device results separately for each platform.
