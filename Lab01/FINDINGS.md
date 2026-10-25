# Lab 1 — Lifecycle Log findings

## Evidence status

This is a React Native adaptation of the visible MAUI lab requirements. Expected behavior below is a hypothesis, not a recorded device result. Do not substitute unit tests or a web preview for Android/iOS observations.

## Environment record

| Field | Android | iOS |
| --- | --- | --- |
| Device/model | Medium_Phone_API_36 / sdk_gphone64_x86_64 | Pending |
| Physical device or emulator | Local Android emulator | Pending |
| OS version / API level | Android 16 / API 36 (ADB) | Pending |
| Expo Go version or native build ID | Expo Go 57.0.9 (ADB) | Pending |
| Runtime | Expo Go host runtime; launch/bundle check only | Pending |
| Expo / React Native | SDK 57 / RN 0.86.3 | SDK 57 / RN 0.86.3 |
| Fast Refresh disabled | Pending | Pending |
| Date and tester | Pending | Pending |

## Experiment procedure

1. Open Lifecycle Log, disable Fast Refresh, wait for storage, and note the session ID.
2. Increment the counter to a known value. Export existing evidence before clearing the log.
3. Perform one action below. Record all observed events in sequence order, including timestamps and session IDs. The screen is newest-first; exported text is oldest-first.
4. Record the counter before/after and whether the session changed. Wait for `Storage: saved`, then Share Log. Sharing can itself create state/focus events; delimit the experiment before opening the share sheet.
5. Repeat separately on both platforms. Preserve unexpected results rather than editing them to match a hypothesis.

| Action | Hypothesis to investigate | Android actual sequence / counter / evidence | iOS actual sequence / counter / evidence |
| --- | --- | --- | --- |
| Home → return | Background then active; iOS may include inactive. Counter survives if runtime survives. | Pending | Pending |
| Portrait → landscape → portrait | Window-size events, responsive content, counter retained in the same runtime. AppState may remain active. | Pending | Pending |
| Switch apps → return | Compare with Home; Android focus events are separate from app state. | Pending | Pending |
| Swipe away → relaunch | A new runtime has a new session and zero counter; completed log writes remain. No destruction callback is promised. | Pending | Pending |

For rotation, enable system auto-rotate and restart the project after changing orientation configuration. In Expo Go, dismiss/relaunch the host and reopen this project for the fourth experiment. An OS action does not guarantee a particular callback sequence. A new session can also result from JavaScript reload, and is not proof of process death.

## Interpretation

- **Created:** our startup event identifies a JavaScript session, not a native window or Activity creation.
- **Activated:** `active` reports foreground state.
- **Deactivated:** iOS `inactive` and Android `blur` have different meanings. Pulling down Android's notification shade can blur without backgrounding.
- **Stopped:** `background` is an observation, not confirmation that the process stopped executing.
- **Resumed:** the logger annotates active after background, including an intervening inactive state.
- **Destroying:** there is no reliable JavaScript termination callback. React cleanup is not OS destruction; pending writes can be lost.

Mobile execution is controlled by the OS and user. A server request normally has a bounded request/response flow; a mobile runtime can be interrupted without a final callback. Save small amounts of needed state while running, and avoid background polling. The intentionally volatile counter demonstrates what is lost without persistence.

## Additional acceptance checks

| Check | Android | iOS |
| --- | --- | --- |
| Offline after bundle has loaded: increment, observe, clear, restore | Pending | Pending |
| Large font/display scaling, portrait and landscape | Pending | Pending |
| Light/dark appearance and contrast | Pending | Pending |
| TalkBack / VoiceOver focus and named controls | Pending | Pending |
| System back, interruptions, lock/unlock | Pending | Pending |
| Reduced motion, safe areas, small screen | Pending | Pending |
| Separate forced process death / low-memory recovery | Pending | Pending |

No protected-resource permissions are requested by this feature, so permission-denial tests are not applicable to its own code. Host Expo Go permissions are not evidence of a standalone app's permissions.

## Automated verification

Tests cover ordering, resume interpretation, retention/restoration, counter reset, storage failures, corrupt saved data, clear/write races, subscription cleanup, accessible controls, and share failure recovery.

| Verification | Observed result |
| --- | --- |
| `npm test` | Passed: 12 tests, 3 suites |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed, no warnings |
| `npx expo install --check` | Passed after SDK 57 patch alignment |
| `npx expo-doctor` | Passed: 21/21 checks after deduplicating react-native-screens to 4.26.2 |
| `npx expo export --platform all --output-dir .expo/lab-export` | Passed: Android/iOS Hermes bundles and four static web routes; not native device validation |
| `npm audit --omit=dev` | 8 unresolved findings; see constraints.md |

## Observed preview checks and device limitations

- The web preview rendered both tabs in dark appearance. Incrementing to 1, switching to Lab Guide, and returning retained the counter and session. Reloading reset the counter to 0, created a new session, and restored earlier entries labelled Saved session. These are browser observations only.
- Visual inspection exposed a clipped heading in the web tab layout. The tab content now flexes into available space instead of consuming a full viewport plus the footer; a follow-up screenshot confirmed that the heading and navigation are visible. Preview evidence: `.expo/lifecycle-preview.png` (local generated artifact).
- Android emulator boot and Expo Go installation/launch were attempted successfully through Expo CLI, and the Android JavaScript bundle built. Native screenshot capture repeatedly timed out, including after refreshing the window and attempting activation. No native UI experiment sequence is claimed. The four experiment rows and accessibility/device checks remain pending.
- This Windows environment has no iOS simulator or connected iOS test session. iOS device checks remain pending.
- Development refresh was enabled for browser implementation checks, so these checks are not the formal four-experiment evidence run.
